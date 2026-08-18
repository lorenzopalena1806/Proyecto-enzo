export const dynamic = 'force-dynamic';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ProfileEditForm } from '@/components/dashboard/ProfileEditForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
            <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
            <p className="text-slate-400 text-sm mt-0.5">Actualizá tus datos personales.</p>
          </div>
        </div>
        <ProfileEditForm profile={profile} userEmail={user.email || ''} />
      </div>
    </div>
  );
}
