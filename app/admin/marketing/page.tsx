'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { Profile } from '@/types';
import { UploadCloud, Loader2, Image as ImageIcon, Store } from 'lucide-react';
import { getMerchantsForMarketingServer, createMarketingAssetServer } from '@/app/actions/admin';

export default function AdminMarketingPage() {
  const supabase = createClient();
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(true);

  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    setLoadingMerchants(true);
    const data = await getMerchantsForMarketingServer();
    setMerchants(data);
    setLoadingMerchants(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant || !file) {
      setMessage({ type: 'error', text: 'Seleccioná un comercio y un archivo.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      // 1. Subir archivo a Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedMerchant}-${Date.now()}.${fileExt}`;
      const filePath = `merchants/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('marketing-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('marketing-assets')
        .getPublicUrl(filePath);

      // 2. Crear registro en la tabla marketing_assets usando Server Action
      const { data: sessionData } = await supabase.auth.getSession();
      const adminId = sessionData.session?.user.id;

      if (!adminId) throw new Error("Sesión no encontrada");

      const result = await createMarketingAssetServer({
        merchant_id: selectedMerchant,
        title: title || 'Material Promocional',
        description: description || '',
        file_url: publicUrlData.publicUrl,
        file_type: 'image',
        uploaded_by: adminId,
      });

      if (!result.success) throw new Error(result.error);

      setMessage({ type: 'success', text: 'Material subido correctamente.' });
      
      // Limpiar form
      setTitle('');
      setDescription('');
      setFile(null);
      
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Error al subir el archivo.' });
    } finally {
      setUploading(false);
    }
  };

  if (loadingMerchants) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Subir Marketing</h1>
        <p className="text-slate-400 mt-1">Cargá imágenes y promociones para el panel de los comercios.</p>
      </div>

      <form onSubmit={handleUpload} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm space-y-6">
        
        {/* Selección de Comercio */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Comercio Destino
          </label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <select
              value={selectedMerchant}
              onChange={(e) => setSelectedMerchant(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all appearance-none"
              required
            >
              <option value="" disabled>Seleccionar un comercio...</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.business_name || m.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Título y Descripción */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Promo Verano"
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-violet-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Descripción (Opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles de la imagen..."
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-violet-500 transition-all"
            />
          </div>
        </div>

        {/* Zona de subida */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Archivo de Imagen</label>
          <div className="mt-2 flex justify-center rounded-xl border border-dashed border-slate-700 px-6 py-10 hover:border-violet-500 hover:bg-slate-800/30 transition-all">
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-slate-500" aria-hidden="true" />
              <div className="mt-4 flex text-sm leading-6 text-slate-400 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-semibold text-violet-400 hover:text-violet-300"
                >
                  <span>Cargar un archivo</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                <p className="pl-1">o arrastrar y soltar</p>
              </div>
              <p className="text-xs leading-5 text-slate-500 mt-2">
                {file ? (
                  <span className="font-semibold text-emerald-400">{file.name}</span>
                ) : (
                  'PNG, JPG, GIF hasta 5MB'
                )}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-950/50 text-red-400 border border-red-900/50' : 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50'}`}>
            {message.text}
          </div>
        )}

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={uploading || !file || !selectedMerchant}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <UploadCloud className="h-5 w-5" />
              Subir Material
            </>
          )}
        </button>
      </form>
    </div>
  );
}
