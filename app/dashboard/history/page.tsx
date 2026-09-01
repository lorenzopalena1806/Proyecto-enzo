export const dynamic = 'force-dynamic';

import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Receipt, TrendingUp, Users, DollarSign } from 'lucide-react';
import { UndoChargeButton } from '@/components/dashboard/UndoChargeButton';
import { MerchantChart } from '@/components/dashboard/MerchantChart';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function MerchantHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'merchant') redirect('/dashboard');

  // Obtener todas las transacciones del comercio
  const { data: transactions } = await adminClient
    .from('discount_transactions')
    .select(`
      *,
      scanned_user:profiles!scanned_user_id(full_name, business_name, role),
      offer:merchant_offers(title, original_price, final_price)
    `)
    .eq('scanner_id', user.id)
    .order('applied_at', { ascending: false });

  const txList = transactions || [];

  // Calcular totales
  const totalTx = txList.length;
  const totalDiscounted = txList.reduce((sum: number, tx: any) => {
    const saved = (tx.original_amount || 0) - (tx.final_amount || 0);
    return sum + saved;
  }, 0);
  const totalRevenue = txList.reduce((sum: number, tx: any) => sum + (tx.final_amount || 0), 0);
  const uniqueClients = new Set(txList.map((tx: any) => tx.scanned_user_id)).size;

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  // Preparar datos para el gráfico (últimos 7 días)
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
    
    const userScans = new Set();
    let nuevos = 0;
    let recurrentes = 0;
    
    txsForDay.forEach((tx: any) => {
      if (userScans.has(tx.scanned_user_id)) {
        recurrentes++;
      } else {
        nuevos++;
        userScans.add(tx.scanned_user_id);
      }
    });
    
    chartData.push({
      day: formatDay(d),
      nuevos,
      recurrentes
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Historial de Transacciones</h1>
        <p className="text-slate-400 mt-1">Todos los descuentos que aplicaste en tu comercio.</p>
      </div>

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

      {/* Lista */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {txList.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Sin transacciones"
            description="Todavía no registraste ninguna transacción. Cuando cobres usando la app, aparecerán acá."
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
                {txList.map((tx: any) => {
                  const scannedUser = tx.scanned_user as { full_name?: string; business_name?: string; role?: string } | null;
                  const offer = tx.offer as { title?: string } | null;
                  const clientName = scannedUser?.business_name || scannedUser?.full_name || 'Usuario';
                  const saved = (tx.original_amount || 0) - (tx.final_amount || 0);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{clientName}</div>
                        <div className="text-xs text-slate-500 capitalize">{scannedUser?.role === 'merchant' ? 'Comercio' : 'Cliente'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300 text-sm">
                          {offer?.title || 'Descuento general'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-slate-400 line-through text-sm">
                          {tx.original_amount ? fmt(tx.original_amount) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white font-semibold">
                          {tx.final_amount ? fmt(tx.final_amount) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-emerald-400 font-bold text-sm">-{tx.discount_pct}%</span>
                          {saved > 0 && (
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
    </div>
  );
}
