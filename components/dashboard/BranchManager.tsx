'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Store, Trash2, X, Loader2, Edit2, Navigation } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { createBranchAction, deleteBranchAction, updateBranchAction } from '@/app/actions/branches';
import { BusinessHoursEditor } from './BusinessHoursEditor';

interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone?: string | null;
  business_hours?: string | null;
  maps_url?: string | null;
  latitude: number;
  longitude: number;
}

export function BranchManager({ branches, planType = 'basic' }: { branches: Branch[], planType?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [businessHours, setBusinessHours] = useState('');

  const router = useRouter();

  const isBasicAndLimited = planType === 'basic' && branches.length >= 1;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    
    if (editingBranch) {
      const result = await updateBranchAction(editingBranch.id, formData);
      if (result.success) {
        setIsModalOpen(false);
        setEditingBranch(null);
        setBusinessHours('');
        router.refresh();
      } else {
        setErrorMsg(result.reason || 'Hubo un error al actualizar la sucursal.');
        setIsLoading(false);
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
        setEditingBranch(null);
        setBusinessHours('');
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
      <div className="flex justify-between items-center bg-slate-900 p-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Store className="h-6 w-6 text-violet-400" />
            Mis Sucursales
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gestioná las ubicaciones físicas de tu negocio</p>
        </div>
        <div>
          <button 
            onClick={() => {
              if (isBasicAndLimited) {
                alert('El Plan Básico permite máximo 1 sucursal. Mejorá tu plan a PRO para agregar más sucursales.');
                return;
              }
              setEditingBranch(null);
              setBusinessHours('');
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
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-6">
        {(!branches || branches.length === 0) ? (
          <EmptyState 
            icon={<MapPin className="h-12 w-12 text-slate-500" />}
            title="Aún no tenés sucursales"
            description="Agregá la ubicación de tus locales para que los clientes te encuentren en el mapa y sepan tus horarios."
            actionLabel="Agregar Sucursal"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="divide-y divide-slate-800/50">
            {branches.map(branch => (
              <div key={branch.id} className="p-4 sm:p-6 hover:bg-slate-800/20 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {branch.name}
                  </h3>
                  {branch.address && (
                    <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {branch.address}
                    </p>
                  )}
                  {branch.maps_url && (
                    <a 
                      href={branch.maps_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-violet-400 text-xs font-bold inline-flex items-center gap-1 hover:text-violet-300 mt-2 bg-violet-500/10 px-3 py-1 rounded-lg"
                    >
                      Ver en mapa <Navigation className="w-3 h-3" />
                    </a>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingBranch(branch);
                      const bh = branch.business_hours;
                      setBusinessHours(
                        typeof bh === 'object' && bh !== null 
                          ? JSON.stringify(bh) 
                          : bh || ''
                      );
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
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Link de Google Maps</label>
                <input
                  type="url"
                  name="maps_url"
                  required
                  defaultValue={editingBranch?.maps_url || ''}
                  placeholder="Ej: https://maps.app.goo.gl/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Pegá acá el link para compartir de tu ubicación.</p>
                <input type="hidden" name="business_hours" value={businessHours || ''} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp de Contacto (Público)</label>
                <input 
                  type="tel" 
                  name="phone" 
                  defaultValue={editingBranch?.phone || ''}
                  placeholder="Ej: +54 9 11 1234-5678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 outline-none" 
                />
                <p className="text-xs text-slate-500 mt-1">Este número se mostrará en el perfil público de la sucursal.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Horarios de Atención</label>
                <BusinessHoursEditor
                  value={businessHours}
                  onChange={(val) => setBusinessHours(val)}
                />
              </div>

              {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
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
