'use client';

import React, { useState } from 'react';
import { Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateProfileServer } from '@/app/actions/auth';

interface SubscriptionManagerProps {
  userId: string;
  expiresAt: string | null;
}

export function SubscriptionManager({ userId, expiresAt }: SubscriptionManagerProps) {
  const [date, setDate] = useState(expiresAt ? expiresAt.split('T')[0] : '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formattedDate = date ? new Date(date).toISOString() : null;
      const res = await updateProfileServer(userId, { subscription_expires_at: formattedDate });
      
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error?.message || 'Error al guardar la fecha');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-violet-400" />
        Gestor de Suscripción (Cobro a Locales)
      </h2>
      
      <div className="flex flex-col gap-2 mb-4">
        <label className="block text-sm font-medium text-slate-300">Fecha de Vencimiento</label>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full sm:w-[200px] bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Fecha'}
          </button>
        </div>
      </div>

      {success && (
        <p className="text-emerald-400 text-sm mt-3 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" /> Fecha de vencimiento actualizada correctamente.
        </p>
      )}
      {error && (
        <p className="text-red-400 text-sm mt-3 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}

      {expiresAt && (
        <div className={`mt-4 p-3 rounded-lg border ${isExpired ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          <strong>Estado actual:</strong> {isExpired ? 'Suscripción Vencida' : 'Suscripción Al Día'} 
          <span className="text-slate-400 ml-2 font-normal text-sm">
            (Vence el {new Date(expiresAt).toLocaleDateString('es-AR')})
          </span>
        </div>
      )}
    </div>
  );
}
