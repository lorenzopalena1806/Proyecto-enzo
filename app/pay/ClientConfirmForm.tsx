'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle, ShieldCheck, Star } from 'lucide-react';
import { confirmScannedPaymentServer, rateTransactionServer } from '@/app/actions/charge';
import { completePendingCharge } from '@/app/actions/pending-charges';
import type { PaymentMethod } from '@/types';
import { formatARS } from '@/lib/discount-logic';

interface Props {
  chargeId: string;
  merchantId: string;
  merchantName: string;
  clientName: string;
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
  clientName,
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
  const [createdTxId, setCreatedTxId] = useState<string | null>(null);
  
  // Rating state
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    if (status === 'success') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status]);

  const handleConfirm = async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
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

      if (res.transactionId) {
        setCreatedTxId(res.transactionId);
      }

      const resolvedFinal = ('finalAmount' in res && res.finalAmount !== undefined) ? res.finalAmount : finalAmount;
      const resolvedPct   = ('discountPct' in res && res.discountPct !== undefined) ? res.discountPct : discountPct;
      await completePendingCharge(chargeId, clientName, resolvedFinal, resolvedPct);

      // Gamificación
      try { new Audio('/success.mp3').play().catch(() => {}); } catch (_) {}
      
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#059669', '#3b82f6'] // Colores más verdes (éxito)
        });
      });

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Error de conexión.');
    }
  };

  if (status === 'success') {
    return (
      <div
        className="w-full rounded-3xl p-8 flex flex-col items-center text-center space-y-5"
        style={{
          background: 'rgba(16,185,129,0.08)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(16,185,129,0.25)',
          boxShadow: '0 0 60px rgba(16,185,129,0.15), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="h-24 w-24 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.2))',
            border: '1px solid rgba(16,185,129,0.4)',
            boxShadow: '0 0 40px rgba(16,185,129,0.3)',
          }}
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        </div>

        <div>
          <h2 className="text-3xl font-black text-white mb-1">¡Listo!</h2>
          {offerTitle && (
            <p className="text-emerald-400 font-semibold">{offerTitle}</p>
          )}
        </div>

        <div className="w-full rounded-2xl p-4 space-y-2"
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {discountPct > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Precio original</span>
              <span className="text-slate-400 line-through">{formatARS(amount)}</span>
            </div>
          )}
          {discountPct > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400">Descuento</span>
              <span className="text-emerald-400 font-bold">−{discountPct}%</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-2 border-t border-white/[0.06]">
            <span className="text-white font-bold">Pagaste</span>
            <span className="text-3xl font-black text-emerald-400">{formatARS(finalAmount)}</span>
          </div>
        </div>

        {/* --- Encuesta Exprés --- */}
        {!ratingSubmitted ? (
          <div className="w-full pt-2 pb-2">
            <p className="text-white font-semibold text-sm mb-3">¿Cómo te atendieron en {merchantName}?</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  disabled={isRatingSubmitting}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={async () => {
                    setRating(star);
                    if (!createdTxId) {
                      setRatingSubmitted(true);
                      return;
                    }
                    setIsRatingSubmitting(true);
                    await rateTransactionServer(createdTxId, star);
                    setRatingSubmitted(true);
                    setIsRatingSubmitting(false);
                  }}
                  className="transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star 
                    className={`h-8 w-8 transition-colors ${
                      (hoverRating || rating) >= star 
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                        : 'text-white/20'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full pt-2 pb-2">
            <p className="text-emerald-400 font-bold">¡Gracias por tu calificación!</p>
          </div>
        )}
        {/* ----------------------- */}

        <button
          onClick={() => router.push('/client/qr')}
          className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all mt-2"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {status === 'error' && (
        <div
          className="flex items-start gap-3 rounded-2xl p-4"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{errorMsg}</p>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={status === 'loading'}
        className="confirm-btn w-full py-5 rounded-2xl text-white font-black text-xl disabled:opacity-60 flex items-center justify-center gap-3"
      >
        {status === 'loading' ? (
          <><Loader2 className="h-6 w-6 animate-spin" /> Confirmando...</>
        ) : (
          <><ShieldCheck className="h-6 w-6" /> Confirmar Pago</>
        )}
      </button>

      <p className="text-center text-xs text-slate-600">
        Al confirmar, el descuento queda registrado automáticamente.
      </p>
    </div>
  );
}
