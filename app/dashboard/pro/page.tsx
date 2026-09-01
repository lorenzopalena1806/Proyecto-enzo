import { createAdminClient, createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Check, X, Star, Zap } from 'lucide-react';
import { ProSubscriptionButtons } from './ProSubscriptionButtons';

export const metadata = {
  title: 'Suscripciones | Lazoo',
};

export default async function SuscripcionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role, plan_type, mp_subscription_status')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'merchant') redirect('/dashboard');

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white mb-4">Elegí tu Plan en Lazoo</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Potenciá tus ventas, fidelizá clientes y formá parte de la red de beneficios más grande.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* PLAN BÁSICO */}
        <div className="glass-panel rounded-3xl p-8 relative border-slate-800 flex flex-col h-full">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-400" /> Plan Básico
            </h2>
            <p className="text-slate-400 text-sm">Ideal para comercios que recién empiezan en la red.</p>
          </div>
          
          <div className="mb-8">
            <div className="flex items-end gap-1">
              <span className="text-5xl font-black text-white">$1.000</span>
              <span className="text-slate-400 mb-1">/mes</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">* Alta inicial por única vez: $80.000 (Incluye 1er mes y Kit Físico)</p>
          </div>

          <div className="space-y-4 flex-grow mb-8">
            <Feature included text="Panel de control para tu comercio" />
            <Feature included text="Cobros mediante código QR interactivo" />
            <Feature included text="Estadísticas básicas de ventas" />
            <Feature included text="Gestión de 1 sucursal" />
            <Feature included text="Kit de Bienvenida físico (Stickers, Carteles)" />
            <Feature included={false} text="Reportes avanzados de clientela" />
            <Feature included={false} text="Gestión de cajeros y empleados" />
          </div>

          {profile.plan_type === 'basic' && profile.mp_subscription_status === 'authorized' ? (
            <div className="w-full py-4 rounded-xl font-bold text-center bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Plan Actual Activo
            </div>
          ) : (
            <ProSubscriptionButtons type="basic" />
          )}
        </div>

        {/* PLAN PRO */}
        <div className="glass-panel rounded-3xl p-8 relative border-amber-500/30 shadow-[0_0_50px_-12px_rgba(245,158,11,0.15)] flex flex-col h-full overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-xs font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
            Recomendado
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-400" /> Plan PRO
            </h2>
            <p className="text-slate-400 text-sm">Para negocios que quieren escalar y cruzar datos.</p>
          </div>
          
          <div className="mb-8">
            <div className="flex items-end gap-1">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">$2.000</span>
              <span className="text-slate-400 mb-1">/mes</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">* Alta inicial por única vez: $110.000 (Incluye 1er mes y Kit VIP)</p>
          </div>

          <div className="space-y-4 flex-grow mb-8">
            <Feature included text="Todas las funciones del Plan Básico" />
            <Feature included text="Múltiples sucursales ilimitadas" />
            <Feature included text="Gestión de empleados y cajeros" />
            <Feature included text="Afinidad de rubros (¿Dónde más compran?)" />
            <Feature included text="Mapa de calor de ventas (Próximamente)" />
            <Feature included text="Soporte prioritario por WhatsApp" />
          </div>

          {profile.plan_type === 'pro' && profile.mp_subscription_status === 'authorized' ? (
            <div className="w-full py-4 rounded-xl font-bold text-center bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Plan PRO Activo
            </div>
          ) : (
            <ProSubscriptionButtons type="pro" />
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
