'use client';

import React, { useState } from 'react';
import { Loader2, Shield, Zap, Ban, ChevronDown } from 'lucide-react';
import { setMerchantPlanServer } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export function MerchantStatusDropdown({ merchantId, currentPlan, isActive }: { merchantId: string, currentPlan: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSelect = async (planAction: 'inactive' | 'basic' | 'pro') => {
    setOpen(false);
    if (!confirm(`¿Seguro que querés cambiar el estado a ${planAction.toUpperCase()}?`)) return;
    
    setLoading(true);
    const res = await setMerchantPlanServer(merchantId, planAction);
    setLoading(false);

    if (!res.success) {
      alert(res.error || 'Error al actualizar el estado');
    } else {
      router.refresh();
    }
  };

  // Determinar apariencia actual
  let currentStyle = 'bg-slate-800 text-slate-300 border-slate-700';
  let currentLabel = 'Inactivo';
  let CurrentIcon = Ban;

  if (isActive) {
    if (currentPlan === 'pro') {
      currentStyle = 'bg-amber-950/40 text-amber-400 border-amber-900/50';
      currentLabel = 'Plan PRO';
      CurrentIcon = Shield;
    } else {
      currentStyle = 'bg-blue-950/40 text-blue-400 border-blue-900/50';
      currentLabel = 'Plan Base';
      CurrentIcon = Zap;
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors hover:brightness-110 disabled:opacity-50 ${currentStyle}`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CurrentIcon className="w-4 h-4" />}
        {currentLabel}
        <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
          <button 
            onClick={() => handleSelect('basic')}
            className="w-full text-left px-4 py-3 text-sm text-blue-400 hover:bg-slate-800 flex items-center gap-2 transition-colors border-b border-slate-800/50"
          >
            <Zap className="w-4 h-4" /> Activar Plan Base
          </button>
          <button 
            onClick={() => handleSelect('pro')}
            className="w-full text-left px-4 py-3 text-sm text-amber-400 hover:bg-slate-800 flex items-center gap-2 transition-colors border-b border-slate-800/50"
          >
            <Shield className="w-4 h-4" /> Activar Plan PRO
          </button>
          <button 
            onClick={() => handleSelect('inactive')}
            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2 transition-colors"
          >
            <Ban className="w-4 h-4" /> Suspender Comercio
          </button>
        </div>
      )}
      
      {/* Overlay para cerrar el menú si se hace click afuera */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
      )}
    </div>
  );
}
