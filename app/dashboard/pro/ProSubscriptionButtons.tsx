'use client';

import { useState } from 'react';
import { createSubscription } from '@/app/actions/mp';
import { Loader2 } from 'lucide-react';

export function ProSubscriptionButtons({ type }: { type: 'basic' | 'pro' }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    const res = await createSubscription(type);
    setLoading(false);

    if (res.error) {
      alert(res.error);
      return;
    }

    if (res.init_point) {
      window.location.href = res.init_point;
    }
  };

  if (type === 'basic') {
    return (
      <button 
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full py-4 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Suscribirse al Plan Básico'}
      </button>
    );
  }

  return (
    <button 
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full py-4 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Suscribirse al Plan PRO'}
    </button>
  );
}
