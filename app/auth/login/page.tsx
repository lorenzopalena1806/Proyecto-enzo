'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Store, Loader2, LogIn } from 'lucide-react';

import { getUserRoleById } from '@/app/actions/auth';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !authData.user) {
      setError('Email o contraseña incorrectos. Verificá tus datos.');
      setLoading(false);
      return;
    }

    // Usar el ID devuelto por el login en el cliente para buscar el rol sin depender de las cookies
    const role = await getUserRoleById(authData.user.id);
      
    // Usamos window.location.href en lugar de router.push para forzar
    // una recarga completa y que las cookies de sesión estén listas
    if (role === 'superadmin') window.location.href = '/admin';
    else if (role === 'merchant') window.location.href = '/dashboard';
    else window.location.href = '/client/qr';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center flex flex-col items-center space-y-3">
          <Link href="/">
            <img src="/logo.jpg" alt="Lazoo" className="h-20 sm:h-24 w-auto rounded-xl shadow-2xl shadow-blue-900/40 object-contain" />
          </Link>
          <p className="text-slate-400 text-sm">Ingresá a tu panel</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur-sm p-6 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4" noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Contraseña
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-950/60 border border-red-700 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-login"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Ingresando...</>
              ) : (
                <><LogIn className="h-4 w-4" /> Ingresar</>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-slate-500">
            ¿No tenés cuenta?{' '}
            <Link href="/auth/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Registrate
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600">
          © 2025 Lazoo. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
