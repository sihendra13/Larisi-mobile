// v12 — CLEAR ALL CACHE, no caching during active development
// Semua request langsung ke network, tidak ada yang di-cache

const CACHE_NAME = 'larisi-mobile-v12';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Hapus SEMUA cache tanpa terkecuali
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

// Tidak ada fetch handler — semua request langsung ke network
// Perubahan selalu langsung terlihat tanpa perlu unregister SW
