'use server';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function createOffer(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  let discount_pct = parseInt(formData.get('discount_pct') as string, 10);
  const target_role = formData.get('target_role') as string;
  const stock_limit_raw = formData.get('stock_limit') as string;
  const stock_limit = stock_limit_raw ? parseInt(stock_limit_raw, 10) : null;
  const valid_days = formData.getAll('valid_days') as string[];
  
  const original_price_raw = formData.get('original_price') as string;
  const final_price_raw = formData.get('final_price') as string;
  let original_price = original_price_raw ? parseFloat(original_price_raw) : null;
  let final_price = final_price_raw ? parseFloat(final_price_raw) : null;

  if (original_price && final_price && original_price > 0 && final_price > 0 && final_price < original_price) {
    discount_pct = Math.round((1 - (final_price / original_price)) * 100);
  } else {
    original_price = null;
    final_price = null;
  }

  if (!title || isNaN(discount_pct) || discount_pct <= 0 || discount_pct > 100) {
    return { success: false, error: 'Datos inválidos. Asegurate de poner el descuento o los precios.' };
  }

  const image_url_raw = formData.get('image_url') as string;
  const image_url = image_url_raw && image_url_raw.startsWith('http') ? image_url_raw : null;

  let branch_id = formData.get('branch_id') as string | null;
  if (branch_id === 'central' || branch_id === '') {
    branch_id = null;
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from('merchant_offers').insert({
    merchant_id: user.id,
    branch_id: branch_id || null,
    title,
    description,
    discount_pct,
    original_price,
    final_price,
    target_role,
    image_url,
    stock_limit,
    valid_days,
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

export async function updateOffer(offerId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  let discount_pct = parseInt(formData.get('discount_pct') as string, 10);
  const target_role = formData.get('target_role') as string;
  const stock_limit_raw = formData.get('stock_limit') as string;
  const stock_limit = stock_limit_raw ? parseInt(stock_limit_raw, 10) : null;
  const valid_days = formData.getAll('valid_days') as string[];
  
  const original_price_raw = formData.get('original_price') as string;
  const final_price_raw = formData.get('final_price') as string;
  let original_price = original_price_raw ? parseFloat(original_price_raw) : null;
  let final_price = final_price_raw ? parseFloat(final_price_raw) : null;

  if (original_price && final_price && original_price > 0 && final_price > 0 && final_price < original_price) {
    discount_pct = Math.round((1 - (final_price / original_price)) * 100);
  } else {
    original_price = null;
    final_price = null;
  }

  if (!title || isNaN(discount_pct) || discount_pct <= 0 || discount_pct > 100) {
    return { success: false, error: 'Datos inválidos. Asegurate de poner el descuento o los precios.' };
  }

  const image_url_raw = formData.get('image_url') as string;
  const image_url = image_url_raw && image_url_raw.startsWith('http') ? image_url_raw : null;

  let branch_id = formData.get('branch_id') as string | null;
  if (branch_id === 'central' || branch_id === '') {
    branch_id = null;
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from('merchant_offers').update({
    title,
    description,
    discount_pct,
    original_price,
    final_price,
    target_role,
    image_url,
    stock_limit,
    valid_days,
    branch_id: branch_id || null
  }).eq('id', offerId).eq('merchant_id', user.id);

  if (error) {
    console.error("Error updating offer:", error);
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

  const adminClient = createAdminClient();
  const { error } = await adminClient
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

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('merchant_offers')
    .delete()
    .eq('id', offerId)
    .eq('merchant_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/offers');
  revalidatePath('/dashboard/scanner');
  return { success: true };
}

export async function resetOfferStock(offerId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'No autorizado' };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('merchant_offers')
    .update({ is_active: true, used_count: 0 })
    .eq('id', offerId)
    .eq('merchant_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/offers');
  revalidatePath('/dashboard/scanner');
  return { success: true };
}
