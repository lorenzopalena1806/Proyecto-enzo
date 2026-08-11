'use client';

import React, { useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, QrCode, Loader2, AlertCircle } from 'lucide-react';

interface QRDisplayProps {
  qrValue: string;         // El string codificado que va dentro del QR
  userName: string;
  businessName?: string | null;
  size?: number;
}

export function QRDisplay({
  qrValue,
  userName,
  businessName,
  size = 240,
}: QRDisplayProps) {
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // ── Descargar el QR como imagen PNG ──────────────────────
  const handleDownload = useCallback(() => {
    const svgElement = qrContainerRef.current?.querySelector('svg');
    if (!svgElement) return;

    // Serializar SVG a canvas para exportar como PNG
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const padding = 40;
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fondo blanco para el PNG descargado
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, padding, padding, size, size);
      const link = document.createElement('a');
      link.download = `mi-qr-${(businessName ?? userName).replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  }, [size, businessName, userName]);

  // ── Compartir via Web Share API (mobile) ─────────────────
  const handleShare = useCallback(async () => {
    if (!navigator.share) {
      alert('Tu navegador no soporta la función de compartir. Descargá el QR e compartilo manualmente.');
      return;
    }

    const svgElement = qrContainerRef.current?.querySelector('svg');
    if (!svgElement) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      canvas.width = size + 80;
      canvas.height = size + 80;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 40, 40, size, size);
          resolve();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'mi-qr.png', { type: 'image/png' });
        await navigator.share({
          title: `QR de ${businessName ?? userName}`,
          text: 'Mostrá este QR en los comercios de la red para obtener tus descuentos.',
          files: [file],
        });
      }, 'image/png');
    } catch (err) {
      console.error('Error al compartir:', err);
    }
  }, [size, businessName, userName]);

  if (!qrValue) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/60 p-8">
        <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        <p className="text-slate-400 text-sm">Generando tu QR...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur-sm p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
          <QrCode className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Mi Código QR</h2>
          <p className="text-sm text-slate-400">Presentalo en cualquier local de la red</p>
        </div>
      </div>

      {/* QR Container */}
      <div className="flex flex-col items-center gap-4">
        <div
          ref={qrContainerRef}
          className="relative rounded-2xl bg-white p-5 shadow-[0_0_40px_rgba(139,92,246,0.3)] ring-4 ring-violet-500/20"
        >
          <QRCodeSVG
            value={qrValue}
            size={size}
            level="M"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#0f172a"
          />
          {/* Logo overlay en el centro */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-10 w-10 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg">
              <QrCode className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Nombre debajo del QR */}
        <div className="text-center">
          {businessName && (
            <p className="text-white font-bold text-lg">{businessName}</p>
          )}
          <p className="text-slate-400 text-sm">{userName}</p>
        </div>
      </div>

      {/* Info de uso */}
      <div className="rounded-xl bg-violet-950/30 border border-violet-800/50 p-3 flex gap-2">
        <AlertCircle className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-violet-300">
          Este QR es único y personal. Presentalo al comerciante para que lo escanee y aplique tu descuento automáticamente.
        </p>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-2 gap-3">
        <button
          id="btn-download-qr"
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-violet-900/40"
        >
          <Download className="h-4 w-4" />
          Descargar
        </button>
        <button
          id="btn-share-qr"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-all duration-200"
        >
          <Share2 className="h-4 w-4" />
          Compartir
        </button>
      </div>
    </div>
  );
}
