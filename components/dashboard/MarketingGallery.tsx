'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Download, Eye, ImageIcon, Loader2, Search, X } from 'lucide-react';
import type { MarketingAsset } from '@/types';

interface MarketingGalleryProps {
  assets: MarketingAsset[];
  isLoading?: boolean;
}

export function MarketingGallery({ assets, isLoading = false }: MarketingGalleryProps) {
  const [lightboxAsset, setLightboxAsset] = useState<MarketingAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = assets.filter((asset) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      asset.title?.toLowerCase().includes(q) ||
      asset.description?.toLowerCase().includes(q)
    );
  });

  const handleDownload = async (asset: MarketingAsset) => {
    try {
      const response = await fetch(asset.file_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = asset.file_url.split('.').pop() ?? 'jpg';
      link.download = `${(asset.title ?? 'imagen').replace(/\s+/g, '-').toLowerCase()}.${ext}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('No se pudo descargar el archivo. Intentá de nuevo.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Cargando materiales de marketing...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
            <ImageIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Materiales de Marketing</h2>
            <p className="text-sm text-slate-500 font-medium">
              {assets.length} {assets.length === 1 ? 'archivo' : 'archivos'} disponibles
            </p>
          </div>
        </div>

        {/* Buscador */}
        {assets.length > 4 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all shadow-sm font-medium"
            />
          </div>
        )}

        {/* Galería */}
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
            <ImageIcon className="h-12 w-12 text-slate-300" />
            <div className="text-center">
              <p className="text-slate-500 font-bold">
                {searchQuery ? 'Sin resultados para tu búsqueda' : 'Todavía no hay materiales'}
              </p>
              <p className="text-slate-400 text-sm mt-1 font-medium">
                {searchQuery
                  ? 'Probá con otro término'
                  : 'El administrador subirá tus carruseles e imágenes aquí pronto'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onPreview={() => setLightboxAsset(asset)}
                onDownload={() => handleDownload(asset)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxAsset && (
        <Lightbox
          asset={lightboxAsset}
          onClose={() => setLightboxAsset(null)}
          onDownload={() => handleDownload(lightboxAsset)}
        />
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// SUB-COMPONENTES
// ──────────────────────────────────────────────────────────────

interface AssetCardProps {
  asset: MarketingAsset;
  onPreview: () => void;
  onDownload: () => void;
}

function AssetCard({ asset, onPreview, onDownload }: AssetCardProps) {
  return (
    <div className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/5 shadow-sm">
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Image
          src={asset.file_url}
          alt={asset.title ?? 'Material de marketing'}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
        />

        {/* Overlay con acciones */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <button
            onClick={onPreview}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-900 transition-all shadow-sm"
            title="Vista previa"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={onDownload}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
            title="Descargar"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-white">
        <p className="text-slate-900 text-sm font-bold truncate">
          {asset.title ?? 'Sin título'}
        </p>
        {asset.description && (
          <p className="text-slate-500 text-xs truncate mt-0.5 font-medium">{asset.description}</p>
        )}
        <p className="text-slate-400 text-xs mt-1 font-medium">
          {new Date(asset.created_at).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}

interface LightboxProps {
  asset: MarketingAsset;
  onClose: () => void;
  onDownload: () => void;
}

function Lightbox({ asset, onClose, onDownload }: LightboxProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full max-h-[90vh] rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controles */}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            onClick={onDownload}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md"
            title="Descargar"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all shadow-md"
            title="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Imagen */}
        <div className="relative w-full aspect-square md:aspect-video">
          <Image
            src={asset.file_url}
            alt={asset.title ?? 'Material de marketing'}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </div>

        {/* Info */}
        {(asset.title || asset.description) && (
          <div className="p-4 border-t border-slate-200 bg-white shrink-0">
            {asset.title && <p className="text-slate-900 font-bold">{asset.title}</p>}
            {asset.description && (
              <p className="text-slate-500 text-sm mt-1 font-medium">{asset.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
