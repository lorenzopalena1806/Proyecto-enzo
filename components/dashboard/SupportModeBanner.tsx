'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function SupportModeBanner() {
  const [isSupport, setIsSupport] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si venimos de una sesión de soporte
    const adminReturn = localStorage.getItem('admin_return');
    const urlParams = new URLSearchParams(window.location.search);
    if (adminReturn === 'true' || urlParams.get('support_mode') === 'true') {
      setIsSupport(true);
      // Limpiar el param de la URL
      if (urlParams.get('support_mode')) {
        const url = new URL(window.location.href);
        url.searchParams.delete('support_mode');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);

  const handleExit = async () => {
    const supabase = createClient();
    localStorage.removeItem('admin_return');
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (!isSupport) return null;

  return (
    <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-center justify-between gap-4 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div>
          <p className="text-amber-200 font-bold text-sm">Modo Soporte Activo</p>
          <p className="text-amber-400/70 text-xs mt-0.5">Estás viendo la cuenta de este comercio como Administrador.</p>
        </div>
      </div>
      <button
        onClick={handleExit}
        className="flex-shrink-0 px-4 py-2 rounded-xl bg-amber-500 text-slate-900 text-sm font-bold hover:bg-amber-400 transition-colors"
      >
        Salir y volver
      </button>
    </div>
  );
}
