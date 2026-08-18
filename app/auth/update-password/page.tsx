'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Loader2, KeyRound, EyeOff, Eye, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const router = useRouter();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);

    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError('Error al actualizar: ' + updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900 border border-emerald-700">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">¡Contraseña actualizada!</h2>
          <p className="text-slate-400">
            Tu contraseña se cambió correctamente. Ya podés iniciar sesión con tu nueva clave.
          </p>
          <div className="pt-4">
            <Link href="/auth/login" className="inline-block w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all">
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-2xl shadow-violet-900/60">
            <Store className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Crear Nueva Contraseña</h1>
            <p className="text-slate-400 text-sm mt-1">Elegí una contraseña segura para tu cuenta</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur-sm p-6 space-y-5">
          <form onSubmit={handleUpdate} className="space-y-4" noValidate>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Nueva Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Confirmar Contraseña</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-950/60 border border-red-700 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                <><KeyRound className="h-4 w-4" /> Guardar contraseña</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
