'use client';

import { useState, useEffect } from 'react';
import { subscribeToPushServer, unsubscribeFromPushServer } from '@/app/actions/push';
import { BellRing, BellOff, Loader2 } from 'lucide-react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlB64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking push subscription', err);
    }
    setLoading(false);
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // Send to server
        const res = await subscribeToPushServer(JSON.parse(JSON.stringify(subscription)));
        if (res.success) {
          setIsSubscribed(true);
        } else {
          console.error('Server error subscribing:', res.error);
        }
      } else {
        alert('Debes permitir las notificaciones en tu navegador.');
      }
    } catch (err) {
      console.error('Error subscribing', err);
      alert('Hubo un error al suscribirse. Verifica los permisos de tu navegador.');
    }
    setLoading(false);
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await unsubscribeFromPushServer(subscription.endpoint);
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('Error unsubscribing', err);
    }
    setLoading(false);
  };

  if (!isSupported) {
    return (
      <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-4 text-amber-200 text-sm">
        Tu navegador no soporta notificaciones push.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm mb-6">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isSubscribed ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
          {isSubscribed ? <BellRing className="h-5 w-5 text-emerald-400" /> : <BellOff className="h-5 w-5 text-slate-400" />}
        </div>
        <div>
          <h3 className="text-white text-sm font-medium">
            {isSubscribed ? 'Notificaciones activadas' : 'Notificaciones desactivadas'}
          </h3>
          <p className="text-xs text-slate-400">
            {isSubscribed 
              ? 'Recibís avisos de pagos en este dispositivo.' 
              : 'Activá para recibir alertas de pagos.'}
          </p>
        </div>
      </div>
      
      <button
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        disabled={loading}
        className={`text-xs px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
          isSubscribed 
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
            : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
        }`}
      >
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        {isSubscribed ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  );
}
