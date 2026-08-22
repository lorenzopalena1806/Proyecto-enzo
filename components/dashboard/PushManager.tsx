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
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${isSubscribed ? 'bg-blue-500/20 border-blue-500/40' : 'bg-slate-700 border-slate-600'}`}>
          {isSubscribed ? <BellRing className="h-6 w-6 text-blue-400" /> : <BellOff className="h-6 w-6 text-slate-400" />}
        </div>
        <div>
          <h3 className="text-white font-bold">{isSubscribed ? 'Notificaciones Activadas' : 'Activar Notificaciones'}</h3>
          <p className="text-sm text-slate-400 max-w-xs">
            {isSubscribed 
              ? 'Recibirás avisos en este dispositivo cuando un cliente pague exitosamente.' 
              : 'Activá los avisos para enterarte al instante de los pagos exitosos.'}
          </p>
        </div>
      </div>
      
      <button
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        disabled={loading}
        className={`px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 ${
          isSubscribed 
            ? 'bg-slate-700 hover:bg-slate-600 text-white' 
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
        }`}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubscribed ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  );
}
