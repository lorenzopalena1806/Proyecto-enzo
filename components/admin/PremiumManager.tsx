'use client';

import React, { useState } from 'react';
import { Crown, Loader2, CheckCircle2 } from 'lucide-react';
import { updateProfileServer } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export function PremiumManager({ userId, isPremium }: { userId: string, isPremium: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const togglePremium = async () => {
    setLoading(true);
    await updateProfileServer(userId, { is_premium: !isPremium });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-amber-400" />
        Suscripción PRO B2B
      </h2>
      
      <p className="text-sm text-slate-400 mb-4">
        Estado actual: <strong className={isPremium ? 'text-amber-400' : 'text-slate-500'}>{isPremium ? 'Activo (Lazoo PRO)' : 'Inactivo (Plan Básico)'}</strong>
      </p>

      <button
        onClick={togglePremium}
        disabled={loading}
        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 ${
          isPremium 
            ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
            : 'bg-amber-600 hover:bg-amber-700 text-white'
        }`}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPremium ? 'Revocar Acceso PRO' : 'Habilitar Acceso PRO'}
      </button>
    </div>
  );
}
