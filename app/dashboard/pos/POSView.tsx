'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase';
import { createPendingCharge, cancelPendingCharge, completePendingChargeWithCode } from '@/app/actions/pending-charges';
import { employeeCreatePendingCharge, employeeCancelPendingCharge, employeeCompletePendingChargeWithCode } from '@/app/actions/employee';
import Link from 'next/link';
import {
  Store, BellRing, Banknote, ArrowLeftRight,
  Loader2, QrCode, X, Tag, DollarSign, CheckCircle2, Clock, Sparkles, Printer
} from 'lucide-react';
import { UndoChargeButton } from '@/components/dashboard/UndoChargeButton';
import { getLastTransactionServer } from '@/app/actions/charge';
import { formatARS } from '@/lib/discount-logic';

interface Offer {
  id: string;
  title: string;
  discount_pct: number;
  original_price: number | null;
  final_price: number | null;
}

interface PendingCharge {
  id: string;
  offer_title: string | null;
  amount: number;
  payment_method: string;
  expires_at: string;
}

interface RecentTx {
  id?: string;
  original_amount: number;
  discount_pct: number;
  final_amount: number;
  client_name?: string;
  offer_title?: string;
}

export function POSView({
  merchantId,
  branchId,
  businessName,
  offers,
  employeeId,
}: {
  merchantId: string;
  branchId: string | null;
  businessName: string;
  offers: Offer[];
  employeeId?: string;
}) {
  const supabase = createClient();

  // Generar URL completa SOLO en el cliente (después de hidratación)
  const [qrUrl, setQrUrl] = useState('');
  useEffect(() => {
    let url = `${window.location.origin}/pay?m=${merchantId}`;
    if (branchId) {
      url += `&b=${branchId}`;
    }
    setQrUrl(url);
  }, [merchantId, branchId]);

  // Estado del formulario
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Calcula el precio final estimado basado en la oferta seleccionada
  const numAmount = parseFloat(amount);
  const isValidAmount = !isNaN(numAmount) && numAmount > 0;
  
  let estimatedDiscountPctLabel = 0;
  let exactDiscountRatio = 0;

  if (selectedOfferId) {
    const offer = offers.find(o => o.id === selectedOfferId);
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

  // Estado para el código manual
  const [manualCode, setManualCode] = useState('');
  const [manualCodeLoading, setManualCodeLoading] = useState(false);
  const [manualCodeError, setManualCodeError] = useState('');

  // Estado del cobro activo
  const [activeCharge, setActiveCharge] = useState<PendingCharge | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Notificación de cobro recibido
  const [recentTx, setRecentTx] = useState<RecentTx | null>(null);

  // Countdown timer
  useEffect(() => {
    if (!activeCharge) return;
    const expiresAt = new Date(activeCharge.expires_at).getTime();

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

  // Escuchar cuando el cliente confirma el cobro en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel(`pos-merchant-${merchantId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pending_charges',
          filter: `merchant_id=eq.${merchantId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.status === 'completed') {
            // Obtener el ID de la transacción insertada para poder deshacerla
            getLastTransactionServer(merchantId).then((txId) => {
              setActiveCharge(null);
              setRecentTx({
                id: txId || undefined,
                original_amount: updated.amount,
                discount_pct: updated.discount_applied_pct ?? 0,
                final_amount: updated.final_amount_paid ?? updated.amount,
                client_name: updated.completed_by_name ?? undefined,
                offer_title: updated.offer_title ?? undefined,
              });

              // Gamificación: Sonido, Confeti y Vibración
              try { new Audio('/success.mp3').play().catch(() => {}); } catch (_) {}
              
              import('canvas-confetti').then((confetti) => {
                confetti.default({
                  particleCount: 150,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#3b82f6', '#8b5cf6', '#d946ef', '#10b981']
                });
              });

              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
              }

              setTimeout(() => setRecentTx(null), 25000);
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [merchantId]);

  // Cuando seleccionamos una oferta, auto-rellenar el monto
  const handleOfferChange = (offerId: string) => {
    setSelectedOfferId(offerId);
    if (offerId) {
      const offer = offers.find(o => o.id === offerId);
      if (offer?.original_price) {
        setAmount(offer.original_price.toString());
      }
    } else {
      setAmount('');
    }
  };

  const handleLoadQR = async () => {
    setFormError('');
    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Ingresá el monto de la compra.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (selectedOfferId) {
      const offer = offers.find(o => o.id === selectedOfferId);
      formData.set('offer_id', selectedOfferId);
      formData.set('offer_title', offer?.title || '');
    }
    formData.set('amount', amount);
    formData.set('payment_method', paymentMethod);
    if (branchId) {
      formData.set('branch_id', branchId);
    }

    const res = employeeId 
      ? await employeeCreatePendingCharge(employeeId, formData)
      : await createPendingCharge(formData);
    setLoading(false);

    if (!res.success) {
      setFormError(res.error || 'Error al cargar el cobro.');
      return;
    }

    // Mostrar el cobro activo con vencimiento de 15 min
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    setActiveCharge({
      id: res.chargeId!,
      offer_title: selectedOfferId ? offers.find(o => o.id === selectedOfferId)?.title || null : null,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      expires_at: expiresAt,
    });

    // Reset form
    setSelectedOfferId('');
    setAmount('');
    setPaymentMethod('cash');
  };

  const handleCancelCharge = async () => {
    if (!activeCharge) return;
    if (employeeId) {
      await employeeCancelPendingCharge(employeeId, activeCharge.id);
    } else {
      await cancelPendingCharge(activeCharge.id);
    }
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
    const res = employeeId ? await employeeCompletePendingChargeWithCode(employeeId, activeCharge.id, manualCode) : await completePendingChargeWithCode(activeCharge.id, manualCode);
    setManualCodeLoading(false);

    if (!res.success) {
      setManualCodeError(res.error || 'Código inválido o error al cobrar.');
      return;
    }
    
    // Si es exitoso, el websocket automáticamente capturará el cambio de estado a 'completed' 
    // y mostrará la pantalla de éxito.
    setManualCode('');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">

      {/* ── NOTIFICACIÓN DE COBRO RECIBIDO ─────────────────── */}
      {recentTx && (
        <div className="fixed inset-x-4 top-4 z-50 md:static rounded-3xl border border-emerald-500/50 bg-emerald-950/90 backdrop-blur-xl p-6 shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)]">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-inner">
              <BellRing className="h-8 w-8 text-emerald-400 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-white tracking-tight">¡Pago Confirmado!</h3>
              {recentTx.client_name && (
                <p className="text-emerald-300 text-sm font-medium mt-1">
                  Cliente: <span className="text-white font-bold">{recentTx.client_name}</span>
                </p>
              )}
              {recentTx.offer_title && (
                <p className="text-emerald-300/80 text-sm mt-0.5">
                  Oferta: <span className="text-emerald-100">{recentTx.offer_title}</span>
                </p>
              )}
            </div>
            <button onClick={() => setRecentTx(null)} className="text-emerald-500 hover:text-white transition-colors bg-emerald-900/50 hover:bg-emerald-800/50 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 bg-black/20 rounded-2xl p-5 border border-emerald-500/20 shadow-inner">
            <div className="flex justify-between text-sm mb-1.5 text-emerald-100/60">
              <span>Original:</span>
              <span className="line-through">{formatARS(recentTx.original_amount)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3 text-emerald-100/60">
              <span>Descuento:</span>
              <span className="text-emerald-400 font-bold">−{recentTx.discount_pct}%</span>
            </div>
            <div className="flex justify-between items-baseline pt-3 border-t border-emerald-500/20">
              <span className="text-white font-medium">Cobrado:</span>
              <span className="text-3xl font-black text-emerald-400 tracking-tight">{formatARS(recentTx.final_amount)}</span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button
              onClick={() => setRecentTx(null)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              Entendido
            </button>
            {recentTx.id && (
              <div className="flex justify-center">
                <UndoChargeButton transactionId={recentTx.id} onUndoSuccess={() => setRecentTx(null)} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── QR + ESTADO ─────────────────────────────────────── */}
      <div className="glass-card-blue rounded-3xl p-6 flex flex-col items-center relative overflow-hidden">
        {activeCharge && (
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Logo animado si hay cobro */}
          <div className={`relative mb-5 transition-all duration-500 ${activeCharge ? 'float-anim' : ''}`}>
             <div className="h-16 w-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50 border border-white/10 relative z-10">
               <Store className="h-8 w-8 text-white" />
             </div>
             {activeCharge && (
               <div className="absolute -inset-2 bg-blue-500/30 blur-xl rounded-full z-0 glow-pulse" />
             )}
          </div>
          
          <h2 className="text-xl font-black text-white text-center tracking-tight">{businessName}</h2>
          
          {activeCharge && (
             <div className="flex items-center gap-1.5 mt-1 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest">Cobro Activo</p>
            </div>
          )}

          {activeCharge ? (
            <>
              {/* Badge: tiempo restante */}
              <div className="mt-2 mb-6 flex items-center gap-2.5 bg-blue-900/40 border border-blue-500/30 px-5 py-2.5 rounded-full shadow-inner">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                <span className="text-blue-200 text-sm font-bold tracking-wide">
                  Vence en {formatTime(secondsLeft)}
                </span>
              </div>

              <div className="bg-[#0F172A] p-5 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.3)] border-4 border-cyan-500/50 transition-all transform hover:scale-105 duration-300 relative">
                <QRCodeSVG
                  value={qrUrl}
                  size={220}
                  level="H"
                  includeMargin={false}
                  bgColor="#0F172A"
                  fgColor="#38bdf8"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#0F172A] px-2 py-1 rounded-xl shadow-lg border-2 border-cyan-400">
                    <img src="/logo.png" alt="Lazoo" className="h-5 w-auto object-contain" />
                  </div>
                </div>
              </div>

              {/* Resumen del cobro activo */}
              {(() => {
                let discountPctLabel = 0;
                let exactRatio = 0;
                if (activeCharge.offer_title) {
                  const offer = offers.find(o => o.title === activeCharge.offer_title);
                  if (offer) {
                    discountPctLabel = offer.discount_pct || 0;
                    if (offer.original_price && offer.final_price && offer.original_price > 0) {
                      exactRatio = (offer.original_price - offer.final_price) / offer.original_price;
                    } else {
                      exactRatio = discountPctLabel / 100;
                    }
                  }
                }
                const discountAmount = activeCharge.amount * exactRatio;
                const finalPrice = activeCharge.amount - discountAmount;

                return (
                  <div className="w-full mt-8 bg-black/20 border border-white/10 rounded-2xl p-5 space-y-3 shadow-inner">
                    {activeCharge.offer_title && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 flex items-center gap-1.5"><Tag className="w-4 h-4" /> Oferta</span>
                        <span className="text-blue-300 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{activeCharge.offer_title}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        {activeCharge.payment_method === 'cash' ? <Banknote className="w-4 h-4" /> : <ArrowLeftRight className="w-4 h-4" />}
                        Método
                      </span>
                      <span className="text-white font-medium">{activeCharge.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}</span>
                    </div>

                    {exactRatio > 0 ? (
                      <div className="pt-3 border-t border-white/5 space-y-2 mt-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Precio original</span>
                          <span className="text-slate-300 line-through">{formatARS(activeCharge.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-blue-400/80">Descuento ({discountPctLabel}%)</span>
                          <span className="text-blue-400 font-medium">-{formatARS(discountAmount)}</span>
                        </div>
                        <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-blue-900/50">
                          <span className="text-blue-300 font-bold">Monto a Cobrar</span>
                          <span className="text-2xl font-black text-white tracking-tight">{formatARS(finalPrice)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-white/5 flex justify-between items-baseline mt-1">
                        <span className="text-slate-300 font-medium">Monto Total</span>
                        <span className="text-2xl font-black text-white tracking-tight">{formatARS(activeCharge.amount)}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Formulario de Código Manual */}
              <form onSubmit={handleManualCodeSubmit} className="w-full mt-4 bg-slate-900/80 border border-slate-700 rounded-2xl p-4 shadow-lg">
                <label className="block text-xs font-medium text-slate-400 mb-2">¿El cliente no puede escanear?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código de 6 dígitos"
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
                Cancelar este cobro
              </button>
            </>
          ) : (
            <>
              <p className="text-slate-400 text-sm mt-2 mb-6 text-center max-w-[250px]">
                Prepará el cobro abajo para activar el código QR.
              </p>
              <div className="bg-[#0F172A] p-5 rounded-3xl shadow-xl opacity-60 border border-cyan-500/20 transition-all relative">
                <QRCodeSVG
                  value={qrUrl}
                  size={180}
                  level="M"
                  bgColor="#0F172A"
                  fgColor="#38bdf8"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#0F172A] px-2 py-1 rounded-xl shadow-lg border border-cyan-500/40">
                    <img src="/logo.png" alt="Lazoo" className="h-4 w-auto object-contain opacity-75" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-5 text-slate-500 text-xs font-semibold uppercase tracking-wider bg-black/20 px-4 py-2 rounded-full border border-white/5">
                <Clock className="w-3.5 h-3.5" />
                Esperando monto...
              </div>


            </>
          )}
        </div>
      </div>

      {/* ── FORMULARIO: PREPARAR COBRO ───────────────────────── */}
      {!activeCharge && (
        <div className="glass-panel rounded-3xl p-7 space-y-6">
          <h3 className="text-white font-bold text-xl flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <QrCode className="w-5 h-5 text-blue-400" />
            </div>
            Preparar Cobro
          </h3>

          {/* Selector de oferta */}
          {offers.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-medium flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-400" />
                Aplicar Oferta (opcional)
              </label>
              <div className="relative">
                <select
                  value={selectedOfferId}
                  onChange={(e) => handleOfferChange(e.target.value)}
                  className="w-full input-glass rounded-xl px-4 py-3.5 text-white appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-slate-300">Cobro general (sin oferta)</option>
                  {offers.map(o => (
                    <option key={o.id} value={o.id} className="bg-slate-900">
                      {o.title} (−{o.discount_pct}%)
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          )}

          {/* Monto */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-medium flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Monto a cobrar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <span className="text-slate-400 font-black text-xl">$</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                className="w-full input-glass rounded-xl pl-12 pr-4 py-4 text-white text-2xl font-black tracking-tight"
              />
            </div>
          </div>

          {/* ── LIVE PREVIEW DEL DESCUENTO ── */}
          {isValidAmount && exactDiscountRatio > 0 && (
            <div className="rounded-xl bg-blue-950/40 border border-blue-900/50 p-4 space-y-2 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Precio original:</span>
                <span className="text-slate-300 line-through">${numAmount.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-400/80">Descuento ({estimatedDiscountPctLabel}%):</span>
                <span className="text-blue-400 font-medium">-${estimatedDiscountAmount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="w-full h-px bg-blue-900/50 my-1"></div>
              <div className="flex justify-between items-center text-base mt-2">
                <span className="text-blue-300 font-bold">Total a cobrar:</span>
                <span className="text-white font-black text-xl">${estimatedFinalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          {/* Método de pago */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-medium">Medio de pago del cliente</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 font-semibold transition-all
                  ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-500/10 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-white/10 bg-black/20 text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
              >
                <Banknote className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-blue-400' : ''}`} /> Efectivo
              </button>
              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 font-semibold transition-all
                  ${paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-500/10 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-white/10 bg-black/20 text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
              >
                <ArrowLeftRight className={`w-5 h-5 ${paymentMethod === 'transfer' ? 'text-blue-400' : ''}`} /> Transferencia
              </button>
            </div>
          </div>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
              <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm font-medium">{formError}</p>
            </div>
          )}

          <button
            onClick={handleLoadQR}
            disabled={loading}
            className="btn-primary w-full py-4.5 rounded-xl font-black text-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Procesando...</>
            ) : (
              <><QrCode className="w-6 h-6" /> Activar QR de Cobro</>
            )}
          </button>
        </div>
      )}

      {/* Botones auxiliares */}
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => { navigator.clipboard.writeText(qrUrl); alert('¡Enlace de cobro copiado!'); }}
          className="py-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-300 text-sm font-semibold transition-all"
        >
          Copiar enlace web
        </button>
      </div>
    </div>
  );
}
