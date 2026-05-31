// Club de Suboficiales — Service Worker (offline support)
const CACHE_NAME = 'cds-cotizador-v5';
const LOCAL_ASSETS = [
  '../',
  '../index.html',
  '../admin.html',
  '../assets/logo2.jpg',
  '../assets/calzada.jpg',
  '../pwa/manifest.json'
];

// Install: cache local assets and skip waiting immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(LOCAL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: remove ALL old caches and claim clients immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: NETWORK-FIRST for HTML/JS (ensures updates load), cache fallback for offline
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  if (url.origin === location.origin) {
    // Local HTML/JS files: network-first so updates always apply
    const isDocument = event.request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname.endsWith('.js');

    if (isDocument) {
      event.respondWith(
        fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          // Offline fallback: use cache
          return caches.match(event.request).then(cached => {
            return cached || caches.match('../index.html');
          });
        })
      );
    } else {
      // Images and other static assets: cache-first (they don't change often)
      event.respondWith(
        caches.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
          });
        })
      );
    }
  }
  // External requests (Google Fonts, CDN): network only, no caching to avoid CORS issues
});

