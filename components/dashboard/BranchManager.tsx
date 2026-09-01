'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Store, Trash2, X, Loader2 } from 'lucide-react';
import { createBranchAction, deleteBranchAction } from '@/app/actions/branches';

interface Branch {
  id: string;
  name: string;
  address: string | null;
}

export function BranchManager({ branches }: { branches: Branch[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      (err) => {
        alert('Error al obtener la ubicación. Por favor, asegúrate de haber dado los permisos.');
      }
    );
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const result = await createBranchAction(formData);

    if (result.success) {
      setIsModalOpen(false);
    } else {
      setErrorMsg(result.reason || 'Error desconocido');
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
          onClick={() => setIsModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
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
                <button 
                  onClick={() => handleDelete(branch.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors active:scale-95"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Agregar Sucursal</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nombre de Sucursal</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
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
                  placeholder="Ej: Independencia 500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 outline-none" 
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Ubicación en el Mapa</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-slate-700"
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
                disabled={isLoading || !lat || !lng}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg mt-4 flex justify-center items-center"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar Sucursal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
