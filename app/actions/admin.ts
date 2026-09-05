'use server';

import { createAdminClient, createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

// Validar que el usuario que ejecuta la acción es realmente un superadmin
async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autorizado');

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'superadmin') {
    throw new Error('Permisos insuficientes');
  }

  return adminClient;
}

export async function getMerchantsListServer() {
  try {
    const adminClient = await requireSuperAdmin();

    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('role', 'merchant')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    const combined = profiles.map((p: any) => ({
      ...p,
      subscriptionStatus: p.is_active ? 'active' : 'none',
      plan_name: p.plan_type || 'basic'
    }));

    return combined;
  } catch (error) {
    console.error('Error fetching merchants:', error);
    return [];
  }
}

export async function setMerchantPlanServer(merchantId: string, planAction: 'inactive' | 'basic' | 'pro') {
  try {
    const adminClient = await requireSuperAdmin();

    if (planAction === 'inactive') {
      const { error } = await adminClient
        .from('profiles')
        .update({ 
          is_active: false,
          mp_subscription_status: 'cancelled',
          is_premium: false
        })
        .eq('id', merchantId);
      if (error) throw error;
    } else {
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + 31);
      
      const { error } = await adminClient
        .from('profiles')
        .update({ 
          is_active: true,
          plan_type: planAction,
          mp_subscription_status: 'authorized',
          subscription_expires_at: endsAt.toISOString(),
          is_premium: planAction === 'pro'
        })
        .eq('id', merchantId);
      if (error) throw error;
    }

    revalidatePath('/admin/merchants');
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${merchantId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error changing merchant plan:', error.message || error);
    return { success: false, error: 'Error al actualizar suscripción: ' + (error.message || 'Desconocido') };
  }
}

export async function getMerchantsForMarketingServer() {
  try {
    const adminClient = await requireSuperAdmin();
    const { data: profiles, error } = await adminClient
      .from('profiles')
      .select('id, full_name, business_name')
      .eq('role', 'merchant')
      .order('business_name');
    
    if (error) throw error;
    return profiles;
  } catch (error) {
    console.error('Error fetching merchants for marketing:', error);
    return [];
  }
}

export async function createMarketingAssetServer(data: { merchant_id: string, title: string, description: string, file_url: string, file_type: string, uploaded_by: string }) {
  try {
    const adminClient = await requireSuperAdmin();
    const { error } = await adminClient.from('marketing_assets').insert(data);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error creating marketing asset:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteUserServer(userId: string) {
  try {
    const adminClient = await requireSuperAdmin();
    
    // 1. Eliminar dependencias para evitar errores de Foreign Key (si no tienen ON DELETE CASCADE)
    await adminClient.from('merchant_offers').delete().eq('merchant_id', userId);
    await adminClient.from('marketing_assets').delete().eq('merchant_id', userId);
    await adminClient.from('qr_codes').delete().eq('user_id', userId);
    await adminClient.from('discount_transactions').delete().eq('scanner_id', userId);
    await adminClient.from('discount_transactions').delete().eq('scanned_user_id', userId);
    await adminClient.from('favorites').delete().eq('user_id', userId);
    await adminClient.from('favorites').delete().eq('merchant_id', userId);
    await adminClient.from('merchant_branches').delete().eq('merchant_id', userId);
    
    // 2. Eliminar el perfil público
    await adminClient.from('profiles').delete().eq('id', userId);
    
    // 3. Supabase admin method to delete user de auth.users
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error.message || error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function toggleUserActiveStatusServer(userId: string, isActive: boolean) {
  try {
    const adminClient = await requireSuperAdmin();
    
    // Primero traemos la información actual del usuario
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role, subscription_expires_at, is_active')
      .eq('id', userId)
      .single();

    const updateData: any = { is_active: isActive };

    // Si lo estamos dando de ALTA (isActive = true) y es un COMERCIO
    // y además estaba inactivo antes o no tenía fecha de vencimiento válida,
    // le asignamos automáticamente 31 días.
    if (isActive && profile?.role === 'merchant') {
      const isCurrentlyExpired = !profile.subscription_expires_at || new Date(profile.subscription_expires_at) < new Date();
      if (isCurrentlyExpired) {
        const endsAt = new Date();
        endsAt.setDate(endsAt.getDate() + 31);
        updateData.subscription_expires_at = endsAt.toISOString();
        
        // Asumimos un plan básico por defecto si es que no tiene
        updateData.mp_subscription_status = 'authorized';
      }
    }

    const { error } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
    
    if (error) throw error;
    
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling user active status:', error.message || error);
    return { success: false, error: error.message };
  }
}

export async function toggleMerchantFeatured(merchantId: string, isFeatured: boolean) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('profiles')
      .update({ is_featured: isFeatured })
      .eq('id', merchantId);

    if (error) throw error;
    revalidatePath('/admin/merchants');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addFinanceRecordServer(data: any) {
  const adminClient = createAdminClient();
  const { data: record, error } = await adminClient.from('admin_finances').insert([data]).select().single();
  return { record, error };
}

export async function deleteFinanceRecordServer(id: string) {
  const adminClient = createAdminClient();
  const { error } = await adminClient.from('admin_finances').delete().eq('id', id);
  return { success: !error, error };
}
