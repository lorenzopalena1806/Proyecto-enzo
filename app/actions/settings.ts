'use server';

import { createAdminClient, createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function updatePricing(basicPrice: number, proPrice: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'superadmin') {
    return { error: 'Permisos insuficientes' };
  }

  try {
    // Actualizar Plan Básico
    await adminClient
      .from('app_settings')
      .upsert({ key: 'pricing_basic', value: { amount: basicPrice } });

    // Actualizar Plan PRO
    await adminClient
      .from('app_settings')
      .upsert({ key: 'pricing_pro', value: { amount: proPrice } });

    revalidatePath('/dashboard/pro');
    revalidatePath('/admin/settings');
    revalidatePath('/subscription-required');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating pricing:', error);
    return { error: 'Error interno al actualizar precios' };
  }
}
