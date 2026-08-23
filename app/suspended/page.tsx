import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { LogoutButton } from '@/components/dashboard/LogoutButton';

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at top, #0f1f4a 0%, #060d1f 50%, #000510 100%)' }}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>

        <div className="h-16 w-16 bg-red-950/50 border border-red-800/40 rounded-full flex items-center justify-center mb-5">
          <ShieldAlert className="h-8 w-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Acceso Bloqueado</h1>

        <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs font-semibold uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          <span>Infringe la Norma N° 5 de la plataforma</span>
        </div>

        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Tu cuenta de comercio fue suspendida por incumplimiento de los términos de uso (Norma N° 5: faltas a las condiciones de servicio o conducta irregular).
        </p>

        <a
          href="https://wa.me/5493512388658"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all mb-6 flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-950/50"
        >
          💬 Apelar o Contactar a Soporte
        </a>

        <div className="w-full pt-4 border-t border-slate-800 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

