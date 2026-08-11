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
    await createOffer(formData);
    setLoading(false);
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
            <label className="block text-sm font-medium text-slate-400 mb-1">Título de la Oferta</label>
            <input name="title" required placeholder="Ej: 2x1 en Remeras" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Descripción corta (opcional)</label>
            <input name="description" placeholder="Ej: Válido llevando dos remeras lisas" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Descuento (%)</label>
              <input type="number" name="discount_pct" required min="1" max="100" placeholder="Ej: 20" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">¿Para quién es?</label>
              <select name="target_role" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none">
                <option value="client">Solo Clientes</option>
                <option value="merchant">Solo Comercios (B2B)</option>
                <option value="all">Todos</option>
              </select>
            </div>
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

        {initialOffers.map(offer => (
          <div key={offer.id} className={`border rounded-2xl p-5 relative overflow-hidden ${offer.is_active ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-60'}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-white">{offer.title}</h3>
              <span className="bg-emerald-950 text-emerald-400 text-xs font-bold px-2 py-1 rounded-md">
                -{offer.discount_pct}%
              </span>
            </div>
            {offer.description && <p className="text-slate-400 text-sm mb-4">{offer.description}</p>}
            
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
        ))}
      </div>
    </div>
  );
}
