export const dynamic = 'force-dynamic';

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Store, Scan, Tag, Banknote, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';

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



  // Ofertas disponibles para comercios (merchant o all) de otros comercios
  const { data: merchantOffers } = await adminClient
    .from('merchant_offers')
    .select(`
      *,
      merchant:profiles!merchant_id (
        business_name,
        full_name
      )
    `)
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

      {/* Ofertas para comercios */}
      <section className="space-y-4 border-t border-slate-800/50 pt-6">
        <div>
          <h2 className="text-xl font-bold text-white">Ofertas Exclusivas para Comercios</h2>
          <p className="text-sm text-slate-400 mt-1">Estos locales tienen descuentos especiales para vos como dueño de comercio.</p>
        </div>

        {(!merchantOffers || merchantOffers.length === 0) ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-400">Por ahora no hay ofertas B2B disponibles de otros comercios.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {merchantOffers.map((offer: any) => {
              const merchant = offer.merchant as { business_name?: string; full_name?: string };
              const merchantName = merchant?.business_name || merchant?.full_name || 'Comercio';
              const hasPrices = offer.original_price && offer.final_price;
              const savings = hasPrices ? offer.original_price - offer.final_price : null;

              return (
                <div key={offer.id} className="bg-slate-900 border border-violet-800/30 hover:border-violet-600/60 transition-colors rounded-2xl p-5 flex flex-col relative overflow-hidden group">
                  {/* Badge descuento */}
                  <div className="absolute top-0 right-0 bg-violet-600 text-white font-bold px-3 py-1.5 rounded-bl-xl text-sm z-10 shadow-sm">
                    -{offer.discount_pct}%
                  </div>
                  {/* B2B Badge */}
                  {(offer.target_role === 'merchant' || offer.target_role === 'all') && (
                    <div className="absolute top-0 left-0 bg-amber-500 text-black font-bold px-2 py-0.5 rounded-br-lg text-xs">
                      B2B
                    </div>
                  )}
                  <p className="text-xs text-violet-400 font-medium uppercase tracking-wider mb-1 mt-4 pr-12 truncate">
                    {merchantName}
                  </p>
                  <h3 className="font-bold text-lg text-white mb-2 pr-8 leading-tight">{offer.title}</h3>
                  {offer.description && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{offer.description}</p>
                  )}

                  {hasPrices && (
                    <div className="mt-auto bg-slate-950/80 rounded-xl p-3 border border-slate-800/80">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-500">Precio sin app</span>
                        <span className="text-sm text-slate-400 line-through">${offer.original_price.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-amber-400 font-medium">
                          {(offer.target_role === 'merchant' || offer.target_role === 'all') ? 'Precio B2B' : 'Precio con app'}
                        </span>
                        <span className="text-xl text-white font-black">${offer.final_price.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="text-xs text-amber-950 bg-amber-400 py-1.5 px-2 rounded-lg text-center font-bold uppercase tracking-wider">
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
