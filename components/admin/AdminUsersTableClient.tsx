'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Store, User, Mail, Calendar, ShieldAlert, Search, Filter, TrendingUp, ScanBarcode, ChevronRight } from 'lucide-react';
import { SuspendUserButton } from '@/components/admin/SuspendUserButton';
import { MerchantStatusDropdown } from '@/components/admin/MerchantStatusDropdown';

type EnrichedUser = {
  id: string;
  role: string;
  full_name: string;
  email: string;
  business_name?: string;
  phone?: string;
  created_at: string;
  is_active: boolean;
  subscription_expires_at?: string;
  material_status?: string;
  total_sales: number;
  total_scans: number;
};

export default function AdminUsersTableClient({ initialUsers }: { initialUsers: EnrichedUser[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'merchant' | 'client' | 'superadmin'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'sales_desc' | 'scans_desc'>('newest');

  const filteredAndSortedUsers = useMemo(() => {
    // 1. Filtrar
    let result = initialUsers.filter(user => {
      // Filtrar por rol
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      
      // Filtrar por texto
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const nameMatch = user.full_name?.toLowerCase().includes(term);
        const emailMatch = user.email?.toLowerCase().includes(term);
        const businessMatch = user.business_name?.toLowerCase().includes(term);
        return nameMatch || emailMatch || businessMatch;
      }
      return true;
    });

    // 2. Ordenar
    result.sort((a, b) => {
      if (sortBy === 'sales_desc') {
        // Comercios arriba, clientes abajo. Dentro de comercios, mayor venta primero.
        if (a.role === 'merchant' && b.role !== 'merchant') return -1;
        if (b.role === 'merchant' && a.role !== 'merchant') return 1;
        if (a.role === 'merchant' && b.role === 'merchant') {
            return b.total_sales - a.total_sales;
        }
        return 0;
      }
      
      if (sortBy === 'scans_desc') {
        // Clientes o Comercios ordenados por cantidad de operaciones/escaneos
        return b.total_scans - a.total_scans;
      }

      // Por defecto: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [initialUsers, searchTerm, roleFilter, sortBy]);

  return (
    <div className="space-y-4">
      {/* Controles de Búsqueda y Filtros */}
      <div className="flex flex-col lg:flex-row gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        {/* Buscador */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-xl leading-5 bg-slate-950 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors sm:text-sm"
            placeholder="Buscar por nombre, email o comercio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 lg:flex-nowrap">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${roleFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-900'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setRoleFilter('merchant')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${roleFilter === 'merchant' ? 'bg-violet-900/50 text-violet-300' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-900'}`}
            >
              Comercios
            </button>
            <button
              onClick={() => setRoleFilter('client')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${roleFilter === 'client' ? 'bg-emerald-900/50 text-emerald-300' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-900'}`}
            >
              Clientes
            </button>
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="block w-full pl-3 pr-10 py-2 text-xs border border-slate-700 rounded-xl bg-slate-950 text-slate-300 focus:outline-none focus:border-violet-500 transition-colors h-[38px] appearance-none"
            >
              <option value="newest">Más Recientes</option>
              <option value="sales_desc">🏆 Comercios: Más Ventas</option>
              <option value="scans_desc">🎯 Más Escaneos (Actividad)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <Filter className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-3 py-3 font-medium">Usuario / Email</th>
                <th className="px-3 py-3 font-medium">Rol</th>
                <th className="px-3 py-3 font-medium">Negocio / Detalles</th>
                <th className="px-3 py-3 font-medium">Estadísticas</th>
                <th className="px-3 py-3 font-medium">Onboarding</th>
                <th className="px-3 py-3 font-medium text-right">Fecha</th>
                <th className="px-3 py-3 font-medium text-right">Estado</th>
                <th className="px-3 py-3 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredAndSortedUsers.map((user: any) => (
                <tr 
                  key={user.id} 
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        user.role === 'merchant' ? 'bg-violet-900/50 text-violet-400' : 
                        user.role === 'superadmin' ? 'bg-amber-900/50 text-amber-400' :
                        'bg-emerald-900/50 text-emerald-400'
                      }`}>
                        {user.role === 'merchant' ? <Store className="h-4 w-4" /> : 
                         user.role === 'superadmin' ? <ShieldAlert className="h-4 w-4" /> :
                         <User className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{user.full_name || 'Sin nombre'}</div>
                        <div className="text-slate-400 text-[10px] sm:text-xs flex items-center gap-1 mt-0.5 line-clamp-1">
                          <Mail className="h-3 w-3 flex-shrink-0" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'merchant' ? 'bg-violet-950 text-violet-400 border border-violet-800/50' : 
                      user.role === 'superadmin' ? 'bg-amber-950 text-amber-400 border border-amber-800/50' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    }`}>
                      {user.role === 'merchant' ? 'Comercio' : 
                       user.role === 'superadmin' ? 'Superadmin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {user.role === 'merchant' ? (
                      <div>
                        <div className="text-white font-medium line-clamp-1">{user.business_name || 'Sin nombre'}</div>
                        {user.phone && <div className="text-slate-400 text-[10px] mt-0.5">{user.phone}</div>}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[10px] italic">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="space-y-1">
                      {user.role === 'merchant' ? (
                        <>
                          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 whitespace-nowrap">
                            <TrendingUp className="h-3 w-3" /> ${user.total_sales.toLocaleString('es-AR')}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap">
                            <ScanBarcode className="h-3 w-3" /> {user.total_scans} op.
                          </div>
                        </>
                      ) : user.role === 'client' ? (
                        <>
                          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 whitespace-nowrap">
                            <ScanBarcode className="h-3 w-3" /> {user.total_scans} usos
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {user.role === 'merchant' ? (
                      <div className="space-y-1 flex flex-col items-start">
                        {/* Suscripción status */}
                        {user.subscription_expires_at ? (
                          new Date(user.subscription_expires_at) < new Date() ? (
                            <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 whitespace-nowrap">Vencido</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">Susc. OK</span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20 whitespace-nowrap">Sin Pago</span>
                        )}
                        
                        {/* Material Físico status */}
                        {user.material_status === 'delivered' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5 whitespace-nowrap">QR OK</span>
                        ) : user.material_status === 'requested' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-0.5 whitespace-nowrap">QR Pedido</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20 mt-0.5 whitespace-nowrap">Sin QR</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[10px] italic">-</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right text-slate-400">
                    <div className="flex items-center justify-end gap-1 text-[11px] whitespace-nowrap">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.created_at).toLocaleDateString('es-AR', {day: 'numeric', month: 'numeric', year: '2-digit'})}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {user.role === 'merchant' ? (
                      <MerchantStatusDropdown 
                        merchantId={user.id} 
                        currentPlan={(user as any).plan_type || 'basic'} 
                        isActive={user.is_active} 
                      />
                    ) : (
                      <SuspendUserButton userId={user.id} isActive={user.is_active} role={user.role} />
                    )}
                  </td>
                  <td className="px-3 py-3 text-right text-slate-500 group-hover:text-blue-400 transition-colors">
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </td>
                </tr>
              ))}
              
              {filteredAndSortedUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron usuarios que coincidan con tu búsqueda o filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
