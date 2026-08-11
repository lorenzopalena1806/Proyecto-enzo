import React from 'react';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { QRDisplay } from '@/components/dashboard/QRDisplay';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';

export default async function ClientQRPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Obtener perfil y QR
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const { data: qrData } = await supabase
    .from('qr_codes')
    .select('qr_token')
    .eq('user_id', user.id)
    .single();

  // Si no tiene QR (ej: se registró manual y el trigger falló), podemos sugerir contactar a soporte
  if (!qrData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <p className="text-white">Tu código QR se está generando. Por favor, recargá la página en unos minutos.</p>
        <Link href="/auth/login" className="mt-4 text-violet-400">Volver</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm">RedBeneficios</span>
        </div>
        
        <LogoutButton />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 space-y-6 max-w-md mx-auto w-full">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">Hola, {profile?.full_name || 'Cliente'}</h1>
          <p className="text-slate-400 text-sm">Mostrá este QR en los comercios adheridos para acceder a tus descuentos exclusivos.</p>
        </div>

        <div className="w-full">
          <QRDisplay qrToken={qrData.qr_token} />
        </div>
      </main>
    </div>
  );
}
