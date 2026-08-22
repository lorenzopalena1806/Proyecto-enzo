import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase-server';
import { EmployeePinPad } from './EmployeePinPad';
import { EmployeeChargeGenerator } from './EmployeeChargeGenerator';
import { Store, LogOut } from 'lucide-react';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Caja Registradora | Lazoo',
};

export default async function EmployeePOSPage({
  params
}: {
  params: Promise<{ merchant_id: string }>;
}) {
  const { merchant_id: merchantId } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(`emp_session_${merchantId}`);
  const hasAccess = sessionCookie?.value === 'active';

  const adminClient = createAdminClient();

  const { data: profile } = await adminClient
    .from('profiles')
    .select('business_name, full_name, is_active, role')
    .eq('id', merchantId)
    .single();

  if (!profile || profile.role !== 'merchant' || !profile.is_active) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center text-red-400">
          Comercio no válido o inactivo.
        </div>
      </div>
    );
  }

  const merchantName = profile.business_name || profile.full_name || 'Comercio';

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#060D1A] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-violet-900/30 border border-violet-800 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <Store className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{merchantName}</h1>
          <p className="text-slate-400 text-sm">Modo Empleado</p>
        </div>

        <EmployeePinPad merchantId={merchantId} />
      </div>
    );
  }

  // Si tiene acceso, buscamos las ofertas activas
  const { data: offers } = await adminClient
    .from('merchant_offers')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#060D1A] p-4 pb-12 flex flex-col">
      <header className="flex items-center justify-between py-4 mb-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-violet-400" />
          <div>
            <h1 className="text-white font-bold leading-tight">{merchantName}</h1>
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-wider">Caja (Empleado)</p>
          </div>
        </div>
        <form action={async () => {
          'use server';
          const cs = await cookies();
          cs.delete(`emp_session_${merchantId}`);
          redirect(`/pos/${merchantId}`);
        }}>
          <button type="submit" className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </header>

      <EmployeeChargeGenerator merchantId={merchantId} activeOffers={offers || []} />
    </div>
  );
}
