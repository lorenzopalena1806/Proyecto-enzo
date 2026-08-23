'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('lazo_cookies_accepted');
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('lazo_cookies_accepted', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-fade-in-up">
      <div className="bg-[#0b1329]/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-white text-sm font-bold">Uso de cookies y privacidad</p>
            <p className="text-slate-400 text-xs leading-normal">
              Usamos cookies esenciales para mantener tu sesión activa y permitir el correcto funcionamiento de la app. Si continuás navegando, asumimos que estás de acuerdo.
            </p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex justify-end gap-3 mt-1">
          <button 
            onClick={handleAccept}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-900/20"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
