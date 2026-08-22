'use client';

import React, { useState, useMemo } from 'react';
import { Search, Tag, ShoppingBag, Store, MapPin, Briefcase } from 'lucide-react';

export function B2BOffersSection({
  merchants,
  offers,
}: {
  merchants: any[];
  offers: any[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract dynamic categories from active merchants that have B2B offers
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    offers.forEach((offer) => {
      const merchant = merchants.find(m => m.id === offer.merchant_id);
      if (merchant && merchant.category) {
        cats.add(merchant.category);
      }
    });
    return Array.from(cats).sort();
  }, [offers, merchants]);

  // Filter Offers
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const merchant = merchants.find(m => m.id === offer.merchant_id);
      if (!merchant) return false;

      const matchesSearch = 
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        merchant.business_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory ? merchant.category === selectedCategory : true;
      
      return matchesSearch && matchesCategory;
    });
  }, [offers, merchants, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* ── SEARCH BAR ── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar ofertas B2B o comercios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
        />
      </div>

      {/* ── DYNAMIC CATEGORY PILLS ── */}
      {availableCategories.length > 0 && (
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 gap-2 scrollbar-hide snap-x">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-semibold transition-all snap-start ${
              selectedCategory === null 
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/50' 
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Todos
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-semibold transition-all snap-start ${
                selectedCategory === cat 
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/50' 
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ── B2B OFFERS ── */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Beneficios para tu Comercio</h2>
            <p className="text-xs text-slate-400 font-medium">Acercate a estos locales y mostrá tu QR para aprovechar.</p>
          </div>
        </div>

        {filteredOffers.length === 0 ? (
          <div className="bg-slate-900/50 rounded-3xl p-8 text-center border-dashed border-slate-700">
            <p className="text-slate-400 font-medium">No se encontraron beneficios B2B activos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOffers.map((offer: any) => {
              const merchant = merchants.find(m => m.id === offer.merchant_id);
              const merchantName = merchant?.business_name || merchant?.full_name || 'Comercio Adherido';
              const hasPrices = offer.original_price && offer.final_price;
              const savings = hasPrices ? offer.original_price - offer.final_price : null;

              return (
                <div key={offer.id} className="bg-slate-900 rounded-3xl p-5 flex flex-col relative overflow-hidden group hover:border-emerald-500/30 border border-slate-800 transition-all shadow-lg">
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-teal-600 text-white font-bold px-3 py-1.5 rounded-bl-2xl text-sm z-10 shadow-md">
                    -{offer.discount_pct}%
                  </div>
                  {offer.image_url && (
                    <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                      <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-900/50"></div>
                    </div>
                  )}
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 truncate">
                          <Store className="w-4 h-4 flex-shrink-0" />
                          <p className="text-[11px] font-bold uppercase tracking-widest truncate">
                            {merchantName}
                          </p>
                      </div>
                      {merchant?.maps_url && (
                        <a
                          href={merchant.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                          title="Cómo llegar"
                        >
                          <MapPin className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg text-white mb-2 pr-8 leading-tight">{offer.title}</h3>
                    {offer.description && (
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{offer.description}</p>
                    )}
                  
                    {hasPrices && (
                      <div className="mt-auto bg-slate-950/50 rounded-2xl p-3 border border-slate-800 shadow-inner">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-500 font-medium">Precio Normal</span>
                          <span className="text-sm text-slate-400 line-through">${offer.original_price.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-xs text-emerald-400 font-bold uppercase">Precio B2B</span>
                          <span className="text-xl text-white font-black">${offer.final_price.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="text-[11px] text-teal-100 bg-teal-500/20 border border-teal-500/30 py-1.5 px-2 rounded-xl text-center font-bold tracking-wide shadow-inner">
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
    </div>
  );
}
