import { createClient } from '@/lib/supabase-server';
import { ChargeGenerator } from '@/components/dashboard/ChargeGenerator';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Generar Cobro | Lazoo',
  description: 'Generá un código QR o pedí el código del cliente para aplicar descuentos automáticamente.',
};

export default async function ScannerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: offers } = await supabase
    .from('merchant_offers')
    .select('*')
    .eq('merchant_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard" 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Generar Cobro</h1>
          <p className="text-slate-400 mt-1">
            Ingresá el monto y seleccioná el método de pago para cobrar con descuento.
          </p>
        </div>
      </div>

      <ChargeGenerator merchantId={user.id} activeOffers={offers || []} />
    </div>
  );
}
