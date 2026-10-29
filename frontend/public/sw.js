// Self-destructing Service Worker to eliminate any zombie sw.js on localhost:3000
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return caches.keys().then((keys) => {
        return Promise.all(keys.map((k) => caches.delete(k)));
      });
    })
  );
});

// Pass-through fetch handler that never tries to cache chrome-extension or external URLs
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
