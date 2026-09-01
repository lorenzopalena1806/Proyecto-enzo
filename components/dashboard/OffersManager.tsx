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

interface Branch {
  id: string;
  name: string;
}

interface OffersManagerProps {
  initialOffers: any[];
  branches: Branch[];
}

export function OffersManager({ initialOffers, branches = [] }: OffersManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Live preview state
  const [preview, setPreview] = useState({
    title: '',
    description: '',
    image_url: '',
    original_price: '',
    final_price: '',
    discount_pct: '',
    target_role: 'client',
    branch_id: ''
  });

  // Handle opening form
  const handleOpenForm = (offer?: any) => {
    if (offer) {
      setEditingOffer(offer);
      setPreview({
        title: offer.title || '',
        description: offer.description || '',
        image_url: offer.image_url || '',
        original_price: offer.original_price || '',
        final_price: offer.final_price || '',
        discount_pct: offer.discount_pct || '',
        target_role: offer.target_role || 'client',
        branch_id: offer.branch_id || ''
      });
    } else {
      setEditingOffer(null);
      setPreview({
        title: '',
        description: '',
        image_url: '',
        original_price: '',
        final_price: '',
        discount_pct: '',
        target_role: 'client',
        branch_id: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-calculate discount if prices are entered
    if (name === 'original_price' || name === 'final_price') {
      const orig = name === 'original_price' ? Number(value) : Number(preview.original_price);
      const fin = name === 'final_price' ? Number(value) : Number(preview.final_price);
      
      let newPct = preview.discount_pct;
      if (orig > 0 && fin > 0 && fin < orig) {
        newPct = Math.round(((orig - fin) / orig) * 100).toString();
      }
      
      setPreview(prev => ({ ...prev, [name]: value, discount_pct: newPct }));
    } else {
      setPreview(prev => ({ ...prev, [name]: value }));
    }
  };

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
            if (isFormOpen) {
              setIsFormOpen(false);
            } else {
              handleOpenForm();
            }
          }}
          className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          {isFormOpen ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nueva Oferta</>}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-violet-400" />
              {editingOffer ? 'Editar Oferta' : 'Crear Nueva Oferta'}
            </h3>
          </div>
          
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <form key={editingOffer ? editingOffer.id : 'new'} onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Título de la Oferta / Producto</label>
                <input name="title" value={preview.title} onChange={handleChange} required placeholder="Ej: 2x1 en Remeras / Hamburguesa Completa" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Descripción corta (opcional)</label>
                <input name="description" value={preview.description} onChange={handleChange} placeholder="Ej: Válido llevando dos remeras lisas" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
              </div>

              {branches.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Sucursal (opcional)</label>
                  <select 
                    name="branch_id" 
                    value={preview.branch_id} 
                    onChange={handleChange} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none appearance-none"
                  >
                    <option value="">Aplica a Todas las Sucursales</option>
                    <option value="central">Solo Sede Central</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>Solo {b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Enlace (URL) de la Foto (opcional pero recomendado)</label>
                <input type="url" name="image_url" value={preview.image_url} onChange={handleChange} placeholder="Ej: https://misitio.com/foto.jpg" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
                <p className="text-xs text-slate-500 mt-1">Pegá el link de una imagen que ya esté en internet.</p>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 space-y-4">
                <h4 className="text-sm font-medium text-violet-400">Precios y Descuento</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Precio Normal ($)</label>
                    <input type="number" name="original_price" value={preview.original_price} onChange={handleChange} min="1" step="0.01" placeholder="Ej: 10000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Precio con Descuento ($)</label>
                    <input type="number" name="final_price" value={preview.final_price} onChange={handleChange} min="1" step="0.01" placeholder="Ej: 8000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-800"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Ó</span>
                  <div className="flex-1 h-px bg-slate-800"></div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Descuento (%)</label>
                  <input type="number" name="discount_pct" value={preview.discount_pct} onChange={handleChange} min="1" max="100" placeholder="Ej: 20" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">¿Para quién es?</label>
                <select name="target_role" value={preview.target_role} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none">
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

              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-4 font-bold transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-emerald-900/20">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingOffer ? 'Guardar Cambios' : 'Publicar Oferta')}
              </button>
            </form>

            {/* Live Preview */}
            <div className="block relative lg:mt-0 mb-4 lg:mb-0">
              <div className="sticky top-6">
                <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                  Vista Previa
                </h4>
                
                {/* Simulated Card Preview */}
                <div className="bg-slate-900 rounded-3xl p-5 flex flex-col relative overflow-hidden border border-slate-700 shadow-2xl max-w-sm mx-auto pointer-events-none">
                  {/* Badge */}
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-violet-600 to-indigo-600 text-white font-bold px-3 py-1.5 rounded-bl-2xl text-sm z-10 shadow-md">
                    -{preview.discount_pct || '0'}%
                  </div>
                  
                  {/* Target Role Badge */}
                  <div className="absolute top-0 left-0 z-10">
                    {preview.target_role === 'merchant' ? (
                      <div className="bg-amber-500 text-black font-bold px-3 py-1 rounded-br-xl text-[10px] uppercase tracking-wider shadow-sm">
                        Solo Dueños
                      </div>
                    ) : preview.target_role === 'client' ? (
                      <div className="bg-blue-500 text-white font-bold px-3 py-1 rounded-br-xl text-[10px] uppercase tracking-wider shadow-sm">
                        Solo Clientes
                      </div>
                    ) : (
                      <div className="bg-slate-700 text-slate-200 font-bold px-3 py-1 rounded-br-xl text-[10px] uppercase tracking-wider shadow-sm">
                        General
                      </div>
                    )}
                  </div>

                  {preview.image_url ? (
                    <div className="absolute inset-0 z-0 opacity-30">
                      <img src={preview.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 z-0 opacity-10 bg-violet-500/20">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    </div>
                  )}
                  
                  <div className="relative z-10 flex flex-col h-full min-h-[160px] pt-8">
                    <h3 className="font-bold text-lg text-white mb-2 pr-8 leading-tight">
                      {preview.title || 'Título de tu oferta'}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {preview.description || 'Acá va a aparecer la descripción de lo que estás ofreciendo.'}
                    </p>
                  
                    {(preview.original_price && preview.final_price) ? (
                      <div className="mt-auto bg-slate-950/80 rounded-xl p-3 border border-slate-800/80">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-500">Precio Normal</span>
                          <span className="text-sm text-slate-400 line-through">${Number(preview.original_price).toLocaleString('es-AR')}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-violet-400 font-bold uppercase">Precio App</span>
                          <span className="text-xl text-white font-black">${Number(preview.final_price).toLocaleString('es-AR')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-auto bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 border-dashed flex items-center justify-center h-16">
                        <p className="text-xs text-slate-500 text-center">Los precios aparecerán acá si los completás.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                    onClick={() => handleOpenForm(offer)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium text-sm hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" /> Editar
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
