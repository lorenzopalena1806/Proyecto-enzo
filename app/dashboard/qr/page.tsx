export const dynamic = 'force-dynamic';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Store, Scan, Tag, Banknote, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { B2BOffersSection } from '@/components/dashboard/B2BOffersSection';

export const metadata = {
  title: 'Comprar (B2B) | Lazoo',
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
    .select('id, business_name, full_name, category, avatar_url, maps_url')
    .eq('role', 'merchant')
    .eq('is_active', true);

  // Ofertas disponibles para comercios (merchant o all) de otros comercios
  const { data: merchantOffers } = await adminClient
    .from('merchant_offers')
    .select('*')
    .in('target_role', ['merchant', 'all'])
    .eq('is_active', true)
    .neq('merchant_id', user.id) // Excluir sus propias ofertas
    .order('discount_pct', { ascending: false });

  // Historial del comercio como COMPRADOR (cuando fue escaneado en otro local)
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

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-4">

      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-white">Comprar (Beneficios B2B)</h1>
        <p className="text-slate-400 mt-1">
          Escaneá el QR del comercio al que estás visitando y accedé a descuentos exclusivos para comercios.
        </p>
      </div>

      {/* Badge de rol */}
      <div className="flex items-center gap-2 px-4 py-2 bg-violet-950/50 border border-violet-800/50 rounded-xl w-fit">
        <Store className="h-4 w-4 text-violet-400" />
        <span className="text-violet-300 text-sm font-medium">Comercio adherido — Beneficios B2B activos</span>
      </div>

      {/* Acción Principal - Escanear */}
      <div className="w-full">
        <Link href="/dashboard/scan" className="btn-primary flex items-center justify-center gap-3 w-full py-5 rounded-2xl text-white font-black text-xl transition-all relative overflow-hidden group">
          <Scan className="h-7 w-7 relative z-10" />
          <span className="relative z-10 tracking-wide">Escanear QR del Local</span>
        </Link>
      </div>

      {/* Ofertas para comercios usando el componente unificado */}
      <div className="border-t border-slate-800/50 pt-6">
        <B2BOffersSection merchants={merchants || []} offers={merchantOffers || []} />
      </div>

      {/* Historial como comprador */}
      <section className="space-y-4 border-t border-slate-800/50 pt-6">
        <div>
          <h2 className="text-xl font-bold text-white">Mis Compras en Otros Locales</h2>
          <p className="text-sm text-slate-400 mt-1">Historial de cuando fuiste a comprar como cliente a otro comercio de la red.</p>
        </div>

        {(!buyerHistory || buyerHistory.length === 0) ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-400">Todavía no usaste tu descuento B2B en ningún local.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {buyerHistory.map((tx: any) => {
              const scanner = tx.scanner as { business_name?: string; full_name?: string } | null;
              const offer = tx.offer as { title?: string } | null;
              const merchantName = scanner?.business_name || scanner?.full_name || 'Comercio';
              const saved = (tx.original_amount || 0) - (tx.final_amount || 0);

              return (
                <div key={tx.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{merchantName}</p>
                    <p className="text-slate-500 text-xs truncate">{offer?.title || 'Descuento B2B'}</p>
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
                    <span className="text-xs bg-amber-500 text-black font-bold px-1.5 py-0.5 rounded mb-1 inline-block">B2B</span>
                    <p className="text-emerald-400 font-bold text-sm">-{tx.discount_pct}%</p>
                    {saved > 0 && (
                      <p className="text-xs text-emerald-600">Ahorraste ${saved.toLocaleString('es-AR')}</p>
                    )}
                    {tx.final_amount && (
                      <p className="text-xs text-slate-400">${tx.final_amount.toLocaleString('es-AR')} pagado</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
