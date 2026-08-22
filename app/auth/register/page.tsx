'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Store, Loader2, UserPlus, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();


  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' as 'client' | 'merchant',
    businessName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);

    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();

    // 1. Crear usuario en Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          role: formData.role,
        },
      },
    });

    if (signUpError) {
      let errorMsg = signUpError.message;
      if (errorMsg.includes('already registered')) {
        errorMsg = 'Este correo electrónico ya está registrado. Por favor, iniciá sesión.';
      } else if (errorMsg.includes('Password should be at least')) {
        errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
      }
      setError(errorMsg);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. Actualizar perfil usando Server Action para evitar problemas de RLS
      const { updateProfileServer } = await import('@/app/actions/auth');
      const result = await updateProfileServer(data.user.id, {
        business_name: formData.role === 'merchant' ? formData.businessName : null,
        phone: formData.phone || null,
      });

      if (!result.success) {
        setError('Error al crear el perfil. Contactá al soporte.');
        setLoading(false);
        return;
      }

      // 3. Si es cliente, crear QR automáticamente
      if (formData.role === 'client') {
        const { createClientQRServer } = await import('@/app/actions/auth');
        await createClientQRServer(data.user.id);
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    if (formData.role === 'merchant') {
      const message = `Hola, me creé una cuenta de comerciante.\nNombre: ${formData.fullName}\nComercio: ${formData.businessName}\nQuiero saber más sobre el sistema.`;
      const waLink = "https://wa.me/5493512388658?text=" + encodeURIComponent(message);
      
      // Auto-redirección después de 3 segundos
      setTimeout(() => {
        window.location.href = waLink;
      }, 3000);

      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900 border border-emerald-700 mb-2">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-white">¡Registro exitoso!</h2>
            <p className="text-slate-400 text-sm">
              Tu cuenta ha sido creada. Para activarla y configurar tu comercio en la red, serás redirigido a nuestro WhatsApp...
            </p>
            <a
              href={waLink}
              className="inline-block mt-4 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20b858] text-white font-bold transition-all w-full shadow-lg shadow-[#25D366]/20"
            >
              Ir a WhatsApp ahora
            </a>
            <div className="pt-4">
              <Link href="/auth/login" className="text-slate-600 text-sm hover:text-slate-400">
                O ir al Login
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900 border border-emerald-700">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-white">¡Registro exitoso!</h2>
          <p className="text-slate-400 text-sm">
            Revisá tu email para confirmar tu cuenta antes de ingresar.
          </p>
          <Link
            href="/auth/login"
            className="inline-block mt-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all"
          >
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative">
      
      {/* Botón Volver al inicio */}
      <div className="absolute top-6 left-6 z-10 hidden sm:block">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors bg-slate-900/50 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-full hover:bg-slate-800">
          <ArrowLeft className="w-4 h-4" />
          Volver a la web
        </Link>
      </div>

      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center flex flex-col items-center space-y-3">
          <Link href="/">
            <img src="/logo.png" alt="Lazoo" className="h-20 sm:h-24 w-auto rounded-xl shadow-2xl shadow-blue-900/40 object-contain" />
          </Link>
          <p className="text-slate-400 text-sm">Únete a la red de descuentos</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur-sm p-6 space-y-5">
          {/* Mobile Back Button */}
          <div className="sm:hidden mb-2">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-3 h-3" />
              Volver a la web
            </Link>
          </div>

          <form onSubmit={handleRegister} className="space-y-4" noValidate>

            {/* Tipo de cuenta */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Tipo de cuenta</label>
              <div className="grid grid-cols-2 gap-3">
                {(['client', 'merchant'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: r }))}
                    className={`
                      py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all
                      ${formData.role === r
                        ? 'border-violet-500 bg-violet-950/60 text-violet-300'
                        : 'border-slate-600 bg-slate-900/40 text-slate-400 hover:border-slate-500'
                      }
                    `}
                  >
                    {r === 'client' ? '👤 Cliente' : '🏪 Comerciante'}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre completo */}
            <InputField
              id="fullName"
              name="fullName"
              label="Nombre completo"
              type="text"
              placeholder="Juan Pérez"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            {/* Nombre del negocio (solo merchants) */}
            {formData.role === 'merchant' && (
              <InputField
                id="businessName"
                name="businessName"
                label="Nombre del comercio"
                type="text"
                placeholder="Ej: Panadería El Sol"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            )}

            {/* Email */}
            <InputField
              id="reg-email"
              name="email"
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {/* Teléfono */}
            <InputField
              id="phone"
              name="phone"
              label="Teléfono (opcional)"
              type="tel"
              placeholder="+54 9 11 1234 5678"
              value={formData.phone}
              onChange={handleChange}
            />

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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

            {/* Confirmar contraseña */}
            <InputField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirmar contraseña"
              type="password"
              placeholder="Repetí tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-950/60 border border-red-700 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-register"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Crear cuenta</>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800/60 text-slate-400 text-xs uppercase tracking-widest">O</span>
            </div>
          </div>

          {formData.role === 'client' && (
            <button
              type="button"
              className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-md active:scale-[0.99]"
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
          )}

          {formData.role === 'merchant' && (
            <p className="text-center text-xs text-slate-400">
              El registro con Google es exclusivo para clientes.
            </p>
          )}

          <div className="text-center text-sm text-slate-500">
            ¿Ya tenés cuenta?{' '}
            <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Ingresar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper de input ──────────────────────────────────────────

function InputField({
  id,
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
      />
    </div>
  );
}
