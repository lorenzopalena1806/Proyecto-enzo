export const dynamic = 'force-dynamic';

import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Receipt, TrendingUp, Users, DollarSign } from 'lucide-react';
import { UndoChargeButton } from '@/components/dashboard/UndoChargeButton';
import { MerchantChart } from '@/components/dashboard/MerchantChart';
import { HistoryTableClient } from '@/components/dashboard/HistoryTableClient';
import { EmptyState } from '@/components/ui/EmptyState';
import { LazooInsights } from '@/components/dashboard/LazooInsights';
import { cookies } from 'next/headers';

export default async function MerchantHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role, plan_type')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'merchant') redirect('/dashboard');
  const isBasic = profile?.plan_type === 'basic';

  const cookieStore = await cookies();
  const activeBranchId = cookieStore.get('lazoo_active_branch')?.value || null;

  // Obtener todas las transacciones del comercio
  let query = adminClient
    .from('discount_transactions')
    .select('*, scanned_user:profiles!scanned_user_id(full_name, business_name, role), offer:merchant_offers!offer_id(title)')
    .eq('scanner_id', user.id)
    .order('applied_at', { ascending: false });

  if (activeBranchId) {
    query = query.eq('branch_id', activeBranchId);
  }

  const { data: transactions } = await query;
  
  const txList = transactions || [];

  // Calcular mtricas
  const totalTx = txList.length;
  const uniqueClients = new Set(txList.map((tx: any) => tx.scanned_user_id)).size;
  const totalRevenue = txList.reduce((acc: number, tx: any) => acc + (tx.final_amount || 0), 0);
  const totalDiscounted = txList.reduce((acc: number, tx: any) => {
    const orig = tx.original_amount || 0;
    const fin = tx.final_amount || 0;
    return acc + (orig - fin);
  }, 0);

  // Generar datos para el grfico de los ltimos 7 das
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0,0,0,0);
  
  const chartData = [];
  const formatDay = (d: Date) => d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' });
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    
    const txsForDay = txList.filter((tx: any) => {
      const txDate = new Date(tx.applied_at);
      return txDate.getDate() === d.getDate() && txDate.getMonth() === d.getMonth();
    });
    
    chartData.push({
      day: formatDay(d),
      clientes: txsForDay.length
    });
  }

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Ventas y Estadísticas</h1>
        <p className="text-slate-400 mt-1">Métricas, sugerencias de negocio y el registro completo de tus ventas.</p>
      </div>

      {isBasic ? (
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-700/10 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.05)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
            <svg className="w-32 h-32 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider">
              Exclusivo PRO
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Reportes Avanzados</h2>
            <p className="text-slate-300 text-sm max-w-md leading-relaxed">Pasate a PRO para acceder a <strong>Lazoo Insights</strong>: análisis inteligente de tu clientela, horarios pico, sugerencias de ofertas automáticas y un resumen de las métricas clave para potenciar tus ventas.</p>
            <div className="pt-2">
              <a href="/dashboard/pro" className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95">Conocer Beneficios PRO</a>
            </div>
          </div>
        </div>
      ) : (
        <LazooInsights merchantId={user.id} />
      )}

      {/* Stats & Gráfico (Bloqueados si es Basic) */}
      <div className="relative">
        {isBasic && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md rounded-2xl border border-slate-800/50">
            <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">Estadísticas Bloqueadas</h3>
            <p className="text-slate-400 text-sm max-w-sm text-center mb-4">
              Las métricas detalladas y gráficos de escaneos están disponibles solo en el Plan PRO.
            </p>
            <a href="/dashboard/pro" className="bg-white hover:bg-slate-200 text-slate-900 font-bold py-2 px-6 rounded-xl transition-colors">
              Mejorar Plan
            </a>
          </div>
        )}

        <div className={`space-y-6 ${isBasic ? 'opacity-20 pointer-events-none blur-sm' : ''}`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <Receipt className="h-5 w-5 text-violet-400" />
              <p className="text-2xl font-bold text-white">{totalTx}</p>
              <p className="text-xs text-slate-400">Transacciones totales</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <Users className="h-5 w-5 text-blue-400" />
              <p className="text-2xl font-bold text-white">{uniqueClients}</p>
              <p className="text-xs text-slate-400">Clientes únicos</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <p className="text-2xl font-bold text-white">{fmt(totalRevenue)}</p>
              <p className="text-xs text-slate-400">Facturación total</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <TrendingUp className="h-5 w-5 text-amber-400" />
              <p className="text-2xl font-bold text-white">{fmt(totalDiscounted)}</p>
              <p className="text-xs text-slate-400">Total ahorrado por clientes</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 shadow-lg">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Escaneos últimos 7 Días
            </h2>
            <MerchantChart data={chartData} />
          </div>
        </div>
      </div>

      {/* Lista interactiva */}
      <HistoryTableClient txList={txList} />
    </div>
  );
}