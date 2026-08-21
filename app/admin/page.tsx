import React from 'react';
import { createAdminClient } from '@/lib/supabase-server';
import { Users, Store, Receipt } from 'lucide-react';

export default async function AdminDashboard() {
  const adminClient = createAdminClient();

  // Estadísticas básicas usando Admin Client para saltar políticas RLS
  const { count: merchantsCount } = await adminClient
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'merchant');

  const { count: clientsCount } = await adminClient
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'client');

  const { count: transactionsCount } = await adminClient
    .from('discount_transactions')
    .select('*', { count: 'exact', head: true });

  const stats = [
    { name: 'Comercios Registrados', value: merchantsCount || 0, icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Clientes Activos', value: clientsCount || 0, icon: Users, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
    { name: 'Transacciones Totales', value: transactionsCount || 0, icon: Receipt, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6 relative z-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Admin</h1>
        <p className="text-slate-500 mt-1 font-medium">Resumen general de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 border border-slate-200 transition-all group"
            >
              <dt>
                <div className={`absolute rounded-xl ${stat.bg} p-3 shadow-inner`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-bold text-slate-500">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1 mt-1">
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </dd>
            </div>
          );
        })}
      </div>
    </div>
  );
}
