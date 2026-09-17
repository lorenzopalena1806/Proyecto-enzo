import Link from 'next/link';
import { ArrowRight, QrCode, Store, TrendingUp, Users, Star, CheckCircle2, ShieldCheck, Zap, BarChart3, Gift, Wallet, Smartphone, Banknote, CreditCard } from 'lucide-react';
import { Navbar } from '@/components/marketing/Navbar';
import { ClientDownloadButton } from '@/components/shared/ClientDownloadButton';
import { createAdminClient, createClient } from '@/lib/supabase-server';
import { FeaturesTabs } from '@/components/marketing/FeaturesTabs';
import { FloatingWhatsApp } from '@/components/marketing/FloatingWhatsApp';
import { FadeIn } from '@/components/shared/FadeIn';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  alternates: {
    canonical: 'https://lazoo.com.ar',
  },
};

export default async function Home() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (user) {
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role === 'superadmin') redirect('/admin');
    else if (profile?.role === 'merchant') redirect('/dashboard');
    else redirect('/client/qr');
  }

  return (
    <div className="min-h-screen bg-[#060D1A] text-slate-50 selection:bg-cyan-500/30 font-sans overflow-x-hidden">

      {/* Background ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-400/8 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-24 sm:pt-28">
        
        {/* ✨ HERO ✨ */}
        <section className="relative pt-8 pb-20 lg:pt-16 lg:pb-16 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left text */}
              <div className="space-y-8 text-center lg:text-left z-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md text-sm font-medium text-cyan-300">
                  <SparklesIcon className="w-4 h-4" />
                  <span>El primer club de beneficios de tu ciudad</span>
                </div>

                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1]">
                  <span className="text-white">Convertí visitas en </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-400">
                    clientes fieles.
                  </span>
                </h1>

                <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Lazoo es la plataforma que permite a comercios ofrecer descuentos exclusivos usando un simple código QR. Aumentá tus ventas y hacé que tus clientes vuelvan todos los días.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
                  <Link
                    href="/auth/register?role=merchant"
                    className="group relative flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_8px_rgba(6,182,212,0.25)]"
                  >
                    Unir mi comercio
                    <ArrowRight className="relative h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/auth/login"
                    className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl bg-white/5 hover:bg-white/10 border border-cyan-500/20 hover:border-cyan-400/40 text-white font-semibold text-lg transition-all backdrop-blur-sm"
                  >
                    Ya tengo cuenta
                  </Link>
                </div>
              </div>

              {/* Right Visuals - App Mockups */}
              <div className="relative hidden lg:block z-10 h-[500px]">
                {/* Dashboard Mockup (Back) */}
                <div className="absolute top-0 right-0 w-[450px] h-[350px] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 flex flex-col overflow-hidden backdrop-blur-md">
                  <div className="h-10 border-b border-slate-700/50 bg-slate-800/50 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500"/><div className="w-3 h-3 rounded-full bg-amber-500"/><div className="w-3 h-3 rounded-full bg-emerald-500"/></div>
                    <div className="mx-auto w-32 h-4 bg-slate-700/50 rounded-full" />
                  </div>
                  <div className="p-6 flex-1 flex gap-4">
                    <div className="w-1/3 flex flex-col gap-3">
                      <div className="w-full h-8 bg-cyan-500/20 rounded-lg" />
                      <div className="w-full h-8 bg-slate-800 rounded-lg" />
                      <div className="w-full h-8 bg-slate-800 rounded-lg" />
                    </div>
                    <div className="w-2/3 flex flex-col gap-4">
                      <div className="flex gap-4">
                        <div className="w-1/2 h-20 bg-slate-800 rounded-xl flex items-center p-3 border border-slate-700">
                           <BarChart3 className="w-8 h-8 text-cyan-400 opacity-50" />
                        </div>
                        <div className="w-1/2 h-20 bg-slate-800 rounded-xl flex items-center p-3 border border-slate-700">
                           <Users className="w-8 h-8 text-emerald-400 opacity-50" />
                        </div>
                      </div>
                      <div className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2">
                         <div className="w-3/4 h-4 bg-slate-700 rounded-full" />
                         <div className="w-full h-24 bg-gradient-to-t from-cyan-500/20 to-transparent mt-auto rounded-b-lg border-b-2 border-cyan-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Mockup (Front) */}
                <div className="absolute bottom-0 left-10 w-[240px] h-[480px] bg-slate-950 border-[6px] border-slate-800 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] -rotate-6 hover:-rotate-0 transition-transform duration-500 flex flex-col overflow-hidden z-20">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-30" />
                  <div className="p-4 pt-10 flex flex-col h-full bg-gradient-to-b from-blue-900/20 to-slate-950">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                        <QrCode className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="w-20 h-4 bg-slate-800 rounded-full" />
                    </div>
                    <div className="flex-1 bg-white rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
                       <div className="absolute top-0 w-full h-8 bg-amber-400 flex items-center justify-center text-amber-900 text-[10px] font-bold">15% DESCUENTO APLICADO</div>
                       <div className="w-32 h-32 mt-4 bg-black rounded-lg p-2 flex items-center justify-center">
                          <QrCode className="w-24 h-24 text-white" />
                       </div>
                       <div className="mt-4 w-24 h-3 bg-slate-200 rounded-full" />
                    </div>
                    <div className="mt-6 flex justify-around">
                       <div className="w-12 h-12 bg-slate-800 rounded-full" />
                       <div className="w-12 h-12 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
                       <div className="w-12 h-12 bg-slate-800 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* ✨ MARQUEE - CATEGORIES ✨ */}
        <div className="py-4 border-y border-cyan-500/10 bg-black/20 overflow-hidden w-full relative">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#060D1A] to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#060D1A] to-transparent z-10" />
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
            .animate-marquee { animation: marquee 35s linear infinite; }
            .hover-pause:hover { animation-play-state: paused; }
            
            @keyframes scan-line { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
            .animate-scan { animation: scan-line 2s ease-in-out infinite; }
          ` }} />
          <div className="flex w-max animate-marquee hover-pause items-center">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex shrink-0 gap-12 sm:gap-24 items-center px-6 sm:px-12">
                {['Panaderías', 'Verdulerías', 'Carnicerías', 'Fiambrerías', 'Despensas', 'Kioscos', 'Heladerías', 'Ferreterías', 'Bares', 'Peluquerías'].map((cat, j) => (
                  <span key={j} className="text-xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-800 uppercase tracking-widest whitespace-nowrap">
                    {cat}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ✨ LOGO CAROUSEL - IDEA 3 ✨ */}
        <section className="pt-24 pb-12 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <p className="text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-10">Confían en nuestra tecnología</p>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 transition-all duration-500">
              {/* Real and Placeholder logos */}
              <div className="flex flex-col items-center justify-center gap-3 hover:scale-105 transition-transform cursor-pointer">
                <img src="/logos/pepis.png" alt="Pepi's Lomos" className="h-28 w-auto object-contain drop-shadow-xl" />
                <span className="text-white font-black text-lg tracking-wide">PEPI'S LOMOS</span>
              </div>
              <div className="flex flex-col items-center gap-2 font-black text-xl text-slate-400 opacity-50"><TrendingUp className="w-8 h-8 text-slate-500"/> MERCADO NORTE</div>
              <div className="flex flex-col items-center gap-2 font-black text-xl text-slate-400 opacity-50"><Users className="w-8 h-8 text-slate-500"/> RED CARNES</div>
              <div className="flex flex-col items-center gap-2 font-black text-xl text-slate-400 opacity-50"><Zap className="w-8 h-8 text-slate-500"/> KIOSCO 24HS</div>
              <div className="flex flex-col items-center gap-2 font-black text-xl text-slate-400 opacity-50"><Gift className="w-8 h-8 text-slate-500"/> REGALOS VIP</div>
            </div>
            <p className="text-slate-500 text-xs mt-10">Próximamente más locales adheridos a la red</p>
          </div>
        </section>

        {/* ✨ PAYMENTS - IDEA 5 ✨ */}
        <FadeIn>
          <section className="py-16 relative">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-[#060D1A] border border-cyan-500/20 p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-cyan-900/20">
                {/* Decoration */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
                
                <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                  <div className="space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 mb-2">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                      Cobrá como siempre, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">fidelizá como nunca.</span>
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                      Lazoo no procesa tus pagos ni cobra comisiones por venta. Nosotros nos encargamos de validar al cliente y calcular el descuento al instante.
                    </p>
                    <p className="text-white font-semibold flex items-center gap-2 justify-center md:justify-start">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" /> La plata va directo a tu bolsillo.
                    </p>
                  </div>
                  
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-inner">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest text-center mb-6">Medios de pago que podés aceptar</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                        <Banknote className="w-8 h-8 text-emerald-400 mb-2" />
                        <span className="text-sm font-medium">Efectivo</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                        <Smartphone className="w-8 h-8 text-blue-400 mb-2" />
                        <span className="text-sm font-medium">Transferencia</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                        <CreditCard className="w-8 h-8 text-amber-400 mb-2" />
                        <span className="text-sm font-medium">Tarjetas</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
                        <Wallet className="w-8 h-8 text-cyan-400 mb-2 relative z-10" />
                        <span className="text-sm font-medium relative z-10">Billeteras Virtuales</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* ✨ FAST DEMO - IDEA 4 ✨ */}
        <section className="py-24 relative overflow-hidden border-y border-cyan-500/10 bg-black/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Escaneá en menos de 3 segundos</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">No demorás la fila de la caja. El proceso es tan rápido como leer un código QR.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
              <div className="absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 hidden md:block -translate-y-1/2 z-0" />
              
              {/* Step 1 */}
              <div className="relative z-10 bg-[#060D1A] border border-slate-800 p-6 rounded-3xl text-center shadow-xl flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-900 text-slate-400 rounded-full flex items-center justify-center font-bold text-xl mb-6 border border-slate-800">1</div>
                <div className="w-32 h-32 bg-slate-900 rounded-2xl border border-slate-700 flex items-center justify-center mb-6 relative overflow-hidden">
                   <QrCode className="w-16 h-16 text-white" />
                   {/* Animated scan line */}
                   <div className="absolute left-0 w-full h-1 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)] animate-scan" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Cliente abre la app</h3>
                <p className="text-sm text-slate-400">Prepara el escáner de Lazoo en su celular.</p>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 bg-[#060D1A] border border-cyan-500/30 p-6 rounded-3xl text-center shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)] flex flex-col items-center transform md:-translate-y-4">
                <div className="w-12 h-12 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-cyan-500/50">2</div>
                <div className="w-32 h-32 bg-slate-900 rounded-2xl border border-cyan-500/50 flex items-center justify-center mb-6 relative">
                   <Store className="w-16 h-16 text-cyan-400" />
                   <div className="absolute inset-0 border-2 border-cyan-400 rounded-2xl animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Lee tu mostrador</h3>
                <p className="text-sm text-slate-400">Apunta al código QR impreso en tu caja.</p>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 bg-[#060D1A] border border-emerald-500/30 p-6 rounded-3xl text-center shadow-xl flex flex-col items-center">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center font-bold text-xl mb-6">3</div>
                <div className="w-32 h-32 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex flex-col items-center justify-center mb-6">
                   <span className="text-2xl font-black text-emerald-400">-15%</span>
                   <CheckCircle2 className="w-8 h-8 text-emerald-400 mt-2" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Descuento aplicado</h3>
                <p className="text-sm text-slate-400">Pagá el monto final, el cliente se va feliz.</p>
              </div>

            </div>
          </div>
        </section>

        {/* ✨ PURPOSE ✨ */}
        <FadeIn>
          <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#060D1A] via-cyan-900/10 to-[#060D1A]" />
            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Nuestro Propósito</h2>
              <div className="relative p-8 md:p-12 rounded-3xl bg-white/5 border border-cyan-500/20 backdrop-blur-md shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur-2xl opacity-50" />
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
                  Creemos que los comercios de barrio son el corazón de la ciudad. Nacimos para darles la misma tecnología de fidelización que usan las grandes cadenas, pero fácil de usar. Nuestro objetivo es que <strong className="text-cyan-400 font-bold">los locales vendan más</strong> atrayendo nuevos clientes y <strong className="text-cyan-400 font-bold">los vecinos ahorren</strong> en su día a día.
                </p>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* ✨ FEATURES ✨ */}
        <FadeIn>
          <section id="features" className="py-12 relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <FeaturesTabs />
            </div>
          </section>
        </FadeIn>

        {/* ✨ TESTIMONIALS ✨ */}
        <section className="py-24 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Locales que ya crecen con Lazoo</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Martina L.', biz: 'Cafetería La Esquina', text: '"Los martes eran un día muerto. Desde que sumamos el descuento de la red, se llena de clientes nuevos que nos descubrieron por la app."' },
                { name: 'Jorge M.', biz: 'Verdulería El Sol', text: '"Es comodísimo. Yo les muestro el QR de la verdulería, el cliente escanea con su celu y ya le queda el descuento aplicado. Muy fácil."' },
                { name: 'Sofía R.', biz: 'Peluquería Style', text: '"Lo que más me gusta es el descuento de Dueño a Dueño. Cuando voy a comprar la comida para el local, uso mi descuento B2B."' }
              ].map((t, i) => (
                <div key={i} className="rounded-3xl border border-cyan-500/15 bg-white/3 p-8 backdrop-blur-sm relative">
                  <div className="text-cyan-500/20 absolute top-4 right-6 text-6xl font-serif">&quot;</div>
                  <p className="text-slate-300 italic mb-6 relative z-10">{t.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">{t.name.charAt(0)}</div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{t.name}</h4>
                      <p className="text-cyan-400 text-xs">{t.biz}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ✨ PRICING ✨ */}
        <section id="pricing" className="py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Precios Transparentes</h2>
              <p className="text-slate-400 text-lg">Sumate a la red sin comisiones ocultas.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Client Plan */}
              <div className="rounded-3xl border border-cyan-500/15 bg-white/3 p-8 backdrop-blur-sm flex flex-col hover:border-cyan-400/30 transition-all">
                <div className="mb-8">
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 rounded-full border border-cyan-500/20">Para Clientes</span>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">Gratis</div>
                  <p className="mt-2 text-slate-400">Descargá la app y empezá a ahorrar.</p>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  {['App web para escanear locales', 'Acceso a toda la red de comercios', 'Descuentos exclusivos pagando con transferencia', 'Mayores descuentos pagando en efectivo'].map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />
                      <span className="text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register?role=client" className="w-full py-4 rounded-xl border border-cyan-500/20 text-white font-semibold hover:bg-cyan-500/10 transition-colors text-center">
                  Crear Cuenta Gratis
                </Link>
              </div>

              {/* Merchant Plan */}
              <div className="relative rounded-3xl border border-cyan-400/40 bg-cyan-500/5 p-8 backdrop-blur-sm flex flex-col shadow-[0_0_50px_-10px_rgba(6,182,212,0.2)]">
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-cyan-900/30">
                    <Star className="w-3 h-3 fill-current" /> Todas las funciones
                  </span>
                </div>
                <div className="mb-8">
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 rounded-full border border-cyan-500/20">Para Comercios</span>
                  <div className="mt-4 flex items-baseline text-4xl sm:text-5xl font-extrabold text-white">Suscripción</div>
                  <p className="mt-2 text-cyan-200/70">Un pago fijo mensual. Sin comisiones por venta.</p>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  {['Panel de control y estadísticas en vivo', 'Sucursales y cajeros ilimitados', 'Pin VIP en el mapa de clientes', 'Kit físico: Porta QR y Stickers oficiales', 'Beneficio exclusivo B2B (Dueño a Dueño)'].map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />
                      <span className="text-slate-200">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register?role=merchant" className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition-all text-center shadow-lg shadow-cyan-900/30">
                  Unir mi Comercio
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ✨ FAQ ✨ */}
        <section id="faq" className="py-24 relative border-t border-cyan-500/10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Preguntas Frecuentes</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { q: '¿Necesito comprar alguna máquina o terminal si soy comercio?', a: '¡No! Todo funciona con tu propio celular, compu o tablet. Solo necesitás mostrarle tu código QR al cliente para que lo escanee.' },
                { q: '¿Me cobran comisión por las ventas que realizo con Lazoo?', a: 'Nunca. Lazoo funciona con una suscripción fija mensual para el comercio. Todas las ventas y cobros son 100% tuyos sin intermediarios.' },
                { q: '¿Cómo recibe la plata mi local?', a: 'Vos cobrás directamente en tu local (en efectivo o transferencia a tu cuenta). Nosotros solo calculamos y aplicamos el descuento por vos para fidelizar al cliente.' },
                { q: '¿Puedo cancelar mi plan cuando quiera?', a: 'Sí, no hay contratos ni letras chicas. Podés pausar tu suscripción en cualquier momento desde tu panel.' },
              ].map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-cyan-500/10 bg-white/3 backdrop-blur-sm [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-6 font-medium text-white hover:text-cyan-300">
                    <span className="text-lg">{faq.q}</span>
                    <span className="ml-4 flex-shrink-0 transition-transform duration-300 group-open:-rotate-180">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-slate-400">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ✨ CTA Final ✨ */}
        <section className="py-24 relative overflow-hidden border-t border-cyan-500/10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#060D1A] via-cyan-900/20 to-[#060D1A]" />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">Llevá tu negocio al próximo nivel</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Sumate a los locales que ya están escalando sus ventas y atrayendo nuevos clientes con Lazoo.
            </p>
            <div className="pt-4">
              <Link
                href="/auth/register?role=merchant"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(6,182,212,0.3)]"
              >
                Comenzar ahora gratis por 7 días
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-cyan-500/10 bg-black/40 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <img src="/logo.png" alt="Lazoo" className="h-10 w-auto rounded-md object-contain" />
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Lazoo. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <Link href="/about" className="hover:text-cyan-400 transition-colors">Sobre Nosotros</Link>
            <Link href="https://lazoo.com.ar/privacy" className="hover:text-cyan-400 transition-colors">Privacidad</Link>
            <Link href="https://lazoo.com.ar/terms" className="hover:text-cyan-400 transition-colors">Términos</Link>
            <a href="https://wa.me/5493512388658" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
      <FloatingWhatsApp />
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
