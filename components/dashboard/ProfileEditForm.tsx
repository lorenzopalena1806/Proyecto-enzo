'use client';

import React, { useState } from 'react';
import { User, Store, Phone, Mail, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';

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
      <form onSubmit={handleProfileSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" /> Datos personales
        </h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-700">Email</label>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 shadow-inner">
            <Mail className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <span className="text-slate-700 font-medium text-sm">{userEmail}</span>
          </div>
          <p className="text-xs font-semibold text-slate-500">El email no se puede cambiar desde acá.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-700">Nombre completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleProfileChange}
              placeholder="Tu nombre completo"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm font-medium"
            />
          </div>
        </div>

        {profile.role === 'merchant' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Nombre del negocio</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  name="business_name"
                  type="text"
                  value={formData.business_name}
                  onChange={handleProfileChange}
                  placeholder="Nombre de tu local"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Link del Logo (URL de imagen)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold text-sm">http://</span>
                </div>
                <input
                  name="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleProfileChange}
                  placeholder="Ej: https://misitio.com/logo.png"
                  className="w-full pl-16 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Link de Google Maps</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold text-sm">📍</span>
                </div>
                <input
                  name="maps_url"
                  type="url"
                  value={formData.maps_url}
                  onChange={handleProfileChange}
                  placeholder="Ej: https://maps.app.goo.gl/..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm font-medium"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-700">Teléfono</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleProfileChange}
              placeholder="+54 9 11 1234-5678"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm font-medium"
            />
          </div>
        </div>

        {profileError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 shadow-sm">
            <p className="text-sm font-bold text-red-700">{profileError}</p>
          </div>
        )}

        {profileSuccess && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-bold text-emerald-700">¡Perfil actualizado correctamente!</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loadingProfile}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {loadingProfile ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar cambios'}
        </button>
      </form>

      {/* Cambiar contraseña */}
      <form onSubmit={handlePasswordSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-amber-600" /> Cambiar contraseña
        </h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-700">Nueva contraseña</label>
          <input
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-700">Confirmar contraseña</label>
          <input
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm font-medium"
          />
        </div>

        {passwordError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 shadow-sm">
            <p className="text-sm font-bold text-red-700">{passwordError}</p>
          </div>
        )}

        {passwordSuccess && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-bold text-emerald-700">¡Contraseña actualizada correctamente!</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loadingPassword || !passwordData.newPassword}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {loadingPassword ? <><Loader2 className="h-4 w-4 animate-spin" /> Cambiando...</> : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
}
