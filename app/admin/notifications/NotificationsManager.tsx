'use client';

import { useState } from 'react';

import { createGlobalNotification, toggleNotificationStatus, deleteGlobalNotification } from '@/app/actions/admin-notifications';
import { Megaphone, AlertTriangle, CheckCircle2, Info, Trash2, Power } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: string;
  is_active: boolean;
  created_at: string;
  target_merchant_id: string | null;
  profiles?: { business_name: string };
}

interface Merchant {
  id: string;
  business_name: string;
}

export function NotificationsManager({ initialNotifications, merchants }: { initialNotifications: Notification[], merchants: Merchant[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await createGlobalNotification(formData);

    if (!res.success) {
      setError(res.error || 'Error al crear la notificación');
      setLoading(false);
      return;
    }

    // Recargar página o esperar que el server action revalide
    window.location.reload();
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => {
      if (n.id === id) return { ...n, is_active: !currentStatus };
      if (!currentStatus) return { ...n, is_active: false }; // Si prendemos uno, los demás se apagan
      return n;
    }));

    const res = await toggleNotificationStatus(id, !currentStatus);
    if (!res.success) {
      window.location.reload(); // revert on fail
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que querés borrar este comunicado?')) return;
    
    setNotifications(prev => prev.filter(n => n.id !== id));
    await deleteGlobalNotification(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulario */}
      <div className="lg:col-span-1">
        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-cyan-400" /> Nuevo Comunicado
          </h2>

          {error && <p className="text-red-400 text-sm bg-red-400/10 p-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mensaje</label>
            <textarea
              name="message"
              required
              rows={3}
              placeholder="Ej: El lunes 25 realizaremos un mantenimiento programado."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Aviso</label>
            <select
              name="type"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none"
            >
              <option value="info">Información (Azul)</option>
              <option value="warning">Alerta Importante (Amarillo)</option>
              <option value="success">Buenas Noticias (Verde)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Destinatario</label>
            <select
              name="target_merchant_id"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none mb-4"
            >
              <option value="all">Para todos los comercios (Global)</option>
              {merchants.map(m => (
                <option key={m.id} value={m.id}>{m.business_name || 'Comercio sin nombre'}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Publicando...' : 'Publicar Aviso'}
          </button>
        </form>
      </div>

      {/* Lista de Notificaciones */}
      <div className="lg:col-span-2 space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-10 text-center">
            <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No hay comunicados publicados.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`bg-slate-900 border rounded-2xl p-5 flex items-start gap-4 transition-all ${notif.is_active ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-slate-800 opacity-75'}`}
            >
              <div className="mt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm whitespace-pre-wrap">{notif.message}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${notif.target_merchant_id ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20' : 'bg-slate-800 text-slate-300'}`}>
                    {notif.target_merchant_id ? `Solo para: ${notif.profiles?.business_name || 'Desconocido'}` : 'Global'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs font-medium text-slate-500">
                  <span>
                    {new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(notif.created_at))}
                  </span>
                  <span>•</span>
                  <span className={notif.is_active ? 'text-cyan-400 font-bold' : ''}>
                    {notif.is_active ? 'Activo (Mostrándose)' : 'Apagado'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(notif.id, notif.is_active)}
                  title={notif.is_active ? 'Apagar comunicado' : 'Prender comunicado'}
                  className={`p-2 rounded-lg transition-colors ${notif.is_active ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(notif.id)}
                  title="Eliminar comunicado"
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
