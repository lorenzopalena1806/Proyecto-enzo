'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Al instanciar supabase en el cliente, automáticamente lee el hash (#access_token=...)
    // y establece la sesión. Solo necesitamos esperar a que termine y redirigir.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const next = searchParams.get('next') || '/dashboard';
        router.push(next);
        router.refresh(); // Forzar recarga para que el Server Layout vea las nuevas cookies
      } else {
        // Si no hay sesión todavía, configurar un listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            const next = searchParams.get('next') || '/dashboard';
            router.push(next);
            router.refresh();
            subscription.unsubscribe();
          }
        });
      }
    };

    checkSession();
  }, [router, searchParams, supabase.auth]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mb-4" />
      <h1 className="text-xl font-bold">Verificando acceso...</h1>
      <p className="text-slate-400 mt-2">Preparando el modo soporte</p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mb-4" />
        <h1 className="text-xl font-bold">Cargando...</h1>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
