'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { X, Megaphone, AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';

interface Notification {
  id: string;
  message: string | React.ReactNode;
  type: string;
  isReport?: boolean;
}

export function GlobalNotificationBanner({ isSuperAdmin }: { isSuperAdmin?: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotification = async () => {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('global_notifications')
        .select('id, message, type')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      let activeNotifs: Notification[] = [];
      if (data && !error) {
        // Filtramos las que ya cerró
        activeNotifs = data.filter(n => {
          return localStorage.getItem(`dismissed_notif_${n.id}`) !== 'true';
        });
      }

      // Si es SuperAdmin, buscar reportes pendientes
      if (isSuperAdmin) {
        const { count, error: countError } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (count && count > 0 && !countError) {
          activeNotifs.unshift({
            id: 'pending_reports_alert',
            message: (
              <span>
                Tienes <strong>{count} {count === 1 ? 'denuncia pendiente' : 'denuncias pendientes'}</strong> de revisión. <Link href="/admin/reports" className="underline font-bold text-red-200 hover:text-white">Ver denuncias</Link>
              </span>
            ),
            type: 'error',
            isReport: true
          });
        }
      }

      setNotifications(activeNotifs);
      setLoading(false);
    };
    fetchNotification();
  }, [isSuperAdmin]);

  const handleDismiss = (id: string) => {
    localStorage.setItem(`dismissed_notif_${id}`, 'true');
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading || notifications.length === 0) return null;

  const getStyles = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.1)]';
      case 'success': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.1)]';
      case 'error': return 'bg-red-500/20 border-red-500/30 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.15)]';
      default: return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.1)]';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
      case 'error': return <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0" />;
      default: return <Megaphone className="w-5 h-5 text-cyan-400 flex-shrink-0" />;
    }
  };

  return (
    <>
      {notifications.map(notif => (
        <div key={notif.id} className={`mb-4 rounded-2xl border p-4 pr-10 relative flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500 ${getStyles(notif.type)}`}>
          <div className="mt-0.5">
            {getIcon(notif.type)}
          </div>
          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{notif.message}</p>
          <button 
            onClick={() => handleDismiss(notif.id)}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </>
  );
}
