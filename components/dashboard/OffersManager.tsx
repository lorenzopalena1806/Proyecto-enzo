'use client';

import React, { useState } from 'react';
import { createOffer, updateOffer, toggleOfferStatus, deleteOffer, resetOfferStock } from '@/app/actions/offers';
import { Plus, Tag, Trash2, Power, PowerOff, Loader2, AlertTriangle, Edit2, CalendarDays } from 'lucide-react';
import Image from 'next/image';

const DAYS = [
  { value: '1', label: 'L' },
  { value: '2', label: 'M' },
  { value: '3', label: 'M' },
  { value: '4', label: 'J' },
  { value: '5', label: 'V' },
  { value: '6', label: 'S' },
  { value: '0', label: 'D' },
];

export function OffersManager({ initialOffers }: { initialOffers: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = editingOffer 
      ? await updateOffer(editingOffer.id, formData)
      : await createOffer(formData);
      
    setLoading(false);
    
    if (res && !res.success) {
      alert(res.error || `Error al ${editingOffer ? 'actualizar' : 'crear'} la oferta`);
      return;
    }
    
    setIsFormOpen(false);
    setEditingOffer(null);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleOfferStatus(id, !currentStatus);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que querés eliminar esta oferta?')) {
      await deleteOffer(id);
    }
  };

  const handleResetStock = async (id: string) => {
    if (confirm('¿Querés renovar el stock de esta oferta? Esto reiniciará el contador a 0 y la volverá a activar automáticamente.')) {
      await resetOfferStock(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Tus Ofertas Activas</h2>
        <button
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            if (isFormOpen) setEditingOffer(null);
          }}
          className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          {isFormOpen ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nueva Oferta</>}
        </button>
      </div>

      {isFormOpen && (
        <form key={editingOffer ? editingOffer.id : 'new'} onSubmit={handleSubmitForm} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">{editingOffer ? 'Editar Oferta' : 'Crear Nueva Oferta'}</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Título de la Oferta / Producto</label>
            <input name="title" defaultValue={editingOffer?.title} required placeholder="Ej: 2x1 en Remeras / Hamburguesa Completa" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Descripción corta (opcional)</label>
            <input name="description" defaultValue={editingOffer?.description} placeholder="Ej: Válido llevando dos remeras lisas" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Enlace (URL) de la Foto (opcional pero recomendado)</label>
            <input type="url" name="image_url" defaultValue={editingOffer?.image_url} placeholder="Ej: https://misitio.com/foto.jpg" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
            <p className="text-xs text-slate-500 mt-1">Pegá el link de una imagen que ya esté en internet (para no gastar espacio en el servidor).</p>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 space-y-4">
            <h4 className="text-sm font-medium text-violet-400">Precios y Descuento</h4>
            <p className="text-xs text-slate-400 mb-2">Completá los precios para mostrarle al cliente el ahorro exacto. Si no, poné solo el % de descuento.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Precio Normal ($)</label>
                <input type="number" name="original_price" defaultValue={editingOffer?.original_price} min="1" step="0.01" placeholder="Ej: 10000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Precio en App ($)</label>
                <input type="number" name="final_price" defaultValue={editingOffer?.final_price} min="1" step="0.01" placeholder="Ej: 8000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-xs font-bold text-slate-500 uppercase">Ó</span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Descuento (%)</label>
              <input type="number" name="discount_pct" defaultValue={editingOffer?.discount_pct} min="1" max="100" placeholder="Ej: 20" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">¿Para quién es?</label>
            <select name="target_role" defaultValue={editingOffer?.target_role || 'client'} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none">
              <option value="client">Solo Clientes</option>
              <option value="merchant">Solo Comercios (B2B)</option>
              <option value="all">Todos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Límite de Stock (opcional)</label>
            <input type="number" name="stock_limit" defaultValue={editingOffer?.stock_limit} min="1" placeholder="Ej: 50" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
            <p className="text-xs text-slate-500 mt-1">Si querés que la oferta se agote automáticamente al llegar a un límite, ponelo acá.</p>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-violet-400" />
              <label className="text-sm font-medium text-slate-300">Días Válidos (Opcional)</label>
            </div>
            <p className="text-xs text-slate-400 mb-3">Seleccioná qué días de la semana aplica esta oferta. Si no marcás ninguno, estará disponible <b>todos los días</b>.</p>
            <div className="flex gap-2">
              {DAYS.map(day => (
                <label key={day.value} className="flex-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="valid_days" 
                    value={day.value} 
                    defaultChecked={editingOffer && Array.isArray(editingOffer.valid_days) ? editingOffer.valid_days.includes(day.value) : false}
                    className="peer hidden" 
                  />
                  <div className="w-full py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 text-center text-sm font-bold peer-checked:bg-violet-600 peer-checked:border-violet-500 peer-checked:text-white transition-all shadow-sm">
                    {day.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 font-medium transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingOffer ? 'Guardar Cambios' : 'Guardar Oferta')}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialOffers.length === 0 && !isFormOpen && (
          <div className="col-span-full bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No tenés ninguna oferta creada.</p>
            <p className="text-slate-500 text-sm mt-1">Creá una para que los clientes la vean en su vidriera.</p>
          </div>
        )}

        {initialOffers.map(offer => {
          const hasPrices = offer.original_price && offer.final_price;
          const savings = hasPrices ? offer.original_price - offer.final_price : null;
          const isDepleted = offer.stock_limit && offer.used_count >= offer.stock_limit;

          return (
            <div key={offer.id} className={`border rounded-2xl p-5 relative overflow-hidden flex flex-col ${offer.is_active && !isDepleted ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-80'}`}>
              <div className="flex justify-between items-start mb-2 relative z-10">
                <h3 className="font-bold text-lg text-white pr-16 drop-shadow-md">{offer.title}</h3>
                <span className="absolute top-0 right-0 bg-emerald-950/80 backdrop-blur-sm text-emerald-400 text-sm font-bold px-3 py-1.5 rounded-bl-xl border-b border-l border-emerald-900/50 shadow-sm">
                  -{offer.discount_pct}%
                </span>
              </div>
              
              {offer.stock_limit && (
                <div className="mb-3 w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((offer.used_count || 0) / offer.stock_limit) * 100)}%` }}></div>
                </div>
              )}
              {offer.stock_limit && (
                <div className="text-xs font-medium mb-4 text-violet-400">
                  Stock: {offer.stock_limit - (offer.used_count || 0)} disponibles (de {offer.stock_limit})
                </div>
              )}
              
              {offer.image_url && (
                <div className="w-full h-32 mb-4 rounded-xl overflow-hidden relative border border-slate-700/50">
                  <Image src={offer.image_url} alt={offer.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                </div>
              )}
              
              {offer.description && <p className="text-slate-400 text-sm mb-4 relative z-10">{offer.description}</p>}
              
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
                  <div className="flex gap-4">
                    {isDepleted ? (
                      <button 
                        onClick={() => handleResetStock(offer.id)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 text-sm font-medium border border-amber-900/50 bg-amber-950/30 px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        <AlertTriangle className="w-4 h-4"/> ¡Agotada! Reactivar
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleToggle(offer.id, offer.is_active)}
                        className={`flex items-center gap-1.5 text-sm font-medium ${offer.is_active ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                      >
                        {offer.is_active ? <><PowerOff className="w-4 h-4"/> Pausar</> : <><Power className="w-4 h-4"/> Activar</>}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingOffer(offer);
                        setIsFormOpen(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 text-sm font-medium"
                      title="Editar oferta"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(offer.id)}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1.5 text-sm font-medium"
                      title="Eliminar oferta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
