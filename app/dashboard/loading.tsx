import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#060D1A] flex flex-col items-center justify-center text-slate-400 space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl animate-pulse"></div>
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin relative z-10" />
      </div>
      <p className="font-medium animate-pulse">Cargando tu panel de comercio...</p>
    </div>
  );
}
