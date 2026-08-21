export const dynamic = 'force-dynamic';

import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { User, Scan, Sparkles, Tag, ShoppingBag, Clock, Store, MapPin } from 'lucide-react';
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
        <div className="min-h-screen bg-[#060D1A] flex flex-col items-center justify-center p-4">
          <p className="text-white text-center">
            Hubo un error al generar tu QR. Por favor intentá de nuevo más tarde.<br/><br/>
            <span className="text-slate-400 text-sm">
              Actualmente estás logueado como: <strong className="text-blue-400">{user.email}</strong>
            </span>
          </p>
          <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center space-y-3">
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

  // 1. Fetch active offers from active merchants
  const { data: offers } = await adminClient
    .from('merchant_offers')
    .select(`
      *,
      merchant:profiles!inner (
        business_name,
        full_name,
        is_active
      )
    `)
    .eq('is_active', true)
    .eq('merchant.is_active', true)
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

  // 3. Fetch Locales Adheridos (active merchants)
  const { data: merchants } = await adminClient
    .from('profiles')
    .select('id, business_name, avatar_url, maps_url')
    .eq('role', 'merchant')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen app-bg flex flex-col font-sans">
      <style>{`
        .app-bg {
          background: radial-gradient(ellipse at top, #0f1f4a 0%, #060d1f 50%, #000510 100%);
        }
        .glass-panel {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .glass-card-blue {
          background: rgba(59, 130, 246, 0.05);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(59,130,246,0.15);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 40px rgba(59,130,246,0.05);
        }
        .btn-primary {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          box-shadow: 0 0 20px rgba(37,99,235,0.3), 0 4px 10px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          box-shadow: 0 0 30px rgba(59,130,246,0.4), 0 4px 15px rgba(0,0,0,0.3);
          transform: translateY(-1px);
        }
        .scan-btn {
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          box-shadow: 0 0 30px rgba(217,70,239,0.3), 0 4px 15px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .scan-btn:hover {
          box-shadow: 0 0 40px rgba(217,70,239,0.4), 0 4px 15px rgba(0,0,0,0.3);
          transform: translateY(-2px);
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .glow-pulse { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>
      
      {/* Background ambient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="px-4 py-4 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-900/40">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide">Lazoo</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/client/profile" className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Mi Perfil</span>
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 space-y-8 max-w-lg mx-auto w-full pt-8 pb-24 relative z-10">
        
        {/* Sección: Bienvenida */}
        <section className="space-y-4">
          <div className="text-center space-y-1 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Club de Beneficios
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Hola, {profile?.full_name || 'Cliente'}</h1>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Descubrí los mejores locales y ofertas cerca tuyo.
            </p>
          </div>
        </section>

        {/* Sección: Locales Adheridos */}
        <section className="space-y-4 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Store className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Locales Adheridos</h2>
              <p className="text-xs text-slate-400 font-medium">Comercios donde podés usar la app.</p>
            </div>
          </div>

          {(!merchants || merchants.length === 0) ? (
            <div className="glass-panel rounded-3xl p-8 text-center border-dashed border-white/20">
              <p className="text-slate-400 font-medium">Por ahora no hay locales adheridos activos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {merchants.map((merchant: any) => (
                <div key={merchant.id} className="glass-panel rounded-3xl p-4 flex items-center justify-between gap-4 hover:border-blue-500/30 transition-all hover:bg-white/5 shadow-lg group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {merchant.avatar_url ? (
                        <img src={merchant.avatar_url} alt={merchant.business_name || 'Logo'} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white truncate">{merchant.business_name || 'Comercio Adherido'}</h3>
                      <p className="text-xs text-slate-400 truncate">Comercio verificado</p>
                    </div>
                  </div>
                  {merchant.maps_url && (
                    <a
                      href={merchant.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                      title="Cómo llegar"
                    >
                      <MapPin className="w-5 h-5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sección: Vidriera de Ofertas */}
        <section className="space-y-4 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-fuchsia-400" />
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Ofertas Disponibles</h2>
              <p className="text-xs text-slate-400 font-medium">Aprovechá estos descuentos hoy.</p>
            </div>
          </div>

          {(!offers || offers.length === 0) ? (
            <div className="glass-panel rounded-3xl p-8 text-center border-dashed border-white/20">
              <p className="text-slate-400 font-medium">Por ahora no hay ofertas especiales disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {offers.map((offer: any) => {
                const merchant = offer.merchant as { business_name?: string; full_name?: string };
                const merchantName = merchant?.business_name || merchant?.full_name || 'Comercio Adherido';
                const hasPrices = offer.original_price && offer.final_price;
                const savings = hasPrices ? offer.original_price - offer.final_price : null;

                return (
                  <div key={offer.id} className="glass-panel rounded-3xl p-5 flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-all hover:bg-white/5 shadow-lg">
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white font-bold px-3 py-1.5 rounded-bl-2xl text-sm z-10 shadow-md">
                      -{offer.discount_pct}%
                    </div>
                    {offer.image_url && (
                      <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                        <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                      </div>
                    )}
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-1.5 mb-1.5 text-blue-300 pr-12 truncate drop-shadow-md">
                         <Tag className="w-3.5 h-3.5" />
                         <p className="text-[10px] font-bold uppercase tracking-widest truncate">
                           {merchantName}
                         </p>
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2 pr-8 leading-tight drop-shadow-md">{offer.title}</h3>
                      {offer.description && (
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{offer.description}</p>
                      )}
                    
                    {hasPrices && (
                      <div className="mt-auto bg-black/20 rounded-2xl p-3 border border-white/5 shadow-inner">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-500 font-medium">Precio Normal</span>
                          <span className="text-sm text-slate-400 line-through">${offer.original_price.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-xs text-blue-400 font-bold uppercase">Precio App</span>
                          <span className="text-xl text-white font-black">${offer.final_price.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="text-[11px] text-emerald-100 bg-emerald-500/20 border border-emerald-500/30 py-1.5 px-2 rounded-xl text-center font-bold tracking-wide shadow-inner">
                          ¡Ahorrás ${savings?.toLocaleString('es-AR')}!
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Sección: Tu Código Corto (Movida arriba o mantenida) */}
        <section className="space-y-4 pt-6 border-t border-white/10">
          <div className="glass-card-blue rounded-3xl p-6 text-center relative overflow-hidden mt-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full" />
            <p className="text-blue-300/80 text-xs font-bold uppercase tracking-widest mb-2">Tu Código Personal</p>
            <p className="text-slate-400 text-xs mb-3">Dictalo en caja si no podés escanear el QR</p>
            <div className="text-5xl font-black text-white tracking-[0.2em] bg-black/20 py-4 rounded-2xl border border-white/5 shadow-inner font-montserrat">
              {qrData.qr_token.substring(0, 6).toUpperCase()}
            </div>
          </div>
        </section>

        {/* Sección: Mis Descuentos Usados */}
        <section className="space-y-4 pt-6 border-t border-white/10 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-montserrat">Mis Descuentos Usados</h2>
              <p className="text-xs text-slate-400 font-medium">Historial de tus últimas compras.</p>
            </div>
          </div>

          {(!clientHistory || clientHistory.length === 0) ? (
            <div className="glass-panel rounded-3xl p-8 text-center border-dashed border-white/20">
              <p className="text-slate-400 font-medium">Todavía no usaste ningún descuento.</p>
              <p className="text-slate-500 text-sm mt-1">Visitá un comercio adherido para empezar a ahorrar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientHistory.map((tx: any) => {
                const scanner = tx.scanner as { business_name?: string; full_name?: string } | null;
                const offer = tx.offer as { title?: string } | null;
                const merchantName = scanner?.business_name || scanner?.full_name || 'Comercio';
                const saved = (tx.original_amount || 0) - (tx.final_amount || 0);

                return (
                  <div key={tx.id} className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors">
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm truncate tracking-tight">{merchantName}</p>
                      <p className="text-blue-300/80 font-medium text-xs truncate mt-0.5">{offer?.title || 'Descuento general'}</p>
                      <p className="text-slate-500 text-[11px] mt-1 font-medium">
                        {new Date(tx.applied_at).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'America/Argentina/Buenos_Aires',
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm mb-1">
                        -{tx.discount_pct}%
                      </div>
                      {saved > 0 && (
                        <p className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-wide">
                          Ahorro ${saved.toLocaleString('es-AR')}
                        </p>
                      )}
                      {tx.final_amount && (
                        <p className="text-xs font-semibold text-slate-300 mt-0.5">
                          ${tx.final_amount.toLocaleString('es-AR')}
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

      {/* Floating Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none">
        <div className="max-w-lg mx-auto relative flex justify-center pointer-events-auto">
          
          <Link href="/client/scanner" className="group relative flex items-center justify-center">
            {/* Anillo exterior animado */}
            <div className="absolute inset-0 bg-fuchsia-500/30 rounded-full blur-xl group-hover:blur-2xl group-hover:bg-fuchsia-500/40 transition-all duration-300 animate-pulse" />
            
            {/* Botón principal */}
            <div className="relative flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-full border-[4px] border-slate-950 shadow-[0_0_30px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform duration-300">
              <Scan className="w-8 h-8 text-white mb-0.5" />
              <span className="text-[10px] font-bold text-white tracking-widest uppercase font-montserrat">Pagar</span>
            </div>
          </Link>
          
        </div>
      </div>

    </div>
  );
}
