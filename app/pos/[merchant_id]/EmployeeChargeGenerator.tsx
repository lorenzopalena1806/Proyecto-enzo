'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { PaymentMethod } from '@/types';
import { checkRecentTransactionServer } from '@/app/actions/employee';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Banknote,
  ArrowLeftRight,
  RefreshCw,
  Loader2,
  XCircle,
  Tag,
} from 'lucide-react';

interface EmployeeChargeGeneratorProps {
  merchantId: string;
  activeOffers?: any[];
}

export function EmployeeChargeGenerator({ merchantId, activeOffers = [] }: EmployeeChargeGeneratorProps) {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [selectedOffer, setSelectedOffer] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'waiting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<{ amount: number; final: number; transactionId?: string } | null>(null);
  
  // Guardamos el timestamp en el que generamos el QR para no agarrar pagos viejos accidentalmente
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  // Generar URL para el QR
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  let qrUrl = `${baseUrl}/pay?m=${merchantId}&a=${amount}&method=${paymentMethod}`;
  if (selectedOffer) {
    qrUrl += `&offer=${selectedOffer}`;
  }

  // Polling para verificar si el cliente pagó
  useEffect(() => {
    if (status !== 'waiting') return;

    const intervalId = setInterval(async () => {
      try {
        const res = await checkRecentTransactionServer(merchantId, parseFloat(amount), sessionStartTime);
        if (res.success && res.finalAmount !== undefined) {
          setSuccessData({
            amount: parseFloat(amount),
            final: res.finalAmount,
            transactionId: res.transactionId,
          });
          setStatus('success');
        } else if (res.reason === 'Sesión expirada') {
          window.location.reload();
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [status, merchantId, amount, sessionStartTime]);

  const handleStartCharge = () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Ingresá un monto válido.');
      return;
    }
    setErrorMessage('');
    setSessionStartTime(Date.now());
    setStatus('waiting');
  };

  const handleReset = () => {
    setAmount('');
    setStatus('idle');
    setSuccessData(null);
    setErrorMessage('');
    setSelectedOffer('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* ── ESTADO: IDLE ──────────────────────────────────── */}
      {status === 'idle' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur-sm p-6 space-y-5 shadow-xl">
          {activeOffers && activeOffers.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                <Tag className="inline h-4 w-4 mr-1 text-violet-400" />
                ¿Qué estás cobrando? (Opcional)
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
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Cobro General (Descuento estándar)</option>
                {activeOffers.map(offer => (
                  <option key={offer.id} value={offer.id}>
                    {offer.title} (-{offer.discount_pct}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              <DollarSign className="inline h-4 w-4 mr-1 text-violet-400" />
              Monto total de la compra (ARS)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-lg font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Método de pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              <PaymentMethodButton
                selected={paymentMethod === 'cash'}
                onClick={() => setPaymentMethod('cash')}
                label="Efectivo"
                Icon={Banknote}
              />
              <PaymentMethodButton
                selected={paymentMethod === 'transfer'}
                onClick={() => setPaymentMethod('transfer')}
                label="Transferencia"
                Icon={ArrowLeftRight}
              />
            </div>
            <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3" />
              Tarjetas no aplican descuento
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 rounded-lg bg-red-950/50 border border-red-700 p-3">
              <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          <button
            onClick={handleStartCharge}
            className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          >
            <QrCode className="h-5 w-5" />
            Generar QR
          </button>
        </div>
      )}

      {/* ── ESTADO: WAITING ───────────────────────────────── */}
      {status === 'waiting' && (
        <div className="rounded-2xl border border-violet-700/50 bg-slate-800/80 backdrop-blur-sm p-8 flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white">Mostrá este QR al cliente</h3>
            <p className="text-slate-400">Total: <span className="font-bold text-white">${parseFloat(amount).toLocaleString('es-AR')}</span></p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-xl shadow-violet-900/20">
            <QRCodeSVG value={qrUrl} size={250} level="M" />
          </div>

          <div className="flex flex-col items-center gap-2 text-violet-400">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">Esperando al cliente...</span>
            </div>
            <p className="text-xs text-slate-500">Esta pantalla cambiará sola cuando pague</p>
          </div>

          <button
            onClick={handleReset}
            className="mt-6 px-6 py-2 rounded-full border border-slate-600 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* ── ESTADO: SUCCESS ───────────────────────────────── */}
      {status === 'success' && successData && (
        <div className="rounded-2xl border border-emerald-700 bg-emerald-950/30 backdrop-blur-sm p-8 text-center space-y-6 shadow-2xl shadow-emerald-900/20">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.4)] border-4 border-emerald-900">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-white">¡Cobro Exitoso!</h3>
            <p className="text-emerald-400 font-medium">El descuento fue aplicado en el sistema.</p>
          </div>

          <div className="bg-emerald-950/50 rounded-2xl p-5 inline-block text-left w-full max-w-xs mx-auto border border-emerald-800/50">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-emerald-400/70">Monto original:</span>
              <span className="text-slate-300 font-medium">${successData.amount.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-emerald-800/50 pt-3 mt-3">
              <span className="text-emerald-400 font-bold">A cobrar:</span>
              <span className="text-3xl font-black text-white">${successData.final.toLocaleString('es-AR')}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={handleReset}
              className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <RefreshCw className="h-5 w-5" />
              Nuevo Cobro
            </button>
            <p className="text-xs text-slate-500">Nota: Los empleados no pueden revertir cobros.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentMethodButton({ selected, onClick, label, Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200
        ${selected ? 'border-violet-500 bg-violet-950/60 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-500 hover:text-slate-300'}`}
    >
      <Icon className={`h-4 w-4 ${selected ? 'text-violet-400' : ''}`} />
      {label}
    </button>
  );
}
