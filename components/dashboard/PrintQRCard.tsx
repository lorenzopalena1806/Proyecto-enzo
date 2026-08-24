'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface PrintQRCardProps {
  merchantId: string;
  businessName: string;
  qrUrl: string;
}

export function PrintQRCard({
  businessName,
  qrUrl,
}: PrintQRCardProps) {
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = () => {
    const svgElement = qrContainerRef.current?.querySelector('svg.main-qr-svg') as SVGElement | null;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const qrSize = 1000;
    const padding = 100;
    canvas.width = qrSize + padding * 2;
    canvas.height = qrSize + padding * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Fondo #0F172A
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const qrImg = new Image();
    qrImg.onload = () => {
      // 2. Dibujar código QR
      ctx.drawImage(qrImg, padding, padding, qrSize, qrSize);

      // 3. Cargar y dibujar el logo oficial de Lazoo en el centro
      const logoImg = new Image();
      logoImg.onload = () => {
        const logoWidth = 320;
        const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
        const logoX = (canvas.width - logoWidth) / 2;
        const logoY = (canvas.height - logoHeight) / 2;
        const boxPadding = 20;

        // Fondo oscuro con borde cyan para que el logo destaque sobre el QR
        ctx.save();
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#22d3ee'; // cyan-400
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.roundRect(
          logoX - boxPadding,
          logoY - boxPadding,
          logoWidth + boxPadding * 2,
          logoHeight + boxPadding * 2,
          24
        );
        ctx.fill();
        ctx.stroke();

        // Dibujar el logo oficial
        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
        ctx.restore();

        // Disparar la descarga
        const link = document.createElement('a');
        link.download = `QR-Lazoo-${businessName.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      logoImg.src = '/logo.png';
    };
    qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="space-y-6">
      {/* Botones de control (no se imprimen) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <Link
          href="/dashboard/pos"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Cobrar con QR
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPNG}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all border border-slate-700 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Descargar Imagen QR
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold shadow-lg shadow-cyan-900/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir Cartel
          </button>
        </div>
      </div>

      {/* Cartel para Mostrador */}
      <div className="flex justify-center p-2 sm:p-6 print:p-0">
        <div
          className="w-full max-w-md bg-[#0F172A] text-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border-4 border-cyan-500/40 flex flex-col items-center text-center relative overflow-hidden print:border-none print:shadow-none print:max-w-full print:w-[95mm] print:mx-auto print:p-4"
        >
          {/* Header del Cartel */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-black text-cyan-300 uppercase tracking-widest mb-5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Comercio Adherido
          </div>

          <div className="flex justify-center items-center mb-1">
            <img src="/logo.png" alt="Lazoo" className="h-10 w-auto object-contain" />
          </div>
          
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-6">
            Red de Descuentos & Beneficios
          </p>

          <div className="w-full h-px bg-slate-800 mb-6" />

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Escaneá con tu celular en</p>
          <h2 className="text-2xl font-black text-white mb-6">{businessName}</h2>

          {/* QR Container con fondo #0F172A */}
          <div
            ref={qrContainerRef}
            className="p-5 rounded-3xl bg-[#0F172A] border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative mb-6"
          >
            <QRCodeSVG
              value={qrUrl}
              size={240}
              level="H"
              includeMargin={false}
              fgColor="#38bdf8"
              bgColor="#0F172A"
              className="main-qr-svg"
            />
            {/* Logo oficial de Lazoo en el centro del QR */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-[#0F172A] p-2 rounded-2xl shadow-xl border-2 border-cyan-400 flex items-center justify-center">
                <img src="/logo.png" alt="Lazoo" className="h-6 w-auto object-contain" />
              </div>
            </div>
          </div>

          {/* Instrucciones paso a paso */}
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5 mb-6">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>1. Abrí la cámara o app Lazoo</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>2. Escaneá este código QR</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>3. Obtené tu descuento en el acto</span>
            </div>
          </div>

          {/* Footer del cartel */}
          <p className="text-[11px] font-semibold text-slate-500">
            Powered by Lazoo • lazoo.app
          </p>
        </div>
      </div>
    </div>
  );
}
