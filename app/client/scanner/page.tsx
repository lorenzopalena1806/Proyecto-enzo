export const dynamic = 'force-dynamic';

import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ClientScanner } from '@/components/client/ClientScanner';

export const metadata = {
  title: 'Escanear Local | Lazoo',
};

export default async function ClientScannerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: qrData } = await supabase
    .from('qr_codes')
    .select('qr_token')
    .eq('user_id', user.id)
    .single();

  const shortCode = qrData?.qr_token?.substring(0, 6).toUpperCase() || '------';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Escanear Local</h1>
        <p className="text-slate-400 mt-1">
          Usá el escáner para leer el código QR del comercio y acceder a los descuentos.
        </p>
      </div>

      <ClientScanner />

      <div className="glass-panel rounded-2xl p-6 text-center border-white/5 mt-4">
        <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-widest">¿No te funciona la cámara?</p>
        <p className="text-sm text-slate-300 mb-3">Dictale este código al cajero:</p>
        <div className="text-4xl font-black text-white tracking-[0.2em] bg-black/30 py-3 rounded-xl border border-white/10 shadow-inner inline-block px-8">
          {shortCode}
        </div>
      </div>
    </div>
  );
}
