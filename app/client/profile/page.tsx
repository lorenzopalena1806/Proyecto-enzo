export const dynamic = 'force-dynamic';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ProfileEditForm } from '@/components/dashboard/ProfileEditForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { InstallAppButton } from '@/components/client/InstallAppButton';
import { CopyCodeButton } from '@/components/client/CopyCodeButton';

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

  const { data: qrData } = await adminClient
    .from('qr_codes')
    .select('qr_token')
    .eq('user_id', user.id)
    .single();

  const shortCode = qrData?.qr_token?.substring(0, 6).toUpperCase() || '------';

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

          {/* Código de Cliente (Solo texto) */}
          <div className="bg-black/30 p-6 rounded-2xl border border-white/5 text-center relative z-10 mb-6">
            <p className="text-blue-300/80 text-xs font-bold uppercase tracking-widest mb-3">Tu Código de Cliente</p>
            <p className="text-slate-400 text-sm mb-4">Dictale este código al cajero para acceder a tus descuentos.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
              <div className="text-4xl sm:text-5xl font-black text-white tracking-[0.15em] sm:tracking-[0.2em] bg-black/40 py-3 sm:py-4 px-6 sm:px-8 rounded-2xl border border-white/10 shadow-inner font-montserrat w-full sm:w-auto">
                {shortCode}
              </div>
              <CopyCodeButton code={shortCode} className="shrink-0 p-4 w-full sm:w-auto flex justify-center" />
            </div>
          </div>

          <ProfileEditForm profile={profile} userEmail={user.email || ''} />
        </div>
      </div>
    </div>
  );
}
