'use server';

import { createClient, createAdminClient } from '@/lib/supabase-server';

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
