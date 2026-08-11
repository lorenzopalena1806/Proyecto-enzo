'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function createOffer(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const discount_pct = parseInt(formData.get('discount_pct') as string, 10);
  const target_role = formData.get('target_role') as string;

  if (!title || isNaN(discount_pct) || discount_pct <= 0 || discount_pct > 100) {
    return { success: false, error: 'Datos inválidos' };
  }

  const { error } = await supabase.from('merchant_offers').insert({
    merchant_id: user.id,
    title,
    description,
    discount_pct,
    target_role,
    is_active: true
  });

  if (error) {
    console.error("Error creating offer:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/offers');
  revalidatePath('/dashboard/scanner');
  return { success: true };
}

export async function toggleOfferStatus(offerId: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'No autorizado' };

  const { error } = await supabase
    .from('merchant_offers')
    .update({ is_active: isActive })
    .eq('id', offerId)
    .eq('merchant_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/offers');
  revalidatePath('/dashboard/scanner');
  return { success: true };
}

export async function deleteOffer(offerId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'No autorizado' };

  const { error } = await supabase
    .from('merchant_offers')
    .delete()
    .eq('id', offerId)
    .eq('merchant_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/offers');
  revalidatePath('/dashboard/scanner');
  return { success: true };
}
