'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Store, Loader2, UserPlus } from 'lucide-react';

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
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. Actualizar perfil en la tabla profiles (ya fue creado por el trigger de Supabase)
      const { error: profileError } = await supabase.from('profiles')
        .update({
          business_name: formData.role === 'merchant' ? formData.businessName : null,
          phone: formData.phone || null,
        })
        .eq('id', data.user.id);

      if (profileError) {
        setError('Error al crear el perfil. Contactá al soporte.');
        setLoading(false);
        return;
      }

      // 3. Si es cliente, crear QR automáticamente
      if (formData.role === 'client') {
        const token = crypto.randomUUID();
        await supabase.from('qr_codes').insert({
          user_id: data.user.id,
          qr_token: token,
        });
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-2xl shadow-violet-900/60">
            <Store className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
            <p className="text-slate-400 text-sm">Únete a la red de descuentos</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur-sm p-6 space-y-5">
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
