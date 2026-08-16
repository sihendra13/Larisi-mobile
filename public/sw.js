const CACHE = 'larisi-v6';
const PRECACHE = ['/logo_larisi.svg', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  /* Skip API calls & external services */
  if (url.hostname.includes('supabase') || url.hostname.includes('nominatim') || url.hostname.includes('huggingface') || url.hostname.includes('siliconflow') || !url.hostname.includes('localhost') && !url.hostname.includes('larisi')) return;

  /* Network-first untuk HTML — pastikan selalu dapat JS terbaru */
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).catch(() =>
        // Fallback ke cache — kalau tetap tidak ada (cache kosong / load pertama
        // offline), jangan biarkan respondWith() dapat undefined (penyebab
        // "network error response" di FetchEvent).
        caches.match(e.request).then(cached => cached || new Response('', { status: 503, statusText: 'Offline' }))
      )
    );
    return;
  }

  /* Cache-first untuk assets (gambar, font, dll) */
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      // Fetch gagal (network error) DAN tidak ada di cache — jangan biarkan
      // respondWith() dapat undefined (itu yang bikin "network error response").
      return fetch(e.request).catch(() => new Response('', { status: 503, statusText: 'Offline' }));
    })
  );
});

/* ─── Push notification (campaign berhasil/gagal tayang) ─── */
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch { data = { title: 'Larisi', body: e.data ? e.data.text() : '' }; }

  const title = data.title || 'Larisi';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/' },
    tag: 'larisi-campaign-notif',
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const targetUrl = (e.notification.data && e.notification.data.url) || '/';

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsArr => {
      const existing = clientsArr.find(c => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow(targetUrl);
    })
  );
});
