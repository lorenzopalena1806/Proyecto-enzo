'use client';

import React, { useState } from 'react';
import { User, Store, Phone, Mail, KeyRound, Loader2, CheckCircle2, Tag, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { BusinessHoursEditor } from './BusinessHoursEditor';

const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-800 rounded-xl animate-pulse flex items-center justify-center text-slate-500">Cargando mapa...</div>
});

// Categorías sugeridas
const SUGGESTED_CATEGORIES = [
  '🥩 Carnicería',
  '🥦 Verdulería / Frutería',
  '🍬 Kiosco',
  '🥐 Panadería',
  '🍰 Pastelería',
  '🧀 Fiambrería',
  '🛒 Almacén / Despensa',
  '🍽️ Restaurante',
  '🍕 Pizzería',
  '🍔 Hamburguesería',
  '☕ Cafetería',
  '🍦 Heladería',
  '💊 Farmacia',
  '👕 Tienda de ropa',
  '👟 Zapatería',
  '✂️ Peluquería',
  '💅 Estética / Manicuría',
  '🔨 Ferretería',
  '📱 Accesorios para celulares',
  '🐶 Pet shop / Veterinaria',
  '🧼 Artículos de limpieza',
];

interface ProfileEditFormProps {
  profile: any;
  userEmail: string;
  isPro?: boolean;
}

export function ProfileEditForm({ profile, userEmail, isPro = false }: ProfileEditFormProps) {
  const [isCustomCategory, setIsCustomCategory] = useState(
    profile.category && !SUGGESTED_CATEGORIES.includes(profile.category) ? true : false
  );

  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    business_name: profile.business_name || '',
    phone: profile.phone || '',
    avatar_url: profile.avatar_url || '',
    maps_url: profile.maps_url || '',
    instagram: profile.instagram || '',
    category: isCustomCategory ? 'Otro' : (profile.category || ''),
    custom_category: isCustomCategory ? profile.category : '',
    address: profile.address || '',
    business_hours: profile.business_hours || '',
    latitude: profile.latitude || null,
    longitude: profile.longitude || null,
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
  const [isExtractingMaps, setIsExtractingMaps] = useState(false);
  const [mapExtractMessage, setMapExtractMessage] = useState({ type: '', text: '' });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'category') {
      if (value === 'Otro') {
        setIsCustomCategory(true);
      } else {
        setIsCustomCategory(false);
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    setProfileSuccess(false);
    setProfileError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPasswordSuccess(false);
    setPasswordError('');
  };

  const handleExtractMaps = async () => {
    if (!formData.maps_url) {
      setMapExtractMessage({ type: 'error', text: 'Primero pegá un link de Google Maps válido.' });
      return;
    }
    setIsExtractingMaps(true);
    setMapExtractMessage({ type: '', text: '' });
    
    try {
      const { extractCoordinatesFromMapsUrl } = await import('@/app/actions/map');
      const res = await extractCoordinatesFromMapsUrl(formData.maps_url);
      
      if (res.success && res.lat && res.lng) {
        setFormData(prev => ({ ...prev, latitude: res.lat, longitude: res.lng }));
        setMapExtractMessage({ type: 'success', text: '¡Coordenadas obtenidas y actualizadas en el mapa!' });
      } else {
        setMapExtractMessage({ type: 'error', text: res.error || 'No se pudo obtener la ubicación.' });
      }
    } catch (err) {
      setMapExtractMessage({ type: 'error', text: 'Error al comunicarse con el servidor.' });
    } finally {
      setIsExtractingMaps(false);
    }
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
      instagram: formData.instagram || null,
      address: formData.address || null,
      latitude: formData.latitude,
      longitude: formData.longitude,
      business_hours: formData.business_hours || null,
      category: isCustomCategory ? (formData.custom_category || null) : (formData.category || null),
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
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleProfileChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none"
                >
                  <option value="" disabled>Seleccioná tu rubro...</option>
                  {SUGGESTED_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Otro">➕ Otro (escribir...)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
              
              {isCustomCategory && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                  <input
                    name="custom_category"
                    type="text"
                    value={formData.custom_category}
                    onChange={handleProfileChange}
                    placeholder="Escribí tu rubro (ej. Servicio Técnico)"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Horarios de Atención</label>
              <BusinessHoursEditor
                value={formData.business_hours}
                onChange={(val) => setFormData(prev => ({ ...prev, business_hours: val }))}
              />
              <p className="text-xs text-slate-500 mt-2">Este horario aparecerá estructurado en tu perfil para los clientes.</p>
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
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
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
                <button
                  type="button"
                  onClick={handleExtractMaps}
                  disabled={isExtractingMaps || !formData.maps_url}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm text-white font-medium disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {isExtractingMaps ? <Loader2 className="h-4 w-4 animate-spin text-violet-400" /> : <MapPin className="h-4 w-4 text-violet-400" />}
                  Extraer Ubicación
                </button>
              </div>
              {mapExtractMessage.text && (
                <p className={`text-xs mt-1 ${mapExtractMessage.type === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {mapExtractMessage.text}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Dirección Física</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleProfileChange}
                  placeholder="Ej: Av. Corrientes 1234, CABA"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-sm font-medium text-slate-300">Ubicación en el Mapa</label>
              <LocationPicker 
                initialLat={formData.latitude} 
                initialLng={formData.longitude} 
                onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
              />
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

        {isPro && profile.role === 'merchant' && (
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <label className="block text-sm font-medium text-slate-300">
              <span className="flex items-center gap-2">
                Instagram <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Plan Pro</span>
              </span>
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              <input
                name="instagram"
                type="text"
                value={formData.instagram}
                onChange={handleProfileChange}
                placeholder="Ej: milocal.ok (Sin el @)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
            <p className="text-xs text-slate-500">Agregará un botón directo en tu perfil hacia la app de Instagram.</p>
          </div>
        )}

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
