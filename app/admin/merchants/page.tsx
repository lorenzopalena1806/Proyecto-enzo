'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import type { Profile } from '@/types';
import { Store, Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { getMerchantsListServer, toggleMerchantSubscriptionServer, deleteMerchantServer } from '@/app/actions/admin';

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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Comercios</h1>
        <p className="text-slate-500 mt-1 font-medium">Gestioná las suscripciones de los comercios</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Comercio</th>
                <th className="px-6 py-4">Titular</th>
                <th className="px-6 py-4">Estado Suscripción</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {merchants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No hay comercios registrados.
                  </td>
                </tr>
              ) : (
                merchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-200">
                        <Store className="h-4 w-4 text-blue-600" />
                      </div>
                      {merchant.business_name || 'Sin nombre'}
                    </td>
                    <td className="px-6 py-4 font-medium">{merchant.full_name}</td>
                    <td className="px-6 py-4">
                      {merchant.subscriptionStatus === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
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
                          className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-bold transition-all border shadow-sm ${
                            merchant.subscriptionStatus === 'active'
                              ? 'bg-white border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                              : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
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
                          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 transition-all border border-transparent hover:border-red-200"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
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
