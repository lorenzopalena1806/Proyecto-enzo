import { createAdminClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, MapPin, Store, Tag, Star, Clock, Phone, Navigation } from 'lucide-react';
import React from 'react';
import { ReportMerchantButton } from '@/components/client/ReportMerchantButton';

export const dynamic = 'force-dynamic';

export default async function MerchantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const merchantId = resolvedParams.id;
  const supabase = createAdminClient();

  // Obtener datos del comercio
  const { data: merchant, error: merchantError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', merchantId)
    .eq('role', 'merchant')
    .single();

  if (merchantError || !merchant) {
    notFound();
  }

  // Obtener ofertas activas
  const { data: offers } = await supabase
    .from('merchant_offers')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const activeOffers = offers || [];

  // Obtener sucursales
  const { data: branches } = await supabase
    .from('merchant_branches')
    .select('*')
    .eq('merchant_id', merchantId);
  const allBranches = branches || [];

  let hoursData: any = null;
  let groupedHours: Array<{ label: string, timeStr: string, isOpen: boolean }> = [];
  
  if (merchant.business_hours && merchant.business_hours.startsWith('{')) {
    try {
      hoursData = JSON.parse(merchant.business_hours);
      
      const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const groups = [];
      let currentGroup: any = null;

      for (let i = 0; i < DAYS.length; i++) {
        const day = DAYS[i];
        const d = hoursData[day];
        if (!d) continue;

        let timeStr = 'Cerrado';
        if (d.isOpen) {
          timeStr = `${d.shift1Start} a ${d.shift1End}`;
          if (d.shift2Start && d.shift2End && d.shift2Start !== d.shift2End) {
            timeStr += ` y ${d.shift2Start} a ${d.shift2End}`;
          }
        }

        if (!currentGroup) {
          currentGroup = { startDay: day, endDay: day, timeStr, isOpen: d.isOpen };
        } else {
          if (currentGroup.timeStr === timeStr) {
            currentGroup.endDay = day;
          } else {
            groups.push(currentGroup);
            currentGroup = { startDay: day, endDay: day, timeStr, isOpen: d.isOpen };
          }
        }
      }
      if (currentGroup) {
        groups.push(currentGroup);
      }

      groupedHours = groups.map(g => {
        let dayLabel = g.startDay;
        if (g.startDay !== g.endDay) {
          const startIndex = DAYS.indexOf(g.startDay);
          const endIndex = DAYS.indexOf(g.endDay);
          if (endIndex - startIndex === 1) {
            dayLabel = `${g.startDay} y ${g.endDay}`;
          } else {
            dayLabel = `${g.startDay} a ${g.endDay}`;
          }
        }
        return {
          label: dayLabel,
          timeStr: g.timeStr,
          isOpen: g.isOpen
        };
      });

    } catch (e) {}
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: merchant.business_name || merchant.full_name || 'Comercio',
    image: merchant.avatar_url || '',
    telephone: merchant.phone || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: merchant.address || '',
    },
    url: `https://lazoo.com.ar/client/merchant/${merchant.id}`,
    hasMap: merchant.maps_url || '',
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <style dangerouslySetInnerHTML={{ __html: `
        .glass-panel {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
      `}} />

      {/* Hero Header */}
      <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden">
        {merchant.avatar_url ? (
          <>
            <Image 
              src={merchant.avatar_url} 
              alt={merchant.business_name || 'Portada'} 
              fill 
              className="object-cover opacity-60" 
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/20"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-blue-600/30"></div>
        )}
        
        <div className="absolute top-4 left-4 z-20">
          <Link 
            href="/client/qr" 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col items-center sm:items-start text-center sm:text-left transform translate-y-8">
          <div className="w-24 h-24 rounded-2xl bg-slate-900 border-4 border-slate-950 shadow-xl overflow-hidden relative flex items-center justify-center">
            {merchant.avatar_url ? (
              <Image src={merchant.avatar_url} alt="Logo" fill className="object-cover" />
            ) : (
              <Store className="w-10 h-10 text-slate-500" />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-12">
        
        {/* Info del Comercio */}
        <div className="text-center sm:text-left mb-8 relative">
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight mb-1">{merchant.business_name || 'Comercio'}</h1>
              <p className="text-slate-400 font-medium text-sm mb-4 flex items-center justify-center sm:justify-start gap-1">
                <Tag className="w-3.5 h-3.5" /> {merchant.category || 'Rubro General'}
              </p>
            </div>
            
            <div className="flex gap-2">
              {merchant.instagram && (
                <a 
                  href={`https://instagram.com/${merchant.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/20"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Instagram
                </a>
              )}
              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`¡Mirá los descuentos de ${merchant.business_name} en Lazoo! https://lazoo.com.ar/client/merchant/${merchant.id}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                Compartir
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-current" /> 5.0 Excelente
            </div>
            
            {hoursData ? (
              <div className="bg-white/5 text-slate-300 px-4 py-3 rounded-xl text-xs font-medium border border-white/10 w-full sm:w-auto min-w-[250px] mt-2">
                <div className="flex items-center gap-1.5 mb-2 text-white">
                  <Clock className="w-4 h-4" /> <span className="font-bold">Horarios de Atención</span>
                </div>
                <div className="space-y-1.5">
                  {groupedHours.map((g, idx) => (
                    <div key={idx} className="flex justify-between border-b border-white/5 last:border-0 pb-1.5 last:pb-0 gap-4">
                      <span className="text-slate-400 whitespace-nowrap">{g.label}</span>
                      <span className={g.isOpen ? "text-slate-200 text-right" : "text-slate-500 italic text-right"}>
                        {g.timeStr}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : merchant.business_hours ? (
              <div className="flex items-start gap-1.5 bg-white/5 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium border border-white/10">
                <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> 
                <span className="whitespace-pre-wrap leading-relaxed">{merchant.business_hours}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-white/5 text-slate-300 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10">
                <Clock className="w-3.5 h-3.5" /> Abierto ahora
              </div>
            )}
          </div>
        </div>

        {/* Detalles Rápidos */}
        <div className="mt-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              Ubicaciones y Contacto
            </h2>
            <div className="space-y-4">
              {allBranches.length === 0 && !merchant.address ? (
                <div className="glass-panel rounded-3xl p-6 text-center">
                  <p className="text-slate-400 text-sm">No hay información de ubicación disponible.</p>
                </div>
              ) : (
                <>
                  {/* Si el perfil tiene dirección antigua (Legacy), mostrarla como Local Principal temporalmente */}
                  {merchant.address && allBranches.length === 0 && (
                    <div className="glass-panel rounded-2xl p-4 border-l-2 border-l-blue-500">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-2">
                          <span className="text-white font-bold block text-base">Local Principal</span>
                          <span className="text-slate-300 text-sm block">{merchant.address}</span>
                          
                          {merchant.phone && (
                            <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                              <Phone className="w-4 h-4" />
                              {merchant.phone}
                            </div>
                          )}
                        </div>
                        {merchant.latitude && merchant.longitude && (
                          <a href={`https://www.google.com/maps/search/?api=1&query=${merchant.latitude},${merchant.longitude}`} target="_blank" rel="noreferrer" className="text-blue-400 text-xs font-bold inline-flex items-center gap-1 hover:text-blue-300 bg-blue-500/10 px-4 py-2 rounded-xl whitespace-nowrap self-start sm:self-auto border border-blue-500/20">
                            Ver en mapa <Navigation className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Nuevas sucursales con teléfono propio */}
                  {allBranches.map((branch: any) => (
                    <div key={branch.id} className="glass-panel rounded-2xl p-4 border-l-2 border-l-violet-500">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-2">
                          <span className="text-white font-bold block text-base">{branch.name}</span>
                          {branch.address && (
                            <span className="text-slate-300 text-sm flex items-start gap-1">
                              <MapPin className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                              {branch.address}
                            </span>
                          )}
                          {branch.phone && (
                            <a href={`https://wa.me/${branch.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors">
                              <Phone className="w-4 h-4" />
                              {branch.phone}
                            </a>
                          )}
                        </div>
                          {(branch.maps_url || (branch.latitude && branch.longitude)) && (
                            <a 
                              href={branch.maps_url || `https://www.google.com/maps/search/?api=1&query=${branch.latitude},${branch.longitude}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-violet-400 text-xs font-bold inline-flex items-center gap-1 hover:text-violet-300 bg-violet-500/10 px-4 py-2 rounded-xl whitespace-nowrap self-start sm:self-auto border border-violet-500/20"
                            >
                              Ir <Navigation className="w-4 h-4" />
                            </a>
                          )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

        {/* Promociones */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-fuchsia-400" />
            Promociones Activas
          </h2>

          {activeOffers.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center border-dashed border-white/20">
              <p className="text-slate-400 font-medium">Este comercio aún no tiene promociones activas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOffers.map((offer: any) => {
                const hasPrices = offer.original_price && offer.final_price;
                const savings = hasPrices ? offer.original_price - offer.final_price : null;

                return (
                  <div key={offer.id} className="glass-panel rounded-3xl p-5 flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-lg">
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white font-bold px-4 py-1.5 rounded-bl-2xl text-sm z-10 shadow-md">
                      -{offer.discount_pct}% OFF
                    </div>
                    {offer.image_url && (
                      <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                        <Image src={offer.image_url} alt={offer.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                      </div>
                    )}
                    <div className="relative z-10 flex flex-col h-full">
                      <h3 className="font-bold text-lg text-white mb-2 pr-16 leading-tight drop-shadow-md">{offer.title}</h3>
                      {offer.description && (
                        <p className="text-slate-300 text-sm mb-4 leading-relaxed">{offer.description}</p>
                      )}
                    
                    {hasPrices && (
                      <div className="mt-auto bg-black/30 rounded-2xl p-4 border border-white/10 shadow-inner">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-400 font-medium">Precio Normal</span>
                          <span className="text-sm text-slate-500 line-through">${offer.original_price.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="flex justify-between items-baseline mb-3">
                          <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Precio App</span>
                          <span className="text-2xl text-white font-black">${offer.final_price.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="text-xs text-emerald-100 bg-emerald-500/20 border border-emerald-500/30 py-2 px-3 rounded-xl text-center font-bold tracking-wide shadow-inner">
                          ¡Ahorrás ${savings?.toLocaleString('es-AR')} en esta compra!
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <ReportMerchantButton merchantId={merchantId} merchantName={merchant.business_name || merchant.full_name || 'este comercio'} />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
