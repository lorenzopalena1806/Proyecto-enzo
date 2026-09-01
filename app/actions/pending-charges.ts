'use server';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function createPendingCharge(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autorizado' };

  const adminClient = createAdminClient();

  // Cancelar cualquier cobro activo previo del mismo comercio
  await adminClient
    .from('pending_charges')
    .update({ status: 'cancelled' })
    .eq('merchant_id', user.id)
    .eq('status', 'active');

  const offer_id = formData.get('offer_id') as string | null;
  const amount = parseFloat(formData.get('amount') as string);
  const payment_method = formData.get('payment_method') as string;
  const offer_title = formData.get('offer_title') as string | null;
  const branch_id = formData.get('branch_id') as string | null;

  if (!amount || amount <= 0 || !payment_method) {
    return { success: false, error: 'Datos inválidos. Revisá el monto y el método de pago.' };
  }

  const { data, error } = await adminClient
    .from('pending_charges')
    .insert({
      merchant_id: user.id,
      branch_id: branch_id || null,
      offer_id: offer_id || null,
      offer_title: offer_title || null,
      amount,
      payment_method,
      status: 'active',
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Expira en 5 minutos
    })
    .select('id')
    .single();

  if (error) {
    console.error('createPendingCharge error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/pos');
  return { success: true, chargeId: data.id };
}

export async function cancelPendingCharge(chargeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autorizado' };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('pending_charges')
    .update({ status: 'cancelled' })
    .eq('id', chargeId)
    .eq('merchant_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/pos');
  return { success: true };
}

// Called by the CLIENT after confirming payment — marks the charge as completed with result info
export async function completePendingCharge(
  chargeId: string,
  completedByName: string,
  finalAmountPaid: number,
  discountAppliedPct: number,
) {
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('pending_charges')
    .update({
      status: 'completed',
      completed_by_name: completedByName,
      final_amount_paid: finalAmountPaid,
      discount_applied_pct: discountAppliedPct,
    })
    .eq('id', chargeId);

  if (error) {
    console.error('completePendingCharge error:', error);
    return { success: false };
  }
  return { success: true };
}

export async function completePendingChargeWithCode(chargeId: string, shortCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autorizado' };

  const adminClient = createAdminClient();
  
  // 1. Get the pending charge
  const { data: charge } = await adminClient
    .from('pending_charges')
    .select('*')
    .eq('id', chargeId)
    .eq('merchant_id', user.id)
    .eq('status', 'active')
    .single();

  if (!charge) {
    return { success: false, error: 'Cobro activo no encontrado.' };
  }

  // 2. Find client by short code
  const { data: qrRecords } = await adminClient
    .from('qr_codes')
    .select('user_id, is_active, profiles:user_id(full_name)')
    .ilike('qr_token', `${shortCode}%`)
    .limit(1);

  if (!qrRecords || qrRecords.length === 0) {
    return { success: false, error: 'Código de cliente no encontrado.' };
  }

  const clientData = qrRecords[0];
  if (!clientData.is_active) {
    return { success: false, error: 'El código de este cliente está desactivado.' };
  }

  // 3. Process payment using the existing logic
  const { processPaymentByShortCodeServer } = await import('./charge');
  const paymentRes = await processPaymentByShortCodeServer(
    user.id, 
    charge.amount, 
    charge.payment_method as any, 
    shortCode, 
    charge.offer_id || undefined,
    charge.branch_id || undefined
  );

  if (!paymentRes.success) {
    return { success: false, error: paymentRes.reason || 'Error al procesar el pago.' };
  }

  // 4. Update the pending charge to completed to trigger the real-time UI
  const clientProfile = clientData.profiles as any;
  const { error: updateError } = await adminClient
    .from('pending_charges')
    .update({
      status: 'completed',
      completed_by_name: clientProfile?.full_name || 'Cliente',
      final_amount_paid: (paymentRes as any).finalAmount,
      discount_applied_pct: (paymentRes as any).discountPct,
    })
    .eq('id', chargeId);

  if (updateError) {
    console.error('Error updating pending charge status:', updateError);
    return { success: false, error: 'Pago registrado, pero no se pudo actualizar la pantalla.' };
  }

  return { success: true };
}
