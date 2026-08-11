import { createClient } from '@/lib/supabase-server';
import { ChargeGenerator } from '@/components/dashboard/ChargeGenerator';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Generar Cobro | RedBeneficios',
  description: 'Generá un código QR o pedí el código del cliente para aplicar descuentos automáticamente.',
};

export default async function ScannerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Generar Cobro</h1>
        <p className="text-slate-400 mt-1">
          Ingresá el monto y seleccioná el método de pago para cobrar con descuento.
        </p>
      </div>

      <ChargeGenerator merchantId={user.id} />
    </div>
  );
}
