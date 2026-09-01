import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { BranchManager } from '@/components/dashboard/BranchManager';

export const metadata = {
  title: 'Mis Sucursales | Lazoo',
};

export default async function BranchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();

  // Verificar rol
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'merchant') redirect('/dashboard');

  // Verificar suscripción PRO
  const { data: subscription } = await adminClient
    .from('subscriptions')
    .select('*')
    .eq('merchant_id', user.id)
    .eq('status', 'active')
    .single();

  if (!subscription) {
    redirect('/dashboard/pro');
  }

  const { data: branches } = await adminClient
    .from('merchant_branches')
    .select('*')
    .eq('merchant_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <BranchManager branches={branches || []} />
    </div>
  );
}
