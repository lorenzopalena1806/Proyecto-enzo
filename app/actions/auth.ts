'use server';

import { createClient, createAdminClient } from '@/lib/supabase-server';

export async function loginWithPasswordServer(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Get role
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  return { success: true, role: profile?.role || null };
}

export async function getUserRoleServer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  return profile?.role || null;
}
export async function getUserRoleById(userId: string) {
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  return profile?.role || null;
}

export async function updateProfileServer(userId: string, data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.id !== userId) {
    return { success: false, error: { message: 'No autorizado' } };
  }

  // Filtramos campos sensibles para evitar escalamiento de privilegios
  const safeData = { ...data };
  delete safeData.role;
  delete safeData.plan_type;
  delete safeData.mp_subscription_id;
  delete safeData.mp_subscription_status;
  delete safeData.id;

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('profiles')
    .update(safeData)
    .eq('id', userId);
  return { success: !error, error };
}

export async function createClientQRServer(userId: string) {
  const adminClient = createAdminClient();
  const token = crypto.randomUUID();
  const { error } = await adminClient.from('qr_codes').insert({
    user_id: userId,
    qr_token: token,
  });
  return { success: !error, error };
}
