'use client';

import { useState } from 'react';
import { updatePricing } from '@/app/actions/settings';
import { Loader2, Save } from 'lucide-react';

export function PricingForm({ currentBasic, currentPro }: { currentBasic: number, currentPro: number }) {
  const [basic, setBasic] = useState(currentBasic.toString());
  const [pro, setPro] = useState(currentPro.toString());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    
    const basicNum = parseInt(basic) || 0;
    const proNum = parseInt(pro) || 0;

    const res = await updatePricing(basicNum, proNum);
    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl max-w-lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Precio Plan Básico ($ ARS)</label>
          <input
            type="number"
            value={basic}
            onChange={(e) => setBasic(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Precio Plan PRO ($ ARS)</label>
          <input
            type="number"
            value={pro}
            onChange={(e) => setPro(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500"
          />
        </div>
        
        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {success ? '¡Guardado!' : 'Guardar Precios'}
        </button>
      </div>
    </div>
  );
}
