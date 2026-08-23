import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad | Lazoo',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver a la web
        </Link>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6">
          <h1 className="text-3xl font-bold text-white mb-2">POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS PERSONALES DE LAZOO</h1>
          <p className="text-sm text-slate-400">Última actualización: 23 de agosto de 2026</p>

          <div className="space-y-6 mt-8">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Introducción y Responsable del Tratamiento</h2>
              <p>1.1. La presente Política de Privacidad (en adelante, la "Política") tiene como objetivo informar de manera clara, precisa y transparente a los Usuarios (tanto Comercios Adheridos como Clientes Finales) sobre cómo Lorenzo Palena, con domicilio legal en LA ESTANZUELA, LA CALERA, CÓRDOBA, REPÚBLICA ARGENTINA (en adelante, "Lazoo", "nosotros" o el "Responsable del Tratamiento"), recolecta, utiliza, procesa, almacena y protege los datos personales ingresados en las plataformas lazoo.app y lazoo.com.ar (en adelante, la "Plataforma").</p>
              <p className="mt-2">1.2. El uso de la Plataforma implica la aceptación irrestricta de la presente Política, la cual forma parte indivisible de los Términos y Condiciones de Uso de Lazoo.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Marco Legal Aplicable</h2>
              <p>2.1. El tratamiento de los datos personales llevado a cabo por Lazoo se rige estrictamente por la Ley N° 25.326 de Protección de los Datos Personales de la República Argentina, su Decreto Reglamentario N° 1558/2001, y las disposiciones emitidas por la Agencia de Acceso a la Información Pública (AAIP).</p>
              <p className="mt-2">2.2. En miras a una futura expansión y para garantizar los más altos estándares de seguridad, Lazoo adopta proactivamente principios rectores del Reglamento General de Protección de Datos (GDPR - Reglamento UE 2016/679), tales como la minimización de datos, la privacidad por diseño y por defecto, y la transparencia algorítmica.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Principios Rectores del Tratamiento</h2>
              <p>3.1. Toda la información personal recolectada será tratada bajo los siguientes principios fundamentales:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Licitud y Lealtad:</strong> Los datos se recopilan con fines legítimos y de manera transparente.</li>
                <li><strong>Minimización:</strong> Solo se requerirán los datos estrictamente necesarios para cumplir con el objeto del servicio (SaaS).</li>
                <li><strong>Exactitud:</strong> Lazoo procurará que los datos sean exactos y se mantengan actualizados, brindando a los Usuarios las herramientas para su autogestión.</li>
                <li><strong>Confidencialidad:</strong> El acceso a los datos está restringido y protegido por el deber de secreto profesional.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Datos Personales Recolectados</h2>
              <p>Para la correcta prestación de los servicios SaaS de red de beneficios, Lazoo recolecta y procesa las siguientes categorías de datos:</p>
              
              <h3 className="text-lg font-medium text-white mt-4 mb-2">4.1. Respecto de los Clientes Finales (B2C):</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Datos de Identificación y Contacto:</strong> Nombre completo, dirección de correo electrónico (email) y número de teléfono celular.</li>
                <li><strong>Datos de Interacción:</strong> Historial de escaneos de códigos QR, comercios visitados y beneficios validados en la Plataforma.</li>
                <li><strong>Datos de Ubicación:</strong> Información de geolocalización (siempre que el Usuario otorgue el permiso explícito en su dispositivo) para el funcionamiento del mapa interactivo.</li>
                <li><strong>Exclusión de Datos Financieros y de Pagos:</strong> Dado que Lazoo opera de forma exclusiva como una cuponera digital y no como billetera virtual ni pasarela de pagos B2C, no solicita, no procesa ni almacena bajo ninguna circunstancia datos bancarios, números de tarjetas de crédito/débito, CVU/CBU ni información financiera de los Clientes Finales.</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4 mb-2">4.2. Respecto de los Comercios Adheridos (B2B):</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Datos de Identificación Comercial y Fiscal:</strong> Nombre del titular, razón social, CUIT/CUIL, rubro y nombre de fantasía del comercio.</li>
                <li><strong>Datos de Contacto:</strong> Email corporativo o personal, número de teléfono (línea móvil o fija) / WhatsApp.</li>
                <li><strong>Datos Operativos:</strong> Ubicación geográfica precisa del local comercial (coordenadas para el mapa interactivo), descripción de los productos, logotipo y ofertas publicadas.</li>
                <li><strong>Datos de Facturación:</strong> Información requerida por las pasarelas de pago integradas para procesar la Membresía mensual (Lazoo no almacena de forma directa los números de tarjetas de crédito o débito, tarea que se delega a la pasarela de pagos certificada con estándar PCI-DSS).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Finalidad del Tratamiento de los Datos</h2>
              <p>5.1. La recolección y tratamiento de la información tiene como propósitos exclusivos y específicos:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Gestión de Cuentas:</strong> Crear, administrar y mantener activos los perfiles de los Usuarios (B2B y B2C) dentro de la Plataforma.</li>
                <li><strong>Operativa del Servicio:</strong> Registrar y procesar la validación de los descuentos. Esto incluye la sincronización del sistema cuando el Comercio Adherido habilita un beneficio desde su panel de administración y el Cliente Final, mediante la cámara de su dispositivo, escanea el código QR dispuesto físicamente en el local.</li>
                <li><strong>Mapa Interactivo:</strong> Mostrar a los Clientes Finales los locales adheridos cercanos a su ubicación geográfica en tiempo real.</li>
                <li><strong>Soporte Técnico:</strong> Atender consultas, reclamos o incidentes operativos dentro del plazo comprometido de 48 horas hábiles.</li>
                <li><strong>Comunicaciones y Notificaciones:</strong> Enviar avisos importantes sobre el estado del sistema, actualizaciones de los Términos, alertas de seguridad, recordatorios de vencimiento de membresías y novedades de la red de beneficios.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Consentimiento del Titular</h2>
              <p>6.1. Al registrarse en la Plataforma, el Usuario presta su consentimiento libre, expreso e informado para que Lazoo recolecte y procese sus datos personales conforme a los términos expuestos en este documento.</p>
              <p className="mt-2">6.2. El Usuario tiene el derecho de revocar este consentimiento en cualquier momento. Sin embargo, la revocación implicará la imposibilidad técnica de continuar prestando el servicio, derivando en la baja de la cuenta.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Privacidad, Cesión y Transferencia de Datos</h2>
              <p>7.1. <strong>No comercialización:</strong> Lazoo asume un compromiso absoluto con la privacidad. Los datos personales de nuestros Usuarios (nombres, correos, teléfonos, historiales) no serán vendidos, alquilados, comercializados ni cedidos a terceras partes bajo ningún concepto o contraprestación económica.</p>
              <p className="mt-2">7.2. <strong>Excepciones legales:</strong> La información personal solo podrá ser compartida con terceros ajenos a la Plataforma en los siguientes supuestos:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Para dar cumplimiento a una orden judicial, requerimiento legal, citación o investigación emitida por autoridades competentes de la República Argentina.</li>
                <li>Para proteger los derechos, la propiedad o la seguridad operativa de Lazoo y de su comunidad frente a fraudes (ver Norma N° 5 de los Términos y Condiciones).</li>
                <li>Con proveedores de infraestructura tecnológica (hosting, servicios de email, pasarelas de pago) que actúan como "Encargados del Tratamiento" bajo estrictos contratos de confidencialidad.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Uso de Cookies, Tecnologías de Rastreo y Analítica Web</h2>
              <p>8.1. <strong>Cookies Técnicas:</strong> Lazoo utiliza cookies propias (pequeños archivos de texto alojados en el navegador del Usuario) de carácter estrictamente técnico y de sesión. Estas son indispensables para mantener al Usuario autenticado, garantizar la seguridad de su cuenta y permitir el correcto flujo de la aplicación.</p>
              <p className="mt-2">8.2. <strong>Analítica de Rendimiento:</strong> Con el fin de monitorear la velocidad de carga, los cuellos de botella y mejorar la experiencia de usuario (UX), la Plataforma integra herramientas de analítica web proporcionadas por terceros, específicamente Vercel Analytics y Speed Insights.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Estas herramientas recolectan métricas de rendimiento y uso de manera agregada y anonimizada.</li>
                <li>No rastrean el comportamiento individual a través de múltiples sitios ni compilan perfiles de identidad cruzada, respetando los enfoques "privacy-first".</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Geolocalización e Integración con Terceros</h2>
              <p>9.1. La Plataforma ofrece un mapa interactivo para facilitar el hallazgo de beneficios. Para ello, Lazoo utiliza APIs de geolocalización y cartografía provistas por terceros (por ejemplo, Google Maps).</p>
              <p className="mt-2">9.2. Cuando el Cliente autoriza el uso de su ubicación, dicha información es procesada en tiempo real para centrar el mapa. Lazoo no almacena el recorrido, rutas ni el historial de ubicaciones persistentes del dispositivo del Cliente en sus bases de datos.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Derechos de los Usuarios (Derechos ARCO)</h2>
              <p>10.1. Conforme a la Ley 25.326, el Titular de los datos personales goza de los siguientes derechos (Derechos ARCO), que podrán ser ejercidos de forma gratuita:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Acceso:</strong> Solicitar y obtener información detallada sobre los datos personales propios que obren en las bases de datos de Lazoo.</li>
                <li><strong>Rectificación y Actualización:</strong> Solicitar la modificación o corrección de datos que sean incorrectos, inexactos o hayan quedado desactualizados.</li>
                <li><strong>Supresión (Derecho al olvido):</strong> Exigir la eliminación completa de su cuenta y de sus datos personales de nuestros servidores operativos, siempre que no exista una obligación legal o un contrato de membresía B2B pendiente de liquidación que requiera su retención temporal.</li>
              </ul>
              <p className="mt-2">10.2. Para ejercer estos derechos, el Usuario deberá enviar una solicitud formal por correo electrónico a <strong>soportelazoo@gmail.com</strong> desde la cuenta registrada, acreditando su identidad. Lazoo responderá y ejecutará lo solicitado dentro de los plazos legales aplicables (10 días corridos para acceso; 5 días hábiles para rectificación/supresión).</p>
              <p className="mt-2">10.3. La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">11. Medidas de Seguridad y Alojamiento en la Nube</h2>
              <p>11.1. Lazoo considera la seguridad informática como una prioridad crítica. Todos los datos recolectados son transmitidos mediante protocolos de encriptación seguros (HTTPS/SSL/TLS) y alojados en infraestructuras de nube de primer nivel con certificaciones de seguridad globales.</p>
              <p className="mt-2">11.2. Implementamos barreras técnicas y lógicas, controles de acceso biométricos o de doble factor (2FA) en nivel de administración, contraseñas hasheadas y firewalls para proteger la información contra accesos no autorizados, alteraciones, pérdidas o divulgación ilegítima.</p>
              <p className="mt-2">11.3. A pesar de nuestros máximos esfuerzos, ningún sistema informático es infalible. En caso de detectarse una brecha de seguridad que comprometa datos personales, Lazoo notificará a los Usuarios afectados y a las autoridades competentes en el menor tiempo posible, conforme a las mejores prácticas internacionales.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">12. Plazo de Conservación de los Datos</h2>
              <p>12.1. Los datos personales serán conservados únicamente durante el tiempo que la cuenta del Usuario se mantenga activa y en tanto sean necesarios para cumplir con las finalidades descritas en la Sección 5.</p>
              <p className="mt-2">12.2. En caso de baja de la cuenta, Lazoo podrá retener ciertos datos (como registros de facturación de Comercios o historiales de bloqueo por fraude a la Norma N° 5) por el plazo que la legislación comercial, civil o tributaria de la República Argentina exija, manteniéndolos bloqueados para cualquier otro uso.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">13. Modificaciones a la Política de Privacidad</h2>
              <p>13.1. Lazoo se reserva el derecho a modificar, adaptar o actualizar esta Política en cualquier momento, ya sea por decisiones comerciales, técnicas o por exigencias de nuevas normativas jurídicas.</p>
              <p className="mt-2">13.2. Las modificaciones serán publicadas en la Plataforma indicando la fecha de actualización, y si los cambios son sustanciales en el tratamiento de los datos, se notificará explícitamente a los Usuarios vía correo electrónico. El uso continuado del servicio tras la publicación implica la aceptación de la nueva Política.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">14. Canales de Contacto y Jurisdicción</h2>
              <p>14.1. Ante cualquier duda, consulta o requerimiento legal relacionado con esta Política de Privacidad o el tratamiento de sus datos, los Usuarios pueden contactar al equipo legal y de soporte técnico en <strong>soportelazoo@gmail.com</strong>.</p>
              <p className="mt-2">14.2. Para la resolución de conflictos vinculados a la interpretación de este documento, rige la legislación de la República Argentina y la jurisdicción exclusiva de los Tribunales Ordinarios de la Ciudad de Córdoba, Provincia de Córdoba, tal como se detalla en los Términos y Condiciones Generales de Uso.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
