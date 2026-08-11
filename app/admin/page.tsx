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
    { name: 'Comercios Registrados', value: merchantsCount || 0, icon: Store },
    { name: 'Clientes Activos', value: clientsCount || 0, icon: Users },
    { name: 'Transacciones Totales', value: transactionsCount || 0, icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-slate-400 mt-1">Resumen general de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm"
            >
              <dt>
                <div className="absolute rounded-xl bg-violet-600/10 p-3">
                  <Icon className="h-6 w-6 text-violet-500" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-slate-400">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1">
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
              </dd>
            </div>
          );
        })}
      </div>
    </div>
  );
}
