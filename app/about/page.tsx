import Link from 'next/link';
import { ArrowLeft, Users, Zap, Shield, Heart } from 'lucide-react';

export const metadata = {
  title: 'Sobre Nosotros | Lazoo',
  description: 'Conoce la historia detrás de Lazoo, nuestra misión y el equipo que trabaja para revolucionar los beneficios.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#060D1A] text-slate-50 font-sans overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* Background ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" />
          Volver a la web
        </Link>

        {/* Hero Section */}
        <div className="text-center space-y-6 mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-sm font-medium text-cyan-300">
            <Heart className="w-4 h-4" />
            <span>Nuestra Historia</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Nacimos para conectar a <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
              tu ciudad entera.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Lazoo no es solo una app, es un movimiento. Creemos que los comercios locales y sus clientes merecen una herramienta justa, rápida y transparente para ganar juntos.
          </p>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6">
              <Zap className="text-cyan-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Velocidad</h3>
            <p className="text-slate-400 leading-relaxed">
              Eliminamos los plásticos, los cupones de papel y la fricción. Un QR, un escaneo y el beneficio está aplicado en un segundo.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
              <Users className="text-blue-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Comunidad</h3>
            <p className="text-slate-400 leading-relaxed">
              Queremos que la plata circule en el barrio. Potenciamos a los emprendedores locales para que compitan con los gigantes.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
              <Shield className="text-indigo-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Transparencia</h3>
            <p className="text-slate-400 leading-relaxed">
              Sin letras chicas. No retenemos dinero ni cobramos comisiones por venta. Tu plata es tuya, en el acto.
            </p>
          </div>
        </div>

        {/* The Team / Reality check */}
        <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border border-cyan-500/20 rounded-[2.5rem] p-8 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Hecho con ❤️ desde Córdoba</h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
            Lazoo fue creado por personas reales que entienden lo difícil que es mantener un comercio hoy en día. Nos cansamos de ver cómo los grandes programas de beneficios cobraban comisiones ridículas, así que armamos nuestra propia red.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-8 py-4 rounded-2xl bg-cyan-500 text-white font-bold transition-all hover:scale-105 hover:bg-cyan-400 shadow-lg shadow-cyan-500/25"
            >
              Sumate a la revolución
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
