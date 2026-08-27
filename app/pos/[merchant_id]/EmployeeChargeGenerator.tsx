'use client';

import React, { useState, useEffect, useRef } from 'react';
import { employeeCreatePendingCharge, employeeCancelPendingCharge, employeeCheckPendingChargeStatus } from '@/app/actions/employee';
import {
  QrCode,
  CheckCircle2,
  DollarSign,
  Banknote,
  ArrowLeftRight,
  RefreshCw,
  Loader2,
  XCircle,
  Tag,
  Store,
  Sparkles,
  Clock,
  X,
  Keyboard
} from 'lucide-react';
import type { PaymentMethod } from '@/types';
import { formatARS } from '@/lib/discount-logic';
import { completePendingChargeWithCode } from '@/app/actions/pending-charges';

interface EmployeeChargeGeneratorProps {
  merchantId: string;
  activeOffers?: any[];
}

export function EmployeeChargeGenerator({ merchantId, activeOffers = [] }: EmployeeChargeGeneratorProps) {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [selectedOffer, setSelectedOffer] = useState<string>('');
  
  const [activeCharge, setActiveCharge] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (successData) {
      setTimeout(() => successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [successData]);

  const [manualCode, setManualCode] = useState('');
  const [manualCodeLoading, setManualCodeLoading] = useState(false);
  const [manualCodeError, setManualCodeError] = useState('');

  // Countdown timer para el cobro pendiente
  useEffect(() => {
    if (!activeCharge) return;
    const expiresAt = new Date(activeCharge.expiresAt).getTime();

    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setActiveCharge(null);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeCharge]);

  // Polling para chequear si el cliente pagó
  useEffect(() => {
    if (!activeCharge) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await employeeCheckPendingChargeStatus(merchantId, activeCharge.chargeId);
        if (res.error === 'expired') {
          window.location.reload();
          return;
        }
        
        if (res.success && res.completed) {
          setSuccessData({
            amount: activeCharge.amount,
            final: res.final_amount,
            discountPct: res.discount_pct,
            clientName: res.client_name,
          });
          setActiveCharge(null);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [activeCharge, merchantId]);

  const handleStartCharge = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Ingresá un monto válido.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    const formData = new FormData();
    if (selectedOffer) {
      const offer = activeOffers.find(o => o.id === selectedOffer);
      formData.set('offer_id', selectedOffer);
      formData.set('offer_title', offer?.title || '');
    }
    formData.set('amount', amount);
    formData.set('payment_method', paymentMethod);

    const res = await employeeCreatePendingCharge(merchantId, formData);
    setLoading(false);

    if (res.success) {
      setActiveCharge({
        chargeId: res.chargeId,
        expiresAt: res.expiresAt,
        amount: parseFloat(amount),
        paymentMethod,
        offerTitle: selectedOffer ? activeOffers.find(o => o.id === selectedOffer)?.title : null
      });
      setSelectedOffer('');
      setAmount('');
      setPaymentMethod('cash');
    } else {
      setErrorMessage(res.error || 'Error al habilitar el código.');
    }
  };

  const handleCancelCharge = async () => {
    if (!activeCharge) return;
    await employeeCancelPendingCharge(merchantId, activeCharge.chargeId);
    setActiveCharge(null);
  };

  const handleManualCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualCodeError('');
    
    if (!manualCode || manualCode.length < 6) {
      setManualCodeError('El código debe tener al menos 6 caracteres.');
      return;
    }
    if (!activeCharge) return;

    setManualCodeLoading(true);
    // Para que esto funcione, completePendingChargeWithCode tiene que ser llamable por empleados
    // Pero asume que es el merchant autenticado. Tendremos que crear un employeeCompletePendingChargeWithCode
    // Wait... we need to create it! 
    const res = await fetch('/api/employee/manual-charge', { method: 'POST', body: JSON.stringify({ chargeId: activeCharge.chargeId, shortCode: manualCode }) });
    // Let's use a server action instead
    const { employeeCompletePendingChargeWithCode } = await import('@/app/actions/employee');
    const result = await employeeCompletePendingChargeWithCode(merchantId, activeCharge.chargeId, manualCode);
    setManualCodeLoading(false);

    if (!result.success) {
      setManualCodeError(result.error || 'Código inválido o error al cobrar.');
      return;
    }
    
    setManualCode('');
    // El polling lo detectará y pasará a success!
  };

  const handleReset = () => {
    setAmount('');
    setActiveCharge(null);
    setSuccessData(null);
    setErrorMessage('');
    setSelectedOffer('');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ESTADO EXITO
  if (successData) {
    return (
      <div ref={successRef} className="w-full max-w-lg mx-auto rounded-2xl border border-emerald-700 bg-emerald-950/30 backdrop-blur-sm p-8 text-center space-y-6 shadow-2xl shadow-emerald-900/20 mt-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.4)] border-4 border-emerald-900">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-white">¡Cobro Exitoso!</h3>
          <p className="text-emerald-400 font-medium">El descuento fue aplicado al cliente.</p>
        </div>

        <div className="bg-emerald-950/50 rounded-2xl p-5 inline-block text-left w-full max-w-xs mx-auto border border-emerald-800/50">
          {successData.clientName && (
             <div className="flex justify-between text-sm mb-2">
               <span className="text-emerald-400/70">Cliente:</span>
               <span className="text-slate-300 font-medium">{successData.clientName}</span>
             </div>
          )}
          <div className="flex justify-between text-sm mb-2">
            <span className="text-emerald-400/70">Monto original:</span>
            <span className="text-slate-300 font-medium">{formatARS(successData.amount)}</span>
          </div>
          <div className="flex justify-between items-baseline border-t border-emerald-800/50 pt-3 mt-3">
            <span className="text-emerald-400 font-bold">A cobrar:</span>
            <span className="text-3xl font-black text-white">{formatARS(successData.final)}</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={handleReset}
            className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            <RefreshCw className="h-5 w-5" />
            Habilitar nuevo cobro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 mt-4">
      
      {/* ── ESTADO DEL CÓDIGO (Header Visual) ─────────────────────────────────────── */}
      <div className="bg-blue-900/10 border border-blue-500/20 rounded-3xl p-6 flex flex-col items-center relative overflow-hidden">
        {activeCharge && (
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col items-center w-full">
          <div className={`relative mb-4 transition-all duration-500 ${activeCharge ? 'float-anim' : ''}`}>
             <div className="h-14 w-14 bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50 border border-white/10 relative z-10">
               <Store className="h-7 w-7 text-white" />
             </div>
             {activeCharge && (
               <div className="absolute -inset-2 bg-blue-500/30 blur-xl rounded-full z-0 glow-pulse" />
             )}
          </div>
          
          <h2 className="text-lg font-black text-white text-center tracking-tight">QR Estático del Local</h2>
          
          {activeCharge ? (
             <div className="flex items-center gap-1.5 mt-1 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Código Habilitado</p>
            </div>
          ) : (
             <div className="flex items-center gap-1.5 mt-1 mb-2">
               <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Esperando monto...</p>
             </div>
          )}

          {activeCharge && (
            <div className="w-full flex flex-col items-center mt-2">
              <div className="mb-4 flex items-center gap-2.5 bg-blue-900/40 border border-blue-500/30 px-4 py-2 rounded-full shadow-inner">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                <span className="text-blue-200 text-sm font-bold tracking-wide">
                  Vence en {formatTime(secondsLeft)}
                </span>
              </div>

              <div className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 space-y-3">
                {activeCharge.offerTitle && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center gap-1.5"><Tag className="w-4 h-4" /> Oferta</span>
                    <span className="text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">{activeCharge.offerTitle}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    {activeCharge.paymentMethod === 'cash' ? <Banknote className="w-4 h-4" /> : <ArrowLeftRight className="w-4 h-4" />}
                    Método
                  </span>
                  <span className="text-white font-medium">{activeCharge.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between items-baseline mt-1">
                  <span className="text-slate-300 font-medium">Monto Original</span>
                  <span className="text-2xl font-black text-white tracking-tight">{formatARS(activeCharge.amount)}</span>
                </div>
              </div>

              {/* Formulario de Código Manual */}
              <form onSubmit={handleManualCodeSubmit} className="w-full mt-4 bg-slate-900/80 border border-slate-700 rounded-2xl p-4 shadow-lg">
                <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5" />
                  ¿El cliente no puede escanear?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código (Ej: D8A1F2)"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-blue-500 focus:outline-none"
                    disabled={manualCodeLoading}
                  />
                  <button
                    type="submit"
                    disabled={manualCodeLoading || manualCode.length < 6}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                  >
                    {manualCodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cobrar'}
                  </button>
                </div>
                {manualCodeError && (
                  <p className="text-red-400 text-xs mt-2">{manualCodeError}</p>
                )}
              </form>

              <button
                onClick={handleCancelCharge}
                className="mt-6 flex items-center gap-2 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-full transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── FORMULARIO: PREPARAR COBRO ───────────────────────── */}
      {!activeCharge && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 space-y-5">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            Preparar Cobro
          </h3>

          {/* Selector de oferta */}
          {activeOffers && activeOffers.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-400" />
                Aplicar Oferta (opcional)
              </label>
              <select
                value={selectedOffer}
                onChange={(e) => {
                  const offerId = e.target.value;
                  setSelectedOffer(offerId);
                  if (offerId) {
                    const offer = activeOffers.find(o => o.id === offerId);
                    if (offer && offer.original_price) {
                      setAmount(offer.original_price.toString());
                    }
                  }
                }}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Cobro general (sin oferta)</option>
                {activeOffers.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.title} (−{o.discount_pct}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Monto */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-medium flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Monto a cobrar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 font-black text-xl">$</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-10 pr-4 py-3.5 text-white text-xl font-bold tracking-tight focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-medium">Medio de pago del cliente</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold transition-all
                  ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-500/10 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'}`}
              >
                <Banknote className={`w-4 h-4 ${paymentMethod === 'cash' ? 'text-blue-400' : ''}`} /> Efectivo
              </button>
              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold transition-all
                  ${paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-500/10 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'}`}
              >
                <ArrowLeftRight className={`w-4 h-4 ${paymentMethod === 'transfer' ? 'text-blue-400' : ''}`} /> Transfer.
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <button
            onClick={handleStartCharge}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Procesando...</>
            ) : (
              <><QrCode className="w-6 h-6" /> Habilitar Código</>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
