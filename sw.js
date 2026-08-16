// Service Worker — Distribuidora do Batata CRM
// Habilita uso offline (PWA). Requer ser servido via http(s) ou localhost.
const CACHE = 'batata-crm-v1';
const ASSETS = [
  './',
  './distribuidora-batata-crm-1.html',
  './sql-wasm.js',
  './sql-wasm.wasm',
  './manifest.json',
  './icon.svg',
  './qrcode-lib.js',
  './logo-b64.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r =>
      r || fetch(e.request).then(resp => {
        const cp = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return resp;
      }).catch(() => caches.match('./'))
    )
  );
});
