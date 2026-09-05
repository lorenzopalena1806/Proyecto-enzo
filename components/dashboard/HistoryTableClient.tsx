'use client';

import React, { useState, useMemo } from 'react';
import { Search, Receipt } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { UndoChargeButton } from '@/components/dashboard/UndoChargeButton';

const fmt = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export function HistoryTableClient({ txList }: { txList: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredAndSortedTxs = useMemo(() => {
    let result = [...txList];

    // 1. Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(tx => {
        const scannedUser = tx.scanned_user as { full_name?: string; business_name?: string } | null;
        const offer = tx.offer as { title?: string } | null;
        const clientName = (scannedUser?.business_name || scannedUser?.full_name || 'Usuario').toLowerCase();
        const offerTitle = (offer?.title || '').toLowerCase();
        return clientName.includes(lowerSearch) || offerTitle.includes(lowerSearch);
      });
    }

    // 2. Filter by role
    if (roleFilter !== 'all') {
      result = result.filter(tx => {
        const role = tx.scanned_user?.role || 'client';
        return role === roleFilter;
      });
    }

    // 3. Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(tx => {
        if (statusFilter === 'cancelled') return tx.status === 'cancelled';
        if (statusFilter === 'completed') return tx.status !== 'cancelled';
        return true;
      });
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime();
      }
      if (sortBy === 'highest_amount') {
        return (b.final_amount || 0) - (a.final_amount || 0);
      }
      if (sortBy === 'lowest_amount') {
        return (a.final_amount || 0) - (b.final_amount || 0);
      }
      return 0;
    });

    return result;
  }, [txList, searchTerm, roleFilter, statusFilter, sortBy]);

  return (
    <div className="space-y-4">
      {/* Controles de busqueda y filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente u oferta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-w-[130px]"
          >
            <option value="all">Todos los roles</option>
            <option value="client">Solo Clientes</option>
            <option value="merchant">Solo Comercios</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-w-[130px]"
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Completados</option>
            <option value="cancelled">Cancelados</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-w-[140px]"
          >
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="highest_amount">Mayor monto</option>
            <option value="lowest_amount">Menor monto</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredAndSortedTxs.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={txList.length === 0 ? "Sin transacciones" : "No hay coincidencias"}
            description={txList.length === 0 ? "Todavía no registraste ninguna transacción." : "No se encontraron resultados con los filtros actuales."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Oferta</th>
                  <th className="px-6 py-4 font-medium text-right">Precio Original</th>
                  <th className="px-6 py-4 font-medium text-right">Precio Final</th>
                  <th className="px-6 py-4 font-medium text-right">Descuento</th>
                  <th className="px-6 py-4 font-medium text-right">Fecha</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredAndSortedTxs.map((tx: any) => {
                  const scannedUser = tx.scanned_user as { full_name?: string; business_name?: string; role?: string } | null;
                  const offer = tx.offer as { title?: string } | null;
                  const clientName = scannedUser?.business_name || scannedUser?.full_name || 'Usuario';
                  const saved = (tx.original_amount || 0) - (tx.final_amount || 0);

                  return (
                    <tr key={tx.id} className={`hover:bg-slate-800/30 transition-colors ${tx.status === 'cancelled' ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className={`font-medium ${tx.status === 'cancelled' ? 'text-slate-400 line-through' : 'text-white'}`}>{clientName}</div>
                        <div className="text-xs text-slate-500 capitalize">{scannedUser?.role === 'merchant' ? 'Comercio' : 'Cliente'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300 text-sm">
                          {offer?.title || 'Descuento general'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-slate-400 line-through text-sm">
                          {tx.original_amount ? fmt(tx.original_amount) : '---'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-semibold ${tx.status === 'cancelled' ? 'text-slate-500' : 'text-white'}`}>
                          {tx.final_amount ? fmt(tx.final_amount) : '---'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={`${tx.status === 'cancelled' ? 'text-emerald-800' : 'text-emerald-400'} font-bold text-sm`}>-{tx.discount_pct}%</span>
                          {saved > 0 && tx.status !== 'cancelled' && (
                            <span className="text-xs text-emerald-600">{fmt(saved)} ahorrado</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 text-xs whitespace-nowrap">
                        {new Date(tx.applied_at).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'America/Argentina/Buenos_Aires',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <UndoChargeButton 
                          transactionId={tx.id} 
                          isRecent={new Date(tx.applied_at).getTime() > Date.now() - 24 * 60 * 60 * 1000}
                          isCancelled={tx.status === 'cancelled'}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
