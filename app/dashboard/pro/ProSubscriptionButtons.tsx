'use client';

import { useState } from 'react';
import { createSubscription } from '@/app/actions/mp';
import { Loader2 } from 'lucide-react';

export function ProSubscriptionButtons() {
  const [loading, setLoading] = useState<'basic' | 'pro' | null>(null);

  const handleSubscribe = async (plan: 'basic' | 'pro') => {
    setLoading(plan);
    const res = await createSubscription(plan);
    setLoading(null);

    if (res.error) {
      alert(res.error);
      return;
    }

    if (res.init_point) {
      window.location.href = res.init_point;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <button 
        onClick={() => handleSubscribe('basic')}
        disabled={loading !== null}
        className="w-full py-4 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 flex flex-col items-center justify-center gap-1 disabled:opacity-50"
      >
        {loading === 'basic' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <>
            <span>Suscripción Mensual</span>
            <span className="text-sm text-slate-400 font-normal">$55.000 / mes</span>
          </>
        )}
      </button>

      <button 
        onClick={() => handleSubscribe('pro')}
        disabled={loading !== null}
        className="w-full py-4 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/25 flex flex-col items-center justify-center gap-1 disabled:opacity-50"
      >
        {loading === 'pro' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <>
            <span>Suscripción PRO</span>
            <span className="text-sm font-normal text-slate-900/80">$80.000 / mes</span>
          </>
        )}
      </button>
    </div>
  );
}
