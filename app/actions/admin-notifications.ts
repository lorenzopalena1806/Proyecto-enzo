'use server';

import { createAdminClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function createGlobalNotification(formData: FormData) {
  const adminClient = createAdminClient();
  const message = formData.get('message') as string;
  const type = formData.get('type') as string;

  if (!message || !type) {
    return { success: false, error: 'Faltan campos obligatorios.' };
  }

  // Apagamos todas las notificaciones previas para que haya solo 1 activa
  await adminClient
    .from('global_notifications')
    .update({ is_active: false })
    .neq('message', ''); // truco para actualizar todas

  const { error } = await adminClient
    .from('global_notifications')
    .insert([{ message, type, is_active: true }]);

  if (error) {
    console.error('Error creando notificación:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/admin/notifications');
  return { success: true };
}

export async function toggleNotificationStatus(id: string, isActive: boolean) {
  const adminClient = createAdminClient();

  if (isActive) {
    // Si la prendemos, apagamos todas las demás
    await adminClient
      .from('global_notifications')
      .update({ is_active: false })
      .neq('id', id);
  }

  const { error } = await adminClient
    .from('global_notifications')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/admin/notifications');
  return { success: true };
}

export async function deleteGlobalNotification(id: string) {
  const adminClient = createAdminClient();
  const { error } = await adminClient.from('global_notifications').delete().eq('id', id);
  
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/admin/notifications');
  return { success: true };
}
