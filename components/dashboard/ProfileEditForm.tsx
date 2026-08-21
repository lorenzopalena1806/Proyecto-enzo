'use client';

import React, { useState } from 'react';
import { User, Store, Phone, Mail, KeyRound, Loader2, CheckCircle2, Tag } from 'lucide-react';

// Categorías sugeridas para que el dueño elija o se guíe
const SUGGESTED_CATEGORIES = [
  'Gastronomía',
  'Indumentaria',
  'Kiosco',
  'Servicios',
  'Tecnología',
  'Salud y Belleza',
  'Entretenimiento',
];

interface ProfileEditFormProps {
  profile: any;
  userEmail: string;
}

export function ProfileEditForm({ profile, userEmail }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    business_name: profile.business_name || '',
    phone: profile.phone || '',
    avatar_url: profile.avatar_url || '',
    maps_url: profile.maps_url || '',
    category: profile.category || '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setProfileSuccess(false);
    setProfileError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPasswordSuccess(false);
    setPasswordError('');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileError('');

    const { updateProfileServer } = await import('@/app/actions/auth');
    const result = await updateProfileServer(profile.id, {
      full_name: formData.full_name || null,
      business_name: formData.business_name || null,
      phone: formData.phone || null,
      avatar_url: formData.avatar_url || null,
      maps_url: formData.maps_url || null,
      category: formData.category || null,
    });

    if (result.success) {
      setProfileSuccess(true);
    } else {
      setProfileError('Error al guardar. Intentá de nuevo.');
    }
    setLoadingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoadingPassword(true);
    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });

    if (error) {
      const msg = error.message.includes('different') ? 'La nueva contraseña debe ser diferente a la actual.' : error.message;
      setPasswordError(msg);
    } else {
      setPasswordSuccess(true);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    }
    setLoadingPassword(false);
  };

  return (
    <div className="space-y-6">
      {/* Datos del perfil */}
      <form onSubmit={handleProfileSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <User className="h-5 w-5 text-violet-400" /> Datos personales
        </h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Email</label>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700">
            <Mail className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <span className="text-slate-400 text-sm">{userEmail}</span>
          </div>
          <p className="text-xs text-slate-600">El email no se puede cambiar desde acá.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Nombre completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleProfileChange}
              placeholder="Tu nombre completo"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>
        </div>

        {profile.role === 'merchant' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Nombre del negocio</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  name="business_name"
                  type="text"
                  value={formData.business_name}
                  onChange={handleProfileChange}
                  placeholder="Nombre de tu local"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Categoría o Rubro</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleProfileChange}
                  list="category-suggestions"
                  placeholder="Ej: Gastronomía, Indumentaria..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
                <datalist id="category-suggestions">
                  {SUGGESTED_CATEGORIES.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <p className="text-xs text-slate-500 mt-1">Elegí una sugerencia o escribí la tuya libremente.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Link del Logo (URL de imagen)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-bold text-sm">http://</span>
                </div>
                <input
                  name="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleProfileChange}
                  placeholder="Ej: https://misitio.com/logo.png"
                  className="w-full pl-16 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Link de Google Maps</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-bold text-sm">📍</span>
                </div>
                <input
                  name="maps_url"
                  type="url"
                  value={formData.maps_url}
                  onChange={handleProfileChange}
                  placeholder="Ej: https://maps.app.goo.gl/..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Teléfono</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleProfileChange}
              placeholder="+54 9 11 1234-5678"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>
        </div>

        {profileError && (
          <div className="rounded-lg bg-red-950/60 border border-red-700 p-3">
            <p className="text-sm text-red-300">{profileError}</p>
          </div>
        )}

        {profileSuccess && (
          <div className="rounded-lg bg-emerald-950/60 border border-emerald-700 p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <p className="text-sm text-emerald-300">¡Perfil actualizado correctamente!</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loadingProfile}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold transition-all flex items-center justify-center gap-2"
        >
          {loadingProfile ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar cambios'}
        </button>
      </form>

      {/* Cambiar contraseña */}
      <form onSubmit={handlePasswordSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-amber-400" /> Cambiar contraseña
        </h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Nueva contraseña</label>
          <input
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Confirmar contraseña</label>
          <input
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>

        {passwordError && (
          <div className="rounded-lg bg-red-950/60 border border-red-700 p-3">
            <p className="text-sm text-red-300">{passwordError}</p>
          </div>
        )}

        {passwordSuccess && (
          <div className="rounded-lg bg-emerald-950/60 border border-emerald-700 p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <p className="text-sm text-emerald-300">¡Contraseña actualizada correctamente!</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loadingPassword || !passwordData.newPassword}
          className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold transition-all flex items-center justify-center gap-2"
        >
          {loadingPassword ? <><Loader2 className="h-4 w-4 animate-spin" /> Cambiando...</> : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
}
