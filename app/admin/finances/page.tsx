import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { FinanceClientPage } from '@/components/admin/FinanceClientPage';

export const metadata = {
  title: 'Libro Contable | Lazoo Admin',
};

export default async function AdminFinancesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();

  if (!profile || profile.role !== 'superadmin') {
    redirect('/dashboard');
  }

  const { data: finances } = await adminClient
    .from('admin_finances')
    .select('*')
    .order('date', { ascending: false });

  return <FinanceClientPage initialFinances={finances || []} />;
}
