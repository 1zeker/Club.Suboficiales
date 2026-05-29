// Club de Suboficiales — Service Worker (offline support)
const CACHE_NAME = 'cds-cotizador-v2';
const LOCAL_ASSETS = [
  './',
  './index.html',
  './logo2.jpg',
  './calzada.jpg',
  './manifest.json'
];

// Install: cache local assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(LOCAL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for local assets, network-first for external (fonts, CDN)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  if (url.origin === location.origin) {
    // Local files: cache first, fall back to network
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          // If offline and not cached, return fallback for HTML
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
  // External requests (Google Fonts, CDN): network first, no caching to avoid CORS issues
});
