'use client';

import { useState } from 'react';
import { createEmployeeServer, deleteEmployeeServer } from '@/app/actions/employee';
import { Shield, Copy, Check, Trash2, Users, Store, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRouter } from 'next/navigation';

export function EmployeeManager({ 
  employees, 
  branches,
  baseUrl,
  planType = 'basic'
}: { 
  employees: any[]; 
  branches: any[];
  baseUrl: string;
  planType?: string;
}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isBasicAndLimited = planType === 'basic' && employees.length >= 1;

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${baseUrl}/cajero/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isBasicAndLimited) {
      alert('El Plan Básico permite máximo 1 empleado. Mejorá tu plan a PRO para agregar más.');
      return;
    }
    setIsCreating(true);
    const formData = new FormData(e.currentTarget);
    await createEmployeeServer(formData);
    setIsCreating(false);
    (e.target as HTMLFormElement).reset();
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* List */}
      <div className="glass-panel rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-blue-400" />
          Cajeros Activos
        </h2>
        
        {employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aún no tenés cajeros"
            description="Creá un perfil para que tus empleados puedan cobrar de forma segura, sin ver tus estadísticas ni ingresos."
          />
        ) : (
          <div className="grid gap-4">
            {employees.map(emp => {
              const branch = branches.find(b => b.id === emp.branch_id);
              return (
                <div key={emp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{emp.name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Store className="w-3 h-3" />
                      {branch?.name || 'Sucursal Desconocida'}
                    </p>
                    <p className="text-xs text-amber-400 mt-1 font-mono">PIN: {emp.pin}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyLink(emp.id)}
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      title="Copiar Link de Acceso"
                    >
                      {copiedId === emp.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('¿Seguro que querés eliminar a este empleado?')) {
                          await deleteEmployeeServer(emp.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Form */}
      <div className="glass-panel rounded-2xl p-6 shadow-lg border border-white/5 relative overflow-hidden">
        {isBasicAndLimited && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
            <Shield className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Límite Alcanzado</h3>
            <p className="text-slate-300 text-sm max-w-sm mb-4">
              Tu Plan Básico te permite configurar 1 cajero. Mejorá tu plan a PRO para agregar sucursales y cajeros ilimitados.
            </p>
            <button 
              onClick={() => router.push('/dashboard/pro')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-xl transition-colors"
            >
              Mejorar Plan
            </button>
          </div>
        )}

        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-emerald-400" />
          Crear Nuevo Cajero
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nombre del Cajero / Turno</label>
            <input 
              name="name" 
              required 
              placeholder="Ej: Turno Mañana, Juan Pérez..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Sucursal Asignada</label>
            <select 
              name="branch_id" 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Seleccioná una sucursal...</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">PIN de Acceso (4 a 6 dígitos)</label>
            <input 
              name="pin" 
              required 
              type="password"
              pattern="[0-9]{4,6}"
              placeholder="Ej: 1234" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating || isBasicAndLimited}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Cajero'}
          </button>
        </form>
      </div>
    </div>
  );
}
