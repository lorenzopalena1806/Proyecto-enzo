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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-4 z-0">
      {/* Orbes decorativos */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-400/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center flex flex-col items-center space-y-3">
          <Link href="/">
            <img src="/logo.png" alt="Lazoo" className="h-20 sm:h-24 w-auto rounded-xl shadow-lg shadow-blue-900/10 object-contain" />
          </Link>
          <p className="text-slate-500 text-sm font-medium">Ingresá a tu panel</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl glass-panel p-6 sm:p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
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
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Contraseña
                </label>
                <Link href="/auth/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
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
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-center gap-2">
                <div className="w-1.5 h-full bg-red-500 rounded-full" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-login"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-[0.98]"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Ingresando...</>
              ) : (
                <><LogIn className="h-4 w-4" /> Ingresar</>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-widest rounded-full">O</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase');
              const supabase = createClient();
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              });
              if (error) {
                alert('Error al conectar con Google: ' + error.message);
              }
            }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          <div className="text-center text-sm text-slate-500 font-medium">
            ¿No tenés cuenta?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Registrate
            </Link>
          </div>
        </div>

        <p className="text-center text-xs font-medium text-slate-400">
          © 2026 Lazoo. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
