'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { confirmScannedPaymentServer } from '@/app/actions/charge';
import { completePendingCharge } from '@/app/actions/pending-charges';
import type { PaymentMethod } from '@/types';
import { formatARS } from '@/lib/discount-logic';

interface Props {
  chargeId: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  finalAmount: number;
  discountPct: number;
  paymentMethod: string;
  offerId?: string;
  offerTitle?: string;
}

export function ClientConfirmForm({
  chargeId,
  merchantId,
  merchantName,
  amount,
  finalAmount,
  discountPct,
  paymentMethod,
  offerId,
  offerTitle,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirm = async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
      // 1. Confirmar el pago (guarda la transacción)
      const res = await confirmScannedPaymentServer(
        merchantId,
        amount,
        paymentMethod as PaymentMethod,
        offerId,
      );

      if (!res.success) {
        setStatus('error');
        setErrorMsg(res.reason || 'Error al confirmar el pago.');
        return;
      }

      // 2. Marcar el pending_charge como completado (via server action con admin client)
      await completePendingCharge(chargeId);

      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Error de conexión.');
    }
  };

  if (status === 'success') {
    return (
      <div className="w-full rounded-2xl bg-emerald-950/40 border border-emerald-700 p-8 flex flex-col items-center text-center space-y-4">
        <div className="h-20 w-20 bg-emerald-900 border border-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-emerald-300">¡Listo!</h2>
        {offerTitle && (
          <p className="text-emerald-400 font-medium">{offerTitle}</p>
        )}
        <div className="w-full bg-slate-900/60 rounded-xl p-4 border border-emerald-800/30 space-y-1 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Precio original</span>
            <span>{formatARS(amount)}</span>
          </div>
          {discountPct > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Descuento</span>
              <span>−{discountPct}%</span>
            </div>
          )}
          <div className="flex justify-between text-white font-black text-lg pt-2 border-t border-slate-700/50">
            <span>Pagaste</span>
            <span>{formatARS(finalAmount)}</span>
          </div>
        </div>
        <p className="text-slate-400 text-sm">
          Mostrále esta pantalla a <strong className="text-white">{merchantName}</strong>.
        </p>
        <button
          onClick={() => router.push('/client/qr')}
          className="mt-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors w-full"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {status === 'error' && (
        <div className="flex items-start gap-2 rounded-xl bg-red-950/50 border border-red-800 p-4">
          <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{errorMsg}</p>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={status === 'loading'}
        className="w-full py-5 rounded-2xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-black text-xl transition-all shadow-xl shadow-violet-900/50 disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {status === 'loading' ? (
          <><Loader2 className="h-6 w-6 animate-spin" /> Confirmando...</>
        ) : (
          <>✅ Confirmar Pago</>
        )}
      </button>

      <p className="text-center text-xs text-slate-500">
        Al confirmar, el descuento queda registrado automáticamente.
      </p>
    </div>
  );
}
