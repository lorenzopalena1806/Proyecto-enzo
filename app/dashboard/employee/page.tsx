import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { EmployeeManager } from '@/components/dashboard/EmployeeManager';

export const metadata = {
  title: 'Modo Empleado | Lazoo',
};

export default async function EmployeeModePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');
  
  const adminClient = createAdminClient();

  // Fetch profile to get plan type
  const { data: profile } = await adminClient.from('profiles').select('plan_type').eq('id', user.id).single();

  // Traer empleados
  const { data: employees } = await adminClient
    .from('merchant_employees')
    .select('*')
    .eq('merchant_id', user.id)
    .order('created_at', { ascending: false });

  // Traer sucursales
  const { data: branches } = await adminClient
    .from('merchant_branches')
    .select('id, name')
    .eq('merchant_id', user.id);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazoo.vercel.app';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Sistema de Cajeros</h1>
        <p className="text-slate-400 mt-1">
          Creá usuarios para tus empleados. Podrán cobrar directamente desde sus celulares o una tablet del mostrador, sin ver tu facturación.
        </p>
      </div>

      <EmployeeManager 
        employees={employees || []} 
        branches={branches || []} 
        baseUrl={baseUrl} 
        planType={profile?.plan_type || 'basic'}
      />
    </div>
  );
}
