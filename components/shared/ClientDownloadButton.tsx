'use client';

import React from 'react';
import { Download } from 'lucide-react';

export function ClientDownloadButton({ className, text = "Descargar" }: { className?: string, text?: string }) {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trigger-pwa-install'));
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className || "px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold hover:bg-slate-700 transition-colors flex items-center gap-2"}
    >
      <Download className="w-4 h-4" />
      {text}
    </button>
  );
}
