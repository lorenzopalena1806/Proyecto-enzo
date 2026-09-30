import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Store, Sparkles, Clock, Tag, Banknote, ArrowLeftRight, X, Loader2 } from 'lucide-react';
import { formatARS } from '@/lib/discount-logic';
import type { PendingCharge, Offer } from '../types';

export function POSActiveCharge({
  activeCharge,
  qrUrl,
  businessName,
  offers,
  onCancel,
  onManualCodeSubmit,
  manualCodeLoading,
  manualCodeError
}: {
  activeCharge: PendingCharge | null;
  qrUrl: string;
  businessName: string;
  offers: Offer[];
  onCancel: () => void;
  onManualCodeSubmit: (code: string) => void;
  manualCodeLoading: boolean;
  manualCodeError: string;
}) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [manualCode, setManualCode] = useState('');

  // Countdown timer
  useEffect(() => {
    if (!activeCharge) return;
    const expiresAt = new Date(activeCharge.expires_at).getTime();

    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        onCancel(); // Auto-cancel when time is up
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeCharge, onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onManualCodeSubmit(manualCode);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="glass-card-blue rounded-3xl p-6 flex flex-col items-center relative overflow-hidden">
      {activeCharge && (
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col items-center w-full">
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

            <form onSubmit={handleSubmit} className="w-full mt-4 bg-slate-900/80 border border-slate-700 rounded-2xl p-4 shadow-lg">
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
              onClick={onCancel}
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
  );
}
