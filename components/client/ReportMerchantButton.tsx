'use client';

import React, { useState } from 'react';
import { AlertOctagon, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { submitReport } from '@/app/actions/reports';

export function ReportMerchantButton({ merchantId, merchantName }: { merchantId: string, merchantName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Por favor, selecciona un motivo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitReport(merchantId, reason, details);
      if (res.success) {
        toast.success('Reporte enviado. Gracias por ayudarnos a mejorar Lazoo.');
        setIsOpen(false);
        setReason('');
        setDetails('');
      } else {
        toast.error(res.error || 'Error al enviar reporte');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/30 text-red-400 border border-red-900/50 hover:bg-red-900/40 hover:text-red-300 transition-colors text-sm font-semibold"
      >
        <AlertOctagon className="w-4 h-4" />
        Tuve un inconveniente con este local
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-400" />
                Reportar a {merchantName}
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Motivo del reporte</label>
                <select 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none"
                >
                  <option value="" disabled>Selecciona un motivo...</option>
                  <option value="refused_discount">Se negó a hacerme el descuento Lazoo</option>
                  <option value="fake_offer">La oferta publicada no es real</option>
                  <option value="bad_treatment">Mala atención o trato inaceptable</option>
                  <option value="closed">El local está cerrado permanentemente</option>
                  <option value="other">Otro motivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Detalles (opcional)</label>
                <textarea 
                  value={details} 
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Contanos más sobre lo que pasó para que podamos investigar..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !reason}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
