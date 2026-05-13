const CACHE_NAME = 'news-portal-v10';
const STATIC_ASSETS = [
  '/news-hub/',
  '/news-hub/index.html',
  '/news-hub/bengali.html',
  '/news-hub/national.html',
  '/news-hub/world.html',
  '/news-hub/manifest.json',
  '/news-hub/icons/icon-192.png',
  '/news-hub/icons/icon-512.png',
  '/news-hub/data/geo-utils.js',
  '/news-hub/data/geo-districts.js',
  '/news-hub/data/geo-states.js',
  '/news-hub/data/geo-countries.js',
];

// HTML pages — always fetch fresh, these change with every deploy
const HTML_PAGES = [
  '/news-hub/', '/news-hub/index.html',
  '/news-hub/bengali.html', '/news-hub/national.html', '/news-hub/world.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
//   HTML pages + videos.json → network first, cache fallback (always fresh)
//   geo data / manifest      → cache first, network fallback (rarely changes)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isHtml = HTML_PAGES.some(p => url.pathname === p || url.pathname.endsWith('.html'));
  const isData = url.pathname.includes('videos.json') || url.pathname.includes('video_id_cache.json');

  if (isHtml || isData) {
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
