'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import type { Profile } from '@/types';
import { Store, Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { getMerchantsListServer, toggleMerchantSubscriptionServer, deleteMerchantServer } from '@/app/actions/admin';
import { ImpersonateButton } from '@/components/admin/ImpersonateButton';

interface MerchantWithSubscription extends Profile {
  subscriptionStatus: 'active' | 'inactive' | 'none';
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<MerchantWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    setLoading(true);
    const data = await getMerchantsListServer();
    setMerchants(data as MerchantWithSubscription[]);
    setLoading(false);
  };

  const toggleSubscription = async (merchantId: string, currentStatus: string) => {
    setProcessingId(merchantId);
    
    const result = await toggleMerchantSubscriptionServer(merchantId, currentStatus);
    if (!result.success) {
      alert('Error al actualizar la suscripción. Verifica los logs del servidor.');
    }

    await fetchMerchants();
    setProcessingId(null);
  };

  const handleDelete = async (merchantId: string) => {
    if (!window.confirm('¿Seguro que querés eliminar este comercio por completo? Esta acción NO se puede deshacer y borrará toda su información.')) {
      return;
    }
    
    setProcessingId(merchantId);
    const result = await deleteMerchantServer(merchantId);
    if (!result.success) {
      alert('Error al eliminar: ' + result.error);
    }
    
    await fetchMerchants();
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Comercios</h1>
        <p className="text-slate-400 mt-1">Gestioná las suscripciones de los comercios</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Comercio</th>
                <th className="px-6 py-4">Titular</th>
                <th className="px-6 py-4">Estado Suscripción</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {merchants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No hay comercios registrados.
                  </td>
                </tr>
              ) : (
                merchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-900/50 flex items-center justify-center border border-violet-800">
                        <Store className="h-4 w-4 text-violet-400" />
                      </div>
                      {merchant.business_name || 'Sin nombre'}
                    </td>
                    <td className="px-6 py-4">{merchant.full_name}</td>
                    <td className="px-6 py-4">
                      {merchant.subscriptionStatus === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 border border-red-500/20">
                          <XCircle className="h-3.5 w-3.5" />
                          {merchant.subscriptionStatus === 'none' ? 'Sin iniciar' : 'Inactiva'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleSubscription(merchant.id, merchant.subscriptionStatus)}
                          disabled={processingId === merchant.id}
                          className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                            merchant.subscriptionStatus === 'active'
                              ? 'bg-slate-800 text-slate-300 hover:bg-red-900/50 hover:text-red-400 hover:border-red-800 border border-transparent'
                              : 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-900/20'
                          }`}
                        >
                          {processingId === merchant.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : merchant.subscriptionStatus === 'active' ? (
                            'Pausar'
                          ) : (
                            'Activar'
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDelete(merchant.id)}
                          disabled={processingId === merchant.id}
                          title="Eliminar Comercio"
                          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all border border-transparent hover:border-red-800/50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

                        <ImpersonateButton merchantId={merchant.id} merchantName={merchant.business_name || 'Comercio'} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
