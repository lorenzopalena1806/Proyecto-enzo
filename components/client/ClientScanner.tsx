'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { Scan, AlertTriangle } from 'lucide-react';

export function ClientScanner() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Inicializar el escáner solo una vez
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          // Si el texto decodificado contiene '/pay?m=', redirigimos al cliente
          if (decodedText.includes('/pay?m=')) {
            // Extraer solo la parte de la ruta relativa para evitar salir de la app si es otro dominio
            try {
              const url = new URL(decodedText);
              scanner.clear();
              router.push(url.pathname + url.search);
            } catch (e) {
              // Si falla el parseo de URL, intentamos usar el texto crudo si es relativo
              if (decodedText.startsWith('/pay')) {
                scanner.clear();
                router.push(decodedText);
              } else {
                setError('El código QR no pertenece a RedBeneficios.');
              }
            }
          } else {
            setError('Código QR no válido o de otra aplicación.');
          }
        },
        (errorMessage) => {
          // Ignorar errores de "no se detectó QR"
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [router]);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden">
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
