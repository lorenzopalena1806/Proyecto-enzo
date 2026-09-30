'use client';

import dynamic from 'next/dynamic';

const DynamicChart = dynamic(() => import('./MerchantChartInner'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-xl bg-slate-900/50">
      Cargando gráfico...
    </div>
  )
});

export function MerchantChart({ data }: { data: any[] }) {
  return <DynamicChart data={data} />;
}
