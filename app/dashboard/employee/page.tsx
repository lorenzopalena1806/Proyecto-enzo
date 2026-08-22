import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { EmployeeConfigForm } from './EmployeeConfigForm';

export const metadata = {
  title: 'Modo Empleado | Lazoo',
};

export default async function EmployeeModePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lazoo.vercel.app';
  const posUrl = `${baseUrl}/pos/${user.id}`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Modo Empleado</h1>
        <p className="text-slate-400 mt-1">
          Configurá un PIN de acceso rápido para que tus cajeros puedan cobrar descuentos sin ver el resto de tu cuenta.
        </p>
      </div>

      <EmployeeConfigForm posUrl={posUrl} merchantId={user.id} />
    </div>
  );
}
