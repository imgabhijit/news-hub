const CACHE_NAME = 'news-portal-v2';
const STATIC_ASSETS = [
  '/news-hub/',
  '/news-hub/index.html',
  '/news-hub/bengali.html',
  '/news-hub/manifest.json',
];

// Cache static assets on install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Remove old caches on activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
//   data/videos.json  → network first, fall back to cache
//   everything else   → cache first, fall back to network
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  if (url.pathname.includes('videos.json')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
