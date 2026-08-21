'use client';

import React, { useState, useMemo } from 'react';
import { Search, Heart, Store, MapPin, Tag, ShoppingBag } from 'lucide-react';
import { toggleFavoriteServer } from '@/app/actions/client';

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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(initialFavorites));

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

  const handleToggleFavorite = async (merchantId: string) => {
    const isFavorited = favorites.has(merchantId);
    
    // Optimistic UI update
    const newFavorites = new Set(favorites);
    if (isFavorited) {
      newFavorites.delete(merchantId);
    } else {
      newFavorites.add(merchantId);
    }
    setFavorites(newFavorites);

    const res = await toggleFavoriteServer(merchantId, isFavorited);
    if (!res.success) {
      // Revert if failed
      setFavorites(favorites);
      console.error(res.error);
    }
  };

  // Filter Merchants
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const matchesSearch = m.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? m.category === selectedCategory : true;
      const matchesFavorites = showFavoritesOnly ? favorites.has(m.id) : true;
      
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [merchants, searchQuery, selectedCategory, showFavoritesOnly, favorites]);

  // Filter Offers based on filtered merchants
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const merchantId = offer.merchant_id;
      // Oferta debe pertenecer a un comercio que esté en la lista filtrada
      const merchantMatches = filteredMerchants.some((m) => m.id === merchantId);
      
      // También permitimos buscar por el título de la oferta directamente si no hay categoría seleccionada
      const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (searchQuery && !selectedCategory && !showFavoritesOnly) {
        return merchantMatches || matchesSearch;
      }
      return merchantMatches;
    });
  }, [offers, filteredMerchants, searchQuery, selectedCategory, showFavoritesOnly]);

  return (
    <div className="space-y-6">
      {/* ── SEARCH BAR & FAVORITES TOGGLE ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar comercios, rubros u ofertas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/20 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
          />
        </div>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center justify-center w-12 rounded-2xl border transition-all ${
            showFavoritesOnly 
              ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
              : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'
          }`}
        >
          <Heart className={`h-5 w-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* ── DYNAMIC CATEGORY PILLS ── */}
      {availableCategories.length > 0 && (
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 gap-2 scrollbar-hide snap-x">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-semibold transition-all snap-start ${
              selectedCategory === null 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' 
                : 'bg-black/20 border-white/10 text-slate-300 hover:bg-white/10'
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
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' 
                  : 'bg-black/20 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ── COMERCIOS ── */}
      <section className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Store className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {showFavoritesOnly ? 'Tus Favoritos' : 'Locales Adheridos'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">Comercios donde podés usar la app.</p>
          </div>
        </div>

        {filteredMerchants.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center border-dashed border-white/20">
            <p className="text-slate-400 font-medium">No se encontraron locales con esos filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMerchants.map((merchant: any) => {
              const isFav = favorites.has(merchant.id);
              return (
                <div key={merchant.id} className="glass-panel rounded-3xl p-4 flex items-center justify-between gap-4 hover:border-blue-500/30 transition-all hover:bg-white/5 shadow-lg group relative overflow-hidden">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {merchant.avatar_url ? (
                        <img src={merchant.avatar_url} alt={merchant.business_name || 'Logo'} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0 pr-8">
                      <h3 className="font-bold text-white truncate">{merchant.business_name || 'Comercio'}</h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {merchant.category || 'Comercio adherido'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                      onClick={() => handleToggleFavorite(merchant.id)}
                      className="p-2 rounded-full hover:bg-black/20 transition-colors"
                    >
                      <Heart className={`w-5 h-5 transition-colors ${isFav ? 'fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-slate-400 hover:text-white'}`} />
                    </button>
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── OFERTAS ── */}
      <section className="space-y-4 pt-6 border-t border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingBag className="w-5 h-5 text-fuchsia-400" />
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Ofertas Disponibles</h2>
            <p className="text-xs text-slate-400 font-medium">Aprovechá estos descuentos hoy.</p>
          </div>
        </div>

        {filteredOffers.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center border-dashed border-white/20">
            <p className="text-slate-400 font-medium">No hay ofertas para los locales filtrados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredOffers.map((offer: any) => {
              const merchant = merchants.find(m => m.id === offer.merchant_id) || offer.merchant;
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
    </div>
  );
}
