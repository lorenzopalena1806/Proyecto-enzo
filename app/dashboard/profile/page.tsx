export const dynamic = 'force-dynamic';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Package } from 'lucide-react';
import { ProfileEditForm } from '@/components/dashboard/ProfileEditForm';
import { MaterialRequestButton } from '@/components/dashboard/MaterialRequestButton';
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

      {profile.role === 'merchant' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Material Físico (QR)
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Para que los clientes puedan escanear tus ofertas, necesitás el cartel acrílico oficial de Lazoo en tu mostrador.
          </p>
          <MaterialRequestButton merchantId={user.id} status={profile.material_status || 'none'} />
        </div>
      )}

      <ProfileEditForm profile={profile} userEmail={user.email || ''} isPro={isPro} />
    </div>
  );
}
