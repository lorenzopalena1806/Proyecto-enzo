import Link from 'next/link';
import { Store, User } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/30 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-900/30">
              <Store className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Red<span className="text-violet-400">Beneficios</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Características</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Cómo funciona</a>
            <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <User className="h-4 w-4" />
              Ingresar
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              Registrarme
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}
