const CACHE_NAME = 'rapporto-servizio-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './rapporti.png',
  './xandroid.png',
  './xiphone.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Strategia: Cache first, fallback su rete
// Le richieste Firebase vanno sempre sulla rete
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Firebase: sempre rete, mai cache
  if (url.includes('firebaseapp.com') || url.includes('googleapis.com') || url.includes('gstatic.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    }).catch(() => caches.match('./index.html'))
  );
});
