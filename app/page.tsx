import Link from 'next/link';
import { Store, QrCode, ScanLine, ImageIcon, Shield, TrendingUp, Users, CheckCircle2, Star, ArrowRight, Zap } from 'lucide-react';

export const metadata = {
  title: 'RedBeneficios — Red de Descuentos B2B para Comercios',
  description:
    'La plataforma SaaS que conecta comercios locales con una red de descuentos inteligente. Generá fidelidad, atraé clientes y potenciá tu marketing.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                <Store className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">RedBeneficios</span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">Funcionalidades</a>
              <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">Cómo funciona</a>
              <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Precios</a>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2"
              >
                Ingresar
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all duration-200 shadow-lg shadow-violet-900/40"
              >
                Comenzar gratis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        {/* Fondo con gradiente */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-800/60 bg-violet-950/40 px-4 py-1.5 text-sm text-violet-300 mb-6">
            <Zap className="h-3.5 w-3.5" />
            <span>Plataforma SaaS B2B para comercios locales</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            La red de beneficios que{' '}
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              potencia tu comercio
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-400 text-lg mb-8">
            Generá descuentos inteligentes con QR, atraé clientes de otros comercios
            de la red y accedé a tu material de marketing personalizado — todo en un solo panel.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register?role=merchant"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all duration-200 shadow-2xl shadow-violet-900/50 hover:scale-[1.02] active:scale-[0.99]"
            >
              Suscribirme ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/register?role=client"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:border-slate-600 font-medium transition-all duration-200"
            >
              Soy cliente, quiero mi QR gratis
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Sin tarjeta requerida
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Configuración en minutos
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Cancela cuando quieras
            </div>
          </div>
        </div>
      </section>

      {/* ── DESCUENTOS GRID ─────────────────────────────────── */}
      <section className="py-12 bg-slate-900/50 border-y border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm text-slate-500 mb-6 uppercase tracking-wider font-medium">
            Sistema de descuentos automáticos
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { pct: '10%', label: 'Cliente + Transferencia', color: 'border-blue-800 bg-blue-950/30', badge: 'text-blue-400' },
              { pct: '15%', label: 'Cliente + Efectivo', color: 'border-violet-800 bg-violet-950/30', badge: 'text-violet-400' },
              { pct: '25%', label: 'Comerciante + Efectivo', color: 'border-emerald-800 bg-emerald-950/30', badge: 'text-emerald-400', isB2B: true },
            ].map((item) => (
              <div
                key={item.pct}
                className={`flex items-center gap-4 rounded-xl border p-4 ${item.color}`}
              >
                <div className={`text-4xl font-bold ${item.badge}`}>{item.pct}</div>
                <div>
                  <p className="text-white font-medium text-sm">{item.label}</p>
                  {item.isB2B && (
                    <span className="text-xs text-emerald-500 font-medium">⭐ Beneficio B2B</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-600 mt-4">
            Válido de Lunes a Jueves · Solo efectivo o transferencia · QR dinámico y seguro
          </p>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ─────────────────────────────────── */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Todo lo que necesitás para crecer</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Una suite completa de herramientas diseñadas específicamente para comercios locales
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: QrCode,
                title: 'QR Dinámico Único',
                desc: 'Cada usuario recibe un código QR personal y seguro, listo para descargar y compartir.',
                color: 'bg-violet-900/40 border-violet-800',
                iconColor: 'text-violet-400',
              },
              {
                icon: ScanLine,
                title: 'Escáner Inteligente',
                desc: 'Escanéa el QR de cualquier cliente o comerciante y el sistema calcula el descuento automáticamente.',
                color: 'bg-blue-900/40 border-blue-800',
                iconColor: 'text-blue-400',
              },
              {
                icon: ImageIcon,
                title: 'Marketing Personalizado',
                desc: 'El SuperAdmin sube tus carruseles de Instagram y publicidades directamente a tu perfil.',
                color: 'bg-emerald-900/40 border-emerald-800',
                iconColor: 'text-emerald-400',
              },
              {
                icon: Shield,
                title: 'Roles y Seguridad',
                desc: 'Tres niveles de acceso: SuperAdmin, Comerciante y Cliente. Cada uno ve solo lo que necesita.',
                color: 'bg-amber-900/40 border-amber-800',
                iconColor: 'text-amber-400',
              },
              {
                icon: TrendingUp,
                title: 'Historial de Transacciones',
                desc: 'Registramos cada escaneo con fecha, monto, descuento y método de pago para tu control.',
                color: 'bg-pink-900/40 border-pink-800',
                iconColor: 'text-pink-400',
              },
              {
                icon: Users,
                title: 'Red B2B',
                desc: 'Los comerciantes se benefician entre sí con un 25% de descuento exclusivo en efectivo.',
                color: 'bg-indigo-900/40 border-indigo-800',
                iconColor: 'text-indigo-400',
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`rounded-2xl border p-5 space-y-3 hover:scale-[1.01] transition-transform duration-200 ${f.color}`}
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/60 ${f.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-white font-semibold">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ───────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-slate-900/50 border-y border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">¿Cómo funciona?</h2>
            <p className="text-slate-400">Empezá en menos de 5 minutos</p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: '01',
                title: 'Suscribite como Comerciante',
                desc: 'El SuperAdmin activa tu suscripción y configura tu perfil con tus materiales de marketing.',
              },
              {
                step: '02',
                title: 'Compartí tu QR',
                desc: 'Descargá y mostrá tu QR único en tu comercio para acceder a descuentos en la red.',
              },
              {
                step: '03',
                title: 'Escaneá el QR de tus clientes',
                desc: 'Cuando alguien quiere un descuento, escaneás su QR, elegís el método de pago y el sistema aplica el porcentaje automáticamente.',
              },
              {
                step: '04',
                title: 'Descargá tu material de marketing',
                desc: 'Accedé a tus carruseles e imágenes personalizadas para publicar en tus redes sociales.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-900 border border-violet-700 text-violet-300 font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Planes simples y transparentes</h2>
            <p className="text-slate-400">Sin sorpresas, sin letras chicas</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Plan Cliente */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 space-y-5">
              <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Cliente</p>
                <p className="text-4xl font-bold text-white mt-2">Gratis</p>
                <p className="text-slate-500 text-sm mt-1">Para siempre</p>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {[
                  'QR único personal',
                  'Descuentos en la red de comercios',
                  '10% con transferencia',
                  '15% en efectivo',
                  'Sin costo de activación',
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register?role=client"
                className="block text-center py-3 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 font-medium transition-all"
              >
                Registrarme gratis
              </Link>
            </div>

            {/* Plan Comerciante */}
            <div className="relative rounded-2xl border border-violet-600 bg-violet-950/30 p-6 space-y-5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center gap-1">
                  <Star className="h-3 w-3" /> Recomendado
                </span>
              </div>
              <div>
                <p className="text-violet-300 text-sm font-medium uppercase tracking-wider">Comerciante</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <p className="text-4xl font-bold text-white">Personalizado</p>
                </div>
                <p className="text-slate-400 text-sm mt-1">Precio según plan activado por el administrador</p>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {[
                  'Todo lo del plan Cliente',
                  'Panel de Comerciante completo',
                  'Escáner de QR ilimitado',
                  'Historial de transacciones',
                  'Galería de marketing personalizada',
                  '25% de descuento B2B entre comerciantes',
                  'Soporte prioritario',
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-violet-400 flex-shrink-0" />
                    <span className="text-slate-300">{feat}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register?role=merchant"
                className="block text-center py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-lg shadow-violet-900/40"
              >
                Suscribirme como Comerciante
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────── */}
      <section className="py-20 border-t border-slate-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">
            ¿Listo para unirte a la red?
          </h2>
          <p className="text-slate-400 text-lg">
            Miles de comerciantes ya están ahorrando y fidelizando clientes con RedBeneficios.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg transition-all duration-200 shadow-2xl shadow-violet-900/50 hover:scale-[1.02]"
            >
              Empezar ahora — Es gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600">
              <Store className="h-3 w-3 text-white" />
            </div>
            <span className="text-slate-400 text-sm font-medium">RedBeneficios</span>
          </div>
          <p className="text-slate-600 text-sm">
            © 2025 RedBeneficios. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-sm text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Términos</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
