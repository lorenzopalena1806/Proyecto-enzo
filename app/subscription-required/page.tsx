import Link from 'next/link';
import { AlertCircle, LogOut } from 'lucide-react';

export default function SubscriptionRequiredPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
        <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
          <AlertCircle className="h-8 w-8 text-amber-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Suscripción Pendiente</h1>
          <p className="text-slate-400">
            Tu cuenta de comercio fue creada con éxito, pero tu suscripción aún no ha sido activada por un administrador.
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 text-sm text-slate-300">
          Por favor, comunicate con el soporte o esperá a que un administrador valide y active tu cuenta para acceder al panel.
        </div>

        <div className="pt-4 flex justify-center">
          <Link
            href="/auth/logout"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
