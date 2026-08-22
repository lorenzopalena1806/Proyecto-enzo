import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { NotificationsManager } from './NotificationsManager';

export const metadata = {
  title: 'Comunicados Globales | Lazoo Admin',
};

export default async function AdminNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') redirect('/dashboard');

  const { data: notifications } = await adminClient
    .from('global_notifications')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Comunicados Globales</h1>
        <p className="text-slate-400 mt-1">
          Enviá carteles de aviso a todos los comercios. Solo 1 puede estar activo a la vez.
        </p>
      </div>

      <NotificationsManager initialNotifications={notifications || []} />
    </div>
  );
}
