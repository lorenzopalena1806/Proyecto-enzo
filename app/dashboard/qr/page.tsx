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
        <h1 className="text-2xl font-bold text-slate-900">Comprar (Beneficios B2B)</h1>
        <p className="text-slate-500 mt-1 font-medium">
          Escaneá el QR del comercio al que estás visitando y accedé a descuentos exclusivos para comercios.
        </p>
      </div>

      {/* Badge de rol */}
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl w-fit shadow-sm">
        <Store className="h-4 w-4 text-blue-600" />
        <span className="text-blue-700 text-sm font-bold">Comercio adherido — Beneficios B2B activos</span>
      </div>

      {/* Acción Principal - Escanear */}
      <div className="w-full">
        <Link href="/dashboard/scan" className="btn-primary flex items-center justify-center gap-3 w-full py-5 rounded-2xl text-white font-black text-xl transition-all relative overflow-hidden group">
          <Scan className="h-7 w-7 relative z-10" />
          <span className="relative z-10 tracking-wide">Escanear QR del Local</span>
        </Link>
      </div>

      {/* Ofertas para comercios */}
      <section className="space-y-4 border-t border-slate-200 pt-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Ofertas Exclusivas para Comercios</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Estos locales tienen descuentos especiales para vos como dueño de comercio.</p>
        </div>

        {(!merchantOffers || merchantOffers.length === 0) ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <p className="text-slate-500 font-semibold">Por ahora no hay ofertas B2B disponibles de otros comercios.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {merchantOffers.map((offer: any) => {
              const merchant = offer.merchant as { business_name?: string; full_name?: string };
              const merchantName = merchant?.business_name || merchant?.full_name || 'Comercio';
              const hasPrices = offer.original_price && offer.final_price;
              const savings = hasPrices ? offer.original_price - offer.final_price : null;

              return (
                <div key={offer.id} className="bg-white border border-blue-100 hover:border-blue-300 hover:shadow-md shadow-sm transition-all rounded-2xl p-5 flex flex-col relative overflow-hidden group">
                  {/* Badge descuento */}
                  <div className="absolute top-0 right-0 bg-blue-600 text-white font-bold px-3 py-1.5 rounded-bl-xl text-sm z-10 shadow-sm">
                    -{offer.discount_pct}%
                  </div>
                  {/* B2B Badge */}
                  {(offer.target_role === 'merchant' || offer.target_role === 'all') && (
                    <div className="absolute top-0 left-0 bg-amber-100 text-amber-700 border-r border-b border-amber-200 font-bold px-2 py-0.5 rounded-br-lg text-xs z-10">
                      B2B
                    </div>
                  )}
                  {offer.image_url && (
                    <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
                      <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                    </div>
                  )}
                  <div className="relative z-10 flex flex-col h-full">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1 mt-4 pr-12 truncate">
                      {merchantName}
                    </p>
                  <h3 className="font-black text-lg text-slate-900 mb-2 pr-8 leading-tight">{offer.title}</h3>
                  {offer.description && (
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 font-medium">{offer.description}</p>
                  )}

                  {hasPrices && (
                    <div className="mt-auto bg-slate-50 rounded-xl p-3 border border-slate-200 shadow-inner">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-500 font-semibold">Precio sin app</span>
                        <span className="text-sm text-slate-400 line-through">${offer.original_price.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-amber-600 font-bold">
                          {(offer.target_role === 'merchant' || offer.target_role === 'all') ? 'Precio B2B' : 'Precio con app'}
                        </span>
                        <span className="text-xl text-slate-900 font-black">${offer.final_price.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="text-xs text-amber-700 bg-amber-100 border border-amber-200 py-1.5 px-2 rounded-lg text-center font-bold uppercase tracking-wider shadow-sm">
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

      {/* Historial como comprador */}
      <section className="space-y-4 border-t border-slate-200 pt-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mis Compras en Otros Locales</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Historial de cuando fuiste a comprar como cliente a otro comercio de la red.</p>
        </div>

        {(!buyerHistory || buyerHistory.length === 0) ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <p className="text-slate-500 font-semibold">Todavía no usaste tu descuento B2B en ningún local.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {buyerHistory.map((tx: any) => {
              const scanner = tx.scanner as { business_name?: string; full_name?: string } | null;
              const offer = tx.offer as { title?: string } | null;
              const merchantName = scanner?.business_name || scanner?.full_name || 'Comercio';
              const saved = (tx.original_amount || 0) - (tx.final_amount || 0);

              return (
                <div key={tx.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="min-w-0">
                    <p className="text-slate-900 font-bold text-sm truncate">{merchantName}</p>
                    <p className="text-slate-600 font-medium text-xs truncate">{offer?.title || 'Descuento B2B'}</p>
                    <p className="text-slate-500 text-xs mt-0.5 font-medium">
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
                    <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 font-bold px-1.5 py-0.5 rounded mb-1 inline-block">B2B</span>
                    <p className="text-emerald-600 font-black text-sm">-{tx.discount_pct}%</p>
                    {saved > 0 && (
                      <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-1">Ahorraste ${saved.toLocaleString('es-AR')}</p>
                    )}
                    {tx.final_amount && (
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">${tx.final_amount.toLocaleString('es-AR')} pagado</p>
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
