export const dynamic = 'force-dynamic';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ProfileEditForm } from '@/components/dashboard/ProfileEditForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { InstallAppButton } from '@/components/client/InstallAppButton';

export default async function ClientProfilePage() {
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

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-xl mx-auto space-y-6 pt-4 pb-20">
        <div className="flex items-center gap-3">
          <Link href="/client/qr" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Mi Perfil</h1>
            <p className="text-sm text-slate-400">Gestioná tu cuenta de cliente.</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          
          <div className="mb-4">
            <InstallAppButton />
          </div>

          <ProfileEditForm profile={profile} userEmail={user.email || ''} />
        </div>
      </div>
    </div>
  );
}
