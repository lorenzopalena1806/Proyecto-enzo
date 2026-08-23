import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <div className="mt-6 text-cyan-500 font-medium tracking-widest text-sm uppercase text-center animate-pulse">
          Lazoo
        </div>
      </div>
    </div>
  );
}
