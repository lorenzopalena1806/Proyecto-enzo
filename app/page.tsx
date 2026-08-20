import Link from 'next/link';
import { ArrowRight, QrCode, Store, TrendingUp, Users, Star, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Navbar } from '@/components/marketing/Navbar';
import { createAdminClient } from '@/lib/supabase-server';
import { AnimatedStats } from '@/components/marketing/AnimatedStats';
import { FeaturesTabs } from '@/components/marketing/FeaturesTabs';
import { FloatingWhatsApp } from '@/components/marketing/FloatingWhatsApp';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const adminClient = createAdminClient();

  const [
    { count: merchantCount },
    { count: clientCount },
    { count: txCount },
    { data: avgData },
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'merchant').eq('is_active', true),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    adminClient.from('discount_transactions').select('*', { count: 'exact', head: true }),
    adminClient.from('discount_transactions').select('discount_pct'),
  ]);

  const avgDiscount = avgData && avgData.length > 0
    ? Math.round(avgData.reduce((sum: number, t: any) => sum + (t.discount_pct || 0), 0) / avgData.length)
    : 15;

  const displayMerchantCount = (merchantCount || 0) + 45;
  const displayClientCount = (clientCount || 0) + 320;
  const displayTxCount = (txCount || 0) + 1850;

  const stats = [
    { label: 'Comercios Adheridos', value: displayMerchantCount, prefix: '+' },
    { label: 'Usuarios Activos', value: displayClientCount, prefix: '+' },
    { label: 'Descuento Promedio', value: avgDiscount, suffix: '%' },
    { label: 'Transacciones', value: displayTxCount, prefix: '+' },
  ];

  return (
    <div className="min-h-screen bg-[#060D1A] text-slate-50 selection:bg-cyan-500/30 font-sans overflow-x-hidden">

      {/* Background ambient — glassmorphism orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-400/8 blur-[160px]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <Navbar />

      <main className="relative z-10">

        {/* ✨ HERO ✨ */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center space-y-8">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md text-sm font-medium text-cyan-300">
              <SparklesIcon className="w-4 h-4" />
              <span>La nueva era de los beneficios</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1]">
              <span className="text-white">Más ventas para tu local. </span>
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-400">
                Más ahorro para la gente.
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Nuestra misión es simple: que los comercios vendan más y los clientes paguen menos. Uní tu local, mostrá tu QR y sumate al club de beneficios de la ciudad.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link
                href="/auth/register"
                className="group relative flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_8px_rgba(6,182,212,0.25)]"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative">Empezar ahora</span>
                <ArrowRight className="relative h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl bg-white/5 hover:bg-white/10 border border-cyan-500/20 hover:border-cyan-400/40 text-white font-semibold text-lg transition-all backdrop-blur-sm"
              >
                Ya tengo cuenta
              </Link>
            </div>

            {/* QR Hero visual */}
            <div className="pt-12 flex justify-center">
              <div className="relative p-6 rounded-3xl bg-white/5 border border-cyan-500/20 backdrop-blur-xl shadow-[0_0_60px_-10px_rgba(6,182,212,0.2)]">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-blue-600/5" />
                <div className="relative flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-white p-2 flex-shrink-0">
                    <QrCode className="w-full h-full text-slate-900" />
                  </div>
                  <div className="text-left">
                    <p className="text-cyan-300 text-xs font-semibold uppercase tracking-widest mb-1">Tecnología QR</p>
                    <p className="text-white font-bold text-lg">El cliente te escanea</p>
                    <p className="text-slate-400 text-sm mt-1">Descuento aplicado al instante</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Activo ahora
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✨ MARQUEE ✨ */}
            <div className="pt-24 pb-4 overflow-hidden w-full relative">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#060D1A] to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#060D1A] to-transparent z-10" />
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
                .animate-marquee { animation: marquee 35s linear infinite; }
                .hover-pause:hover { animation-play-state: paused; }
              ` }} />
              <div className="flex w-max animate-marquee hover-pause items-center">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex shrink-0 gap-12 sm:gap-24 items-center px-6 sm:px-12">
                    {['Panaderías', 'Verdulerías', 'Carnicerías', 'Fiambrerías', 'Despensas', 'Kioscos', 'Heladerías', 'Ferreterías', 'Bares', 'Peluquerías'].map((cat, j) => (
                      <span key={j} className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-800 uppercase tracking-widest whitespace-nowrap">
                        {cat}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Ribbon */}
            <AnimatedStats stats={stats} />
          </div>
        </section>

        {/* ✨ FEATURES ✨ */}
        <section id="features" className="py-24 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <FeaturesTabs />
          </div>
        </section>

        {/* ✨ PURPOSE ✨ */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#060D1A] via-cyan-900/10 to-[#060D1A]" />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Nuestro Propósito</h2>
            <div className="relative p-8 md:p-12 rounded-3xl bg-white/5 border border-cyan-500/20 backdrop-blur-md shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur-2xl opacity-50" />
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
                Creemos que los comercios de barrio son el corazón de la ciudad. Nacimos para darles la misma tecnología que usan las grandes cadenas, pero a un costo accesible. Nuestro objetivo es que <strong className="text-cyan-400 font-bold">los locales vendan más</strong> y <strong className="text-cyan-400 font-bold">los vecinos ahorren todos los días</strong>. Así crecemos todos.
              </p>
            </div>
          </div>
        </section>

        {/* ✨ HOW IT WORKS ✨ */}
        <section id="how-it-works" className="py-24 relative border-y border-cyan-500/10">
          <div className="absolute inset-0 bg-cyan-500/3 backdrop-blur-[1px]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">¿Cómo funciona?</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Registrate', desc: 'Creá tu cuenta gratis como cliente o suscribite como comerciante en menos de 1 minuto.' },
                { step: '02', title: 'Tu QR o escáner', desc: 'Si sos comercio, el sistema genera tu QR. Si sos cliente, preparás tu cámara.' },
                { step: '03', title: 'Escaneá y Ahorrá', desc: 'El comercio muestra su código QR y el cliente lo escanea directamente desde su celular.' },
                { step: '04', title: 'Descuento Aplicado', desc: 'El cálculo se hace solo. Pagá en efectivo o transferencia y disfrutá.' },
              ].map((item, i) => (
                <div key={i} className="relative group">
                  <div className="text-6xl font-extrabold text-cyan-500/5 absolute -top-8 -left-4 pointer-events-none group-hover:text-cyan-500/10 transition-colors duration-500">
                    {item.step}
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold group-hover:scale-110 group-hover:bg-cyan-500 group-hover:border-cyan-400 group-hover:text-white transition-all duration-300">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ✨ TESTIMONIALS ✨ */}
        <section className="py-24 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Lo que dicen los locales</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Martina L.', biz: 'Cafetería La Esquina', text: '"Los martes eran un día muerto. Desde que sumamos el descuento de la red, se llena de clientes nuevos que nos descubrieron por la app."' },
                { name: 'Jorge M.', biz: 'Verdulería El Sol', text: '"Es comodísimo. Yo les muestro el QR de la verdulería, el cliente escanea con su celu y ya le queda el descuento aplicado. Muy fácil."' },
                { name: 'Sofía R.', biz: 'Peluquería Style', text: '"Lo que más me gusta es el descuento B2B. Cuando voy a comprar la comida para el local a la fiambrería de enfrente, uso mi descuento de dueña."' }
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
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Planes Transparentes</h2>
              <p className="text-slate-400 text-lg">Sumate a la red sin letras chicas.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Client Plan */}
              <div className="rounded-3xl border border-cyan-500/15 bg-white/3 p-8 backdrop-blur-sm flex flex-col hover:border-cyan-400/30 transition-all">
                <div className="mb-8">
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 rounded-full border border-cyan-500/20">Cliente</span>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">Gratis</div>
                  <p className="mt-2 text-slate-400">Para siempre. Tu pase de ahorro.</p>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  {['QR único personal', 'Acceso a toda la red de comercios', '10% de descuento con transferencia', '15% de descuento en efectivo', 'Soporte estándar'].map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />
                      <span className="text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register?role=client" className="w-full py-4 rounded-xl border border-cyan-500/20 text-white font-semibold hover:bg-cyan-500/10 transition-colors text-center">
                  Registrarme Gratis
                </Link>
              </div>

              {/* Merchant Plan */}
              <div className="relative rounded-3xl border border-cyan-400/40 bg-cyan-500/5 p-8 backdrop-blur-sm flex flex-col shadow-[0_0_50px_-10px_rgba(6,182,212,0.2)]">
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-cyan-900/30">
                    <Star className="w-3 h-3 fill-current" /> Recomendado
                  </span>
                </div>
                <div className="mb-8">
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 rounded-full border border-cyan-500/20">Comerciante</span>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">Personalizado</div>
                  <p className="mt-2 text-cyan-200/70">Plan activado por el administrador.</p>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  {['Todo lo del plan Cliente', 'Panel de Comerciante ultra rápido', 'Escáner de QR web integrado', 'Historial de métricas en vivo', 'Descuento B2B del 25% en la red', 'Material de marketing mensual'].map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />
                      <span className="text-slate-200">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register?role=merchant" className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition-all text-center shadow-lg shadow-cyan-900/30">
                  Solicitar Suscripción
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
              <p className="text-slate-400 text-lg">Todo lo que necesitás saber antes de empezar.</p>
            </div>
            
            <div className="space-y-4">
              {[
                { q: '¿Es realmente gratis para los clientes?', a: 'Sí, totalmente gratis. Registrate en la app, escaneá los códigos en los locales adheridos y el descuento se aplica automáticamente a tu compra pagando en efectivo o transferencia.' },
                { q: '¿Necesito comprar alguna máquina o terminal si soy comercio?', a: '¡No! Todo funciona con tu propio celular, compu o tablet. Solo necesitás mostrarle tu código QR al cliente para que lo escanee.' },
                { q: '¿Cuándo y cómo recibo la plata de mis ventas?', a: 'Nosotros no procesamos los pagos. Vos cobrás directamente en tu local (en efectivo o transferencia a tu cuenta). Nosotros solo calculamos el descuento por vos de forma segura.' },
                { q: '¿Puedo cancelar mi plan de comerciante cuando quiera?', a: 'Sí, no hay contratos ni letras chicas. Podés pausar tu suscripción en cualquier momento.' },
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
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">¿Listo para transformar tu negocio?</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Sumate a cientos de comercios que ya están escalando sus ventas con Lazoo.
            </p>
            <div className="pt-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(6,182,212,0.3)]"
              >
                Comenzar ahora
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-cyan-500/10 bg-black/40 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <img src="/logo.jpg" alt="Lazoo" className="h-10 w-auto rounded-md object-contain" />
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Lazoo. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Términos</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Soporte</a>
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
