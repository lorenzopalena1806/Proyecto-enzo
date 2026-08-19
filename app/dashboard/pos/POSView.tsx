'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase';
import { createPendingCharge, cancelPendingCharge } from '@/app/actions/pending-charges';
import {
  Store, BellRing, Banknote, ArrowLeftRight,
  Loader2, QrCode, X, Tag, DollarSign, CheckCircle2, Clock
} from 'lucide-react';
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
  original_amount: number;
  discount_pct: number;
  final_amount: number;
  client_name?: string;
  offer_title?: string;
}

export function POSView({
  merchantId,
  businessName,
  offers,
}: {
  merchantId: string;
  businessName: string;
  offers: Offer[];
}) {
  const supabase = createClient();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrUrl = `${baseUrl}/pay?m=${merchantId}`;

  // Estado del formulario
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

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
            // Cobro confirmado por el cliente → mostrar notificación
            setActiveCharge(null);
            setRecentTx({
              original_amount: updated.amount,
              discount_pct: updated.discount_applied_pct ?? 0,
              final_amount: updated.final_amount_paid ?? updated.amount,
              client_name: updated.completed_by_name ?? undefined,
              offer_title: updated.offer_title ?? undefined,
            });

            try { new Audio('/success.mp3').play().catch(() => {}); } catch (_) {}
            setTimeout(() => setRecentTx(null), 25000);
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

    const res = await createPendingCharge(formData);
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
    await cancelPendingCharge(activeCharge.id);
    setActiveCharge(null);
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
        <div className="fixed inset-x-4 top-4 z-50 md:static rounded-2xl border border-emerald-500 bg-emerald-950/95 backdrop-blur-md p-6 shadow-2xl shadow-emerald-900/50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-14 w-14 bg-emerald-900 border border-emerald-600 rounded-2xl flex items-center justify-center">
              <BellRing className="h-7 w-7 text-emerald-400 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white">¡Pago Confirmado!</h3>
              {recentTx.client_name && (
                <p className="text-emerald-300 text-sm font-medium">
                  Cliente: <span className="text-white">{recentTx.client_name}</span>
                </p>
              )}
              {recentTx.offer_title && (
                <p className="text-emerald-300 text-sm">
                  Oferta: <span className="text-white">{recentTx.offer_title}</span>
                </p>
              )}
            </div>
            <button onClick={() => setRecentTx(null)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 bg-slate-900/60 rounded-xl p-4 border border-emerald-800/30">
            <div className="flex justify-between text-sm mb-1 text-slate-400">
              <span>Original:</span>
              <span>{formatARS(recentTx.original_amount)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2 text-slate-400">
              <span>Descuento:</span>
              <span className="text-emerald-400">−{recentTx.discount_pct}%</span>
            </div>
            <div className="flex justify-between text-xl font-black pt-2 border-t border-slate-700/50">
              <span className="text-white">Cobrar:</span>
              <span className="text-emerald-400">{formatARS(recentTx.final_amount)}</span>
            </div>
          </div>

          <button
            onClick={() => setRecentTx(null)}
            className="w-full mt-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
          >
            Entendido
          </button>
        </div>
      )}

      {/* ── QR + ESTADO ─────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-700 bg-slate-800/60 backdrop-blur-sm p-6 flex flex-col items-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-violet-600/20 to-transparent" />

        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="h-14 w-14 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Store className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-xl font-black text-white text-center mb-1">{businessName}</h2>

          {activeCharge ? (
            <>
              {/* Badge: cobro cargado */}
              <div className="mb-4 flex items-center gap-2 bg-violet-900/60 border border-violet-600 px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-violet-300 text-sm font-semibold">
                  QR cargado — vence en {formatTime(secondsLeft)}
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-2xl border-4 border-violet-400">
                <QRCodeSVG value={qrUrl} size={230} level="M" />
              </div>

              {/* Resumen del cobro activo */}
              <div className="w-full mt-5 bg-slate-900/70 border border-violet-800/50 rounded-2xl p-4 space-y-1">
                {activeCharge.offer_title && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Oferta</span>
                    <span className="text-violet-300 font-medium">{activeCharge.offer_title}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Monto</span>
                  <span className="text-white font-bold">{formatARS(activeCharge.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Método</span>
                  <span className="text-white capitalize">{activeCharge.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}</span>
                </div>
              </div>

              <button
                onClick={handleCancelCharge}
                className="mt-4 flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar cobro
              </button>
            </>
          ) : (
            <>
              <p className="text-slate-400 text-sm mb-5 text-center">
                Cargá el cobro abajo y mostrále este QR al cliente.
              </p>
              <div className="bg-white p-5 rounded-3xl shadow-xl opacity-60">
                <QRCodeSVG value={qrUrl} size={200} level="M" />
              </div>
              <div className="flex items-center gap-2 mt-3 text-slate-500 text-xs">
                <Clock className="w-3.5 h-3.5" />
                QR sin cobro activo
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── FORMULARIO: PREPARAR COBRO ───────────────────────── */}
      {!activeCharge && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 space-y-5">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5 text-violet-400" />
            Preparar Cobro
          </h3>

          {/* Selector de oferta */}
          {offers.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-violet-400" />
                Oferta seleccionada (opcional)
              </label>
              <select
                value={selectedOfferId}
                onChange={(e) => handleOfferChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="">Cobro general (sin oferta)</option>
                {offers.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.title} (−{o.discount_pct}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Monto */}
          <div className="space-y-1.5">
            <label className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-violet-400" />
              Monto total de la compra
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xl font-bold placeholder-slate-600 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Método de pago */}
          <div className="space-y-1.5">
            <label className="text-sm text-slate-400 font-medium">Método de pago</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all
                  ${paymentMethod === 'cash' ? 'border-violet-500 bg-violet-950/50 text-violet-300' : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'}`}
              >
                <Banknote className="w-4 h-4" /> Efectivo
              </button>
              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all
                  ${paymentMethod === 'transfer' ? 'border-violet-500 bg-violet-950/50 text-violet-300' : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'}`}
              >
                <ArrowLeftRight className="w-4 h-4" /> Transferencia
              </button>
            </div>
          </div>

          {formError && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">{formError}</p>
          )}

          <button
            onClick={handleLoadQR}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg transition-all shadow-lg shadow-violet-900/40 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Cargando...</>
            ) : (
              <><QrCode className="w-5 h-5" /> Cargar QR</>
            )}
          </button>
        </div>
      )}

      {/* Botones auxiliares */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => window.print()}
          className="py-3 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-all"
        >
          Imprimir QR
        </button>
        <button
          onClick={() => { navigator.clipboard.writeText(qrUrl); alert('¡Enlace copiado!'); }}
          className="py-3 rounded-xl border border-violet-700 hover:border-violet-500 bg-violet-900/20 hover:bg-violet-800/30 text-violet-300 text-sm font-medium transition-all"
        >
          Copiar enlace
        </button>
      </div>
    </div>
  );
}
