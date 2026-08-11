export const dynamic = 'force-dynamic';

import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { QRDisplay } from '@/components/dashboard/QRDisplay';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { encodeQRPayload } from '@/lib/qr-utils';

export default async function ClientQRPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  const adminClient = createAdminClient();

  // Obtener perfil y QR
  const { data: profile } = await adminClient
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  let { data: qrData } = await adminClient
    .from('qr_codes')
    .select('qr_token')
    .eq('user_id', user.id)
    .single();

  // Self-healing: si el usuario no tiene QR (por fallos anteriores), se lo creamos en el momento.
  if (!qrData) {
    const token = crypto.randomUUID();
    const { data: newQr } = await adminClient
      .from('qr_codes')
      .insert({ user_id: user.id, qr_token: token })
      .select('qr_token')
      .single();
    
    if (newQr) {
      qrData = newQr;
    } else {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <p className="text-white text-center">
            Hubo un error al generar tu QR. Por favor intentá de nuevo más tarde.<br/><br/>
            <span className="text-slate-400 text-sm">
              Actualmente estás logueado como: <strong className="text-violet-400">{user.email}</strong>
            </span>
          </p>
          <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col items-center space-y-3">
            <LogoutButton />
          </div>
        </div>
      );
    }
  }

  const encodedQR = encodeQRPayload({
    userId: user.id,
    role: 'client',
    token: qrData.qr_token,
    version: 1,
  });

  // 1. Fetch active offers from merchants
  // We fetch offers targeted to 'client' or 'all'
  const { data: offers } = await adminClient
    .from('merchant_offers')
    .select(`
      *,
      merchant:profiles!merchant_id (
        business_name,
        full_name
      )
    `)
    .eq('is_active', true)
    .in('target_role', ['client', 'all'])
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm">RedBeneficios</span>
        </div>
        
        <LogoutButton />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 space-y-8 max-w-lg mx-auto w-full pt-6 pb-20">
        
        {/* Sección: Código de Usuario */}
        <section className="space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">Hola, {profile?.full_name || 'Cliente'}</h1>
            <p className="text-slate-400 text-sm">Dictale este código al comerciante para aplicar tu descuento, o escaneá el QR del local con tu cámara.</p>
          </div>

          <div className="w-full bg-slate-900 border border-violet-800/50 rounded-2xl p-6 text-center shadow-xl shadow-violet-900/20">
            <p className="text-slate-400 text-sm mb-2 font-medium uppercase tracking-wider">Tu Código Único</p>
            <div className="text-5xl font-black text-white tracking-widest bg-violet-950/40 py-4 rounded-xl border border-violet-800">
              {qrData.qr_token.substring(0, 6).toUpperCase()}
            </div>
          </div>
        </section>

        {/* Sección: Vidriera de Ofertas */}
        <section className="space-y-4 pt-4 border-t border-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-white">Ofertas Disponibles</h2>
            <p className="text-sm text-slate-400">Visitá estos locales y aprovechá los descuentos.</p>
          </div>

          {(!offers || offers.length === 0) ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400">Por ahora no hay ofertas especiales disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {offers.map((offer: any) => {
                const merchant = offer.merchant as { business_name?: string; full_name?: string };
                const merchantName = merchant?.business_name || merchant?.full_name || 'Comercio Adherido';

                return (
                  <div key={offer.id} className="bg-slate-900 border border-slate-700 hover:border-violet-600/50 transition-colors rounded-2xl p-5 flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-violet-600 text-white font-bold px-3 py-1.5 rounded-bl-xl text-sm z-10">
                      -{offer.discount_pct}%
                    </div>
                    <p className="text-xs text-violet-400 font-medium uppercase tracking-wider mb-1 pr-12 truncate">
                      {merchantName}
                    </p>
                    <h3 className="font-bold text-lg text-white mb-2 pr-8 leading-tight">{offer.title}</h3>
                    {offer.description && (
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2 flex-1">{offer.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
