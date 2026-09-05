export const dynamic = 'force-dynamic';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Package } from 'lucide-react';
import { ProfileEditForm } from '@/components/dashboard/ProfileEditForm';
import { PushManager } from '@/components/dashboard/PushManager';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/auth/login');

  const isPro = profile.plan_type === 'pro' && profile.mp_subscription_status === 'authorized';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Mi Perfil</h1>
        <p className="text-slate-400 mt-1">Actualizá los datos de tu cuenta.</p>
      </div>

      <PushManager />

      <ProfileEditForm profile={profile} userEmail={user.email || ''} isPro={isPro} />
    </div>
  );
}
