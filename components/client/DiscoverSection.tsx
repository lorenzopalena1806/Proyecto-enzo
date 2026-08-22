'use client';

import React, { useState, useMemo } from 'react';
import { Search, Heart, Store, MapPin, Tag, ShoppingBag, Star, Map, Coffee, Utensils, Wrench } from 'lucide-react';
import { toggleFavoriteServer } from '@/app/actions/client';
import Link from 'next/link';
import Image from 'next/image';

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('caf')) return <Coffee className="w-6 h-6 mb-1 text-amber-400" />;
  if (cat.includes('restauran') || cat.includes('comida') || cat.includes('panad')) return <Utensils className="w-6 h-6 mb-1 text-red-400" />;
  if (cat.includes('tienda') || cat.includes('ropa') || cat.includes('librer')) return <ShoppingBag className="w-6 h-6 mb-1 text-blue-400" />;
  if (cat.includes('servici')) return <Wrench className="w-6 h-6 mb-1 text-slate-400" />;
  return <Store className="w-6 h-6 mb-1 text-violet-400" />;
};

export function DiscoverSection({
  merchants,
  offers,
  initialFavorites,
}: {
  merchants: any[];
  offers: any[];
  initialFavorites: string[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract dynamic categories from active merchants
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    merchants.forEach((m) => {
      if (m.category) {
        cats.add(m.category);
      }
    });
    return Array.from(cats).sort();
  }, [merchants]);

  // Filter Merchants
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const matchesSearch = m.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? m.category === selectedCategory : true;
      
      return matchesSearch && matchesCategory;
    });
  }, [merchants, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      
      {/* ── SEARCH BAR & MAP BUTTON ── */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar locales o categorías..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner text-sm"
          />
        </div>
        <Link
          href="/client/map"
          className="flex flex-shrink-0 items-center justify-center w-[52px] rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-inner"
        >
          <Map className="h-5 w-5" />
        </Link>
      </div>

      {/* ── DYNAMIC CATEGORY PILLS (Strip) ── */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent -mx-4 px-4 py-4 border-y border-amber-500/10">
        <div className="flex overflow-x-auto gap-4 scrollbar-hide snap-x">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 flex flex-col items-center justify-center w-[84px] h-[84px] rounded-2xl border transition-all snap-start shadow-md ${
              selectedCategory === null 
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-1">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Todos</span>
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-[84px] h-[84px] rounded-2xl border transition-all snap-start shadow-md ${
                selectedCategory === cat 
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                  : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-1">
                {getCategoryIcon(cat)}
              </div>
              <span className="text-[10px] font-bold truncate w-full px-1 text-center">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── COMERCIOS ── */}
      <section className="space-y-4 pt-2">
        <h2 className="text-xl font-bold text-white tracking-tight px-1">
          Locales Adheridos
        </h2>

        {filteredMerchants.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center border-dashed border-white/20">
            <p className="text-slate-400 font-medium">No se encontraron locales.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredMerchants.map((merchant: any) => {
              // Si el merchant no tiene ofertas, quizás no mostrar el badge, pero por diseño asumimos que sí.
              const hasOffer = offers.some(o => o.merchant_id === merchant.id);
              
              return (
                <div key={merchant.id} className="bg-white/5 border border-white/10 rounded-[1.5rem] p-2 pr-4 flex items-center gap-4 hover:border-blue-500/30 transition-all shadow-lg group relative overflow-hidden">
                  {/* Foto izquierda */}
                  <div className="w-24 h-24 rounded-xl bg-black/40 flex-shrink-0 flex items-center justify-center overflow-hidden relative shadow-inner">
                    {merchant.avatar_url ? (
                      <Image src={merchant.avatar_url} alt={merchant.business_name || 'Logo'} fill sizes="96px" className="object-cover" />
                    ) : (
                      <Store className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  
                  {/* Contenido derecha */}
                  <div className="min-w-0 flex-1 py-1">
                    <h3 className="font-bold text-white text-[15px] truncate leading-tight mb-1">{merchant.business_name || 'Comercio Adherido'}</h3>
                    
                    {/* Estrellas y distancia falsa */}
                    <div className="flex items-center gap-0.5 mb-1.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <div className="flex items-center gap-1 text-slate-400 text-[10px] ml-2">
                        <MapPin className="w-3 h-3" />
                        <span>{(Math.random() * 8 + 1).toFixed(1)} km</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mb-2">
                      {merchant.category || 'Rubro General'} • <span className="text-emerald-400/80">Abierto ahora</span>
                    </p>

                    {hasOffer ? (
                      <div className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-amber-400/90 text-[10px] font-bold border border-amber-500/20 shadow-sm">
                        Descuento Disponible
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 text-[10px] font-bold border border-slate-500/20 shadow-sm">
                        Visitanos
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
