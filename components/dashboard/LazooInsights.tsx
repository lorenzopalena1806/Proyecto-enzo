import React from 'react';
import { Lightbulb, TrendingUp, TrendingDown, Package, Calendar, AlertCircle } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase-server';
import Link from 'next/link';

export async function LazooInsights({ merchantId }: { merchantId: string }) {
  const adminClient = createAdminClient();
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 14);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  // 1. Fetch transactions (last 30 days)
  const { data: transactions } = await adminClient
    .from('discount_transactions')
    .select('applied_at')
    .eq('scanner_id', merchantId)
    .gte('applied_at', thirtyDaysAgo.toISOString())
    .order('applied_at', { ascending: false });

  const txs = transactions || [];

  // 2. Fetch active offers
  const { data: offers } = await adminClient
    .from('merchant_offers')
    .select('title, stock_limit, used_count')
    .eq('merchant_id', merchantId)
    .eq('is_active', true);

  const activeOffers = offers || [];

  const insights = [];

  // Insight 4: Alerta de Inactividad Temprana (Highest priority if inactive for > 3 days)
  let daysSinceLastTx = 0;
  if (txs.length > 0) {
    const lastTxDate = new Date(txs[0].applied_at);
    daysSinceLastTx = Math.floor((now.getTime() - lastTxDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  if (txs.length > 0 && daysSinceLastTx >= 3) {
    insights.push({
      type: 'warning',
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      title: 'Inactividad Detectada',
      text: `Pasaron más de ${daysSinceLastTx} días sin registrar escaneos. Revisá que tu cartel QR siga visible o subí una oferta nueva.`,
    });
  }

  if (txs.length > 5) {
    // 1. Detección del Día Valle (Contraste de Tráfico)
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const pluralize = (day: string) => (day === 'Sábado' || day === 'Domingo') ? day + 's' : day;

    txs.forEach((tx) => {
      dayCounts[new Date(tx.applied_at).getDay()]++;
    });

    const maxCount = Math.max(...dayCounts);
    let minCount = 99999;
    let worstDayIdx = -1;
    let bestDayIdx = dayCounts.indexOf(maxCount);

    dayCounts.forEach((count, idx) => {
      if (count < minCount) {
        minCount = count;
        worstDayIdx = idx;
      }
    });

    if (maxCount > 0 && (maxCount - minCount) >= 2) { 
      const diffPercent = Math.round(((maxCount - minCount) / maxCount) * 100);
      insights.push({
        type: 'info',
        icon: <Calendar className="w-5 h-5 text-blue-400" />,
        title: 'Día Valle Detectado',
        text: `Tus ${pluralize(dayNames[worstDayIdx])} tienen un ${diffPercent}% menos de movimiento que tus ${pluralize(dayNames[bestDayIdx])}. Considerá armar una oferta exclusiva para ese día.`,
        action: {
          label: `Crear oferta de ${dayNames[worstDayIdx]}`,
          href: '/dashboard/offers'
        }
      });
    }

    // 3. Tracción y Rendimiento Semanal
    const last7DaysTxs = txs.filter(tx => new Date(tx.applied_at) >= sevenDaysAgo).length;
    const prev7DaysTxs = txs.filter(tx => {
      const d = new Date(tx.applied_at);
      return d >= fourteenDaysAgo && d < sevenDaysAgo;
    }).length;

    if (prev7DaysTxs > 0) {
      const growth = Math.round(((last7DaysTxs - prev7DaysTxs) / prev7DaysTxs) * 100);
      if (growth > 10) {
        insights.push({
          type: 'success',
          icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
          title: 'Crecimiento Semanal',
          text: `¡Gran trabajo! Esta semana tus clientes usaron un ${growth}% más de beneficios que la pasada.`
        });
      } else if (growth < -15) {
        insights.push({
          type: 'warning',
          icon: <TrendingDown className="w-5 h-5 text-amber-400" />,
          title: 'Caída de Tráfico',
          text: `Tus escaneos cayeron un ${Math.abs(growth)}% respecto a la semana pasada. Recordale a tus empleados que ofrezcan usar Lazoo.`
        });
      }
    }
  }

  // 2. Velocidad de Agotamiento (Control de Stock)
  if (activeOffers.length > 0) {
    let almostDepleted = activeOffers.find(o => o.stock_limit > 0 && (o.used_count / o.stock_limit) > 0.85);
    let stagnant = activeOffers.find(o => o.stock_limit > 0 && (o.used_count / o.stock_limit) < 0.1);

    if (almostDepleted) {
      insights.push({
        type: 'success',
        icon: <Package className="w-5 h-5 text-emerald-400" />,
        title: 'Stock casi agotado',
        text: `Tu promoción "${almostDepleted.title}" consumió más del 85% de sus cupos. Considerá aumentarlos para no perder ventas.`,
        action: {
          label: 'Editar Promoción',
          href: '/dashboard/offers'
        }
      });
    } else if (stagnant && txs.length > 10) {
      insights.push({
        type: 'info',
        icon: <Package className="w-5 h-5 text-blue-400" />,
        title: 'Promo con poco uso',
        text: `Tu promoción "${stagnant.title}" tiene poco uso comparado con tu volumen. Probá subir el descuento.`
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: 'info',
      icon: <Lightbulb className="w-5 h-5 text-amber-400" />,
      title: 'Lazoo Analíticas',
      text: "Seguí escaneando códigos QR. El sistema analizará tus ventas y te dará sugerencias cuando haya suficientes datos."
    });
  }

  // Priorizamos y mostramos máximo 2.
  const displayInsights = insights.slice(0, 2);

  const getStyle = (type: string) => {
    switch(type) {
      case 'warning': return 'border-red-500/20 bg-red-500/5';
      case 'success': return 'border-emerald-500/20 bg-emerald-500/5';
      default: return 'border-blue-500/20 bg-blue-500/5';
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        Sugerencias para tu local
      </h2>
      
      {displayInsights.map((insight, idx) => (
        <div key={idx} className={`glass-panel rounded-2xl p-5 shadow-lg border relative overflow-hidden group ${getStyle(insight.type)}`}>
          <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
            {React.cloneElement(insight.icon as React.ReactElement<any>, { className: 'w-16 h-16' })}
          </div>
          <h3 className="text-white font-bold text-[15px] mb-2 flex items-center gap-2 relative z-10">
            {insight.icon}
            {insight.title}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed relative z-10 mb-3 pr-4">
            {insight.text}
          </p>
          {insight.action && (
            <Link href={insight.action.href} className="inline-block relative z-10">
              <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors border border-white/10 shadow-md">
                {insight.action.label}
              </button>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
