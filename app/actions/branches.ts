'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { extractCoordinatesFromMapsUrl } from './map';

export async function createBranchAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, reason: 'No autenticado' };

  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const phone = formData.get('phone') as string;
  const businessHours = formData.get('business_hours') as string;
  const mapsUrl = formData.get('maps_url') as string;

  if (!name) {
    return { success: false, reason: 'El nombre es obligatorio' };
  }

  let lat = -10;
  let lng = -10;
  
  if (mapsUrl) {
    const res = await extractCoordinatesFromMapsUrl(mapsUrl);
    if (res.success && res.lat && res.lng) {
      lat = res.lat;
      lng = res.lng;
    }
  }

  const { error } = await supabase.from('merchant_branches').insert({
    merchant_id: user.id,
    name,
    address: address || null,
    phone: phone || null,
    business_hours: businessHours || null,
    maps_url: mapsUrl || null,
    latitude: lat,
    longitude: lng,
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

export async function updateBranchAction(branchId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, reason: 'No autenticado' };

  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const phone = formData.get('phone') as string;
  const businessHours = formData.get('business_hours') as string;
  const mapsUrl = formData.get('maps_url') as string;

  if (!name) {
    return { success: false, reason: 'El nombre es obligatorio' };
  }

  const payload: any = { 
    name, 
    address: address || null,
    phone: phone || null,
    business_hours: businessHours || null,
    maps_url: mapsUrl || null
  };
  
  if (mapsUrl) {
    const res = await extractCoordinatesFromMapsUrl(mapsUrl);
    if (res.success && res.lat && res.lng) {
      payload.latitude = res.lat;
      payload.longitude = res.lng;
    }
  }

  const { error } = await supabase
    .from('merchant_branches')
    .update(payload)
    .eq('id', branchId)
    .eq('merchant_id', user.id);

  if (error) {
    console.error(error);
    return { success: false, reason: 'Hubo un error al actualizar la sucursal' };
  }

  revalidatePath('/dashboard/branches');
  revalidatePath('/client/map');
  return { success: true };
}
