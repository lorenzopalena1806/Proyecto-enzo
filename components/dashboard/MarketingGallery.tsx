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
        <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        <p className="text-slate-400 text-sm">Cargando materiales de marketing...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Materiales de Marketing</h2>
            <p className="text-sm text-slate-400">
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
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition-all"
            />
          </div>
        )}

        {/* Galería */}
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-slate-700">
            <ImageIcon className="h-12 w-12 text-slate-600" />
            <div className="text-center">
              <p className="text-slate-400 font-medium">
                {searchQuery ? 'Sin resultados para tu búsqueda' : 'Todavía no hay materiales'}
              </p>
              <p className="text-slate-600 text-sm mt-1">
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
    <div className="group relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800/60 hover:border-violet-600/60 transition-all duration-300 hover:shadow-lg hover:shadow-violet-900/20">
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-slate-900">
        <Image
          src={asset.file_url}
          alt={asset.title ?? 'Material de marketing'}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
        />

        {/* Overlay con acciones */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={onPreview}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm"
            title="Vista previa"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={onDownload}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 hover:bg-violet-500 text-white transition-all"
            title="Descargar"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-white text-sm font-medium truncate">
          {asset.title ?? 'Sin título'}
        </p>
        {asset.description && (
          <p className="text-slate-400 text-xs truncate mt-0.5">{asset.description}</p>
        )}
        <p className="text-slate-600 text-xs mt-1">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full max-h-[90vh] rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controles */}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            onClick={onDownload}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg"
            title="Descargar"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
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
          <div className="p-4 border-t border-slate-800">
            {asset.title && <p className="text-white font-medium">{asset.title}</p>}
            {asset.description && (
              <p className="text-slate-400 text-sm mt-1">{asset.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
