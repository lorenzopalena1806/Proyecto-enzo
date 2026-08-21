'use client';

import React, { useState } from 'react';
import { Undo2, Loader2 } from 'lucide-react';
import { undoChargeServer } from '@/app/actions/charge';
import { useRouter } from 'next/navigation';

interface Props {
  transactionId: string;
  isRecent?: boolean;
  isCancelled?: boolean;
  onUndoSuccess?: () => void;
}

export function UndoChargeButton({ transactionId, isRecent = true, isCancelled = false, onUndoSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (isCancelled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 rounded-lg">
        Cancelado
      </span>
    );
  }

  if (!isRecent) return null;

  const handleUndo = async () => {
    if (!confirm('¿Seguro que querés deshacer este cobro? Esta acción revertirá el descuento y el stock (si corresponde).')) return;
    
    setLoading(true);
    const res = await undoChargeServer(transactionId);
    setLoading(false); // Siempre quitamos el loading
    
    if (!res.success) {
      alert(res.reason || 'Error al deshacer el cobro');
    } else {
      if (onUndoSuccess) {
        onUndoSuccess();
      } else {
        router.refresh();
      }
    }
  };

  return (
    <button 
      onClick={handleUndo}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-950/50 text-red-400 border border-red-900/50 hover:bg-red-900/50 hover:border-red-800 rounded-lg transition-colors"
      title="Deshacer cobro"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Undo2 className="w-3 h-3" />}
      Deshacer
    </button>
  );
}
