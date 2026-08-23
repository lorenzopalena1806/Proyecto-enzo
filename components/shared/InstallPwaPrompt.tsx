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
    if (typeof window === 'undefined') return;

    // Detect standalone mode first
    const mqStandAlone = '(display-mode: standalone)';
    if ((window.navigator as any).standalone || window.matchMedia(mqStandAlone).matches) {
      setIsStandalone(true);
      return; // If standalone, we don't need to do anything else
    }
    setIsStandalone(false);

    // Detect iOS and URL override
    const ua = window.navigator.userAgent.toLowerCase();
    const isForceIos = window.location.search.includes('forceIos=true');
    const isIosDevice = /iphone|ipad|ipod/.test(ua) || isForceIos;
    setIsIOS(isIosDevice);
    
    let shouldShow = false;
    if (isIosDevice) {
      shouldShow = true; // iOS Safari always 'installable' via share menu
    }

    // Check if dismissed
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissed) {
      const dismissDate = new Date(parseInt(dismissed, 10));
      const now = new Date();
      if (now.getTime() - dismissDate.getTime() < 3 * 24 * 60 * 60 * 1000) {
        shouldShow = false; // Too soon to show again
      } else {
        localStorage.removeItem('pwa_prompt_dismissed');
      }
    }

    // Override if forced
    if (isForceIos) {
      shouldShow = true;
    }

    setIsInstallable(shouldShow);
    setIsDismissed(!shouldShow);

    // Chrome/Android prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) {
        setIsInstallable(true);
        setIsDismissed(false);
      }
    };

    const handleCustomTrigger = () => {
      setIsDismissed(false);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('trigger-pwa-install', handleCustomTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('trigger-pwa-install', handleCustomTrigger);
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
          className="absolute top-3 right-3 p-1.5 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[100] shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 pr-6 relative z-10">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Descargá la app y empezá en Lazoo</h3>
            <p className="text-slate-400 text-xs mt-0.5">Agregá la app a tu inicio para una experiencia más rápida y completa.</p>
          </div>
        </div>

        {isIOS ? (
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 relative z-10 mt-2">
            <div className="flex flex-col items-center gap-2">
              <p className="text-center font-medium text-white mb-1">
                Para instalar la app en tu iPhone:
              </p>
              <div className="flex items-center gap-3 bg-white/10 px-3 py-2 rounded-lg border border-white/5 w-full shadow-inner">
                <div className="bg-blue-500 rounded p-1.5 shadow-sm">
                  <Share className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs leading-tight">1. Tocá <strong>Compartir</strong> en la barra de Safari abajo.</p>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-3 py-2 rounded-lg border border-white/5 w-full shadow-inner">
                <div className="bg-slate-600 rounded p-1.5 shadow-sm">
                  <PlusSquare className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs leading-tight">2. Deslizá hacia abajo y elegí <strong>Agregar a Inicio</strong>.</p>
              </div>
            </div>
            {/* Flecha animada apuntando hacia abajo al centro de la pantalla */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white animate-bounce drop-shadow-lg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-md"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
            </div>
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
