import { createAdminClient } from '@/lib/supabase-server';
import { Filter, Users, AlertTriangle, Store, Tag } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function FunnelPage() {
  const supabase = createAdminClient();
  
  // Obtener todos los perfiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'merchant');
    
  // Obtener todos los dueños de ofertas
  const { data: offers } = await supabase
    .from('offers')
    .select('merchant_id');

  const merchants = profiles || [];
  const totalMerchants = merchants.length;
  
  // Abandono 1: Perfil Incompleto (Sin nombre o dirección)
  const incompleteMerchants = merchants.filter(m => !m.business_name || !m.business_address || m.business_name.trim() === '');
  
  // Abandono 2: Sin ofertas activas
  const merchantIdsWithOffers = new Set((offers || []).map(o => o.merchant_id));
  const merchantsWithoutOffers = merchants.filter(m => !merchantIdsWithOffers.has(m.id) && !incompleteMerchants.includes(m));

  // Exitosos
  const successfulMerchants = merchants.filter(m => merchantIdsWithOffers.has(m.id));

  const calculatePct = (val: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((val / total) * 100);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Filter className="h-6 w-6 text-pink-400" />
          Embudo de Abandono
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Métricas de fricción: detectá dónde se traban los comerciantes al crear su cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-6 rounded-3xl border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" /> Total Registros
          </h3>
          <div className="text-3xl font-black text-white">{totalMerchants}</div>
        </div>
        
        <div className="glass-panel p-6 rounded-3xl border-red-900/50 bg-red-950/10">
          <h3 className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-4 w-4" /> Perfil Incompleto
          </h3>
          <div className="text-3xl font-black text-red-400">{incompleteMerchants.length}</div>
          <p className="text-xs text-red-400/70 mt-1">{calculatePct(incompleteMerchants.length, totalMerchants)}% del total</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border-amber-900/50 bg-amber-950/10">
          <h3 className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2 text-amber-400">
            <Store className="h-4 w-4" /> Sin Ofertas
          </h3>
          <div className="text-3xl font-black text-amber-400">{merchantsWithoutOffers.length}</div>
          <p className="text-xs text-amber-400/70 mt-1">{calculatePct(merchantsWithoutOffers.length, totalMerchants)}% del total</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border-emerald-900/50 bg-emerald-950/10">
          <h3 className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2 text-emerald-400">
            <Tag className="h-4 w-4" /> Activos Exitosos
          </h3>
          <div className="text-3xl font-black text-emerald-400">{successfulMerchants.length}</div>
          <p className="text-xs text-emerald-400/70 mt-1">{calculatePct(successfulMerchants.length, totalMerchants)}% del total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla Incompletos */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-red-900/30">
          <div className="p-4 bg-red-950/20 border-b border-red-900/30 flex justify-between items-center">
            <h3 className="font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Abandonaron en el Perfil
            </h3>
            <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded-full">{incompleteMerchants.length}</span>
          </div>
          <div className="p-0">
            {incompleteMerchants.length === 0 ? (
              <p className="text-slate-500 text-sm p-6 text-center">No hay abandonos en esta etapa.</p>
            ) : (
              <ul className="divide-y divide-slate-800/50">
                {incompleteMerchants.map(m => (
                  <li key={m.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-white font-medium text-sm">{m.full_name || 'Sin Nombre'}</p>
                      <p className="text-slate-500 text-xs">Falta completar datos del local</p>
                    </div>
                    <Link href={`/admin/users/${m.id}`} className="text-xs text-blue-400 hover:text-blue-300">
                      Ver detalle
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Tabla Sin Ofertas */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-amber-900/30">
          <div className="p-4 bg-amber-950/20 border-b border-amber-900/30 flex justify-between items-center">
            <h3 className="font-semibold text-amber-400 flex items-center gap-2">
              <Store className="h-4 w-4" />
              Abandonaron antes de la Oferta
            </h3>
            <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-1 rounded-full">{merchantsWithoutOffers.length}</span>
          </div>
          <div className="p-0">
            {merchantsWithoutOffers.length === 0 ? (
              <p className="text-slate-500 text-sm p-6 text-center">No hay abandonos en esta etapa.</p>
            ) : (
              <ul className="divide-y divide-slate-800/50">
                {merchantsWithoutOffers.map(m => (
                  <li key={m.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-white font-medium text-sm">{m.business_name || m.full_name}</p>
                      <p className="text-slate-500 text-xs">Aprobado, pero sin promociones activas</p>
                    </div>
                    <Link href={`/admin/users/${m.id}`} className="text-xs text-blue-400 hover:text-blue-300">
                      Contactar
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
