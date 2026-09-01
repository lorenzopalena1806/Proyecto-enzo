export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { CashierLoginForm } from './CashierLoginForm';

export const metadata = {
  title: 'Acceso de Cajero | Lazoo',
};

export default async function CashierLoginPage({ params }: { params: { employee_id: string } }) {
  const adminClient = createAdminClient();
  
  // Buscar datos básicos del empleado
  const { data: emp, error: empErr } = await adminClient
    .from('merchant_employees')
    .select('*')
    .eq('id', params.employee_id)
    .single();

  if (empErr || !emp) {
    console.error('Error fetching employee:', empErr);
    notFound();
  }

  // Buscar sucursal
  const { data: branchData } = await adminClient
    .from('merchant_branches')
    .select('name')
    .eq('id', emp.branch_id)
    .single();

  // Buscar comercio
  const { data: merchantData } = await adminClient
    .from('profiles')
    .select('business_name')
    .eq('id', emp.merchant_id)
    .single();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
        </div>
        
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-2xl font-black text-white mb-2">{merchantData?.business_name}</h1>
          <p className="text-blue-400 font-bold">{branchData?.name}</p>
          <p className="text-sm text-slate-400 mt-2">Cajero: {emp.name}</p>
        </div>

        <CashierLoginForm employeeId={params.employee_id} />
      </div>
    </div>
  );
}
