'use client';

import React, { useState } from 'react';
import { Package, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateProfileServer } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export function MaterialManager({ userId, currentStatus }: { userId: string, currentStatus?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const statusLabels: Record<string, string> = {
    'none': 'Sin QR Físico',
    'requested': 'QR Solicitado',
    'delivered': 'QR Entregado'
  };
  
  const activeStatus = currentStatus || 'none';

  const setStatus = async (newStatus: string) => {
    setLoading(true);
    await updateProfileServer(userId, { material_status: newStatus });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-amber-400" />
        Gestor de Material Físico (Onboarding)
      </h2>
      
      <p className="text-sm text-slate-400 mb-4">
        Estado actual: <strong className="text-white">{statusLabels[activeStatus]}</strong>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setStatus('none')}
          disabled={loading || activeStatus === 'none'}
          className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
        >
          Marcar Sin QR
        </button>
        <button
          onClick={() => setStatus('requested')}
          disabled={loading || activeStatus === 'requested'}
          className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
        >
          Marcar Solicitado
        </button>
        <button
          onClick={() => setStatus('delivered')}
          disabled={loading || activeStatus === 'delivered'}
          className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
        >
          Marcar Entregado
        </button>
      </div>
    </div>
  );
}
