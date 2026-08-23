import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Términos y Condiciones | Lazoo',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver a la web
        </Link>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6">
          <h1 className="text-3xl font-bold text-white mb-2">TÉRMINOS Y CONDICIONES DE USO DE LAZOO</h1>
          <p className="text-sm text-slate-400">Última actualización: 23 de agosto de 2026</p>

          <div className="space-y-6 mt-8">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Aceptación de los Términos y Condiciones</h2>
              <p>1.1. Los presentes Términos y Condiciones de Uso (en adelante, los "Términos") regulan el acceso y uso de la plataforma tecnológica Lazoo, accesible a través de los sitios web lazoo.app y lazoo.com.ar y de cualquier aplicación, subdominio o canal asociado (en adelante, la "Plataforma" o el "Servicio"), operada por LORENZO PALENA, con domicilio en LA ESTANZUELA, LA CALERA, CÓRDOBA, República Argentina (en adelante, "Lazoo", "la Empresa", "nosotros").</p>
              <p className="mt-2">1.2. El acceso, registro o uso de la Plataforma, bajo cualquier modalidad (Comercio o Cliente), implica la lectura, comprensión y aceptación plena, expresa e incondicional de estos Términos, así como de la Política de Privacidad, que forma parte integrante de este documento. Si el Usuario no está de acuerdo con la totalidad de lo aquí dispuesto, deberá abstenerse de utilizar la Plataforma.</p>
              <p className="mt-2">1.3. Estos Términos constituyen un acuerdo vinculante entre el Usuario y Lazoo. Su aceptación podrá realizarse mediante un clic, tilde ("checkbox") o cualquier acción equivalente al momento del registro, la cual tendrá plena validez legal como manifestación de voluntad conforme a la legislación argentina vigente en materia de contratos electrónicos.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Definiciones</h2>
              <p>A los fines de estos Términos, se entiende por:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Plataforma / Lazoo:</strong> el conjunto de sitios web, aplicaciones, bases de datos, funcionalidades tecnológicas y contenidos operados por la Empresa.</li>
                <li><strong>Comercio Adherido / Comercio:</strong> persona humana o jurídica titular de un local, negocio o emprendimiento que se registra en la Plataforma con el fin de publicar beneficios, promociones o descuentos y percibir pagos mediante código QR.</li>
                <li><strong>Cliente / Usuario Final:</strong> persona humana que se registra en la Plataforma con el fin de acceder a los beneficios, promociones y descuentos publicados por los Comercios Adheridos.</li>
                <li><strong>Usuario:</strong> de manera conjunta, los Comercios y los Clientes.</li>
                <li><strong>Membresía:</strong> suscripción mensual paga que habilita a un Comercio a operar dentro de la Plataforma.</li>
                <li><strong>Código de Descuento / Código QR:</strong> identificador numérico o gráfico, personal e intransferible, generado por la Plataforma, que habilita al Cliente a acceder a un beneficio en un Comercio Adherido.</li>
                <li><strong>Contenido:</strong> toda información, texto, imagen, marca, logo, descripción o dato publicado por un Usuario en la Plataforma.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Objeto, Mecánica y Descripción del Servicio</h2>
              <p>3.1. Lazoo es una plataforma tecnológica (SaaS) que actúa estrictamente como una cuponera digital y red de beneficios. Conecta a Comercios Adheridos con Clientes interesados en acceder a promociones y descuentos.</p>
              <p className="mt-2">3.2. <strong>Mecánica de Validación:</strong> El proceso para hacer efectivo un descuento consta de los siguientes pasos irrenunciables: a) El Cliente visualiza las promociones disponibles desde su panel de usuario. b) Al presentarse de forma presencial en el local del Comercio Adherido e informar su intención de utilizar el beneficio, el titular del comercio (o su personal a cargo) deberá habilitar la operación desde su propio panel de administración dentro de la Plataforma. c) Una vez habilitada la operación por el Comercio, el Cliente deberá escanear con la cámara de su dispositivo móvil el código QR físico y estático dispuesto en el local, validando así el descuento a través del sistema de Lazoo.</p>
              <p className="mt-2">3.3. <strong>Exclusión de Servicios Financieros:</strong> Lazoo no es una billetera virtual, no es una pasarela de pagos, no provee cuentas de pago (CVU) ni procesa transacciones económicas derivadas de la compra de bienes o servicios. Lazoo no capta, retiene, transfiere ni maneja fondos de los Clientes Finales. Toda transacción monetaria por el pago del producto o servicio (con el descuento ya aplicado) se realiza de forma directa, exclusiva y por fuera de la Plataforma entre el Cliente Final y el Comercio Adherido.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Registro de Cuenta y Requisitos de Acceso</h2>
              <p>4.1. <strong>Mayoría de edad:</strong> El uso de la Plataforma está reservado exclusivamente a personas mayores de dieciocho (18) años, con capacidad legal para contratar conforme al Código Civil y Comercial de la Nación. Al registrarse, el Usuario declara y garantiza bajo su exclusiva responsabilidad que cumple con este requisito. Lazoo se reserva el derecho de solicitar documentación que acredite la edad del Usuario y de dar de baja, sin previo aviso, cualquier cuenta respecto de la cual se detecte o presuma el incumplimiento de este requisito.</p>
              <p className="mt-2">4.2. <strong>Veracidad de los datos:</strong> El Usuario se obliga a proporcionar información veraz, completa, exacta y actualizada al momento del registro y durante toda la vigencia de su cuenta. La falsedad o inexactitud en los datos proporcionados podrá dar lugar a la suspensión o baja inmediata de la cuenta, sin perjuicio de las acciones legales que pudieran corresponder.</p>
              <p className="mt-2">4.3. <strong>Cuenta y credenciales:</strong> El Usuario es el único responsable de la confidencialidad de sus credenciales de acceso (usuario, contraseña, código QR/numérico personal) y de todas las actividades realizadas bajo su cuenta. El Usuario deberá notificar a Lazoo de forma inmediata ante cualquier uso no autorizado de su cuenta.</p>
              <p className="mt-2">4.4. <strong>Registro de Comercios:</strong> Los Comercios que se registren deberán, además, proporcionar información adicional referida a su actividad comercial, incluyendo, sin limitarse a: razón social o nombre del titular, Clave Única de Identificación Tributaria (CUIT/CUIL) cuando corresponda, rubro, dirección física del local y ubicación geográfica. El Comercio declara contar con las habilitaciones comerciales, impositivas y municipales necesarias para el desarrollo de su actividad.</p>
              <p className="mt-2">4.5. <strong>Cuenta única:</strong> Cada Usuario podrá registrar y mantener una única cuenta activa, salvo autorización expresa de Lazoo. La creación de cuentas múltiples, falsas o duplicadas está prohibida y constituye una infracción a estos Términos.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Tipos de Cuenta</h2>
              <p>5.1. <strong>Comercios Adheridos (B2B):</strong> cuentas destinadas a dueños de locales o emprendimientos que deseen publicar beneficios, descuentos o promociones, gestionar su perfil comercial dentro de la Plataforma y recibir pagos mediante código QR, previo pago de la Membresía correspondiente.</p>
              <p className="mt-2">5.2. <strong>Clientes (B2C):</strong> cuentas destinadas a personas humanas que deseen acceder, mediante un código QR o numérico personal e intransferible, a los descuentos y beneficios publicados por los Comercios Adheridos.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Suscripciones, Membresías y Pagos</h2>
              <p>6.1. El acceso de los Comercios a las funcionalidades de la Plataforma se encuentra sujeto al pago de una Membresía de carácter mensual, cuyo valor, condiciones y medios de pago serán informados en la Plataforma o a través de los canales oficiales de contacto de Lazoo (incluyendo, entre otros, WhatsApp) y/o pasarelas de pago habilitadas.</p>
              <p className="mt-2">6.2. Las Membresías se renuevan automáticamente en forma mensual, salvo cancelación expresa por parte del Comercio con la antelación que se indique en la Plataforma. El Comercio autoriza expresamente el cobro periódico correspondiente a través del medio de pago informado.</p>
              <p className="mt-2">6.3. La falta de pago en término de la Membresía facultará a Lazoo a suspender de forma automática el acceso del Comercio a las funcionalidades de la Plataforma hasta la regularización del pago.</p>
              <p className="mt-2">6.4. Los importes abonados en concepto de Membresía no son reembolsables, salvo disposición legal en contrario o decisión expresa de Lazoo, especialmente en los casos de suspensión o baja de cuenta por infracción a estos Términos conforme lo establecido en la Sección 8.</p>
              <p className="mt-2">6.5. Lazoo podrá modificar el valor de las Membresías, debiendo notificar dicha modificación a los Comercios con razonable antelación a través de los canales de contacto registrados.</p>
              <p className="mt-2">6.6. <strong>Botón de Baja y Cancelación de Suscripción:</strong> En cumplimiento con la normativa vigente, los Comercios Adheridos disponen en todo momento de un enlace o botón visible en la configuración de su cuenta para solicitar la baja o cancelación inmediata de su membresía. La cancelación detendrá los cobros correspondientes a los períodos de facturación subsiguientes. Sin embargo, no se emitirán reembolsos ni devoluciones prorrateadas por los días no utilizados del mes en curso ya abonado.</p>
              <p className="mt-2">6.7. <strong>Política contra Contracargos (Chargebacks) Injustificados:</strong> Si un Comercio Adherido abona su membresía mediante tarjeta de crédito o débito y posteriormente realiza un desconocimiento de cargo o contracargo (chargeback) ante la entidad emisora de forma injustificada, habiendo hecho uso de los servicios de la Plataforma, Lazoo procederá a la suspensión inmediata y definitiva de la cuenta, reservándose el derecho de iniciar las acciones legales correspondientes por fraude o retención indebida, e inhabilitando al titular para futuros registros.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Normas Comunitarias y Reglas de Conducta</h2>
              <p>7.1. Todos los Usuarios se comprometen a hacer un uso adecuado, lícito y de buena fe de la Plataforma, absteniéndose de:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>a) Utilizar la Plataforma con fines fraudulentos, ilícitos o contrarios a estos Términos, a la moral o a las buenas costumbres.</li>
                <li>b) Suplantar la identidad de terceros o falsear su vinculación con un Comercio, marca o persona.</li>
                <li>c) Vulnerar, evadir o intentar vulnerar los sistemas de seguridad de la Plataforma.</li>
                <li>d) Reproducir, copiar, distribuir o explotar comercialmente los contenidos de la Plataforma sin autorización expresa de Lazoo.</li>
                <li>e) Publicar contenido difamatorio, discriminatorio, violento o que infrinja derechos de terceros.</li>
              </ul>
              <p className="mt-4 font-semibold text-white">7.2. Norma N° 5 – Prohibición de fraude y uso indebido del sistema de descuentos.</p>
              <p>Constituye una infracción grave a estas normas comunitarias cualquier conducta orientada a defraudar, manipular o abusar del sistema de beneficios de Lazoo, incluyendo, con carácter enunciativo y no taxativo:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>a) La generación, reutilización, duplicación, alteración o comercialización indebida de códigos QR o numéricos de descuento, propios o ajenos.</li>
                <li>b) La publicación por parte de un Comercio de información falsa, engañosa o inexacta respecto de su identidad, rubro, ubicación, productos, servicios, precios o condiciones de los beneficios ofrecidos.</li>
                <li>c) El rechazo injustificado o simulado de descuentos legítimamente generados por un Cliente a través de la Plataforma.</li>
                <li>d) La utilización de identidades falsas, cuentas duplicadas o datos de terceros para acceder a beneficios de forma indebida o reiterada.</li>
                <li>e) Cualquier maniobra de colusión entre Comercios y Clientes, o entre Usuarios, orientada a obtener beneficios de manera fraudulenta o a perjudicar a Lazoo o a otros Usuarios.</li>
                <li>f) La alteración, manipulación o falsificación de comprobantes, capturas de pantalla o registros vinculados a transacciones realizadas en la Plataforma.</li>
              </ul>
              <p className="mt-2">7.3. La infracción a la Norma N° 5, así como a cualquiera de las restantes normas comunitarias, habilita a Lazoo a aplicar las medidas descriptas en la Sección 8, con independencia de las acciones legales, civiles y/o penales que pudieran corresponder conforme a la legislación aplicable.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Suspensión, Bloqueo y Baja de Cuentas</h2>
              <p>8.1. Lazoo se reserva el derecho de suspender, bloquear o dar de baja, de forma preventiva e inmediata y sin necesidad de previo aviso, cualquier cuenta —de Comercio o de Cliente— respecto de la cual detecte, razonablemente sospeche o reciba denuncias fundadas sobre el incumplimiento de estos Términos, de las normas comunitarias descriptas en la Sección 7, o de la legislación vigente.</p>
              <p className="mt-2">8.2. La suspensión o baja de una cuenta por infracción a estos Términos no genera derecho a reembolso alguno de los importes abonados en concepto de Membresía u otro concepto, sin perjuicio de las excepciones que pudieran corresponder por disposición legal imperativa.</p>
              <p className="mt-2">8.3. Sin perjuicio del carácter inmediato de la medida precautoria, el Usuario afectado podrá presentar sus descargos y explicaciones a través de los canales de contacto de Lazoo dentro de los diez (10) días corridos de notificada la suspensión, los cuales serán evaluados por la Empresa a los fines de resolver sobre el levantamiento o la confirmación definitiva de la medida.</p>
              <p className="mt-2">8.4. La reiteración de infracciones, o la gravedad de una infracción aislada, podrá derivar en la baja definitiva de la cuenta y en la imposibilidad de que el Usuario vuelva a registrarse en la Plataforma bajo su identidad u otra.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Rol de Lazoo como Intermediario Tecnológico – Deslinde de Responsabilidad</h2>
              <p>9.1. Lazoo es una plataforma tecnológica que actúa exclusivamente como intermediario entre Comercios Adheridos y Clientes, facilitando la difusión de beneficios y descuentos. Lazoo no es el vendedor, fabricante, prestador ni responsable directo de los productos o servicios ofrecidos, publicados o comercializados por los Comercios Adheridos.</p>
              <p className="mt-2">9.2. Lazoo no garantiza, verifica de forma exhaustiva ni asume responsabilidad alguna respecto de: la calidad, idoneidad, legalidad, disponibilidad, veracidad o exactitud de los productos, servicios, ofertas, precios o condiciones publicadas por los Comercios; el cumplimiento por parte de los Comercios de la normativa de defensa del consumidor, lealtad comercial, tributaria o de cualquier otra índole aplicable a su actividad; ni de los daños, perjuicios o incumplimientos que pudieran derivarse de la relación de consumo entablada directamente entre el Comercio y el Cliente.</p>
              <p className="mt-2">9.3. Todo reclamo vinculado a la calidad de un producto o servicio, a un vicio, defecto, incumplimiento, garantía o a cualquier otra cuestión derivada de la relación de consumo, deberá ser dirigido directamente por el Cliente al Comercio Adherido correspondiente, quien resulta el único y exclusivo responsable frente al Cliente en tales aspectos.</p>
              <p className="mt-2">9.4. Sin perjuicio de lo anterior, Lazoo pone a disposición de los Usuarios canales de contacto para recibir reportes o denuncias vinculados al uso indebido de la Plataforma, los cuales serán evaluados conforme a lo establecido en las Secciones 7 y 8.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Propiedad Intelectual</h2>
              <p>10.1. La marca "Lazoo", su logotipo, nombre de dominio (lazoo.app, lazoo.com.ar), diseño, interfaz, código fuente, base de datos, estructura, y todo otro elemento distintivo o funcional de la Plataforma son de titularidad exclusiva de Lazoo o de sus licenciantes, y se encuentran protegidos por la normativa vigente en materia de propiedad intelectual e industrial (Ley N° 11.723 de Propiedad Intelectual y demás normas concordantes).</p>
              <p className="mt-2">10.2. Queda expresamente prohibida la reproducción, distribución, modificación, ingeniería inversa, descompilación, extracción de datos (scraping), o cualquier forma de explotación total o parcial de la Plataforma, su código fuente o su diseño, sin autorización previa y por escrito de Lazoo.</p>
              <p className="mt-2">10.3. Se concede al Usuario una licencia de uso limitada, personal, no exclusiva, no transferible y revocable, exclusivamente para el uso de la Plataforma conforme a su finalidad y a estos Términos.</p>
              <p className="mt-2">10.4. El Contenido que los Comercios publiquen en la Plataforma (fotografías, descripciones, logotipos, información comercial) es de titularidad del Comercio, quien garantiza contar con los derechos necesarios para su publicación y otorga a Lazoo una licencia gratuita, no exclusiva y mundial para exhibirlo, reproducirlo y utilizarlo dentro de la Plataforma y en sus canales de comunicación y promoción, mientras dure la vigencia de su cuenta.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">11. Soporte Técnico</h2>
              <p>11.1. Lazoo pone a disposición de los Usuarios canales de soporte técnico a través de los medios de contacto informados en la Plataforma.</p>
              <p className="mt-2">11.2. Lazoo se compromete a brindar una primera respuesta a las consultas, reclamos o incidencias técnicas reportadas por los Usuarios en un plazo máximo de cuarenta y ocho (48) horas hábiles, contadas desde la recepción de la solicitud. Dicho plazo refiere a la primera respuesta o atención del reclamo, y no implica necesariamente la resolución definitiva de la cuestión planteada dentro de dicho término, la cual dependerá de la naturaleza y complejidad de cada caso.</p>
              <p className="mt-2">11.3. Se consideran horas hábiles los días de lunes a viernes, excluyendo fines de semana y feriados nacionales de la República Argentina.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">12. Disponibilidad del Servicio y Nivel de Acuerdo (SLA)</h2>
              <p>12.1. Lazoo realiza sus mejores esfuerzos técnicos para mantener la Plataforma operativa; sin embargo, no garantiza un cien por ciento (100%) de disponibilidad ininterrumpida. La Plataforma puede sufrir caídas temporales, interrupciones o latencias debido a tareas de mantenimiento programado, actualizaciones de infraestructura, o fallas imprevistas en los proveedores externos de alojamiento en la nube (ej. Vercel, bases de datos externas, proveedores de internet). El Usuario acepta que estas interrupciones temporales no generarán derecho a reclamo, indemnización, ni devolución total o parcial del valor de las membresías abonadas.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">13. Limitación de Responsabilidad</h2>
              <p>13.1. En la máxima medida permitida por la legislación aplicable, Lazoo no será responsable por daños indirectos, incidentales, especiales, punitivos o lucro cesante derivados del uso o la imposibilidad de uso de la Plataforma.</p>
              <p className="mt-2">13.2. La responsabilidad total de Lazoo frente a un Usuario, de resultar procedente conforme a derecho, se limitará al monto efectivamente abonado por dicho Usuario a Lazoo en concepto de Membresía durante los tres (3) meses anteriores al hecho que origina el reclamo.</p>
              <p className="mt-2">13.3. Lo dispuesto en esta Sección no limita ni afecta los derechos irrenunciables que la legislación de defensa del consumidor u otra normativa de orden público pudiera reconocer a los Usuarios.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">14. Indemnidad</h2>
              <p>14.1. El Usuario se obliga a mantener indemne a Lazoo, sus socios, directivos, empleados y colaboradores, frente a cualquier reclamo, daño, pérdida, responsabilidad, costo o gasto (incluidos honorarios legales razonables) que se derive de: (a) el incumplimiento por parte del Usuario de estos Términos; (b) el uso indebido, fraudulento o contrario a la ley de la Plataforma; o (c) la violación de derechos de terceros por parte del Usuario.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">15. Protección de Datos Personales</h2>
              <p>15.1. El tratamiento de los datos personales de los Usuarios se rige por la Política de Privacidad de Lazoo, disponible en <Link href="/privacy" className="text-violet-400 hover:text-violet-300 underline">lazoo.app/privacy</Link>, la cual forma parte integrante de estos Términos.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">16. Modificaciones a los presentes Términos</h2>
              <p>16.1. Lazoo podrá modificar estos Términos en cualquier momento, a fin de adecuarlos a cambios normativos, tecnológicos o del propio Servicio. Las modificaciones serán publicadas en la Plataforma indicando la fecha de su última actualización, y/o notificadas a través de los canales de contacto registrados.</p>
              <p className="mt-2">16.2. El uso continuado de la Plataforma con posterioridad a la entrada en vigencia de las modificaciones implicará la aceptación de las mismas. Si el Usuario no está de acuerdo con las modificaciones, deberá cesar el uso de la Plataforma y podrá solicitar la baja de su cuenta.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">17. Cesión</h2>
              <p>17.1. El Usuario no podrá ceder, transferir o subrogar los derechos y obligaciones emergentes de estos Términos sin autorización previa y por escrito de Lazoo. Lazoo podrá ceder o transferir estos Términos, total o parcialmente, en el marco de procesos de reorganización societaria, fusión, adquisición o venta de activos, notificando dicha circunstancia a los Usuarios.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">18. Divisibilidad</h2>
              <p>18.1. Si alguna cláusula de estos Términos fuera declarada nula, inválida o inaplicable por autoridad competente, dicha circunstancia no afectará la validez y vigencia de las restantes disposiciones, las cuales mantendrán plena aplicación.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">19. Ley Aplicable y Jurisdicción</h2>
              <p>19.1. Estos Términos se rigen por las leyes de la República Argentina.</p>
              <p className="mt-2">19.2. Para cualquier controversia derivada de la interpretación, validez, ejecución o cumplimiento de estos Términos, las partes se someten a la jurisdicción exclusiva de los Tribunales Ordinarios de la Ciudad de Córdoba, Provincia de Córdoba, República Argentina, con renuncia expresa a cualquier otro fuero o jurisdicción que pudiera corresponderles.</p>
              <p className="mt-2">19.3. En caso de que, en virtud de la expansión regional o internacional del Servicio, resultare de aplicación imperativa una normativa local distinta (incluyendo normas de protección al consumidor de otras jurisdicciones), dicha normativa será de aplicación exclusivamente respecto de los Usuarios alcanzados por ella, sin perjuicio de la aplicación general de lo dispuesto en los apartados precedentes.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">20. Notificaciones y Contacto</h2>
              <p>20.1. Toda comunicación, consulta, reclamo o notificación vinculada a estos Términos podrá dirigirse a Lazoo a través del correo electrónico <strong>soportelazoo@gmail.com</strong> o de los demás canales oficiales publicados en la Plataforma.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
