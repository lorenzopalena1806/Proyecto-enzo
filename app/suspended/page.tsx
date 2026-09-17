import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { AlertTriangle, MapPin, Zap, Star, ExternalLink, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ProSubscriptionButtons } from '@/app/dashboard/pro/ProSubscriptionButtons';
import { LogoutButton } from '@/components/dashboard/LogoutButton';

export const metadata = {
  title: 'Cuenta Suspendida | Lazoo',
};

export default async function SuspendedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user role and status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/auth/login');
  }

  // If user is active, send them to their dashboard
  if (profile.is_active) {
    if (profile.role === 'merchant') redirect('/dashboard');
    if (profile.role === 'client') redirect('/client/qr');
    if (profile.role === 'employee') redirect('/cajero');
    redirect('/');
  }

  const isMerchant = profile.role === 'merchant';
  const userId = user.id;

  // Si es comercio, obtener precios
  let proPrice = 45000;
  if (isMerchant) {
    const { data: settings } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value');
    
    if (settings) {
      const proPriceStr = settings.find(s => s.setting_key === 'pricing_pro')?.setting_value;
      if (proPriceStr) proPrice = parseInt(proPriceStr);
    }
  }

  const formatPrice = (p: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-rose-500/30">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-lg relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Lazoo" className="h-10 w-auto mx-auto mb-6 opacity-50" />
          <div className="inline-flex items-center justify-center p-4 bg-rose-500/10 rounded-full mb-6 border border-rose-500/20">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-3">
            Cuenta Suspendida
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            {isMerchant 
              ? 'Tu local ya no es visible en el mapa y tus códigos QR fueron desactivados.'
              : 'Tu cuenta ha sido inhabilitada temporalmente.'}
          </p>
        </div>

        {/* Action Box */}
        {isMerchant ? (
          <div className="space-y-6">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 text-center">
              <p className="text-rose-200 text-sm">
                Para reactivar tu cuenta y volver a aparecer en Lazoo, necesitás contar con una suscripción activa.
              </p>
            </div>

            <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-amber-500/30 shadow-[0_0_30px_-10px_rgba(245,158,11,0.15)] rounded-3xl p-6 flex flex-col h-full relative overflow-hidden max-w-sm mx-auto">
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Recomendado
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" /> Suscripción
                </h2>
                <p className="text-slate-400 text-sm">Todas las herramientas incluidas.</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">{formatPrice(proPrice)}</span>
                <span className="text-slate-400 text-sm">/mes</span>
              </div>
              <div className="mt-auto">
                <ProSubscriptionButtons type="pro" userId={userId} />
              </div>
            </div>

            <div className="mt-8 flex justify-center flex-col items-center gap-4">
              <a 
                href="https://wa.me/5493512388658" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800"
              >
                ¿Tuviste un problema? Hablá con Soporte <ExternalLink className="w-3 h-3" />
              </a>
              <LogoutButton />
            </div>
          </div>
        ) : (
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 text-center shadow-xl">
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Si creés que esto es un error o querés apelar la suspensión, por favor comunicate con nuestro equipo de soporte.
            </p>
            <div className="flex flex-col gap-3">
              <a 
                href="https://wa.me/5493512388658" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-rose-900/50 flex justify-center items-center gap-2"
              >
                Contactar Soporte <ExternalLink className="w-4 h-4" />
              </a>
              <LogoutButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
