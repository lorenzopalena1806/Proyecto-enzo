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
  if (profile?.plan_type === 'basic') redirect('/dashboard/pro');

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

      <LazooInsights merchantId={user.id} />

      {/* Stats */}
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

      {/* Gráfico de Escaneos */}
      <div className="glass-panel rounded-2xl p-6 shadow-lg">
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Escaneos Últimos 7 Días
        </h2>
        <MerchantChart data={chartData} />
      </div>

      {/* Lista interactiva */}
      <HistoryTableClient txList={txList} />
    </div>
  );
}