import Link from 'next/link';
import { Store, User } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-cyan-500/10 bg-black/30 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-900/30">
              <Store className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Red<span className="text-cyan-400">Beneficios</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-300 transition-colors">Características</a>
            <a href="#how-it-works" className="hover:text-cyan-300 transition-colors">Cómo funciona</a>
            <a href="#pricing" className="hover:text-cyan-300 transition-colors">Precios</a>
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
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold hover:from-cyan-400 hover:to-blue-500 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Registrarme
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}
