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
    { name: 'Comercios Registrados', value: merchantsCount || 0, icon: Store, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Clientes Activos', value: clientsCount || 0, icon: Users, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
    { name: 'Transacciones Totales', value: transactionsCount || 0, icon: Receipt, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6 relative z-10">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Dashboard Admin</h1>
        <p className="text-slate-400 mt-1 font-medium">Resumen general de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-3xl glass-panel p-6 shadow-lg hover:bg-white/5 transition-all group border-white/10"
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition-colors" />
              <dt>
                <div className={`absolute rounded-xl ${stat.bg} p-3 border border-white/5 shadow-inner`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-semibold text-slate-400">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1 mt-1">
                <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
              </dd>
            </div>
          );
        })}
      </div>
    </div>
  );
}
