'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Store, Trash2, X, Loader2, Edit2 } from 'lucide-react';
import { createBranchAction, deleteBranchAction, updateBranchAction } from '@/app/actions/branches';

interface Branch {
  id: string;
  name: string;
  address: string | null;
}

export function BranchManager({ branches, planType = 'basic' }: { branches: Branch[], planType?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [mapsUrl, setMapsUrl] = useState('');
  const [isExtractingMaps, setIsExtractingMaps] = useState(false);
  const [mapExtractMessage, setMapExtractMessage] = useState({ type: '', text: '' });

  const router = useRouter();

  const isBasicAndLimited = planType === 'basic' && branches.length >= 1;

  const handleExtractMaps = async () => {
    if (!mapsUrl) {
      setMapExtractMessage({ type: 'error', text: 'Ingresá un link.' });
      return;
    }
    setIsExtractingMaps(true);
    setMapExtractMessage({ type: '', text: '' });
    try {
      const { extractCoordinatesFromMapsUrl } = await import('@/app/actions/map');
      const res = await extractCoordinatesFromMapsUrl(mapsUrl);
      if (res.success && res.lat && res.lng) {
        setLat(res.lat);
        setLng(res.lng);
        setMapExtractMessage({ type: 'success', text: '¡Coordenadas obtenidas!' });
      } else {
        setMapExtractMessage({ type: 'error', text: res.error || 'No se pudo obtener la ubicación.' });
      }
    } catch (err) {
      setMapExtractMessage({ type: 'error', text: 'Error de servidor.' });
    } finally {
      setIsExtractingMaps(false);
    }
  };

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      }, (err) => {
        alert('No pudimos acceder a tu ubicación. Probá desde un celular o introducí las coordenadas manualmente.');
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (!lat || !lng) {
      if (!editingBranch) {
        setErrorMsg('Por favor obtené las coordenadas antes de guardar.');
        setIsLoading(false);
        return;
      }
    }

    const formData = new FormData(e.currentTarget);
    
    if (editingBranch) {
      const result = await updateBranchAction(editingBranch.id, formData);
      if (result.success) {
        setIsModalOpen(false);
        setEditingBranch(null);
        router.refresh();
      } else {
        setErrorMsg(result.reason || 'Error desconocido');
      }
    } else {
      if (isBasicAndLimited) {
        setErrorMsg('El Plan Básico permite máximo 1 sucursal.');
        setIsLoading(false);
        return;
      }
      const result = await createBranchAction(formData);
      if (result.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        setErrorMsg(result.reason || 'Error desconocido');
      }
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta sucursal? Desaparecerá del mapa de los clientes.')) return;
    
    await deleteBranchAction(id);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Store className="h-8 w-8 text-violet-400" />
            Mis Sucursales
          </h1>
          <p className="text-slate-400 mt-1">
            Gestioná todas las ubicaciones de tu franquicia o marca.
          </p>
        </div>
        <button 
          onClick={() => {
            if (isBasicAndLimited) {
              alert('El Plan Básico permite máximo 1 sucursal. Mejorá tu plan a PRO para agregar más sucursales.');
              return;
            }
            setEditingBranch(null);
            setIsModalOpen(true);
          }}
          className={`font-bold py-2 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isBasicAndLimited 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          <Plus className="h-5 w-5" />
          Nueva Sucursal
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-6">
        {(!branches || branches.length === 0) ? (
          <div className="p-12 text-center">
            <MapPin className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Aún no agregaste ninguna sucursal extra.</p>
            <p className="text-slate-500 text-sm mt-1">Tu local principal seguirá apareciendo en el mapa.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {branches.map(branch => (
              <div key={branch.id} className="p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Store className="h-6 w-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{branch.name}</h3>
                    <p className="text-slate-400 text-sm flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {branch.address || 'Ubicación anclada'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingBranch(branch);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-500 hover:text-violet-400 hover:bg-violet-400/10 rounded-lg transition-colors active:scale-95"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(branch.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors active:scale-95"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingBranch ? 'Editar Sucursal' : 'Agregar Sucursal'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nombre de Sucursal</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  defaultValue={editingBranch?.name || ''}
                  placeholder="Ej: Sucursal Nueva Córdoba"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Dirección Visible</label>
                <input 
                  type="text" 
                  name="address" 
                  required 
                  defaultValue={editingBranch?.address || ''}
                  placeholder="Ej: Independencia 500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 outline-none" 
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Ubicación en el Mapa</label>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    placeholder="Link de Google Maps..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleExtractMaps}
                    disabled={isExtractingMaps || !mapsUrl}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center border border-slate-700 whitespace-nowrap"
                  >
                    {isExtractingMaps ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Extraer'}
                  </button>
                </div>
                {mapExtractMessage.text && (
                  <p className={`text-xs mb-3 ${mapExtractMessage.type === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {mapExtractMessage.text}
                  </p>
                )}

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">o también podés</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-slate-700 mt-3"
                >
                  <MapPin className="h-4 w-4" />
                  {lat && lng ? '✅ Coordenadas Obtenidas' : 'Obtener mi ubicación actual'}
                </button>
                {lat && lng && (
                  <p className="text-xs text-emerald-400 mt-2 text-center">Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}</p>
                )}
                
                <input type="hidden" name="latitude" value={lat || ''} />
                <input type="hidden" name="longitude" value={lng || ''} />
              </div>

              {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}

              <button 
                type="submit" 
                disabled={isLoading || (!editingBranch && (!lat || !lng))}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg mt-4 flex justify-center items-center"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingBranch ? 'Guardar Cambios' : 'Guardar Sucursal')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
