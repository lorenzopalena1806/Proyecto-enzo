'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmScannedPaymentServer } from '@/app/actions/charge';
import type { PaymentMethod } from '@/types';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface ClientPayFormProps {
  merchantId: string;
  amount: number;
  method: PaymentMethod;
  merchantName: string;
  offerId?: string;
}

export function ClientPayForm({ merchantId, amount, method, merchantName, offerId }: ClientPayFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirm = async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await confirmScannedPaymentServer(merchantId, amount, method, offerId);
      if (res.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(res.reason || 'Error al confirmar el pago.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Error de conexión.');
    }
  };

  if (status === 'success') {
    return (
      <div className="w-full rounded-2xl bg-emerald-950/40 border border-emerald-800 p-8 flex flex-col items-center text-center space-y-4">
        <CheckCircle2 className="h-16 w-16 text-emerald-400" />
        <h2 className="text-2xl font-bold text-emerald-300">¡Confirmado!</h2>
        <p className="text-emerald-400/80">Mostrale esta pantalla a {merchantName}.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {status === 'error' && (
        <div className="flex items-start gap-2 rounded-xl bg-red-950/50 border border-red-800 p-4">
          <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{errorMsg}</p>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={status === 'loading'}
        className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg transition-all shadow-lg shadow-violet-900/40 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Procesando...
          </>
        ) : (
          'Confirmar Descuento'
        )}
      </button>

      <button
        onClick={() => router.push('/dashboard')}
        disabled={status === 'loading'}
        className="w-full py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition-colors"
      >
        Cancelar
      </button>
    </div>
  );
}
