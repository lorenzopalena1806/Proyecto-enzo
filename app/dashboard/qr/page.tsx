import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { QRDisplay } from '@/components/dashboard/QRDisplay';
import { encodeQRPayload } from '@/lib/qr-utils';

export const metadata = {
  title: 'Mi QR | RedBeneficios',
  description: 'Tu código QR único para acceder a descuentos en la red de comercios.',
};

export default async function QRPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/auth/login');

  // Obtener o crear el código QR del usuario
  let { data: qrCode } = await adminClient
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (!qrCode) {
    // Crear QR si no existe
    const { generateQRToken } = await import('@/lib/qr-utils');
    const token = generateQRToken();

    const { data: newQR } = await adminClient
      .from('qr_codes')
      .insert({ user_id: user.id, qr_token: token })
      .select()
      .single();

    qrCode = newQR;
  }

  // Codificar el payload del QR
  const qrValue = qrCode
    ? encodeQRPayload({
        userId: user.id,
        role: profile.role,
        token: qrCode.qr_token,
        version: 1,
      })
    : '';

  return (
    <div className="max-w-md mx-auto py-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mi Código QR</h1>
        <p className="text-slate-400 mt-1">
          Presentá este QR en cualquier local de la red para acceder a tus descuentos
        </p>
      </div>

      <QRDisplay
        qrValue={qrValue}
        userName={profile.full_name ?? user.email ?? 'Usuario'}
        businessName={profile.business_name}
        size={240}
      />

      {/* Instrucciones */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-5 space-y-3">
        <h3 className="text-white font-semibold">¿Cómo usar tu QR?</h3>
        <ol className="space-y-2 text-sm text-slate-400">
          {[
            'Abrí esta pantalla en el local donde vayas a comprar.',
            'Pedile al comerciante que escanee tu QR con su panel.',
            'El sistema calcula automáticamente tu descuento.',
            'El descuento aplica solo de Lunes a Jueves, pagando en efectivo o transferencia.',
          ].map((step, i) => (
            <li key={i} className="flex gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-900 text-violet-300 text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
