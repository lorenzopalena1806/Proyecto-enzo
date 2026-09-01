export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase-server';
import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { POSView } from '@/app/dashboard/pos/POSView';

export const metadata = {
  title: 'Terminal de Cobro | Lazoo',
};

export default async function CashierPOSPage({ params }: { params: { employee_id: string } }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(`lazoo_emp_${params.employee_id}`);
  
  if (!sessionCookie) {
    redirect(`/cajero/${params.employee_id}`);
  }

  const adminClient = createAdminClient();

  const { data: emp, error: empErr } = await adminClient
    .from('merchant_employees')
    .select('*')
    .eq('id', params.employee_id)
    .single();

  if (empErr || !emp) {
    console.error('Error fetching employee for POS:', empErr);
    notFound();
  }

  // Buscar comercio
  const { data: merchantData } = await adminClient
    .from('profiles')
    .select('business_name')
    .eq('id', emp.merchant_id)
    .single();

  // Traer las ofertas activas del comercio
  const { data: offers } = await adminClient
    .from('merchant_offers')
    .select('id, title, discount_pct, original_price, final_price')
    .eq('merchant_id', emp.merchant_id)
    .eq('is_active', true);


  // Renderizamos una version reducida usando el mismo POSView, 
  // pero pasándole flags para ocultar el header normal si quisiéramos.
  // El POSView actual es un componente de cliente que recibe merchantId y ofertas.
  // Pero ahora debemos pasarle un "employeeId" si queremos que llame a las acciones de empleado.
  // Dado que POSView ya existe, la vamos a usar, pero necesitamos asegurarnos de que use las acciones correctas.
  // Wait, POSView uses `createPendingCharge` from `app/actions/pending-charges.ts` which uses `supabase.auth.getUser()`.
  // The employee does NOT have a Supabase Auth session!
  // So we MUST create a special `CashierPOSView.tsx` for the employee that uses `app/actions/employee.ts`.
  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-md mx-auto">
        <div className="glass-panel p-4 rounded-2xl mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-white font-bold">{merchantData?.business_name}</h1>
            <p className="text-xs text-blue-400">Cajero: {emp.name}</p>
          </div>
          <form action={async () => {
            'use server';
            const { cookies } = await import('next/headers');
            const cs = await cookies();
            cs.delete(`lazoo_emp_${params.employee_id}`);
            const { redirect } = await import('next/navigation');
            redirect(`/cajero/${params.employee_id}`);
          }}>
            <button type="submit" className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-500/30">
              Salir
            </button>
          </form>
        </div>

        <POSView 
          merchantId={emp.merchant_id} 
          branchId={emp.branch_id}
          businessName={merchantData?.business_name || 'Comercio'}
          offers={offers || []}
          employeeId={params.employee_id}
        />
      </div>
    </div>
  );
}
