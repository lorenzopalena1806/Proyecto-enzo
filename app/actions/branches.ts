'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function createBranchAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, reason: 'No autenticado' };

  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const latStr = formData.get('latitude') as string;
  const lngStr = formData.get('longitude') as string;

  if (!name || !latStr || !lngStr) {
    return { success: false, reason: 'El nombre y las coordenadas son obligatorias' };
  }

  const { error } = await supabase.from('merchant_branches').insert({
    merchant_id: user.id,
    name,
    address,
    latitude: parseFloat(latStr),
    longitude: parseFloat(lngStr),
  });

  if (error) {
    console.error(error);
    return { success: false, reason: 'Hubo un error al crear la sucursal en la base de datos' };
  }

  revalidatePath('/dashboard/branches');
  revalidatePath('/client/map');
  return { success: true };
}

export async function deleteBranchAction(branchId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, reason: 'No autenticado' };

  const { error } = await supabase
    .from('merchant_branches')
    .delete()
    .eq('id', branchId)
    .eq('merchant_id', user.id);

  if (error) return { success: false, reason: 'Error al eliminar la sucursal' };

  revalidatePath('/dashboard/branches');
  revalidatePath('/client/map');
  return { success: true };
}
