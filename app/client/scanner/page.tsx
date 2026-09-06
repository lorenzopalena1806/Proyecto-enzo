import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ClientScanner } from '@/components/client/ClientScanner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import React from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Escanear Local | Lazoo',
};

export default async function ClientScannerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();
  const { data: qrData } = await adminClient
    .from('qr_codes')
    .select('qr_token')
    .eq('user_id', user.id)
    .single();

  const shortCode = qrData?.qr_token?.substring(0, 6).toUpperCase() || '------';

  return (
    <div className="space-y-6 max-w-lg mx-auto w-full p-4 relative min-h-screen text-white">
      <div className="flex items-center gap-3 pt-4">
        <Link 
          href="/client/qr" 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Escanear Local</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Leé el QR del comercio para acceder.
          </p>
        </div>
      </div>

      <ClientScanner />

      <div className="bg-slate-900/50 rounded-2xl p-6 text-center border border-slate-800 mt-4">
        <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-widest">¿No te funciona la cámara?</p>
        <p className="text-sm text-slate-300 mb-3">Dictale este código al cajero:</p>
        <div className="text-4xl font-black text-white tracking-[0.2em] bg-black/40 py-3 rounded-xl border border-slate-700 shadow-inner inline-block px-8">
          {shortCode}
        </div>
      </div>
    </div>
  );
}
