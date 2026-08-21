export const dynamic = 'force-dynamic';

import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Receipt, TrendingUp, Users, DollarSign } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Historial de Transacciones</h1>
        <p className="text-slate-500 mt-1 font-medium">Todos los descuentos que aplicaste en tu comercio.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <Receipt className="h-5 w-5 text-violet-600" />
          <p className="text-2xl font-black text-slate-900">{totalTx}</p>
          <p className="text-xs font-semibold text-slate-500">Transacciones totales</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <Users className="h-5 w-5 text-blue-600" />
          <p className="text-2xl font-black text-slate-900">{uniqueClients}</p>
          <p className="text-xs font-semibold text-slate-500">Clientes únicos</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          <p className="text-2xl font-black text-slate-900">{fmt(totalRevenue)}</p>
          <p className="text-xs font-semibold text-slate-500">Facturación total</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <TrendingUp className="h-5 w-5 text-amber-600" />
          <p className="text-2xl font-black text-slate-900">{fmt(totalDiscounted)}</p>
          <p className="text-xs font-semibold text-slate-500">Total descontado a clientes</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {txList.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-semibold">Todavía no registraste ninguna transacción.</p>
            <p className="text-slate-400 text-sm mt-1 font-medium">Cuando escanees el QR de un cliente, aparecerá acá.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Oferta</th>
                  <th className="px-6 py-4 text-right">Precio Original</th>
                  <th className="px-6 py-4 text-right">Precio Final</th>
                  <th className="px-6 py-4 text-right">Descuento</th>
                  <th className="px-6 py-4 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {txList.map((tx: any) => {
                  const scannedUser = tx.scanned_user as { full_name?: string; business_name?: string; role?: string } | null;
                  const offer = tx.offer as { title?: string } | null;
                  const clientName = scannedUser?.business_name || scannedUser?.full_name || 'Usuario';
                  const saved = (tx.original_amount || 0) - (tx.final_amount || 0);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{clientName}</div>
                        <div className="text-xs font-medium text-slate-500 capitalize">{scannedUser?.role === 'merchant' ? 'Comercio' : 'Cliente'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 text-sm font-semibold">
                          {offer?.title || 'Descuento general'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-slate-400 line-through text-sm font-medium">
                          {tx.original_amount ? fmt(tx.original_amount) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-slate-900 font-bold">
                          {tx.final_amount ? fmt(tx.final_amount) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-emerald-600 font-black text-sm">-{tx.discount_pct}%</span>
                          {saved > 0 && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md shadow-sm">
                              {fmt(saved)} ahorrado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 text-xs font-semibold whitespace-nowrap">
                        {new Date(tx.applied_at).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'America/Argentina/Buenos_Aires',
                        })}
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
