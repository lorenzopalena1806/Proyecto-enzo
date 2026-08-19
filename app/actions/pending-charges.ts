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

  if (!amount || amount <= 0 || !payment_method) {
    return { success: false, error: 'Datos inválidos. Revisá el monto y el método de pago.' };
  }

  const { data, error } = await adminClient
    .from('pending_charges')
    .insert({
      merchant_id: user.id,
      offer_id: offer_id || null,
      offer_title: offer_title || null,
      amount,
      payment_method,
      status: 'active',
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
