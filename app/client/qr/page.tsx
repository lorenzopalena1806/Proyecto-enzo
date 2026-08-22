export const dynamic = 'force-dynamic';

import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { User, Sparkles, Clock, Scan, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { encodeQRPayload } from '@/lib/qr-utils';
import { CopyCodeButton } from '@/components/client/CopyCodeButton';
import { DiscoverSection } from '@/components/client/DiscoverSection';

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
    .select('full_name, is_active')
    .eq('id', user.id)
    .single();

  if (profile && profile.is_active === false) {
    redirect('/suspended');
  }

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

  // Filtrar ofertas por día válido y stock (stock logic usually handled here or in client, but let's do day filter)
  const argDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
  const todayString = argDate.getDay().toString();

  const activeOffers = (offers || []).filter((offer: any) => {
    // Si la oferta tiene un límite de stock y ya se agotó, no mostrarla (opcional, pero buena práctica)
    if (offer.stock_limit && offer.used_count >= offer.stock_limit) return false;
    
    // Si tiene días válidos configurados (array no vacío), debe incluir el día de hoy
    if (offer.valid_days && Array.isArray(offer.valid_days) && offer.valid_days.length > 0) {
      if (!offer.valid_days.includes(todayString)) return false;
    }
    
    return true;
  });

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
    .select('id, business_name, avatar_url, maps_url, category, is_featured')
    .eq('role', 'merchant')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  // 4. Fetch Favorites for current user
  const { data: favoritesData } = await adminClient
    .from('favorites')
    .select('merchant_id')
    .eq('client_id', user.id);
  const initialFavorites = favoritesData?.map((f: any) => f.merchant_id) || [];

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
          <span className="text-blue-400 font-black text-xl tracking-wide">Lazoo</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          ¡Bienvenido a Lazoo!
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
        <DiscoverSection 
          merchants={merchants || []} 
          offers={activeOffers} 
          initialFavorites={initialFavorites} 
        />

        {/* Sección: Tu Código Corto (Movida arriba o mantenida) */}
        <section className="space-y-4 pt-6 border-t border-white/10">
          <div className="glass-card-blue rounded-3xl p-6 text-center relative overflow-hidden mt-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full" />
            <p className="text-blue-300/80 text-xs font-bold uppercase tracking-widest mb-2">Tu Código Personal</p>
            <p className="text-slate-400 text-xs mb-3">Dictalo en caja si no podés escanear el QR</p>
            <div className="relative">
              <div className="text-5xl font-black text-white tracking-[0.2em] bg-black/20 py-4 rounded-2xl border border-white/5 shadow-inner font-montserrat">
                {qrData.qr_token.substring(0, 6).toUpperCase()}
              </div>
              <CopyCodeButton code={qrData.qr_token.substring(0, 6).toUpperCase()} />
            </div>
          </div>
        </section>

        {/* Sección: Mis Descuentos Usados */}
        <section id="historial" className="space-y-4 pt-6 border-t border-white/10 mb-8">
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
      <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pointer-events-none">
        <div className="max-w-lg mx-auto relative flex justify-between items-end pointer-events-auto bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] px-6 py-3 shadow-2xl">
          
          {/* Left: Historial */}
          <button 
            onClick={() => document.getElementById('historial')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white transition-colors pb-1"
          >
            <div className="relative">
              <ClipboardList className="h-6 w-6" />
              <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold text-white">
                %
              </div>
            </div>
            <span className="text-[10px] font-semibold text-center leading-tight">Descuentos<br/>Escaneados</span>
          </button>

          {/* Center: QR (Floating) */}
          <div className="relative -top-6">
            <Link href="/client/scanner" className="group relative flex items-center justify-center">
              {/* Anillo exterior animado */}
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl group-hover:blur-2xl group-hover:bg-blue-500/40 transition-all duration-300 animate-pulse" />
              
              {/* Botón principal */}
              <div className="relative flex flex-col items-center justify-center w-[72px] h-[72px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-full border-4 border-slate-950 shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform duration-300">
                <Scan className="w-8 h-8 text-blue-400 mb-0.5" />
              </div>
            </Link>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-300 whitespace-nowrap">Escanear QR</span>
          </div>

          {/* Right: Perfil */}
          <Link href="/client/profile" className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white transition-colors pb-1">
            <User className="h-6 w-6" />
            <span className="text-[10px] font-semibold text-center leading-tight mt-1">Perfil<br/>&nbsp;</span>
          </Link>
          
        </div>
      </div>

    </div>
  );
}
