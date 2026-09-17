import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Check, X, Star, Zap, Crown, ExternalLink } from 'lucide-react';
import { ProSubscriptionButtons } from './ProSubscriptionButtons';

export const metadata = {
  title: 'Suscripción | Lazoo',
};

export default async function ProPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, mp_subscription_status')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'merchant') redirect('/dashboard');

  const { data: settings } = await supabase
    .from('app_settings')
    .select('setting_key, setting_value');

  const proPriceStr = settings?.find(s => s.setting_key === 'pricing_pro')?.setting_value || '45000';
  const proPrice = parseInt(proPriceStr);

  const formatPrice = (p: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-2xl mb-2 border border-amber-500/20">
          <Crown className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Suscripción <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Lazoo</span></h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Potenciá tus ventas, fidelizá clientes y formá parte de la red de beneficios más grande.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="glass-panel rounded-3xl p-8 relative border-amber-500/30 shadow-[0_0_50px_-12px_rgba(245,158,11,0.15)] flex flex-col h-full overflow-hidden">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-400" /> Plan Único
            </h2>
            <p className="text-slate-400 text-sm">Todas las herramientas incluidas para tu negocio.</p>
          </div>
          
          <div className="mb-8">
            <div className="flex items-end gap-1">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">{formatPrice(proPrice)}</span>
              <span className="text-slate-400 mb-1">/mes</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">* Alta inicial por única vez (Incluye 1er mes y Kit físico)</p>
          </div>

          <div className="space-y-4 flex-grow mb-8">
            <Feature included text="Panel de control avanzado" />
            <Feature included text="Cobros mediante código QR interactivo" />
            <Feature included text="Múltiples sucursales ilimitadas" />
            <Feature included text="Gestión de empleados y cajeros" />
            <Feature included text="Estadísticas avanzadas y reportes" />
            <Feature included text="Pin destacado en el mapa de clientes" />
            <Feature included text="Soporte prioritario por WhatsApp" />
          </div>

          {profile.mp_subscription_status === 'authorized' ? (
            <div className="w-full py-4 rounded-xl font-bold text-center bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Suscripción Activa
            </div>
          ) : (
            <ProSubscriptionButtons type="pro" userId={user.id} />
          )}
        </div>
      </div>
    </div>
  );
}

function Feature({ included, text }: { included: boolean; text: string }) {
  return (
    <div className={`flex items-start gap-3 ${included ? 'text-slate-300' : 'text-slate-600'}`}>
      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${included ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
        {included ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}
