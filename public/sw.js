const VERSION = 'input-log-v1.1.0';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;
const PRECACHE = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/assets/icon.svg', '/assets/icon-192.png', '/assets/icon-512.png', '/assets/field-notes-hero-640.webp'];

self.addEventListener('install', event => {
  // `reload` prevents an HTTP 304 body from becoming an empty cached module
  // when installation follows the page's first network load.
  event.waitUntil(caches.open(SHELL).then(cache => cache.addAll(PRECACHE.map(url => new Request(url, { cache: 'reload' })))));
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => ![SHELL, ASSETS].includes(key)).map(key => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(SHELL).then(cache => cache.put('/index.html', copy));
      return response;
    }).catch(async () => (await caches.match('/index.html')) || (await caches.match('/offline.html'))));
    return;
  }
  if (url.pathname.startsWith('/assets/') || /\.(?:js|css|webp|avif|png|svg)$/.test(url.pathname)) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) caches.open(ASSETS).then(cache => cache.put(event.request, response.clone()));
      return response;
    })));
    return;
  }
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
