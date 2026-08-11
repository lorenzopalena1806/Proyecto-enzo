'use server';

import { createAdminClient, createClient } from '@/lib/supabase-server';
import { calculateDiscount } from '@/lib/discount-logic';
import type { PaymentMethod, Profile } from '@/types';

export async function processPaymentByShortCodeServer(merchantId: string, amount: number, method: PaymentMethod, shortCode: string) {
  const adminClient = createAdminClient();

  // Find the QR code by short code (first 6 chars of qr_token)
  // Since we don't have a short_code column, we use a wildcard search on qr_token
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

  return await executePaymentServer(merchantId, qrRecord.user_id, amount, method, qrRecord.qr_token);
}

export async function confirmScannedPaymentServer(merchantId: string, amount: number, method: PaymentMethod) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, reason: 'Debes iniciar sesión para confirmar el pago.' };
  }

  const adminClient = createAdminClient();

  // Get the client's QR token
  const { data: qrData } = await adminClient
    .from('qr_codes')
    .select('qr_token, is_active')
    .eq('user_id', user.id)
    .single();

  if (!qrData || !qrData.is_active) {
    return { success: false, reason: 'No tienes un código QR activo para recibir beneficios.' };
  }

  return await executePaymentServer(merchantId, user.id, amount, method, qrData.qr_token);
}

async function executePaymentServer(merchantId: string, clientId: string, amount: number, method: PaymentMethod, qrToken: string) {
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
    .select('is_active, role')
    .eq('id', clientId)
    .single();

  if (!clientUser || !clientUser.is_active) {
    return { success: false, reason: 'El usuario cliente no es válido o está inactivo.' };
  }

  // 4. Calculate Discount
  const outcome = calculateDiscount(clientUser.role, method, amount);

  if (!outcome.valid) {
    return { success: false, reason: outcome.reason };
  }

  // 5. Insert Transaction
  const { error: insertError } = await adminClient.from('discount_transactions').insert({
    scanner_id: merchantId,
    scanned_user_id: clientId,
    original_amount: amount,
    discount_pct: outcome.discount_pct,
    final_amount: outcome.final_amount,
    payment_method: method,
    day_of_week: new Date().getDay(),
  });

  if (insertError) {
    console.error("Insert error:", insertError);
    return { success: false, reason: `Error al registrar: ${insertError.message}` };
  }

  return { success: true, finalAmount: outcome.final_amount, discountPct: outcome.discount_pct };
}
