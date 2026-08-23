'use client';

import { Download } from 'lucide-react';

export function InstallAppButton() {
  const handleTrigger = () => {
    const event = new CustomEvent('trigger-pwa-install');
    window.dispatchEvent(event);
  };

  const isStandalone = typeof window !== 'undefined' && 
    (('standalone' in window.navigator && (window.navigator as any).standalone) || 
     window.matchMedia('(display-mode: standalone)').matches);

  if (isStandalone) return null;

  return (
    <button
      onClick={handleTrigger}
      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform w-full justify-center shadow-lg"
    >
      <Download className="w-4 h-4" />
      Instalar App en el Teléfono
    </button>
  );
}
