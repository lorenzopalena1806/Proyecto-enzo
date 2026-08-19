'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, ArrowLeftRight, DollarSign } from 'lucide-react';

export function ClientInputAmountForm({ merchantId, merchantName }: { merchantId: string, merchantName: string }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'transfer'>('cash');
  const router = useRouter();

  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    router.push(`/pay?m=${merchantId}&a=${amount}&method=${method}`);
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-xl mb-6 space-y-6 animate-fade-in">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          <DollarSign className="inline h-4 w-4 mr-1 text-violet-400" />
          Monto total de la compra (Sin descuento)
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
            className="w-full pl-8 pr-4 py-4 rounded-xl bg-slate-950 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-xl font-bold"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          ¿Cómo vas a pagar?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMethod('cash')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200
              ${method === 'cash' ? 'border-violet-500 bg-violet-950/60 text-violet-300' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
          >
            <Banknote className="h-4 w-4" />
            Efectivo
          </button>
          <button
            onClick={() => setMethod('transfer')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200
              ${method === 'transfer' ? 'border-violet-500 bg-violet-950/60 text-violet-300' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Transferencia
          </button>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!amount || parseFloat(amount) <= 0}
        className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-900/50"
      >
        Continuar para ver descuento
      </button>
    </div>
  );
}
