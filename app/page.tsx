import Link from 'next/link';
import { ArrowRight, QrCode, Store, TrendingUp, Users, Star, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Navbar } from '@/components/marketing/Navbar';
import { createAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const adminClient = createAdminClient();

  // Contar datos reales de la base de datos
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

  const stats = [
    { label: 'Comercios Adheridos', value: merchantCount ? `${merchantCount}` : '0' },
    { label: 'Usuarios Activos', value: clientCount ? `${clientCount}` : '0' },
    { label: 'Descuento Promedio', value: `${avgDiscount}%` },
    { label: 'Transacciones', value: txCount ? `${txCount}` : '0' },
  ];
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-50 selection:bg-violet-500/30 font-sans overflow-x-hidden">
      {/* Background ambient light */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <Navbar />

      <main className="relative z-10">
        {/* ✨ HERO SECTION ✨ */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-violet-300 mb-4 animate-fade-in">
              <SparklesIcon className="w-4 h-4" />
              <span>La nueva era de los beneficios</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 max-w-4xl mx-auto leading-[1.1]">
              Tu red exclusiva de <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-500">
                descuentos inteligentes
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Uní tu comercio a la red que transforma cada venta. Fidelizá clientes, accedé a descuentos B2B y hacé crecer tu negocio con tecnología QR en segundos.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link
                href="/auth/register"
                className="group relative flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_8px_rgba(124,58,237,0.3)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative">Empezar ahora</span>
                <ArrowRight className="relative h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg transition-all"
              >
                Ya tengo cuenta
              </Link>
            </div>

            {/* Metrics Ribbon */}
            <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto border-t border-white/10">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center space-y-1">
                  <span className="text-3xl font-bold text-white tracking-tight">{stat.value}</span>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ✨ FEATURES BENTO GRID ✨ */}
        <section id="features" className="py-24 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Diseñado para impulsar tu comercio</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">Todo lo que necesitás para gestionar beneficios, en una sola plataforma ultra rápida.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 - Large */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/10 p-8 hover:border-violet-500/50 transition-colors">
                <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 mb-6 border border-violet-500/30">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Escáner QR Integrado</h3>
                    <p className="text-slate-400">Olvidate del hardware costoso. Usá la cámara de cualquier celular o tablet para validar descuentos al instante. Cálculo automático según método de pago.</p>
                  </div>
                </div>
              </div>

              {/* Feature 2 - Small */}
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/10 p-8 hover:border-emerald-500/50 transition-colors">
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 mb-6 border border-emerald-500/30">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">100% Seguro</h3>
                    <p className="text-slate-400 text-sm">Cada QR es único y encriptado, evitando fraudes.</p>
                  </div>
                </div>
              </div>

              {/* Feature 3 - Small */}
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/10 p-8 hover:border-blue-500/50 transition-colors">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 mb-6 border border-blue-500/30">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Métricas en Vivo</h3>
                    <p className="text-slate-400 text-sm">Panel de control con estadísticas detalladas de tus ventas.</p>
                  </div>
                </div>
              </div>

              {/* Feature 4 - Large */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/10 p-8 hover:border-pink-500/50 transition-colors">
                <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 mb-6 border border-pink-500/30">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Descuentos B2B Exclusivos</h3>
                    <p className="text-slate-400">Si sos comerciante adherido, obtenés un 25% de descuento fijo en todos los demás comercios de la red. Una comunidad diseñada para potenciarse mutuamente.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ✨ HOW IT WORKS ✨ */}
        <section id="how-it-works" className="py-24 bg-black/40 border-y border-white/5 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">¿Cómo funciona?</h2>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: '01',
                  title: 'Registrate',
                  desc: 'Creá tu cuenta gratis como cliente o suscribite como comerciante en menos de 1 minuto.',
                },
                {
                  step: '02',
                  title: 'Obtené tu QR',
                  desc: 'El sistema generará tu QR personal e intransferible de forma instantánea.',
                },
                {
                  step: '03',
                  title: 'Mostralo o Escaneá',
                  desc: 'Los clientes muestran su QR; los comerciantes lo escanean con un solo toque.',
                },
                {
                  step: '04',
                  title: 'Descuento Aplicado',
                  desc: 'El cálculo se hace solo. Pagá en efectivo o transferencia y disfrutá.',
                },
              ].map((item, i) => (
                <div key={i} className="relative group">
                  <div className="text-6xl font-extrabold text-white/5 absolute -top-8 -left-4 pointer-events-none group-hover:text-violet-500/10 transition-colors duration-500">
                    {item.step}
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-400 font-bold group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
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

        {/* ✨ PRICING ✨ */}
        <section id="pricing" className="py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Planes Transparentes</h2>
              <p className="text-slate-400 text-lg">Sumate a la red sin letras chicas.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Client Plan */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm flex flex-col">
                <div className="mb-8">
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white/5 rounded-full border border-white/5">Cliente</span>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                    Gratis
                  </div>
                  <p className="mt-2 text-slate-400">Para siempre. Tu pase de ahorro.</p>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  {[
                    'QR único personal',
                    'Acceso a toda la red de comercios',
                    '10% de descuento con transferencia',
                    '15% de descuento en efectivo',
                    'Soporte estándar',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <span className="text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register?role=client"
                  className="w-full py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors text-center"
                >
                  Registrarme Gratis
                </Link>
              </div>

              {/* Merchant Plan */}
              <div className="relative rounded-3xl border border-violet-500/50 bg-violet-950/20 p-8 backdrop-blur-sm flex flex-col shadow-[0_0_40px_-10px_rgba(124,58,237,0.15)]">
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-current" /> Recomendado
                  </span>
                </div>
                <div className="mb-8">
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300 bg-violet-500/10 rounded-full border border-violet-500/20">Comerciante</span>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                    Personalizado
                  </div>
                  <p className="mt-2 text-violet-200/70">Plan activado por el administrador.</p>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  {[
                    'Todo lo del plan Cliente',
                    'Panel de Comerciante ultra rápido',
                    'Escáner de QR web integrado',
                    'Historial de métricas en vivo',
                    'Descuento B2B del 25% en la red',
                    'Material de marketing mensual',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-violet-400 shrink-0" />
                      <span className="text-slate-200">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register?role=merchant"
                  className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all text-center shadow-lg shadow-violet-900/30"
                >
                  Solicitar Suscripción
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ✨ CTA ✨ */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-violet-900/20 mix-blend-screen" />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">Listo para transformar tu negocio?</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Sumate a cientos de comercios que ya están escalando sus ventas con RedBeneficios.
            </p>
            <div className="pt-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-white text-black font-extrabold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                Comenzar ahora
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">RedBeneficios</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} RedBeneficios. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
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
