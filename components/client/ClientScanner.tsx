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
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden relative">
        {isStarting && !error && (
          <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-sm font-bold animate-pulse">Iniciando cámara...</p>
          </div>
        )}
        <div id="reader" className="w-full rounded-2xl overflow-hidden [&>div]:!border-none [&_video]:rounded-2xl"></div>
        
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-blue-600 font-bold">
            <Scan className="w-5 h-5" />
            <span>Apuntá al QR del local</span>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Alineá el código en el centro del recuadro para leerlo automáticamente.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex gap-2 items-start font-bold shadow-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
