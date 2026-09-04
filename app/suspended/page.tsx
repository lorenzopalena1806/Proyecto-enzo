import React from 'react';
import { ShieldAlert, AlertTriangle, Zap, Star, Clock } from 'lucide-react';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ProSubscriptionButtons } from '@/app/dashboard/pro/ProSubscriptionButtons';

export default async function SuspendedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/auth/login');

  // Si ya está activo, lo mandamos de vuelta al dashboard
  if (profile.is_active) {
    redirect('/dashboard');
  }

  if (profile.role === 'merchant') {
    return <MerchantActivationView profile={profile} userId={user.id} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at top, #0f1f4a 0%, #060d1f 50%, #000510 100%)' }}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>

        <div className="h-16 w-16 bg-red-950/50 border border-red-800/40 rounded-full flex items-center justify-center mb-5">
          <ShieldAlert className="h-8 w-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Acceso Bloqueado</h1>

        <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs font-semibold uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          <span>Infringe la Norma N° 5 de la plataforma</span>
        </div>

        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Tu cuenta fue suspendida por incumplimiento de los términos de uso (Norma N° 5: faltas a las condiciones de servicio o conducta irregular).
        </p>

        <a
          href="https://wa.me/5493512388658"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all mb-6 flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-950/50"
        >
          Apelar o Contactar a Soporte
        </a>

        <div className="w-full pt-4 border-t border-slate-800 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

async function MerchantActivationView({ profile, userId }: { profile: any, userId: string }) {
  const adminClient = createAdminClient();
  const { data: settingsData } = await adminClient.from('app_settings').select('*');
  const getSetting = (key: string, defaultValue: number) => {
    const row = settingsData?.find(s => s.key === key);
    return row ? row.value.amount : defaultValue;
  };
  const basicPrice = getSetting('pricing_basic', 55000);
  const proPrice = getSetting('pricing_pro', 80000);

  const formatPrice = (price: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 lg:p-8" style={{ background: 'radial-gradient(ellipse at top, #0f1f4a 0%, #060d1f 50%, #000510 100%)' }}>
      <div className="max-w-4xl w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-4">Activá tu cuenta de Comercio</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Tu cuenta está inactiva. Para empezar a cobrar con Lazoo y aparecer en la app, elegí tu plan y realizá el pago de forma segura con Mercado Pago.
          </p>
        </div>

        {profile.mp_subscription_status === 'pending' && (
          <div className="max-w-xl mx-auto mb-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 text-amber-400">
            <Clock className="w-8 h-8 shrink-0 animate-pulse" />
            <div className="text-left text-sm">
              <strong className="block font-bold mb-1">Pago en proceso</strong>
              Estamos esperando la confirmación de Mercado Pago. Si ya pagaste, la cuenta se activará automáticamente en breve. También podés volver a intentar o contactar a soporte.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Plan Básico */}
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 flex flex-col h-full">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" /> Plan Básico
              </h2>
              <p className="text-slate-400 text-sm">Ideal para empezar en la red.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-white">{formatPrice(basicPrice)}</span>
              <span className="text-slate-400 text-sm">/mes</span>
            </div>
            <div className="mt-auto">
              <ProSubscriptionButtons type="basic" userId={userId} />
            </div>
          </div>

          {/* Plan PRO */}
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-amber-500/30 shadow-[0_0_30px_-10px_rgba(245,158,11,0.15)] rounded-3xl p-6 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Recomendado
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" /> Plan PRO
              </h2>
              <p className="text-slate-400 text-sm">Escalabilidad y cruce de datos.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">{formatPrice(proPrice)}</span>
              <span className="text-slate-400 text-sm">/mes</span>
            </div>
            <div className="mt-auto">
              <ProSubscriptionButtons type="pro" userId={userId} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center flex-col items-center gap-4">
          <a
            href="https://wa.me/5493512388658"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white text-sm underline transition-colors"
          >
            Necesito ayuda para activar mi cuenta
          </a>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
