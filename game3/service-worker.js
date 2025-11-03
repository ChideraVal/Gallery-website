const CACHE_NAME = 'game-three-v1';
const urlsToCache = [
  '/game3/',
  '/game3/index.html',
  '/game3/settings.html',
  '/game3/store.html',
  '/game3/style.css'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
