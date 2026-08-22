'use server';

import { createAdminClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function createGlobalNotification(formData: FormData) {
  const adminClient = createAdminClient();
  const message = formData.get('message') as string;
  const type = formData.get('type') as string;
  const targetId = formData.get('target_merchant_id') as string;

  const target_merchant_id = (targetId && targetId !== 'all') ? targetId : null;

  if (!message || !type) {
    return { success: false, error: 'Faltan campos obligatorios.' };
  }

  // Solo apagamos las previas si el mensaje es global. Si es a un comercio en específico, no tocamos las demás.
  if (!target_merchant_id) {
    await adminClient
      .from('global_notifications')
      .update({ is_active: false })
      .is('target_merchant_id', null);
  }

  const { error } = await adminClient
    .from('global_notifications')
    .insert([{ message, type, is_active: true, target_merchant_id }]);

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
    // Averiguar si esta notificación es global o específica
    const { data: notif } = await adminClient.from('global_notifications').select('target_merchant_id').eq('id', id).single();
    
    // Si la prendemos y es global, apagamos las demás globales
    if (notif && !notif.target_merchant_id) {
      await adminClient
        .from('global_notifications')
        .update({ is_active: false })
        .is('target_merchant_id', null)
        .neq('id', id);
    }
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
