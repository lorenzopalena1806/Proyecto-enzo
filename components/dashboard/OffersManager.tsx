'use client';

import React, { useState } from 'react';
import { createOffer, toggleOfferStatus, deleteOffer } from '@/app/actions/offers';
import { Plus, Tag, Trash2, Power, PowerOff, Loader2 } from 'lucide-react';

export function OffersManager({ initialOffers }: { initialOffers: any[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createOffer(formData);
    setLoading(false);
    
    if (res && !res.success) {
      alert(res.error || 'Error al crear la oferta');
      return;
    }
    
    setIsCreating(false);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleOfferStatus(id, !currentStatus);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que querés eliminar esta oferta?')) {
      await deleteOffer(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Tus Ofertas Activas</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          {isCreating ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nueva Oferta</>}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Título de la Oferta / Producto</label>
            <input name="title" required placeholder="Ej: 2x1 en Remeras / Hamburguesa Completa" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Descripción corta (opcional)</label>
            <input name="description" placeholder="Ej: Válido llevando dos remeras lisas" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 space-y-4">
            <h4 className="text-sm font-medium text-violet-400">Precios y Descuento</h4>
            <p className="text-xs text-slate-400 mb-2">Completá los precios para mostrarle al cliente el ahorro exacto. Si no, poné solo el % de descuento.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Precio Normal ($)</label>
                <input type="number" name="original_price" min="1" step="0.01" placeholder="Ej: 10000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Precio en App ($)</label>
                <input type="number" name="final_price" min="1" step="0.01" placeholder="Ej: 8000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-xs font-bold text-slate-500 uppercase">Ó</span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Descuento (%)</label>
              <input type="number" name="discount_pct" min="1" max="100" placeholder="Ej: 20" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">¿Para quién es?</label>
            <select name="target_role" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none">
              <option value="client">Solo Clientes</option>
              <option value="merchant">Solo Comercios (B2B)</option>
              <option value="all">Todos</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 font-medium transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Oferta'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialOffers.length === 0 && !isCreating && (
          <div className="col-span-full bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No tenés ninguna oferta creada.</p>
            <p className="text-slate-500 text-sm mt-1">Creá una para que los clientes la vean en su vidriera.</p>
          </div>
        )}

        {initialOffers.map(offer => {
          const hasPrices = offer.original_price && offer.final_price;
          const savings = hasPrices ? offer.original_price - offer.final_price : null;

          return (
            <div key={offer.id} className={`border rounded-2xl p-5 relative overflow-hidden flex flex-col ${offer.is_active ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-60'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-white pr-16">{offer.title}</h3>
                <span className="absolute top-0 right-0 bg-emerald-950 text-emerald-400 text-sm font-bold px-3 py-1.5 rounded-bl-xl border-b border-l border-emerald-900/50">
                  -{offer.discount_pct}%
                </span>
              </div>
              
              {offer.description && <p className="text-slate-400 text-sm mb-4">{offer.description}</p>}
              
              {hasPrices && (
                <div className="mb-4 bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">Precio Normal</span>
                    <span className="text-sm text-slate-400 line-through">${offer.original_price.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-emerald-400 font-medium">Precio en App</span>
                    <span className="text-lg text-white font-bold">${offer.final_price.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="text-xs text-emerald-400/80 bg-emerald-950/30 py-1 px-2 rounded-lg text-center font-medium">
                    Ahorro para el cliente: ${savings?.toLocaleString('es-AR')}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-2">
                <div className="text-xs text-slate-500 mb-4 font-medium uppercase tracking-wider">
                  Para: {offer.target_role === 'client' ? 'Clientes' : offer.target_role === 'merchant' ? 'Comercios' : 'Todos'}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                  <button 
                    onClick={() => handleToggle(offer.id, offer.is_active)}
                    className={`flex items-center gap-1.5 text-sm font-medium ${offer.is_active ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                  >
                    {offer.is_active ? <><PowerOff className="w-4 h-4"/> Pausar</> : <><Power className="w-4 h-4"/> Activar</>}
                  </button>
                  <button 
                    onClick={() => handleDelete(offer.id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1.5 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
