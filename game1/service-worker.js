const CACHE_NAME = 'game-one-v1';
const urlsToCache = [
  '/game1/',
  '/game1/index.html',
  '/game1/moves.html',
  '/game1/result.html',
  '/game1/game2.css',
  '/game1/settings.html',
  '/game1/store.html',
  '/game1/style.css'
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
