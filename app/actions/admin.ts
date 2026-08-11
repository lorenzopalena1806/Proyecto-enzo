'use server';

import { createAdminClient, createClient } from '@/lib/supabase-server';

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

    const { data: subscriptions } = await adminClient
      .from('subscriptions')
      .select('merchant_id, status');

    const subsMap = new Map(subscriptions?.map((s: any) => [s.merchant_id, s.status]) || []);

    const combined = profiles.map((p: any) => ({
      ...p,
      subscriptionStatus: (subsMap.get(p.id) as 'active' | 'inactive') || 'none',
    }));

    return combined;
  } catch (error) {
    console.error('Error fetching merchants:', error);
    return [];
  }
}

export async function toggleMerchantSubscriptionServer(merchantId: string, currentStatus: string) {
  try {
    const adminClient = await requireSuperAdmin();
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    if (currentStatus === 'none') {
      await adminClient.from('subscriptions').insert({
        merchant_id: merchantId,
        status: 'active',
        plan_name: 'basic',
      });
    } else {
      await adminClient
        .from('subscriptions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('merchant_id', merchantId);
    }
    return { success: true };
  } catch (error) {
    console.error('Error toggling subscription:', error);
    return { success: false };
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
