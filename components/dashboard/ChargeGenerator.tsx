'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase';
import { processPaymentByShortCodeServer } from '@/app/actions/charge';
import type { PaymentMethod } from '@/types';
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
  Keyboard,
  Tag,
} from 'lucide-react';
import { UndoChargeButton } from './UndoChargeButton';
import confetti from 'canvas-confetti';

const playSuccessSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Premium "Ting!" sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // A6
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error('Audio play failed', e);
  }
};

interface ChargeGeneratorProps {
  merchantId: string;
  activeOffers?: any[];
}

export function ChargeGenerator({ merchantId, activeOffers = [] }: ChargeGeneratorProps) {
  const supabase = createClient();

  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [shortCode, setShortCode] = useState<string>('');
  const [selectedOffer, setSelectedOffer] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'waiting' | 'success' | 'error' | 'processing'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<{ amount: number; final: number; transactionId?: string } | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'success') {
      setTimeout(() => successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [status]);

  // Calcula el precio final estimado basado en la oferta seleccionada
  const numAmount = parseFloat(amount);
  const isValidAmount = !isNaN(numAmount) && numAmount > 0;
  
  let estimatedDiscountPctLabel = 0;
  let exactDiscountRatio = 0;
  if (selectedOffer) {
    const offer = activeOffers.find(o => o.id === selectedOffer);
    if (offer) {
      estimatedDiscountPctLabel = offer.discount_pct || 0;
      if (offer.original_price && offer.final_price && offer.original_price > 0) {
        exactDiscountRatio = (offer.original_price - offer.final_price) / offer.original_price;
      } else {
        exactDiscountRatio = estimatedDiscountPctLabel / 100;
      }
    }
  }
  
  const estimatedDiscountAmount = isValidAmount ? numAmount * exactDiscountRatio : 0;
  const estimatedFinalPrice = isValidAmount ? numAmount - estimatedDiscountAmount : 0;

  // Generar URL para el QR
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  let qrUrl = `${baseUrl}/pay?m=${merchantId}&a=${amount}&method=${paymentMethod}`;
  if (selectedOffer) {
    qrUrl += `&offer=${selectedOffer}`;
  }

  // Escuchar cobros en tiempo real
  useEffect(() => {
    if (status !== 'waiting') return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'discount_transactions',
          filter: `scanner_id=eq.${merchantId}`,
        },
        (payload) => {
          const newTx = payload.new;
          // Validar que el monto coincida para estar seguros que es este cobro
          if (newTx.original_amount === parseFloat(amount)) {
            setSuccessData({
              amount: newTx.original_amount,
              final: newTx.final_amount,
              transactionId: newTx.id,
            });
            setStatus('success');
            
            // Juguetes Visuales y Sensoriales
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#8b5cf6', '#10b981', '#3b82f6']
            });
            playSuccessSound();
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [status, merchantId, amount, supabase]);

  const handleStartCharge = () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Ingresá un monto válido.');
      return;
    }
    setErrorMessage('');
    setStatus('waiting');
  };

  const handleManualCharge = async () => {
    if (shortCode.length < 6) {
      setErrorMessage('El código debe tener al menos 6 caracteres.');
      return;
    }
    setStatus('processing');
    setErrorMessage('');

    try {
      const res = await processPaymentByShortCodeServer(
        merchantId, 
        parseFloat(amount), 
        paymentMethod, 
        shortCode.toLowerCase(),
        selectedOffer || undefined
      );
      
      if (res.success) {
        setSuccessData({
          amount: parseFloat(amount),
          final: (res as any).finalAmount,
          transactionId: (res as any).transactionId,
        });
        setStatus('success');
        
        // Juguetes Visuales y Sensoriales
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#10b981', '#3b82f6']
        });
        playSuccessSound();
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      } else {
        setErrorMessage(res.reason || 'Error desconocido.');
        setStatus('waiting');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error al procesar.');
      setStatus('waiting');
    }
  };

  const handleReset = () => {
    setAmount('');
    setShortCode('');
    setStatus('idle');
    setSuccessData(null);
    setErrorMessage('');
    setSelectedOffer('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* ── HEADER ───────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
          <QrCode className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Generar Cobro</h2>
          <p className="text-sm text-slate-400">El cliente escaneará el QR para confirmar</p>
        </div>
      </div>

      {/* ── ESTADO: IDLE — Formulario previo al cobro ───── */}
      {status === 'idle' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur-sm p-6 space-y-5">
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
                inputMode="decimal"
                pattern="[0-9]*"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-lg font-semibold"
              />
            </div>
          </div>

          {/* ── LIVE PREVIEW DEL DESCUENTO ── */}
          {isValidAmount && exactDiscountRatio > 0 && (
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-900/50 p-4 space-y-2 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Precio original:</span>
                <span className="text-slate-300 line-through">${numAmount.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-400/80">Descuento ({estimatedDiscountPctLabel}%):</span>
                <span className="text-emerald-400 font-medium">-${estimatedDiscountAmount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="w-full h-px bg-emerald-900/50 my-1"></div>
              <div className="flex justify-between items-center text-base">
                <span className="text-emerald-300 font-bold">Total a cobrar:</span>
                <span className="text-white font-black text-lg">${estimatedFinalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

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
              Las tarjetas de crédito/débito no aplican descuento
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
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-900/50"
          >
            <QrCode className="h-5 w-5" />
            Generar QR de Cobro
          </button>
        </div>
      )}

      {/* ── ESTADO: WAITING / PROCESSING ──────────────────────── */}
      {(status === 'waiting' || status === 'processing') && (
        <div className="rounded-2xl border border-violet-700/50 bg-slate-800/80 backdrop-blur-sm p-8 flex flex-col items-center gap-6">
          <div className="text-center space-y-2 w-full max-w-sm mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Mostrá este QR al cliente</h3>
            
            {exactDiscountRatio > 0 ? (
              <div className="bg-emerald-950/40 rounded-xl p-4 border border-emerald-900/50 space-y-2 text-left mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Precio original:</span>
                  <span className="text-slate-300 line-through">${numAmount.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-400/80">Descuento ({estimatedDiscountPctLabel}%):</span>
                  <span className="text-emerald-400 font-medium">-${estimatedDiscountAmount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="w-full h-px bg-emerald-900/50 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-300 font-bold text-sm">Total a cobrar:</span>
                  <span className="text-white font-black text-xl">${estimatedFinalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-lg mb-6">Total: <span className="font-black text-white text-2xl">${parseFloat(amount).toLocaleString('es-AR')}</span></p>
            )}
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-xl shadow-violet-900/20">
            <QRCodeSVG value={qrUrl} size={250} level="M" />
          </div>

          <div className="flex items-center gap-2 text-violet-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Esperando confirmación del cliente...</span>
          </div>

          <div className="w-full h-px bg-slate-700 my-2"></div>

          <div className="w-full space-y-3">
            <p className="text-sm text-slate-400 text-center flex justify-center items-center gap-2">
              <Keyboard className="h-4 w-4" />
              ¿El cliente no puede escanear? Ingresá su código:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: d8a1f2"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-600 text-white uppercase text-center font-bold tracking-widest focus:ring-2 focus:ring-violet-500 outline-none"
                maxLength={6}
              />
              <button
                onClick={handleManualCharge}
                disabled={status === 'processing'}
                className="px-6 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all disabled:opacity-50"
              >
                Cobrar
              </button>
            </div>
            {errorMessage && <p className="text-red-400 text-xs text-center">{errorMessage}</p>}
          </div>

          <button
            onClick={handleReset}
            className="mt-4 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* ── ESTADO: SUCCESS ───────────────────────────────── */}
      {status === 'success' && successData && (
        <div 
          ref={successRef}
          className="rounded-2xl border border-emerald-700 bg-emerald-950/30 backdrop-blur-sm p-8 text-center space-y-6 shadow-2xl shadow-emerald-900/20"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900 border border-emerald-700">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-emerald-300">¡Cobro Exitoso!</h3>
            <p className="text-slate-400">El descuento fue aplicado y guardado.</p>
          </div>

          <div className="bg-emerald-950/50 rounded-xl p-4 inline-block text-left w-full max-w-xs mx-auto border border-emerald-800/50">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-emerald-400/70">Monto original:</span>
              <span className="text-slate-300">${successData.amount.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-emerald-800/50 pt-2 mt-2">
              <span className="text-emerald-400">Pagado:</span>
              <span className="text-white">${successData.final.toLocaleString('es-AR')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Nuevo Cobro
            </button>
            
            {successData.transactionId && (
              <div className="flex justify-center mt-2">
                <UndoChargeButton 
                  transactionId={successData.transactionId} 
                  isRecent={true} 
                  isCancelled={false} 
                  onUndoSuccess={() => {
                    handleReset();
                    alert('Cobro revertido correctamente.');
                  }}
                />
              </div>
            )}
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
        ${selected ? 'border-violet-500 bg-violet-950/60 text-violet-300 shadow-lg' : 'border-slate-600 bg-slate-900/40 text-slate-400 hover:border-slate-500 hover:text-slate-300'}`}
    >
      <Icon className={`h-4 w-4 ${selected ? 'text-violet-400' : ''}`} />
      {label}
    </button>
  );
}
