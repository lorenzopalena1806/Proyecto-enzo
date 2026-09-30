import { BellRing, X } from 'lucide-react';
import { UndoChargeButton } from '@/components/dashboard/UndoChargeButton';
import { formatARS } from '@/lib/discount-logic';
import type { RecentTx } from '../types';

export function POSSuccessAlert({
  recentTx,
  onClose
}: {
  recentTx: RecentTx;
  onClose: () => void;
}) {
  return (
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
        <button onClick={onClose} className="text-emerald-500 hover:text-white transition-colors bg-emerald-900/50 hover:bg-emerald-800/50 p-2 rounded-full">
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
          onClick={onClose}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        >
          Entendido
        </button>
        {recentTx.id && (
          <div className="flex justify-center">
            <UndoChargeButton transactionId={recentTx.id} onUndoSuccess={onClose} />
          </div>
        )}
      </div>
    </div>
  );
}
