'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase';
import { createPendingCharge, cancelPendingCharge, completePendingChargeWithCode } from '@/app/actions/pending-charges';
import {
  Store, BellRing, Banknote, ArrowLeftRight,
  Loader2, QrCode, X, Tag, DollarSign, CheckCircle2, Clock, Sparkles
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

  // Generar URL completa SOLO en el cliente (después de hidratación)
  const [qrUrl, setQrUrl] = useState('');
  useEffect(() => {
    setQrUrl(`${window.location.origin}/pay?m=${merchantId}`);
  }, [merchantId]);

  // Estado del formulario
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

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
            // Cobro confirmado por el cliente → mostrar notificación
            setActiveCharge(null);
            setRecentTx({
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

  const handleManualCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualCodeError('');
    
    if (!manualCode || manualCode.length < 6) {
      setManualCodeError('El código debe tener al menos 6 caracteres.');
      return;
    }
    if (!activeCharge) return;

    setManualCodeLoading(true);
    const res = await completePendingChargeWithCode(activeCharge.id, manualCode);
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
        <div className="fixed inset-x-4 top-4 z-50 md:static rounded-3xl border border-emerald-200 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300 rounded-2xl flex items-center justify-center shadow-inner">
              <BellRing className="h-8 w-8 text-emerald-600 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">¡Pago Confirmado!</h3>
              {recentTx.client_name && (
                <p className="text-slate-600 text-sm font-medium mt-1">
                  Cliente: <span className="text-slate-900 font-bold">{recentTx.client_name}</span>
                </p>
              )}
              {recentTx.offer_title && (
                <p className="text-slate-500 text-sm mt-0.5">
                  Oferta: <span className="text-emerald-600 font-semibold">{recentTx.offer_title}</span>
                </p>
              )}
            </div>
            <button onClick={() => setRecentTx(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 bg-emerald-50 rounded-2xl p-5 border border-emerald-200 shadow-inner">
            <div className="flex justify-between text-sm mb-1.5 text-slate-600">
              <span className="font-medium">Original:</span>
              <span className="line-through">{formatARS(recentTx.original_amount)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3 text-slate-600">
              <span className="font-medium">Descuento:</span>
              <span className="text-emerald-600 font-bold">−{recentTx.discount_pct}%</span>
            </div>
            <div className="flex justify-between items-baseline pt-3 border-t border-emerald-200">
              <span className="text-slate-700 font-semibold">Cobrado:</span>
              <span className="text-3xl font-black text-emerald-600 tracking-tight">{formatARS(recentTx.final_amount)}</span>
            </div>
          </div>

          <button
            onClick={() => setRecentTx(null)}
            className="w-full mt-5 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/30"
          >
            Entendido
          </button>
        </div>
      )}

      {/* ── QR + ESTADO ─────────────────────────────────────── */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col items-center relative overflow-hidden">
        {activeCharge && (
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Logo animado si hay cobro */}
          <div className={`relative mb-5 transition-all duration-500 ${activeCharge ? 'float-anim' : ''}`}>
             <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-200 relative z-10">
               <Store className="h-8 w-8 text-blue-600" />
             </div>
             {activeCharge && (
               <div className="absolute -inset-2 bg-blue-400/20 blur-xl rounded-full z-0 animate-pulse" />
             )}
          </div>
          
          <h2 className="text-xl font-black text-slate-900 text-center tracking-tight">{businessName}</h2>
          
          {activeCharge && (
             <div className="flex items-center gap-1.5 mt-1 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest">Cobro Activo</p>
            </div>
          )}

          {activeCharge ? (
            <>
              {/* Badge: tiempo restante */}
              <div className="mt-2 mb-6 flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-5 py-2.5 rounded-full shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                <span className="text-blue-700 text-sm font-bold tracking-wide">
                  Vence en {formatTime(secondsLeft)}
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-xl border border-slate-200 transition-all transform hover:scale-105 duration-300">
                <QRCodeSVG value={qrUrl} size={220} level="H" includeMargin={false} />
              </div>

              {/* Resumen del cobro activo */}
              <div className="w-full mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-inner">
                {activeCharge.offer_title && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium"><Tag className="w-4 h-4" /> Oferta</span>
                    <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">{activeCharge.offer_title}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    {activeCharge.payment_method === 'cash' ? <Banknote className="w-4 h-4" /> : <ArrowLeftRight className="w-4 h-4" />}
                    Método
                  </span>
                  <span className="text-slate-900 font-bold">{activeCharge.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline mt-1">
                  <span className="text-slate-600 font-semibold">Monto Total</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">{formatARS(activeCharge.amount)}</span>
                </div>
              </div>

              {/* Formulario de Código Manual */}
              <form onSubmit={handleManualCodeSubmit} className="w-full mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                <label className="block text-xs font-semibold text-slate-500 mb-2">¿El cliente no puede escanear?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código de 6 dígitos"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                    disabled={manualCodeLoading}
                  />
                  <button
                    type="submit"
                    disabled={manualCodeLoading || manualCode.length < 6}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-sm"
                  >
                    {manualCodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cobrar'}
                  </button>
                </div>
                {manualCodeError && (
                  <p className="text-red-500 text-xs font-medium mt-2">{manualCodeError}</p>
                )}
              </form>

              <button
                onClick={handleCancelCharge}
                className="mt-6 flex items-center gap-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-full transition-colors font-bold"
              >
                <X className="w-4 h-4" />
                Cancelar este cobro
              </button>
            </>
          ) : (
            <>
              <p className="text-slate-500 text-sm mt-2 mb-6 text-center max-w-[250px] font-medium">
                Prepará el cobro abajo para activar el código QR.
              </p>
              <div className="bg-white p-5 rounded-3xl shadow-md border border-slate-200 opacity-50 grayscale-[50%] transition-all">
                <QRCodeSVG value={qrUrl} size={180} level="M" />
              </div>
              <div className="flex items-center gap-2 mt-5 text-slate-500 text-xs font-bold uppercase tracking-wider bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
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
          <h3 className="text-slate-900 font-bold text-xl flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 border border-blue-200">
              <QrCode className="w-5 h-5 text-blue-600" />
            </div>
            Preparar Cobro
          </h3>

          {/* Selector de oferta */}
          {offers.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-slate-700 font-bold flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-600" />
                Aplicar Oferta (opcional)
              </label>
              <div className="relative">
                <select
                  value={selectedOfferId}
                  onChange={(e) => handleOfferChange(e.target.value)}
                  className="w-full bg-white/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-3.5 text-slate-900 font-medium appearance-none cursor-pointer shadow-sm transition-all"
                >
                  <option value="" className="bg-white text-slate-700">Cobro general (sin oferta)</option>
                  {offers.map(o => (
                    <option key={o.id} value={o.id} className="bg-white text-slate-900 font-medium">
                      {o.title} (−{o.discount_pct}%)
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          )}

          {/* Monto */}
          <div className="space-y-2">
            <label className="text-sm text-slate-700 font-bold flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Monto a cobrar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <span className="text-slate-500 font-black text-xl">$</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                className="w-full bg-white/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-xl pl-12 pr-4 py-4 text-slate-900 text-2xl font-black tracking-tight placeholder-slate-400 shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <label className="text-sm text-slate-700 font-bold">Medio de pago del cliente</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 font-bold transition-all shadow-sm
                  ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-blue-500/10' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
              >
                <Banknote className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-blue-600' : ''}`} /> Efectivo
              </button>
              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 font-bold transition-all shadow-sm
                  ${paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-blue-500/10' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
              >
                <ArrowLeftRight className={`w-5 h-5 ${paymentMethod === 'transfer' ? 'text-blue-600' : ''}`} /> Transferencia
              </button>
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-semibold">{formError}</p>
            </div>
          )}

          <button
            onClick={handleLoadQR}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2 transition-all shadow-lg shadow-blue-500/30"
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
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => window.print()}
          className="py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition-all shadow-sm"
        >
          Imprimir QR estático
        </button>
        <button
          onClick={() => { navigator.clipboard.writeText(qrUrl); alert('¡Enlace de cobro copiado!'); }}
          className="py-3.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-sm font-bold transition-all shadow-sm"
        >
          Copiar enlace web
        </button>
      </div>
    </div>
  );
}
