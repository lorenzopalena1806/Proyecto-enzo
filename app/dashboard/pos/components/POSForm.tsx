import { QrCode, Tag, DollarSign, Banknote, ArrowLeftRight, X, Loader2 } from 'lucide-react';
import type { Offer } from '../types';
import { useState } from 'react';

export function POSForm({
  offers,
  loading,
  formError,
  onSubmit
}: {
  offers: Offer[];
  loading: boolean;
  formError: string;
  onSubmit: (data: { offerId: string; amount: string; paymentMethod: string }) => void;
}) {
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');

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

  const handleSubmit = () => {
    onSubmit({ offerId: selectedOfferId, amount, paymentMethod });
  };

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

  return (
    <div className="glass-panel rounded-3xl p-7 space-y-6">
      <h3 className="text-white font-bold text-xl flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <QrCode className="w-5 h-5 text-blue-400" />
        </div>
        Preparar Cobro
      </h3>

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
        onClick={handleSubmit}
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
  );
}
