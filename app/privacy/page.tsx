import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-cyan-600/10 blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10 space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Link>

        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-2xl">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Política de Privacidad</h1>
            <p className="text-slate-400 text-sm mt-1">Última actualización: Agosto 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-slate-300 leading-relaxed font-light text-sm md:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Información General</h2>
            <p>
              Lazoo se compromete a proteger la privacidad y seguridad de la información personal de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos tus datos cuando usás nuestra plataforma de beneficios.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Datos que Recopilamos</h2>
            <p>
              Recopilamos información indispensable para el funcionamiento de la red:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><b>Clientes:</b> Dirección de correo electrónico, nombre completo e historial de transacciones de descuentos aplicados.</li>
              <li><b>Comercios:</b> Datos de perfil comercial (Nombre comercial, rubro, dirección física, dirección de Google Maps, logo e historial de transacciones).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Uso de la Información</h2>
            <p>
              La información recopilada se utiliza exclusivamente para:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Generar y validar códigos QR de descuentos únicos.</li>
              <li>Permitir a los comercios adheridos escanear códigos de clientes y registrar la aplicación de promociones.</li>
              <li>Mostrar a los clientes la vidriera de comercios activos de la red.</li>
              <li>Proveer estadísticas de rendimiento y ahorro en el panel del comerciante.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Transacciones y Pagos</h2>
            <p>
              <b>Lazoo no procesa pagos de compras.</b> Todos los pagos se realizan de forma directa y presencial entre el cliente y el comercio adherido (mediante efectivo, transferencia bancaria o los medios que el comercio disponga). Lazoo únicamente actúa como validador informático del beneficio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Cookies y Almacenamiento Local</h2>
            <p>
              Utilizamos cookies esenciales y almacenamiento local del navegador (localStorage) únicamente para mantener activa tu sesión, asegurar el funcionamiento de la PWA (instalación de la app móvil en tu pantalla de inicio) y recordar tus preferencias de navegación.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">6. Contacto</h2>
            <p>
              Si tenés dudas respecto a esta política de privacidad, podés contactarnos a través de los canales oficiales habilitados en la plataforma.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
