const CACHE = 'second-brain-os-v2';
const SHELL = ['/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Nunca cachear las llamadas a la IA: siempre tienen que ir a la red.
  if (e.request.url.includes('/api/')) return;

  // El HTML (y la navegación en general) siempre va primero a la red,
  // así las actualizaciones se ven al instante. Si no hay conexión, usa lo cacheado.
  const isHTML = e.request.mode === 'navigate' || e.request.url.endsWith('/index.html') || e.request.url.endsWith('/');
  if (isHTML) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // El resto (íconos, manifest) sí puede servirse cacheado primero.
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
