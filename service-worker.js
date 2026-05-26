const CACHE_NAME = 'larisi-mobile-v11';

const STATIC_ASSETS = [
  '/?cb=11',
  '/index.html?cb=11',
  '/login.html?cb=11',
  '/register.html?cb=11',
  '/onboarding.html?cb=11',
  '/src/css/tokens.css?cb=11',
  '/src/css/layout.css?cb=11',
  '/src/css/panel.css?cb=11',
  '/src/css/upload.css?cb=11',
  '/src/css/persona.css?cb=11',
  '/src/css/map.css?cb=11',
  '/src/css/chips.css?cb=11',
  '/src/css/phone.css?cb=11',
  '/src/css/caption.css?cb=11',
  '/src/css/stitch.css?cb=11',
  '/src/css/bottom-bar.css?cb=11',
  '/src/css/monitor.css?cb=11',
  '/src/css/analytics.css?cb=11',
  '/src/css/mobile.css?cb=11',
  '/src/js/config.js?cb=11',
  '/src/js/state.js?cb=11',
  '/src/js/main.js?cb=11',
  '/src/js/mobile.js?cb=11',
  '/src/data/personas.js?cb=11',
  '/src/data/locations.js?cb=11',
  '/src/data/region-dialek.js?cb=11',
  '/src/data/caption-templates.js?cb=11',
  '/Assets/logo-dashboard.png?cb=11'
];

// Install — cache semua static assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — hapus semua cache lama
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — strategi berbeda per jenis request
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  var url = new URL(event.request.url);

  // Selalu ke network: Supabase, Groq, API eksternal
  if (url.hostname.includes('supabase') ||
      url.hostname.includes('groq') ||
      url.hostname.includes('postforme') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('jsdelivr') ||
      url.hostname.includes('unpkg')) {
    return;
  }

  // NETWORK-FIRST untuk file kita sendiri (/src/, /Assets/, root HTML)
  // → perubahan deployment SELALU langsung terlihat
  // → SW tidak blok update sama sekali
  var isOwnAsset = url.hostname === self.location.hostname && (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/Assets/') ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/service-worker.js'
  );

  if (isOwnAsset) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        // Update cache dengan versi terbaru
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback: serve dari cache kalau network gagal
        return caches.match(event.request);
      })
    );
    return;
  }

  // CACHE-FIRST untuk CDN eksternal (Leaflet, Chart.js, fonts, dll)
  // → loading cepat, jarang berubah
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    })
  );
});
