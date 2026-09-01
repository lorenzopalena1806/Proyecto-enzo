'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Lazoo App Error (Browser):', error);
    
    // Enviar al servidor mediante API Route
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      })
    }).catch(() => {}); // Ignorar errores de red en el reporte
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center space-y-6">
        <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">¡Ups! Algo salió mal.</h2>
          <p className="text-slate-400 text-sm">
            Tuvimos un problema inesperado de conexión o procesamiento. Nuestro equipo técnico ya fue notificado.
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-violet-600/20"
        >
          <RefreshCw className="h-5 w-5" />
          Volver a intentar
        </button>
      </div>
    </div>
  );
}
