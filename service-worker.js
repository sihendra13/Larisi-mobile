const CACHE_NAME = 'larisi-mobile-v7';

const STATIC_ASSETS = [
  '/?cb=7',
  '/index.html?cb=7',
  '/login.html?cb=7',
  '/register.html?cb=7',
  '/onboarding.html?cb=7',
  '/src/css/tokens.css?cb=7',
  '/src/css/layout.css?cb=7',
  '/src/css/panel.css?cb=7',
  '/src/css/upload.css?cb=7',
  '/src/css/persona.css?cb=7',
  '/src/css/map.css?cb=7',
  '/src/css/chips.css?cb=7',
  '/src/css/phone.css?cb=7',
  '/src/css/caption.css?cb=7',
  '/src/css/stitch.css?cb=7',
  '/src/css/bottom-bar.css?cb=7',
  '/src/css/monitor.css?cb=7',
  '/src/css/analytics.css?cb=7',
  '/src/css/mobile.css?cb=7',
  '/src/js/config.js?cb=7',
  '/src/js/state.js?cb=7',
  '/src/js/main.js?cb=7',
  '/src/js/mobile.js?cb=7',
  '/src/data/personas.js?cb=7',
  '/src/data/locations.js?cb=7',
  '/src/data/region-dialek.js?cb=7',
  '/src/data/caption-templates.js?cb=7',
  '/Assets/logo-dashboard.png?cb=7'
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

// Activate — hapus cache lama
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

// Fetch — cache-first untuk static, network-first untuk API
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Lewati request ke Supabase, Groq, PostForMe — selalu network
  if (url.hostname.includes('supabase') ||
      url.hostname.includes('groq') ||
      url.hostname.includes('postforme') ||
      url.hostname.includes('leaflet') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('jsdelivr')) {
    return;
  }

  // Cache-first untuk static assets (CSS, JS, gambar)
  if (event.request.method === 'GET') {
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
  }
});
