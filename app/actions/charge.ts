'use server';

import { headers } from 'next/headers';
import { createAdminClient, createClient } from '@/lib/supabase-server';
import { calculateDiscount } from '@/lib/discount-logic';
import { checkRateLimit } from '@/lib/rate-limit';
import type { PaymentMethod, Profile } from '@/types';
import { sendPushNotification } from './push';

export async function processPaymentByShortCodeServer(merchantId: string, amount: number, method: PaymentMethod, shortCode: string, offerId?: string) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
  const rl = checkRateLimit(ip, 5, 30000);
  if (!rl.success) {
    return { success: false, reason: 'Por seguridad, demasiados intentos. Esperá unos segundos.' };
  }

  const adminClient = createAdminClient();

  const { data: qrRecords } = await adminClient
    .from('qr_codes')
    .select('user_id, qr_token, is_active')
    .ilike('qr_token', `${shortCode}%`)
    .limit(1);

  if (!qrRecords || qrRecords.length === 0) {
    return { success: false, reason: 'Código de cliente no encontrado.' };
  }

  const qrRecord = qrRecords[0];

  if (!qrRecord.is_active) {
    return { success: false, reason: 'El código de este cliente está desactivado.' };
  }

  return await executePaymentServer(merchantId, qrRecord.user_id, amount, method, qrRecord.qr_token, offerId);
}

export async function confirmScannedPaymentServer(merchantId: string, amount: number, method: PaymentMethod, offerId?: string) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
  const rl = checkRateLimit(ip, 5, 30000);
  if (!rl.success) {
    return { success: false, reason: 'Demasiados intentos de pago. Esperá unos segundos por seguridad.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, reason: 'Debes iniciar sesión para confirmar el pago.' };
  }

  const adminClient = createAdminClient();

  const { data: qrData } = await adminClient
    .from('qr_codes')
    .select('qr_token, is_active')
    .eq('user_id', user.id)
    .single();

  if (!qrData || !qrData.is_active) {
    return { success: false, reason: 'No tienes un código QR activo para recibir beneficios.' };
  }

  return await executePaymentServer(merchantId, user.id, amount, method, qrData.qr_token, offerId);
}

async function executePaymentServer(merchantId: string, clientId: string, amount: number, method: PaymentMethod, qrToken: string, offerId?: string, offerTitle?: string) {
  const adminClient = createAdminClient();

  // 1. Get Merchant Profile
  const { data: merchantUser } = await adminClient
    .from('profiles')
    .select('is_active, role')
    .eq('id', merchantId)
    .single();

  if (!merchantUser || merchantUser.role !== 'merchant' || !merchantUser.is_active) {
    return { success: false, reason: 'El comercio no es válido o está inactivo.' };
  }

  // 2. Verify Merchant Subscription
  const { data: subscription } = await adminClient
    .from('subscriptions')
    .select('status, expires_at')
    .eq('merchant_id', merchantId)
    .eq('status', 'active')
    .limit(1);

  if (!subscription || subscription.length === 0) {
    return { success: false, reason: 'El comercio no tiene una suscripción activa.' };
  }

  // 3. Get Client Profile
  const { data: clientUser } = await adminClient
    .from('profiles')
    .select('is_active, role, full_name')
    .eq('id', clientId)
    .single();

  if (!clientUser || !clientUser.is_active) {
    return { success: false, reason: 'El usuario cliente no es válido o está inactivo.' };
  }

  let finalPct = 0;
  let finalAmount = amount;

  // 4. Calculate Discount
  if (offerId) {
    // Si hay una oferta específica
    const { data: offer } = await adminClient
      .from('merchant_offers')
      .select('*')
      .eq('id', offerId)
      .eq('merchant_id', merchantId)
      .single();

    if (!offer || !offer.is_active) {
      return { success: false, reason: 'La oferta seleccionada no existe o ya no está activa.' };
    }

    if (offer.stock_limit && offer.used_count >= offer.stock_limit) {
      // Auto-desactivar por las dudas si no se desactivó
      await adminClient.from('merchant_offers').update({ is_active: false }).eq('id', offerId);
      return { success: false, reason: 'Esta oferta agotó su límite de stock disponible.' };
    }

    if (offer.target_role !== 'all' && offer.target_role !== clientUser.role) {
      return { success: false, reason: `Esta oferta es exclusiva para ${offer.target_role === 'client' ? 'Clientes' : 'Comercios'}.` };
    }
    
    finalPct = offer.discount_pct;
    
    if (offer.original_price && offer.final_price) {
      finalAmount = amount * (offer.final_price / offer.original_price);
    } else {
      finalAmount = amount - (amount * (finalPct / 100));
    }
    
    // Increment stock
    if (offer.stock_limit) {
      const newCount = offer.used_count + 1;
      await adminClient.from('merchant_offers').update({ 
        used_count: newCount,
        is_active: newCount < offer.stock_limit 
      }).eq('id', offerId);
    }

  } else {
    // Fallback: Descuento estándar global
    const outcome = calculateDiscount(clientUser.role, method, amount);
    if (!outcome.valid) {
      return { success: false, reason: outcome.reason };
    }
    finalPct = outcome.discount_pct;
    finalAmount = outcome.final_amount;
  }

  // 5. Insert Transaction
  const { data: insertedTx, error: insertError } = await adminClient.from('discount_transactions').insert({
    scanner_id: merchantId,
    scanned_user_id: clientId,
    original_amount: amount,
    discount_pct: finalPct,
    final_amount: finalAmount,
    payment_method: method,
    day_of_week: new Date().getDay(),
    client_name: (clientUser as any).full_name || null,
    offer_title: offerTitle || null,
    offer_id: offerId || null,
    status: 'completed'
  }).select('id').single();

  if (insertError) {
    console.error("Insert error:", insertError);
    return { success: false, reason: `Error al registrar: ${insertError.message}` };
  }

  // Trigger push notification to merchant
  try {
    await sendPushNotification(merchantId, {
      title: '¡Cobro Exitoso! 💰',
      body: `Cobraste $${finalAmount.toLocaleString('es-AR')} a ${clientUser.full_name || 'un cliente'}.`,
      url: '/dashboard'
    });
  } catch (err) {
    console.error('Failed to send push notification:', err);
  }

  return { success: true, finalAmount: finalAmount, discountPct: finalPct, transactionId: insertedTx?.id };
}

export async function undoChargeServer(transactionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, reason: 'No autorizado' };

  const adminClient = createAdminClient();

  const { data: tx } = await adminClient
    .from('discount_transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (!tx) return { success: false, reason: 'Transacción no encontrada' };
  
  if (tx.scanner_id !== user.id) {
    return { success: false, reason: 'No tienes permiso para deshacer esta transacción' };
  }

  if (tx.status === 'cancelled') {
    return { success: false, reason: 'Esta transacción ya fue cancelada' };
  }

  const { error } = await adminClient
    .from('discount_transactions')
    .update({ status: 'cancelled' })
    .eq('id', transactionId);

  if (error) {
    console.error("Undo error:", error);
    return { success: false, reason: error.message };
  }

  if (tx.offer_id) {
    const { data: offer } = await adminClient
      .from('merchant_offers')
      .select('used_count')
      .eq('id', tx.offer_id)
      .single();

    if (offer && offer.used_count > 0) {
      await adminClient.from('merchant_offers').update({ 
        used_count: offer.used_count - 1,
        is_active: true // reactivar si había quedado pausada por stock limit
      }).eq('id', tx.offer_id);
    }
  }

  return { success: true };
}

export async function getLastTransactionServer(merchantId: string) {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('discount_transactions')
    .select('id')
    .eq('scanner_id', merchantId)
    .order('applied_at', { ascending: false })
    .limit(1)
    .single();

  return data ? data.id : null;
}

export async function rateTransactionServer(transactionId: string, rating: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, reason: 'No autorizado' };

  if (rating < 1 || rating > 5) return { success: false, reason: 'Calificación inválida' };

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('discount_transactions')
    .update({ rating })
    .eq('id', transactionId)
    // Nos aseguramos de que solo el cliente escaneado (scanned_user_id) pueda calificar,
    // o simplemente actualizamos si existe.
    .eq('scanned_user_id', user.id);

  if (error) {
    console.error("Rating error:", error);
    return { success: false, reason: error.message };
  }

  return { success: true };
}
