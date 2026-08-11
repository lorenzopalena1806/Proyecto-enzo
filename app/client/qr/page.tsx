import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { QRDisplay } from '@/components/dashboard/QRDisplay';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { encodeQRPayload } from '@/lib/qr-utils';

export default async function ClientQRPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  const adminClient = createAdminClient();

  // Obtener perfil y QR
  const { data: profile } = await adminClient
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  let { data: qrData } = await adminClient
    .from('qr_codes')
    .select('qr_token')
    .eq('user_id', user.id)
    .single();

  // Self-healing: si el usuario no tiene QR (por fallos anteriores), se lo creamos en el momento.
  if (!qrData) {
    const token = crypto.randomUUID();
    const { data: newQr } = await adminClient
      .from('qr_codes')
      .insert({ user_id: user.id, qr_token: token })
      .select('qr_token')
      .single();
    
    if (newQr) {
      qrData = newQr;
    } else {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <p className="text-white text-center">
            Hubo un error al generar tu QR. Por favor intentá de nuevo más tarde.<br/><br/>
            <span className="text-slate-400 text-sm">
              Actualmente estás logueado como: <strong className="text-violet-400">{user.email}</strong>
            </span>
          </p>
          <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col items-center space-y-3">
            <LogoutButton />
          </div>
        </div>
      );
    }
  }

  const encodedQR = encodeQRPayload({
    userId: user.id,
    role: 'client',
    token: qrData.qr_token,
    version: 1,
  });

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
          <QRDisplay 
            qrValue={encodedQR} 
            userName={profile?.full_name || 'Cliente'} 
          />
        </div>
      </main>
    </div>
  );
}
