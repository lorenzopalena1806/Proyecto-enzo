'use client';

import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-900 flex items-center justify-center">
      <div className="text-violet-400 font-medium animate-pulse">Cargando mapa interactivo...</div>
    </div>
  )
});

export default function MapWrapper({ merchants }: { merchants: any[] }) {
  return <InteractiveMap merchants={merchants} />;
}
