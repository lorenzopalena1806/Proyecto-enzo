'use client';

import React, { useState } from 'react';
import { Ban, CheckCircle, Loader2 } from 'lucide-react';
import { toggleUserActiveStatusServer } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export function SuspendUserButton({ userId, isActive, role }: { userId: string, isActive: boolean, role: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // No permitir suspenderse a sí mismo o a otros superadmins fácilmente desde esta UI para evitar bloqueos accidentales
  if (role === 'superadmin') return null;

  const handleToggle = async () => {
    const action = isActive ? 'suspender' : 'reactivar';
    if (!confirm(`¿Seguro que querés ${action} este usuario?`)) return;
    
    setLoading(true);
    const res = await toggleUserActiveStatusServer(userId, !isActive);
    setLoading(false);

    if (!res.success) {
      alert(res.error || `Error al ${action} el usuario`);
    } else {
      router.refresh();
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
        isActive 
          ? 'bg-red-950/30 text-red-400 border-red-900/50 hover:bg-red-900/50 hover:border-red-800' 
          : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/50 hover:border-emerald-800'
      }`}
      title={isActive ? 'Suspender usuario' : 'Reactivar usuario'}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : (isActive ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />)}
      {isActive ? 'Suspender' : 'Reactivar'}
    </button>
  );
}
