'use client';

import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Store, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string | null;
}

interface Merchant {
  id: string;
  name: string;
  address: string | null;
  branches: Branch[];
}

export function AdminQRManager({ merchants }: { merchants: Merchant[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ref y estado para el QR invisible (se renderiza solo para descargarlo)
  const qrRef = useRef<HTMLDivElement>(null);
  const [downloadingUrl, setDownloadingUrl] = useState('');
  const [downloadingName, setDownloadingName] = useState('');

  const filteredMerchants = merchants.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.branches.some(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownload = (url: string, name: string) => {
    setDownloadingUrl(url);
    setDownloadingName(name);
    
    // Delay para permitir que el canvas renderice el logo
    setTimeout(() => {
      const canvas = qrRef.current?.querySelector('canvas');
      if (!canvas) return;

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_Lazoo_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      setDownloadingUrl('');
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
        <Store className="text-slate-500 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar comercio por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMerchants.map(merchant => (
          <div key={merchant.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Store className="h-5 w-5 text-violet-400" />
                {merchant.name}
              </h2>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-slate-400">Casa Central</span>
                <button 
                  onClick={() => handleDownload(`https://lazoo.vercel.app/pay?m=${merchant.id}`, `${merchant.name}_Central`)}
                  className="bg-violet-600 hover:bg-violet-500 text-white p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                >
                  <Download className="h-4 w-4" /> Descargar QR
                </button>
              </div>
            </div>

            {merchant.branches.length > 0 && (
              <div className="p-5 bg-slate-950/50 flex-1">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Sucursales ({merchant.branches.length})</h3>
                <div className="space-y-3">
                  {merchant.branches.map(branch => (
                    <div key={branch.id} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-violet-400" />
                        {branch.name}
                      </span>
                      <button 
                        onClick={() => handleDownload(`https://lazoo.vercel.app/pay?m=${merchant.id}&b=${branch.id}`, `${merchant.name}_${branch.name}`)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded transition-colors flex items-center justify-center gap-1.5 text-xs w-full"
                      >
                        <Download className="h-3.5 w-3.5" /> Descargar QR Sucursal
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contenedor invisible para renderizar el QR SVG a descargar */}
      {downloadingUrl && (
        <div ref={qrRef} style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <QRCodeCanvas
            value={downloadingUrl}
            size={1000}
            level="H"
            includeMargin={true}
            bgColor="#0f172a"
            fgColor="#38bdf8"
            imageSettings={{
              src: '/logo.png',
              x: undefined,
              y: undefined,
              height: 120,
              width: 300,
              excavate: true,
            }}
          />
        </div>
      )}
    </div>
  );
}
