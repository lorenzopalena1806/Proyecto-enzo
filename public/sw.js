const CACHE_NAME = 'lazoo-cache-v1';
const OFFLINE_URLS = ['/', '/client/qr', '/manifest.json', '/logo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch(err => console.warn('Cache addAll error (ignored)', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Ignore API and supabase requests for cache
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        if (response) return response;
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('', { status: 408, headers: { 'Content-Type': 'text/plain' } });
      });
    })
  );
});

self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon || '/logo.png',
        badge: '/logo.png',
        vibrate: data.vibrate || [200, 100, 200, 100, 200, 100, 200],
        data: {
          url: data.url || '/',
        },
      };

      event.waitUntil(self.registration.showNotification(data.title, options));
    } catch (e) {
      console.error('Error parsing push data', e);
      // Fallback for simple text payloads
      event.waitUntil(
        self.registration.showNotification(event.data.text(), {
          icon: '/logo.png',
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it.
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
