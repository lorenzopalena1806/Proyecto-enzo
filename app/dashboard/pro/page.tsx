import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Lock, Crown, BarChart3, Users } from 'lucide-react';
import { ProSubscriptionButtons } from './ProSubscriptionButtons';

export const metadata = {
  title: 'Lazoo PRO | Reportes Avanzados',
};

export default async function ProReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role, is_premium').eq('id', user.id).single();

  if (!profile || profile.role !== 'merchant') redirect('/dashboard');

  if (!profile.is_premium) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-amber-500/20 rounded-3xl p-8 max-w-lg w-full text-center relative overflow-hidden shadow-[0_0_50px_-12px_rgba(245,158,11,0.3)]">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Crown className="w-32 h-32 text-amber-500" /></div>
          
          <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 mb-6">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          
          <h1 className="text-3xl font-black text-white mb-4 flex items-center justify-center gap-2">
            Lazoo <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">PRO</span>
          </h1>
          
          <p className="text-slate-400 mb-8 leading-relaxed">
            Descubrí quiénes son tus clientes. Obtené reportes cruzados, mapas de calor de ventas y datos demográficos para escalar tu negocio al siguiente nivel.
          </p>

          <div className="space-y-3 text-left mb-8">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">✓</div>
              Identificá qué otros rubros consumen tus clientes
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">✓</div>
              Mapa de calor de tus mejores horarios
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">✓</div>
              Exportación de base de datos a Excel/CSV
            </div>
          </div>

          <ProSubscriptionButtons />
        </div>
      </div>
    );
  }

  // Si es PRO, renderizar reportes avanzados
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          Lazoo <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">PRO</span>
        </h1>
        <p className="text-slate-400 mt-1">Estadísticas avanzadas exclusivas para tu negocio.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border-amber-500/20">
          <h2 className="text-white font-bold flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-amber-400" /> Afinidad de Rubros
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Tus clientes también compraron en:</p>
            <div className="space-y-2">
              {['Gastronomía (45%)', 'Indumentaria (30%)', 'Entretenimiento (15%)', 'Otros (10%)'].map(rubro => (
                <div key={rubro} className="bg-slate-900 rounded-lg p-3 text-sm font-medium text-slate-300 border border-slate-800">
                  {rubro}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border-amber-500/20">
          <h2 className="text-white font-bold flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-amber-400" /> Mapa de Calor (Mockup)
          </h2>
          <div className="h-48 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            [Gráfico de Mapa de Calor Próximamente]
          </div>
        </div>
      </div>
    </div>
  );
}
