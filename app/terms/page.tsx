import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Términos y Condiciones</h1>
            <p className="text-slate-400 text-sm mt-1">Última actualización: Agosto 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-slate-300 leading-relaxed font-light text-sm md:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Aceptación de los Términos</h2>
            <p>
              Al registrarte y hacer uso de Lazoo, ya sea como cliente o como comercio adherido, aceptás cumplir con estos Términos y Condiciones. Si no estás de acuerdo con alguna de estas reglas, debés abstenerte de usar la plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Funcionamiento de los Beneficios</h2>
            <p>
              Lazoo provee una infraestructura de software que permite a los comercios configurar ofertas y validar cupones mediante códigos QR. 
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>El descuento aplica sobre el precio de lista publicado por el comercio y bajo las condiciones (stock, días válidos) informadas por el mismo.</li>
              <li>Lazoo no asume responsabilidad alguna por cambios imprevistos en las ofertas o políticas internas del comercio adherido.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Exclusión de Responsabilidad por Transacciones Financieras</h2>
            <p>
              <b>El servicio de Lazoo no constituye una pasarela de pago.</b> La relación contractual del cobro/pago es exclusiva entre el comercio y el comprador. Lazoo queda totalmente desvinculada de reclamos relacionados con problemas de pago, estafas en el local, fallas de facturación, o devoluciones de mercadería.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Uso Responsable de las Cuentas</h2>
            <p>
              Tanto clientes como comercios son responsables de la confidencialidad de sus cuentas y credenciales. La creación de perfiles falsos, la suplantación de identidad comercial o la manipulación informática del sistema de descuentos resultará en la suspensión inmediata e irrevocable de la cuenta del infractor.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Suscripciones para Comercios</h2>
            <p>
              Para publicar ofertas y hacer uso del panel POS, los comercios deben abonar una suscripción activa. El impago o cancelación de la misma deshabilitará el acceso a las funciones de cobro QR y ocultará las ofertas asociadas de la vidriera pública hasta que la cuenta se regularice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">6. Modificaciones de los Términos</h2>
            <p>
              Lazoo se reserva el derecho de modificar o actualizar estos términos en cualquier momento. El uso continuado de la plataforma con posterioridad a dichas modificaciones constituye la aceptación expresa de los nuevos términos.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
