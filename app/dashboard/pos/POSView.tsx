'use client';

import { useState, useEffect } from 'react';
import { createPendingCharge, cancelPendingCharge, completePendingChargeWithCode } from '@/app/actions/pending-charges';
import { employeeCreatePendingCharge, employeeCancelPendingCharge, employeeCompletePendingChargeWithCode } from '@/app/actions/employee';

import { POSSuccessAlert } from './components/POSSuccessAlert';
import { POSForm } from './components/POSForm';
import { POSActiveCharge } from './components/POSActiveCharge';
import { usePosRealtime } from './hooks/usePosRealtime';
import type { Offer, PendingCharge, RecentTx } from './types';

export function POSView({
  merchantId,
  branchId,
  businessName,
  offers,
  employeeId,
}: {
  merchantId: string;
  branchId: string | null;
  businessName: string;
  offers: Offer[];
  employeeId?: string;
}) {
  const [qrUrl, setQrUrl] = useState('');
  useEffect(() => {
    let url = `${window.location.origin}/pay?m=${merchantId}`;
    if (branchId) {
      url += `&b=${branchId}`;
    }
    setQrUrl(url);
  }, [merchantId, branchId]);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [activeCharge, setActiveCharge] = useState<PendingCharge | null>(null);
  const [recentTx, setRecentTx] = useState<RecentTx | null>(null);
  
  const [manualCodeLoading, setManualCodeLoading] = useState(false);
  const [manualCodeError, setManualCodeError] = useState('');

  // Auto-hide success alert
  useEffect(() => {
    if (recentTx) {
      const timer = setTimeout(() => setRecentTx(null), 25000);
      return () => clearTimeout(timer);
    }
  }, [recentTx]);

  // Hook handles websocket
  usePosRealtime(merchantId, (tx) => {
    setActiveCharge(null);
    setRecentTx(tx);
  });

  const handleLoadQR = async (data: { offerId: string; amount: string; paymentMethod: string }) => {
    setFormError('');
    if (!data.amount || parseFloat(data.amount) <= 0) {
      setFormError('Ingresá el monto de la compra.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (data.offerId) {
      const offer = offers.find(o => o.id === data.offerId);
      formData.set('offer_id', data.offerId);
      formData.set('offer_title', offer?.title || '');
    }
    formData.set('amount', data.amount);
    formData.set('payment_method', data.paymentMethod);
    if (branchId) {
      formData.set('branch_id', branchId);
    }

    const res = employeeId 
      ? await employeeCreatePendingCharge(employeeId, formData)
      : await createPendingCharge(formData);
      
    setLoading(false);

    if (!res.success) {
      setFormError(res.error || 'Error al cargar el cobro.');
      return;
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    setActiveCharge({
      id: res.chargeId!,
      offer_title: data.offerId ? offers.find(o => o.id === data.offerId)?.title || null : null,
      amount: parseFloat(data.amount),
      payment_method: data.paymentMethod,
      expires_at: expiresAt,
    });
  };

  const handleCancelCharge = async () => {
    if (!activeCharge) return;
    if (employeeId) {
      await employeeCancelPendingCharge(employeeId, activeCharge.id);
    } else {
      await cancelPendingCharge(activeCharge.id);
    }
    setActiveCharge(null);
  };

  const handleManualCodeSubmit = async (code: string) => {
    setManualCodeError('');
    if (!activeCharge) return;

    setManualCodeLoading(true);
    const res = employeeId 
      ? await employeeCompletePendingChargeWithCode(employeeId, activeCharge.id, code) 
      : await completePendingChargeWithCode(activeCharge.id, code);
      
    setManualCodeLoading(false);

    if (!res.success) {
      setManualCodeError(res.error || 'Código inválido o error al cobrar.');
      return;
    }
    // Si es exitoso, el websocket capturará el evento y mostrará la pantalla de éxito.
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {recentTx && (
        <POSSuccessAlert 
          recentTx={recentTx} 
          onClose={() => setRecentTx(null)} 
        />
      )}

      {!activeCharge && (
        <POSForm 
          offers={offers}
          loading={loading}
          formError={formError}
          onSubmit={handleLoadQR}
        />
      )}

      <POSActiveCharge 
        activeCharge={activeCharge}
        qrUrl={qrUrl}
        businessName={businessName}
        offers={offers}
        onCancel={handleCancelCharge}
        onManualCodeSubmit={handleManualCodeSubmit}
        manualCodeLoading={manualCodeLoading}
        manualCodeError={manualCodeError}
      />

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => { navigator.clipboard.writeText(qrUrl); alert('¡Enlace de cobro copiado!'); }}
          className="py-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-300 text-sm font-semibold transition-all"
        >
          Copiar enlace web
        </button>
      </div>
    </div>
  );
}
