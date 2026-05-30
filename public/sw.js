const CACHE = 'larisi-v4';
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

  /* Skip API calls */
  if (url.hostname.includes('supabase') || url.hostname.includes('nominatim')) return;

  /* Network-first untuk HTML — pastikan selalu dapat JS terbaru */
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  /* Cache-first untuk assets (gambar, font, dll) */
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
