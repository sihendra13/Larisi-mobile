const CACHE_NAME = 'larisi-mobile-v9';

const STATIC_ASSETS = [
  '/?cb=9',
  '/index.html?cb=9',
  '/login.html?cb=9',
  '/register.html?cb=9',
  '/onboarding.html?cb=9',
  '/src/css/tokens.css?cb=9',
  '/src/css/layout.css?cb=9',
  '/src/css/panel.css?cb=9',
  '/src/css/upload.css?cb=9',
  '/src/css/persona.css?cb=9',
  '/src/css/map.css?cb=9',
  '/src/css/chips.css?cb=9',
  '/src/css/phone.css?cb=9',
  '/src/css/caption.css?cb=9',
  '/src/css/stitch.css?cb=9',
  '/src/css/bottom-bar.css?cb=9',
  '/src/css/monitor.css?cb=9',
  '/src/css/analytics.css?cb=9',
  '/src/css/mobile.css?cb=9',
  '/src/js/config.js?cb=9',
  '/src/js/state.js?cb=9',
  '/src/js/main.js?cb=9',
  '/src/js/mobile.js?cb=9',
  '/src/data/personas.js?cb=9',
  '/src/data/locations.js?cb=9',
  '/src/data/region-dialek.js?cb=9',
  '/src/data/caption-templates.js?cb=9',
  '/Assets/logo-dashboard.png?cb=9'
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
