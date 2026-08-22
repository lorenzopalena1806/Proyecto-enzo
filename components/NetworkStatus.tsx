'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    // Definimos el estado inicial
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      // Ocultar el mensaje de "Conexión restaurada" después de 3 segundos
      setTimeout(() => setShowRestored(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none mt-2">
      <div 
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg shadow-black/50 backdrop-blur-md border font-medium text-sm transition-all duration-300 transform translate-y-0 opacity-100 ${
          !isOnline 
            ? 'bg-red-950/90 border-red-800 text-red-200' 
            : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
        }`}
      >
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4 animate-pulse" />
            Sin conexión a Internet. Esperando red...
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4" />
            Conexión restaurada
          </>
        )}
      </div>
    </div>
  );
}
