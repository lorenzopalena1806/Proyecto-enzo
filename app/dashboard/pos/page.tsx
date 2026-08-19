export const dynamic = 'force-dynamic';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { POSView } from './POSView';

export const metadata = {
  title: 'Mi QR de Cobro | RedBeneficios',
};

export default async function POSPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'merchant') redirect('/dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">QR de Cobro</h1>
        <p className="text-slate-400 mt-1">
          Mostrá este QR a tus clientes. Ellos lo escanean, ingresan el monto y te avisan cuando está listo.
        </p>
      </div>

      <POSView merchantId={user.id} businessName={profile.business_name || profile.full_name} />
    </div>
  );
}
