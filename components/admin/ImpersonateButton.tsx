'use client';

import { useState } from 'react';
import { LogIn, Loader2 } from 'lucide-react';

export function ImpersonateButton({ merchantId, merchantName }: { merchantId: string; merchantName: string }) {
  const [loading, setLoading] = useState(false);

  const handleImpersonate = async () => {
    if (!confirm(`¿Querés entrar como "${merchantName}"? Se va a cerrar tu sesión de admin temporalmente.`)) return;

    setLoading(true);

    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId }),
      });

      const data = await res.json();

      if (!res.ok || !data.link) {
        alert('Error: ' + (data.error || 'No se pudo generar el acceso'));
        setLoading(false);
        return;
      }

      // Guardamos que somos admin para mostrar el banner al volver
      localStorage.setItem('admin_return', 'true');
      window.location.href = data.link;

    } catch (err) {
      alert('Error de conexión. Intentá de nuevo.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleImpersonate}
      disabled={loading}
      title={`Entrar como ${merchantName}`}
      className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-cyan-900/30 hover:text-cyan-400 transition-all border border-transparent hover:border-cyan-800/50 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
    </button>
  );
}
