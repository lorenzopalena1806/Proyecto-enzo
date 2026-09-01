import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Scan } from 'lucide-react';
import MapWrapper from '@/components/client/MapWrapper';

export const metadata = {
  title: 'Mapa de Comercios | Lazoo',
  description: 'Encontrá comercios adheridos cerca tuyo.',
};

export default async function MapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const adminClient = createAdminClient();

  // Obtener comercios activos con coordenadas
  // Necesitamos que tengan suscripción activa
  const { data: activeSubscriptions } = await adminClient
    .from('subscriptions')
    .select('merchant_id')
    .eq('status', 'active');

  const activeMerchantIds = activeSubscriptions?.map(s => s.merchant_id) || [];

  if (activeMerchantIds.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400">
        No hay comercios con suscripciones activas en este momento.
      </div>
    );
  }

  const { data: merchants } = await adminClient
    .from('profiles')
    .select('id, business_name, avatar_url, category, address, latitude, longitude, is_premium')
    .eq('role', 'merchant')
    .eq('is_active', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .in('id', activeMerchantIds);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-slate-950">
      
      {/* ── HEADER CON BOTÓN VOLVER ── */}
      <header className="absolute top-0 left-0 right-0 z-[400] p-4 flex items-center justify-between bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none">
        <Link 
          href="/client/qr" 
          className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors shadow-lg"
        >
          <ChevronLeft className="w-6 h-6 -ml-1" />
        </Link>
        <div className="pointer-events-auto">
          <h1 className="text-sm font-bold text-slate-800 drop-shadow-md bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-lg">
            📍 Comercios Adheridos
          </h1>
        </div>
        <div className="w-10 h-10"></div> {/* Spacer for centering */}
      </header>
      
      {/* ── MAPA ── */}
      <div className="flex-1 w-full h-full">
        <MapWrapper merchants={merchants || []} />
      </div>

      {/* ── BOTTOM NAV BAR ── */}
      <div className="absolute bottom-0 left-0 right-0 z-[400] px-4 pb-6 pt-10 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none">
        <div className="max-w-lg mx-auto relative flex justify-center pointer-events-auto">
          <Link href="/client/scanner" className="group relative flex items-center justify-center">
            {/* Anillo exterior animado */}
            <div className="absolute inset-0 bg-fuchsia-500/30 rounded-full blur-xl group-hover:blur-2xl group-hover:bg-fuchsia-500/40 transition-all duration-300 animate-pulse" />
            
            {/* Botón principal */}
            <div className="relative flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-full border-[4px] border-slate-950 shadow-[0_0_30px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform duration-300">
              <Scan className="w-8 h-8 text-white mb-0.5" />
              <span className="text-[10px] font-bold text-white tracking-widest uppercase font-montserrat">Pagar</span>
            </div>
          </Link>
        </div>
      </div>
      
    </div>
  );
}
