'use client';

import React, { useState } from 'react';
import { Package, Loader2, CheckCircle2 } from 'lucide-react';
import { updateProfileServer } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export function MaterialRequestButton({ merchantId, status }: { merchantId: string, status: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequest = async () => {
    setLoading(true);
    await updateProfileServer(merchantId, { material_status: 'requested' });
    setLoading(false);
    router.refresh();
  };

  if (status === 'delivered') {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-4 flex items-center justify-center gap-2 font-medium w-full">
        <CheckCircle2 className="w-5 h-5" />
        Material Entregado
      </div>
    );
  }

  if (status === 'requested') {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl p-4 flex items-center justify-center gap-2 font-medium w-full text-center">
        <Package className="w-5 h-5" />
        Solicitud en proceso...<br/>Te contactaremos pronto.
      </div>
    );
  }

  return (
    <button
      onClick={handleRequest}
      disabled={loading}
      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-amber-500/20"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <Package className="w-5 h-5" />
          Solicitar Cartel (Consultar Precio)
        </>
      )}
    </button>
  );
}
