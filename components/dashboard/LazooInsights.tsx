import React from 'react';
import { Lightbulb } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase-server';

export async function LazooInsights({ merchantId }: { merchantId: string }) {
  const adminClient = createAdminClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: transactions } = await adminClient
    .from('discount_transactions')
    .select('applied_at')
    .eq('scanner_id', merchantId)
    .gte('applied_at', thirtyDaysAgo.toISOString());

  const txs = transactions || [];
  
  let insightMessage = "Seguí escaneando para que nuestra inteligencia artificial pueda darte sugerencias.";

  if (txs.length > 5) {
    // Basic AI analysis logic
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    txs.forEach((tx) => {
      const dayIndex = new Date(tx.applied_at).getDay();
      dayCounts[dayIndex]++;
    });

    const maxCount = Math.max(...dayCounts);
    const minCount = Math.min(...dayCounts);
    const bestDay = dayNames[dayCounts.indexOf(maxCount)];
    const worstDay = dayNames[dayCounts.indexOf(minCount)];

    const pluralize = (day: string) => (day === 'Sábado' || day === 'Domingo') ? day + 's' : day;

    if (maxCount - minCount > 2) {
      insightMessage = `Notamos que tus días más flojos son los ${pluralize(worstDay)} y tus mejores son los ${pluralize(bestDay)}. Te sugerimos crear una "Oferta Relámpago" especial de 20% OFF solo para los ${pluralize(worstDay)} para levantar las ventas en esos horarios muertos.`;
    } else {
      insightMessage = "Tu nivel de ventas está siendo muy estable todos los días de la semana. ¡Excelente trabajo! Podés intentar subir el ticket promedio ofreciendo un beneficio 2x1.";
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-lg border border-amber-500/20 bg-amber-500/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Lightbulb className="w-24 h-24 text-amber-500 group-hover:scale-110 transition-transform duration-500" />
      </div>
      <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2 relative z-10">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        Lazoo AI Insights
      </h2>
      <p className="text-sm text-slate-300 leading-relaxed relative z-10">
        {insightMessage}
      </p>
    </div>
  );
}
