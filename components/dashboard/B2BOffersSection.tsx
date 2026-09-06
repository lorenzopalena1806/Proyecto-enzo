'use client';

import React, { useState, useMemo } from 'react';
import { Search, Tag, ShoppingBag, Store, MapPin, Briefcase, Coffee, Utensils, Wrench } from 'lucide-react';
import Image from 'next/image';

const getCategoryIcon = (category: string | null | undefined) => {
  if (!category) return <Store className="w-5 h-5 mb-1 text-violet-400" />;
  const cat = category.toLowerCase();
  if (cat.includes('caf')) return <Coffee className="w-5 h-5 mb-1 text-amber-400" />;
  if (cat.includes('restauran') || cat.includes('comida') || cat.includes('panad')) return <Utensils className="w-5 h-5 mb-1 text-red-400" />;
  if (cat.includes('tienda') || cat.includes('ropa') || cat.includes('librer')) return <ShoppingBag className="w-5 h-5 mb-1 text-blue-400" />;
  if (cat.includes('servici')) return <Wrench className="w-5 h-5 mb-1 text-slate-400" />;
  return <Store className="w-5 h-5 mb-1 text-violet-400" />;
};

export function B2BOffersSection({
  merchants,
  offers,
}: {
  merchants: any[];
  offers: any[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [targetFilter, setTargetFilter] = useState<'both' | 'merchant'>('both');

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

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const merchant = merchants.find(m => m.id === offer.merchant_id);
      if (!merchant) return false;

      const matchesSearch = 
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        merchant.business_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory ? merchant.category === selectedCategory : true;
      const matchesTarget = targetFilter === 'both' ? true : offer.target_role === 'merchant';
      
      return matchesSearch && matchesCategory && matchesTarget;
    });
  }, [offers, merchants, searchQuery, selectedCategory, targetFilter]);

  return (
    <div className="space-y-6">
      {/* 🔍 SEARCH BAR 🔍 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar ofertas B2B o comercios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-[1.5rem] bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all shadow-inner backdrop-blur-md"
        />
      </div>

      {/* 🎯 B2B TARGET FILTERS 🎯 */}
      <div className="flex gap-2">
        <button
          onClick={() => setTargetFilter('both')}
          className={`flex-1 py-3 px-4 rounded-2xl text-sm font-semibold transition-all ${
            targetFilter === 'both'
              ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] border border-violet-500'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white backdrop-blur-sm'
          }`}
        >
          Todas las Ofertas
        </button>
        <button
          onClick={() => setTargetFilter('merchant')}
          className={`flex-1 py-3 px-4 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            targetFilter === 'merchant'
              ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] border border-violet-500'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white backdrop-blur-sm'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Exclusivas B2B
        </button>
      </div>

      {/* 🏷️ DYNAMIC CATEGORY PILLS 🏷️ */}
      {availableCategories.length > 0 && (
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 gap-2 scrollbar-hide snap-x">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 w-20 py-2 rounded-2xl border text-[10px] font-semibold transition-all snap-start flex flex-col items-center justify-center ${
              selectedCategory === null 
                ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-inner' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-1">
              <Store className="w-5 h-5 text-slate-300" />
            </div>
            Todos
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 w-20 py-2 rounded-2xl border transition-all snap-start flex flex-col items-center justify-center ${
                selectedCategory === cat 
                  ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-inner' 
                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-1">
                {getCategoryIcon(cat)}
              </div>
              <span className="text-[10px] font-bold truncate w-full px-1 text-center">{cat}</span>
            </button>
          ))}
        </div>
      )}

      {/* 💼 B2B OFFERS 💼 */}
      <section className="space-y-4 pt-2">
        <h2 className="text-xl font-bold text-white tracking-tight px-1">
          Beneficios en la Red
        </h2>

        {filteredOffers.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center border-dashed border-white/20">
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
                <div key={offer.id} className="glass-panel rounded-3xl p-5 flex flex-col relative overflow-hidden group hover:border-violet-500/30 transition-all shadow-lg">
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-violet-500 to-fuchsia-600 text-white font-bold px-3 py-1.5 rounded-bl-2xl text-sm z-10 shadow-md">
                    -{offer.discount_pct}%
                  </div>
                  
                  {/* Badge de Target Role */}
                  <div className="absolute top-0 left-0 z-10">
                    {offer.target_role === 'merchant' ? (
                      <div className="bg-amber-500 text-black font-bold px-3 py-1 rounded-br-xl text-[10px] uppercase tracking-wider shadow-sm">
                        Solo Dueños
                      </div>
                    ) : offer.target_role === 'client' ? (
                      <div className="bg-blue-500 text-white font-bold px-3 py-1 rounded-br-xl text-[10px] uppercase tracking-wider shadow-sm">
                        Solo Clientes
                      </div>
                    ) : (
                      <div className="bg-white/20 backdrop-blur-md border border-white/10 text-white font-bold px-3 py-1 rounded-br-xl text-[10px] uppercase tracking-wider shadow-sm">
                        General
                      </div>
                    )}
                  </div>

                  {offer.image_url && (
                    <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                      <Image src={offer.image_url} alt={offer.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-900/50"></div>
                    </div>
                  )}
                  <div className="relative z-10 flex flex-col h-full mt-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-violet-300 truncate">
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
                          className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-violet-500/10 text-violet-300 hover:bg-violet-500 hover:text-white transition-colors"
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
                      <div className="mt-auto bg-black/20 rounded-2xl p-3 border border-white/5 shadow-inner">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-500 font-medium">Precio Normal</span>
                          <span className="text-sm text-slate-400 line-through">${offer.original_price.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-xs text-violet-400 font-bold uppercase">Precio B2B</span>
                          <span className="text-xl text-white font-black">${offer.final_price.toLocaleString('es-AR')}</span>
                        </div>
                        {savings && savings > 0 && (
                          <div className="w-full text-center py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <span className="text-emerald-400 font-bold text-xs">
                              Ahorrás ${savings.toLocaleString('es-AR')}
                            </span>
                          </div>
                        )}
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
