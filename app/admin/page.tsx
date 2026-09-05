import React from 'react';
import { createAdminClient } from '@/lib/supabase-server';
import { Users, Store, TrendingUp, DollarSign, Activity, AlertCircle, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const adminClient = createAdminClient();

  // 1. Fetch profiles
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, full_name, business_name, role, is_active, plan_type, created_at')
    .order('created_at', { ascending: false });

  const allProfiles = profiles || [];
  
  // Suscripciones
  const merchants = allProfiles.filter(p => p.role === 'merchant');
  const clientsCount = allProfiles.filter(p => p.role === 'client').length;
  
  const planBaseCount = merchants.filter(p => p.is_active && p.plan_type === 'basic').length;
  const planProCount = merchants.filter(p => p.is_active && p.plan_type === 'pro').length;
  const inactiveCount = merchants.filter(p => !p.is_active).length;

  // 2. Fetch transactions
  const { data: transactions } = await adminClient
    .from('discount_transactions')
    .select('*, scanner:profiles!discount_transactions_scanner_id_fkey(business_name, full_name), client:profiles!discount_transactions_scanned_user_id_fkey(full_name)')
    .order('applied_at', { ascending: false });

  const txs = transactions || [];
  const validTxs = txs.filter(t => t.status !== 'cancelled');

  // Dinero Movido
  const totalRevenue = validTxs.reduce((sum, t) => sum + (t.final_amount || 0), 0);
  const totalSaved = validTxs.reduce((sum, t) => sum + ((t.original_amount || 0) - (t.final_amount || 0)), 0);

  // Top 5 Locales
  const merchantStats: Record<string, { name: string; scans: number; revenue: number; id: string }> = {};
  
  validTxs.forEach(t => {
    if (!t.scanner_id) return;
    if (!merchantStats[t.scanner_id]) {
      merchantStats[t.scanner_id] = {
        id: t.scanner_id,
        name: t.scanner?.business_name || t.scanner?.full_name || 'Comercio Desconocido',
        scans: 0,
        revenue: 0,
      };
    }
    merchantStats[t.scanner_id].scans++;
    merchantStats[t.scanner_id].revenue += (t.final_amount || 0);
  });

  const topMerchants = Object.values(merchantStats)
    .sort((a, b) => b.scans - a.scans)
    .slice(0, 5);

  // Últimos Movimientos
  const recentActivity = txs.slice(0, 8);

  const getRelativeTime = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} hs`;
    if (days === 1) return `Ayer`;
    return `Hace ${days} días`;
  };

  return (
    <div className="space-y-8 relative z-10 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Dashboard Admin</h1>
        <p className="text-slate-400 mt-1 font-medium">Centro de control principal de Lazo</p>
      </div>

      {/* FILA 1: EL NEGOCIO (Suscripciones) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Store className="h-5 w-5 text-violet-400" />
          Estado del Negocio (Suscripciones)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Store className="h-16 w-16" /></div>
             <p className="text-sm font-semibold text-slate-400 mb-1">Total Comercios</p>
             <p className="text-3xl font-black text-white">{merchants.length}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle2 className="h-16 w-16" /></div>
             <p className="text-sm font-semibold text-indigo-300 mb-1">Plan Base</p>
             <p className="text-3xl font-black text-indigo-100">{planBaseCount}</p>
          </div>
          <div className="bg-gradient-to-br from-fuchsia-900/50 to-slate-900 border border-fuchsia-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="h-16 w-16" /></div>
             <p className="text-sm font-semibold text-fuchsia-300 mb-1">Plan PRO</p>
             <p className="text-3xl font-black text-fuchsia-100">{planProCount}</p>
          </div>
          <div className="bg-gradient-to-br from-red-900/50 to-slate-900 border border-red-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><AlertCircle className="h-16 w-16" /></div>
             <p className="text-sm font-semibold text-red-300 mb-1">Inactivos / Vencidos</p>
             <p className="text-3xl font-black text-red-100">{inactiveCount}</p>
          </div>
        </div>
      </div>

      {/* FILA 2: IMPACTO Y MÉTRICAS */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400" />
          Impacto en la Red
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400">Dinero Movido</p>
              <p className="text-2xl font-black text-white">${totalRevenue.toLocaleString('es-AR')}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              <TrendingUp className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400">Ahorro Generado a Clientes</p>
              <p className="text-2xl font-black text-white">${Math.max(0, totalSaved).toLocaleString('es-AR')}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400">Clientes Totales</p>
              <p className="text-2xl font-black text-white">{clientsCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COLUMNA 1: RANKING */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            Top 5 Locales (Más Escaneos)
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            {topMerchants.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {topMerchants.map((merchant, index) => (
                  <div key={merchant.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{merchant.name}</p>
                        <p className="text-xs text-slate-400">${merchant.revenue.toLocaleString('es-AR')} en ventas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">{merchant.scans}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Escaneos</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">No hay transacciones suficientes.</div>
            )}
            <div className="p-3 bg-slate-950/50 border-t border-slate-800 text-center">
              <Link href="/admin/users" className="text-sm text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1">
                Ver todos los locales <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: ACTIVIDAD RECIENTE */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Últimos Movimientos (En Vivo)
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-5">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((tx) => (
                  <div key={tx.id} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-2 ${tx.status === 'cancelled' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                      <div className="w-px h-full bg-slate-800 mt-2"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm text-slate-300">
                          <strong className="text-white">{tx.scanner?.business_name || tx.scanner?.full_name || 'Un comercio'}</strong> {tx.status === 'cancelled' ? 'canceló un cobro a' : 'le cobró a'} <strong className="text-white">{tx.client?.full_name || 'un cliente'}</strong>
                        </p>
                        <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                          {getRelativeTime(tx.applied_at)}
                        </span>
                      </div>
                      <p className={`text-sm font-mono ${tx.status === 'cancelled' ? 'text-red-400 line-through' : 'text-emerald-400'}`}>
                        ${(tx.final_amount || 0).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">No hay actividad reciente.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
