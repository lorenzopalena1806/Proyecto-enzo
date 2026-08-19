export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ClientScanner } from '@/components/client/ClientScanner';

export const metadata = {
  title: 'Escanear Local | RedBeneficios',
};

export default async function MerchantScannerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Escanear Local</h1>
        <p className="text-slate-400 mt-1">
          Usá el escáner para leer el código QR del comercio al que estás visitando.
        </p>
      </div>

      <ClientScanner />
    </div>
  );
}
