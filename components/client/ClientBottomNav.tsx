'use client';
import React from 'react';
import Link from 'next/link';
import { ClipboardList, Scan, User, Compass } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function ClientBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pointer-events-none">
      <div className="max-w-lg mx-auto relative flex justify-between items-end pointer-events-auto bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] px-6 py-3 shadow-2xl">
        
        {/* Left: Comercios (Discover) */}
        <Link 
          href="/client/qr"
          className={`flex flex-col items-center justify-center gap-1 transition-colors pb-1 \${pathname === '/client/qr' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <Compass className="h-6 w-6" />
          <span className="text-[10px] font-semibold text-center leading-tight mt-1">Explorar<br/>Comercios</span>
        </Link>

        {/* Center-Left: Historial */}
        <Link 
          href="/client/history"
          className={`flex flex-col items-center justify-center gap-1 transition-colors pb-1 \${pathname === '/client/history' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <div className="relative">
            <ClipboardList className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold text-white">
              %
            </div>
          </div>
          <span className="text-[10px] font-semibold text-center leading-tight mt-1">Mis<br/>Ahorros</span>
        </Link>

        {/* Center: QR Scanner (Floating) */}
        <div className="relative -top-6 mx-2">
          <Link href="/client/scanner" className="group relative flex items-center justify-center">
            {/* Anillo exterior animado */}
            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl group-hover:blur-2xl group-hover:bg-blue-500/40 transition-all duration-300 animate-pulse" />
            
            {/* Botón principal */}
            <div className="relative flex flex-col items-center justify-center w-[64px] h-[64px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-full border-4 border-slate-950 shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform duration-300">
              <Scan className="w-7 h-7 text-blue-400 mb-0.5" />
            </div>
          </Link>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-300 whitespace-nowrap">Escanear QR</span>
        </div>

        {/* Right: Perfil */}
        <Link 
          href="/client/profile" 
          className={`flex flex-col items-center justify-center gap-1 transition-colors pb-1 \${pathname === '/client/profile' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <User className="h-6 w-6" />
          <span className="text-[10px] font-semibold text-center leading-tight mt-1">Mi<br/>Perfil</span>
        </Link>
        
      </div>
    </div>
  );
}
