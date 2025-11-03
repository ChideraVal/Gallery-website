const CACHE_NAME = 'game-two-v1';
const urlsToCache = [
  '/game2/',
  '/game2/index.html',
  '/game2/settings.html',
  '/game2/store.html',
  '/game2/style.css'
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
