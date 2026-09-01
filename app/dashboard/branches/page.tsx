import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { MapPin, Plus, Store, Trash2 } from 'lucide-react';

export const metadata = {
  title: 'Mis Sucursales | Lazoo',
};

export default async function BranchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();

  // Verificar rol
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'merchant') redirect('/dashboard');

  // Verificar suscripción PRO
  const { data: subscription } = await adminClient
    .from('subscriptions')
    .select('*')
    .eq('merchant_id', user.id)
    .eq('status', 'active')
    .single();

  if (!subscription) {
    redirect('/dashboard/pro'); // O mostrar mensaje
  }

  const { data: branches } = await adminClient
    .from('merchant_branches')
    .select('*')
    .eq('merchant_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Store className="h-8 w-8 text-violet-400" />
            Mis Sucursales
          </h1>
          <p className="text-slate-400 mt-1">
            Gestioná todas las ubicaciones de tu franquicia o marca.
          </p>
        </div>
        <button className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all">
          <Plus className="h-5 w-5" />
          Nueva Sucursal
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {(!branches || branches.length === 0) ? (
          <div className="p-12 text-center">
            <MapPin className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Aún no agregaste ninguna sucursal extra.</p>
            <p className="text-slate-500 text-sm mt-1">Tu local principal seguirá apareciendo en el mapa.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {branches.map(branch => (
              <div key={branch.id} className="p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Store className="h-6 w-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{branch.name}</h3>
                    <p className="text-slate-400 text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {branch.address}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
