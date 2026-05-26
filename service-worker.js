const CACHE_NAME = 'larisi-mobile-v3';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/register.html',
  '/onboarding.html',
  '/src/css/tokens.css',
  '/src/css/layout.css',
  '/src/css/panel.css',
  '/src/css/upload.css',
  '/src/css/persona.css',
  '/src/css/map.css',
  '/src/css/chips.css',
  '/src/css/phone.css',
  '/src/css/caption.css',
  '/src/css/stitch.css',
  '/src/css/bottom-bar.css',
  '/src/css/monitor.css',
  '/src/css/analytics.css',
  '/src/css/mobile.css',
  '/src/js/config.js',
  '/src/js/state.js',
  '/src/js/main.js',
  '/src/js/mobile.js',
  '/src/data/personas.js',
  '/src/data/locations.js',
  '/src/data/region-dialek.js',
  '/src/data/caption-templates.js',
  '/Assets/logo-dashboard.png'
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
