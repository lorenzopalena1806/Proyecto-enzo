import Link from 'next/link';
import { AlertCircle, LogOut } from 'lucide-react';
import { ProSubscriptionButtons } from '@/app/dashboard/pro/ProSubscriptionButtons';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function SubscriptionRequiredPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
        <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
          <AlertCircle className="h-8 w-8 text-amber-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Suscripción Inactiva o Vencida</h1>
          <p className="text-slate-400">
            Tu cuenta de comercio no tiene una suscripción activa o la fecha de pago ha vencido. Para seguir usando el sistema y cobrando con Lazoo, por favor renová tu suscripción.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">Elegí tu Plan para Renovar</h3>
          <div className="grid grid-cols-1 gap-4">
            <ProSubscriptionButtons type="basic" userId={user.id} />
            <ProSubscriptionButtons type="pro" userId={user.id} />
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-4 border-t border-slate-800 mt-6 pt-6">
          <Link
            href="/auth/logout"
            className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors font-medium mt-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
