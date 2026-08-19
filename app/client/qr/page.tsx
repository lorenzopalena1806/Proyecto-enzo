export const dynamic = 'force-dynamic';

import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { QRDisplay } from '@/components/dashboard/QRDisplay';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { LogOut, User, Scan } from 'lucide-react';
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

  // 2. Fetch this client's transaction history
  const { data: clientHistory } = await adminClient
    .from('discount_transactions')
    .select(`
      *,
      scanner:profiles!scanner_id(business_name, full_name),
      offer:merchant_offers(title)
    `)
    .eq('scanned_user_id', user.id)
    .order('applied_at', { ascending: false })
    .limit(20);

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
        <div className="flex items-center gap-2">
          <Link href="/client/profile" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Mi Perfil</span>
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 space-y-8 max-w-lg mx-auto w-full pt-6 pb-20">
        {/* Acción Principal */}
        <div className="w-full">
          <Link href="/client/scanner" className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg shadow-lg shadow-violet-900/40 transition-all">
            <Scan className="h-6 w-6" />
            Escanear QR del Local
          </Link>
        </div>

        {/* Sección: Código de Usuario (Fallback) */}
        <section className="space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-white">Hola, {profile?.full_name || 'Cliente'}</h1>
            <p className="text-slate-400 text-sm">Escaneá el QR en la caja del local, o dictales este código corto si no podés usar la cámara.</p>
          </div>

          <div className="w-full bg-slate-900 border border-violet-800/30 rounded-2xl p-4 text-center">
            <p className="text-slate-400 text-xs mb-1 font-medium uppercase tracking-wider">Código de Respaldo</p>
            <div className="text-4xl font-black text-white tracking-widest bg-slate-950 py-3 rounded-xl border border-slate-800">
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
                const hasPrices = offer.original_price && offer.final_price;
                const savings = hasPrices ? offer.original_price - offer.final_price : null;

                return (
                  <div key={offer.id} className="bg-slate-900 border border-slate-700 hover:border-violet-600/50 transition-colors rounded-2xl p-5 flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-violet-600 text-white font-bold px-3 py-1.5 rounded-bl-xl text-sm z-10 shadow-sm">
                      -{offer.discount_pct}%
                    </div>
                    <p className="text-xs text-violet-400 font-medium uppercase tracking-wider mb-1 pr-12 truncate">
                      {merchantName}
                    </p>
                    <h3 className="font-bold text-lg text-white mb-2 pr-8 leading-tight">{offer.title}</h3>
                    {offer.description && (
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{offer.description}</p>
                    )}
                    
                    {hasPrices && (
                      <div className="mt-auto bg-slate-950/80 rounded-xl p-3 border border-slate-800/80">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-500">Precio Normal</span>
                          <span className="text-sm text-slate-400 line-through">${offer.original_price.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-emerald-400 font-medium">Precio con App</span>
                          <span className="text-xl text-white font-black">${offer.final_price.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="text-xs text-emerald-950 bg-emerald-400 py-1.5 px-2 rounded-lg text-center font-bold uppercase tracking-wider shadow-sm shadow-emerald-900/50">
                          ¡Ahorrás ${savings?.toLocaleString('es-AR')}!
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Sección: Mis Descuentos Usados */}
        <section className="space-y-4 pt-4 border-t border-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-white">Mis Descuentos Usados</h2>
            <p className="text-sm text-slate-400">Historial de tus últimas compras con descuento.</p>
          </div>

          {(!clientHistory || clientHistory.length === 0) ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400">Todavía no usaste ningún descuento.</p>
              <p className="text-slate-500 text-sm mt-1">Mostrá tu código en un comercio adherido para empezar a ahorrar.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {clientHistory.map((tx: any) => {
                const scanner = tx.scanner as { business_name?: string; full_name?: string } | null;
                const offer = tx.offer as { title?: string } | null;
                const merchantName = scanner?.business_name || scanner?.full_name || 'Comercio';
                const saved = (tx.original_amount || 0) - (tx.final_amount || 0);

                return (
                  <div key={tx.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">{merchantName}</p>
                      <p className="text-slate-500 text-xs truncate">{offer?.title || 'Descuento general'}</p>
                      <p className="text-slate-600 text-xs mt-0.5">
                        {new Date(tx.applied_at).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'America/Argentina/Buenos_Aires',
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-emerald-400 font-bold text-sm">-{tx.discount_pct}%</p>
                      {saved > 0 && (
                        <p className="text-xs text-emerald-600">
                          Ahorraste ${saved.toLocaleString('es-AR')}
                        </p>
                      )}
                      {tx.final_amount && (
                        <p className="text-xs text-slate-400">
                          ${tx.final_amount.toLocaleString('es-AR')} pagado
                        </p>
                      )}
                    </div>
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
