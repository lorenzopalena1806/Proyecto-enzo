'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, Download, Sparkles, CheckCircle2, QrCode } from 'lucide-react';
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
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = () => {
    const svgElement = printAreaRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const size = 600;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 40, 40, size - 80, size - 80);
      const link = document.createElement('a');
      link.download = `QR-Lazoo-${businessName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all border border-slate-700"
          >
            <Download className="w-4 h-4" />
            Descargar Imagen
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold shadow-lg shadow-cyan-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Imprimir Cartel
          </button>
        </div>
      </div>

      {/* Cartel para Mostrador */}
      <div className="flex justify-center p-2 sm:p-6 print:p-0">
        <div
          ref={printAreaRef}
          className="w-full max-w-md bg-white text-slate-900 rounded-[2rem] p-8 sm:p-10 shadow-2xl border-4 border-cyan-500/30 flex flex-col items-center text-center relative overflow-hidden print:border-none print:shadow-none print:max-w-full print:w-[90mm] print:mx-auto print:p-4"
        >
          {/* Header del Cartel */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-black text-cyan-800 uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            Comercio Adherido
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase mb-1">
            Lazoo
          </h1>
          <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wider mb-6">
            Red de Descuentos & Beneficios
          </p>

          <div className="w-full h-px bg-slate-100 mb-6" />

          <p className="text-sm font-bold text-slate-600 mb-1">Escaneá con tu celular en</p>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">{businessName}</h2>

          {/* QR Container con marco */}
          <div className="p-5 rounded-3xl bg-white border-2 border-slate-900/10 shadow-lg relative mb-6">
            <QRCodeSVG
              value={qrUrl}
              size={240}
              level="H"
              includeMargin={false}
              fgColor="#090D16"
              bgColor="#ffffff"
            />
            {/* Logo de Lazoo en el centro */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-12 w-12 rounded-xl bg-slate-950 text-cyan-400 flex items-center justify-center shadow-md border-2 border-white">
                <QrCode className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Instrucciones paso a paso */}
          <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2 mb-6">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
              <span>1. Abrí la cámara o app Lazoo</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
              <span>2. Escaneá este código QR</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
              <span>3. Obtené tu descuento en el acto</span>
            </div>
          </div>

          {/* Footer del cartel */}
          <p className="text-[11px] font-semibold text-slate-400">
            Powered by Lazoo • lazoo.app
          </p>
        </div>
      </div>
    </div>
  );
}
