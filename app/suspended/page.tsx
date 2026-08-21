import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { LogoutButton } from '@/components/dashboard/LogoutButton';

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at top, #0f1f4a 0%, #060d1f 50%, #000510 100%)' }}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl">
        <div className="h-16 w-16 bg-red-950/50 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Cuenta Suspendida</h1>
        <p className="text-slate-400 mb-8">
          Tu acceso a la plataforma ha sido suspendido temporalmente. Si creés que esto es un error, por favor contactate con el soporte.
        </p>
        
        <div className="w-full pt-6 border-t border-slate-800">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
