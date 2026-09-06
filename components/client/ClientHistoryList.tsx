'use client';

import React, { useState } from 'react';
import { Clock, Search } from 'lucide-react';

export function ClientHistoryList({ history }: { history: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter((tx) => {
    const scanner = tx.scanner as { business_name?: string; full_name?: string } | null;
    const offer = tx.offer as { title?: string } | null;
    const merchantName = scanner?.business_name || scanner?.full_name || 'Comercio';
    
    const searchLower = searchTerm.toLowerCase();
    return (
      merchantName.toLowerCase().includes(searchLower) ||
      (offer?.title && offer.title.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-6 h-6 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-montserrat">Historial</h1>
          <p className="text-sm text-slate-400 font-medium">Tus últimos beneficios usados.</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500" />
        </div>
        <input
          type="search"
          placeholder="Buscar comercio u oferta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {(!filteredHistory || filteredHistory.length === 0) ? (
        <div className="glass-panel rounded-3xl p-8 text-center border-dashed border-white/20">
          <p className="text-slate-400 font-medium">No se encontraron descuentos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((tx: any) => {
            const scanner = tx.scanner as { business_name?: string; full_name?: string } | null;
            const offer = tx.offer as { title?: string } | null;
            const merchantName = scanner?.business_name || scanner?.full_name || 'Comercio';
            const saved = (tx.original_amount || 0) - (tx.final_amount || 0);

            return (
              <div key={tx.id} className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors">
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate tracking-tight">{merchantName}</p>
                  <p className="text-blue-300/80 font-medium text-xs truncate mt-0.5">{offer?.title || 'Descuento general'}</p>
                  <p className="text-slate-500 text-[11px] mt-1 font-medium">
                    {new Date(tx.applied_at).toLocaleString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'America/Argentina/Buenos_Aires',
                    })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm mb-1">
                    -{tx.discount_pct}%
                  </div>
                  {saved > 0 && (
                    <p className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-wide">
                      Ahorro ${saved.toLocaleString('es-AR')}
                    </p>
                  )}
                  {tx.final_amount && (
                    <p className="text-xs font-semibold text-slate-300 mt-0.5">
                      ${tx.final_amount.toLocaleString('es-AR')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
