export const dynamic = 'force-dynamic';

import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Store, Scan, Sparkles, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { DiscoverSection } from '@/components/client/DiscoverSection';

export const metadata = {
  title: 'Comprar | Lazoo',
};

export default async function QRPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/auth/login');

  // Fetch active merchants for B2B
  const { data: merchants } = await adminClient
    .from('profiles')
    .select('id, business_name, full_name, category, avatar_url, maps_url, address, latitude, longitude')
    .eq('role', 'merchant')
    .eq('is_active', true);

  // Ofertas disponibles para comercios (vamos a traer TODAS las ofertas activas, para que el badge de DiscoverSection sea preciso)
  const { data: allActiveOffers } = await adminClient
    .from('merchant_offers')
    .select('*')
    .eq('is_active', true)
    .neq('merchant_id', user.id);

  // Historial del comercio como COMPRADOR
  const { data: buyerHistory } = await adminClient
    .from('discount_transactions')
    .select(`
      *,
      scanner:profiles!scanner_id(business_name, full_name),
      offer:merchant_offers(title)
    `)
    .eq('scanned_user_id', user.id)
    .order('applied_at', { ascending: false })
    .limit(15);

  const totalSaved = (buyerHistory || []).reduce((acc: number, tx: any) => {
    if (tx.status !== 'cancelled') {
      return acc + ((tx.original_amount || 0) - (tx.final_amount || 0));
    }
    return acc;
  }, 0);

  // 4. Fetch Favorites for current user
  const { data: favoritesData } = await adminClient
    .from('favorites')
    .select('merchant_id')
    .eq('client_id', user.id);
  const initialFavorites = favoritesData?.map((f: any) => f.merchant_id) || [];

  return (
    <div className="relative min-h-[calc(100vh-2rem)] flex flex-col font-sans">
      <style>{`
        .b2b-bg {
          background: radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 50%, #020617 100%);
          border-radius: 1.5rem;
        }
        .glass-panel {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .scan-btn {
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          box-shadow: 0 0 30px rgba(217,70,239,0.3), 0 4px 15px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          transition: all 0.2s ease;
        }
        .scan-btn:hover {
          box-shadow: 0 0 40px rgba(217,70,239,0.4), 0 4px 15px rgba(0,0,0,0.3);
          transform: translateY(-2px);
        }
      `}</style>
      
      {/* Background ambient orbs inside the container */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[1.5rem]">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[100px]" />
      </div>

      <div className="b2b-bg relative z-10 flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full">
        
        {/* Welcome Section */}
        <section className="space-y-4 text-center">
          {totalSaved > 0 ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-1 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Sparkles className="w-3.5 h-3.5" />
              Ahorraste ${totalSaved.toLocaleString('es-AR')} en B2B
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-widest mb-1 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <Store className="w-3.5 h-3.5" />
              Red B2B de Lazoo
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Comprar como Local</h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            Escaneá el QR del comercio al que estás visitando y accedé a descuentos exclusivos entre colegas.
          </p>
        </section>

        {/* Scan Button Prominente */}
        <div className="max-w-md mx-auto w-full pt-2 pb-4">
          <Link href="/dashboard/scan" className="scan-btn flex items-center justify-center gap-3 w-full py-5 rounded-[1.5rem] text-white font-black text-xl transition-all relative overflow-hidden group">
            <Scan className="h-7 w-7 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="relative z-10 tracking-wide">Escanear QR del Local</span>
            <div className="absolute inset-0 bg-white/20 blur-md rounded-full translate-x-[-150%] skew-x-[-30deg] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </Link>
        </div>

        {/* B2B Discover Component (Replacing B2BOffersSection) */}
        <div className="border-t border-white/10 pt-8">
          <DiscoverSection merchants={merchants || []} offers={allActiveOffers || []} initialFavorites={initialFavorites} />
        </div>

        {/* Historial de Compras B2B */}
        <section className="space-y-4 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Mis Compras B2B</h2>
              <p className="text-xs text-slate-400 font-medium">Historial de ahorro en la red.</p>
            </div>
          </div>

          {(!buyerHistory || buyerHistory.length === 0) ? (
            <div className="glass-panel rounded-3xl p-8 text-center border-dashed border-white/20">
              <p className="text-slate-400 font-medium">Todavía no compraste en ningún local colega.</p>
              <p className="text-slate-500 text-sm mt-1">Explorá las ofertas de arriba y aprovechá la red.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {buyerHistory.map((tx: any) => {
                const scanner = tx.scanner as { business_name?: string; full_name?: string } | null;
                const offer = tx.offer as { title?: string } | null;
                const merchantName = scanner?.business_name || scanner?.full_name || 'Comercio';
                const saved = (tx.original_amount || 0) - (tx.final_amount || 0);

                return (
                  <div key={tx.id} className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors">
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm truncate tracking-tight">{merchantName}</p>
                      <p className="text-blue-300/80 font-medium text-xs truncate mt-0.5">{offer?.title || 'Descuento B2B'}</p>
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
                      <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold text-sm mb-1">
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

      </div>
    </div>
  );
}
