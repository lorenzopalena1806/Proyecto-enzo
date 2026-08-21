'use client';

import React, { useState } from 'react';
import { createOffer, toggleOfferStatus, deleteOffer } from '@/app/actions/offers';
import { Plus, Tag, Trash2, Power, PowerOff, Loader2, QrCode as QrCodeIcon, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export function OffersManager({ initialOffers }: { initialOffers: any[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrOffer, setQrOffer] = useState<any | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

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
        <h2 className="text-xl font-semibold text-slate-900">Tus Ofertas Activas</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
        >
          {isCreating ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nueva Oferta</>}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Título de la Oferta / Producto</label>
            <input name="title" required placeholder="Ej: 2x1 en Remeras / Hamburguesa Completa" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Descripción corta (opcional)</label>
            <input name="description" placeholder="Ej: Válido llevando dos remeras lisas" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Enlace (URL) de la Foto (opcional pero recomendado)</label>
            <input type="url" name="image_url" placeholder="Ej: https://misitio.com/foto.jpg" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm" />
            <p className="text-xs font-semibold text-slate-500 mt-1">Pegá el link de una imagen que ya esté en internet (para no gastar espacio en el servidor).</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 shadow-inner">
            <h4 className="text-sm font-bold text-blue-700">Precios y Descuento</h4>
            <p className="text-xs font-semibold text-slate-500 mb-2">Completá los precios para mostrarle al cliente el ahorro exacto. Si no, poné solo el % de descuento.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Precio Normal ($)</label>
                <input type="number" name="original_price" min="1" step="0.01" placeholder="Ej: 10000" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Precio en App ($)</label>
                <input type="number" name="final_price" min="1" step="0.01" placeholder="Ej: 8000" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs font-black text-slate-400 uppercase">Ó</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Descuento (%)</label>
              <input type="number" name="discount_pct" min="1" max="100" placeholder="Ej: 20" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">¿Para quién es?</label>
            <select name="target_role" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm">
              <option value="client">Solo Clientes</option>
              <option value="merchant">Solo Comercios (B2B)</option>
              <option value="all">Todos</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Oferta'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialOffers.length === 0 && !isCreating && (
          <div className="col-span-full bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No tenés ninguna oferta creada.</p>
            <p className="text-slate-400 text-sm mt-1 font-medium">Creá una para que los clientes la vean en su vidriera.</p>
          </div>
        )}

        {initialOffers.map(offer => {
          const hasPrices = offer.original_price && offer.final_price;
          const savings = hasPrices ? offer.original_price - offer.final_price : null;

          return (
          return (
            <div key={offer.id} className={`border rounded-2xl p-5 relative overflow-hidden flex flex-col shadow-sm transition-all ${offer.is_active ? 'bg-white border-slate-200 hover:shadow-md' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
              <div className="flex justify-between items-start mb-2 relative z-10">
                <h3 className="font-bold text-lg text-slate-900 pr-16">{offer.title}</h3>
                <span className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-sm font-black px-3 py-1.5 rounded-bl-xl border-b border-l border-blue-200 shadow-sm">
                  -{offer.discount_pct}%
                </span>
              </div>
              
              {offer.image_url && (
                <div className="w-full h-32 mb-4 rounded-xl overflow-hidden relative border border-slate-200">
                  <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>
                </div>
              )}
              
              {offer.description && <p className="text-slate-600 text-sm mb-4 relative z-10 font-medium">{offer.description}</p>}
              
              {hasPrices && (
                <div className="mb-4 bg-slate-50 rounded-xl p-3 border border-slate-200 shadow-inner">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500 font-semibold">Precio Normal</span>
                    <span className="text-sm text-slate-400 line-through">${offer.original_price.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-blue-600 font-bold">Precio en App</span>
                    <span className="text-lg text-slate-900 font-black">${offer.final_price.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 py-1 px-2 rounded-lg text-center font-bold shadow-sm">
                    Ahorro para el cliente: ${savings?.toLocaleString('es-AR')}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-2">
                <div className="text-xs text-slate-500 mb-4 font-bold uppercase tracking-wider">
                  Para: {offer.target_role === 'client' ? 'Clientes' : offer.target_role === 'merchant' ? 'Comercios' : 'Todos'}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleToggle(offer.id, offer.is_active)}
                      className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${offer.is_active ? 'text-amber-600 hover:text-amber-700 bg-amber-50 px-2 py-1 rounded-lg' : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg'}`}
                    >
                      {offer.is_active ? <><PowerOff className="w-4 h-4"/> Pausar</> : <><Power className="w-4 h-4"/> Activar</>}
                    </button>
                    {offer.is_active && (
                      <button 
                        onClick={() => setQrOffer(offer)}
                        className="text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg flex items-center gap-1.5 text-sm font-bold transition-colors"
                      >
                        <QrCodeIcon className="w-4 h-4" /> QR
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDelete(offer.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1.5 text-sm font-bold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {qrOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-sm w-full relative flex flex-col items-center shadow-2xl">
            <button 
              onClick={() => setQrOffer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">{qrOffer.title}</h3>
            <p className="text-sm text-slate-500 font-medium text-center mb-8">
              Mostrá este QR al cliente para que aplique esta oferta específica.
            </p>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 mb-6 transition-transform hover:scale-105 duration-300">
              <QRCodeSVG 
                value={`${baseUrl}/pay?m=${qrOffer.merchant_id}&offer=${qrOffer.id}${qrOffer.final_price ? `&a=${qrOffer.original_price}` : ''}`}
                size={220} 
                level="M" 
              />
            </div>
            {qrOffer.final_price && (
              <p className="text-blue-700 font-black bg-blue-50 px-4 py-3 rounded-xl text-center w-full border border-blue-200 shadow-sm text-lg">
                Paga: ${qrOffer.final_price.toLocaleString('es-AR')}
              </p>
            )}
            {!qrOffer.final_price && (
              <p className="text-blue-700 font-black bg-blue-50 px-4 py-3 rounded-xl text-center w-full border border-blue-200 shadow-sm text-lg">
                -{qrOffer.discount_pct}% de descuento
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
