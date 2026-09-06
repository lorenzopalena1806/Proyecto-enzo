'use client';

import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { updateProfileServer } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export function RestartTutorialButton({ userId, redirectUrl, text = 'Ver Tutorial' }: { userId: string, redirectUrl: string, text?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRestart = async () => {
    setLoading(true);
    await updateProfileServer(userId, { has_seen_tutorial: false });
    // Usamos localStorage directamente si es el del admin, o simplemente recargamos
    if (redirectUrl.includes('dashboard')) {
      localStorage.removeItem('lazoo_tour_completed');
    }
    router.push(redirectUrl);
  };

  return (
    <button 
      onClick={handleRestart}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-xl transition-all font-medium text-sm w-full justify-center"
    >
      <PlayCircle className="w-5 h-5" />
      {loading ? 'Cargando...' : text}
    </button>
  );
}
