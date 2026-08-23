import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] text-white relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-md w-full space-y-6">
        <div className="flex justify-center">
          <div className="p-5 rounded-3xl bg-violet-500/10 border border-violet-500/20 text-violet-400 animate-bounce">
            <HelpCircle className="w-16 h-16" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            404
          </h1>
          <h2 className="text-2xl font-bold">Página no encontrada</h2>
          <p className="text-slate-400 text-sm">
            La ruta a la que intentás acceder no existe o fue movida temporalmente.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold transition-all shadow-lg shadow-violet-900/30"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
