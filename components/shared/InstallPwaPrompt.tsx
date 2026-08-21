'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Share, PlusSquare } from 'lucide-react';

export function InstallPwaPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // Default true para evitar parpadeo
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Check if dismissed
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissed) {
      const dismissDate = new Date(parseInt(dismissed, 10));
      const now = new Date();
      // Si la cerró hace menos de 3 días, no la volvemos a mostrar
      if (now.getTime() - dismissDate.getTime() < 3 * 24 * 60 * 60 * 1000) {
        return; 
      } else {
        localStorage.removeItem('pwa_prompt_dismissed'); 
        setIsDismissed(false);
      }
    } else {
      setIsDismissed(false);
    }

    // Check if already installed (standalone mode)
    const mqStandAlone = '(display-mode: standalone)';
    if ((window.navigator as any).standalone || window.matchMedia(mqStandAlone).matches) {
      setIsStandalone(true);
      return; // Ya está instalada
    }
    setIsStandalone(false);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);
    if (isIosDevice) {
      setIsInstallable(true); // iOS Safari siempre puede instalar (manualmente)
    }

    // Android/Chrome install prompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // Prevent default browser mini-infobar
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstallable(false);
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // El prompt solo se puede usar una vez, así que lo borramos
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (isStandalone || isDismissed || !isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full"></div>
        
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 pr-6 relative z-10">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Instalá Lazoo</h3>
            <p className="text-slate-400 text-xs mt-0.5">Agregá la app a tu inicio para una experiencia más rápida y completa.</p>
          </div>
        </div>

        {isIOS && !deferredPrompt ? (
          <div className="bg-blue-950/40 border border-blue-900/50 rounded-xl p-3 text-xs text-blue-200 relative z-10 mt-1">
            <p className="flex items-center gap-1.5 justify-center text-center">
              Tocá el botón <Share className="w-4 h-4 text-blue-400 flex-shrink-0" /> en el menú y elegí
            </p>
            <p className="flex items-center gap-1 justify-center text-center font-bold text-white mt-1.5">
              <PlusSquare className="w-3.5 h-3.5 text-slate-300" /> Agregar a Inicio
            </p>
          </div>
        ) : (
          <button 
            onClick={handleInstallClick}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-lg relative z-10 mt-1"
          >
            Instalar App Ahora
          </button>
        )}
      </div>
    </div>
  );
}
