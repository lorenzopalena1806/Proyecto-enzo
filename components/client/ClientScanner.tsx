'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { Scan, AlertTriangle, Loader2 } from 'lucide-react';

export function ClientScanner() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isStarting, setIsStarting] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isMounted = true;
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        if (decodedText.includes('/pay?m=')) {
          try {
            const url = new URL(decodedText);
            scanner.stop().then(() => {
              if (isMounted) router.push(url.pathname + url.search);
            });
          } catch (e) {
            if (decodedText.startsWith('/pay')) {
              scanner.stop().then(() => {
                if (isMounted) router.push(decodedText);
              });
            } else {
              setError('El código QR no pertenece a Lazoo.');
            }
          }
        } else {
          setError('Código QR no válido o de otra aplicación.');
        }
      },
      (errorMessage) => {
        // Ignore normal scan errors
      }
    ).then(() => {
      if (isMounted) setIsStarting(false);
    }).catch((err) => {
      if (isMounted) {
        setIsStarting(false);
        setError('No se pudo acceder a la cámara. Por favor, dale permisos al navegador.');
        console.error(err);
      }
    });

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [router]);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
        {isStarting && !error && (
          <div className="absolute inset-0 z-10 bg-slate-900 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-slate-400 text-sm font-medium animate-pulse">Iniciando cámara...</p>
          </div>
        )}
        <div id="reader" className="w-full rounded-2xl overflow-hidden [&>div]:!border-none [&_video]:rounded-2xl"></div>
        
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-violet-400 font-semibold">
            <Scan className="w-5 h-5" />
            <span>Apuntá al QR del local</span>
          </div>
          <p className="text-sm text-slate-400">
            Alineá el código en el centro del recuadro para leerlo automáticamente.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-sm flex gap-2 items-start">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
