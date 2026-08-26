import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { TrendingUp, Package } from 'lucide-react';
import { MerchantChart } from '@/components/dashboard/MerchantChart';
import { MaterialRequestButton } from '@/components/dashboard/MaterialRequestButton';

export const metadata = {
  title: 'Analíticas y Material | Lazoo',
  description: 'Estadísticas de tu comercio.',
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0,0,0,0);

  const [
    { data: profile },
    { data: chartTransactions }
  ] = await Promise.all([
    adminClient.from('profiles').select('*').eq('id', user.id).single(),
    adminClient.from('discount_transactions').select('applied_at, scanned_user_id').eq('scanner_id', user.id).gte('applied_at', sevenDaysAgo.toISOString())
  ]);

  if (!profile) redirect('/auth/login');

  // Preparar datos para el gráfico (últimos 7 días)
  const chartData = [];
  const formatDay = (d: Date) => d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' });
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    
    const txsForDay = (chartTransactions || []).filter((tx: any) => {
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
      <div>
        <h1 className="text-2xl font-bold text-white">Analíticas y Material</h1>
        <p className="text-slate-400 mt-1">Acá podés ver el rendimiento de tu local y pedir cartelería.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-lg">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Escaneos Últimos 7 Días
          </h2>
          <MerchantChart data={chartData} />
        </div>
        
        <div className="glass-panel rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              Material Físico (QR)
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Para que los clientes puedan escanear tus ofertas, necesitás el cartel acrílico oficial de Lazoo en tu mostrador.
            </p>
          </div>
          <MaterialRequestButton merchantId={user.id} status={profile.material_status || 'none'} />
        </div>
      </div>
    </div>
  );
}
