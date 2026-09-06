export const dynamic = 'force-dynamic';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Package } from 'lucide-react';
import { ProfileEditForm } from '@/components/dashboard/ProfileEditForm';
import { PushManager } from '@/components/dashboard/PushManager';
import { RestartTutorialButton } from '@/components/client/RestartTutorialButton';

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
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Tutorial Interactivo</h2>
        <p className="text-sm text-slate-400">Si querés volver a ver la guía paso a paso de cómo usar tu panel, podés reiniciarla acá.</p>
        <RestartTutorialButton userId={user.id} redirectUrl="/dashboard" text="Volver a ver el Tutorial" />
      </div>
    </div>
  );
}
