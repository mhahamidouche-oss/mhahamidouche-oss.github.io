/* Copie locale de l'application pour un fonctionnement sans Internet.
   Après chaque mise à jour de index.html, augmenter le numéro de VERSION.
   v2 : ne s'occupe plus que de sa propre page, pour ne pas gêner les autres applications
   du même compte (par exemple /regles-association/). */
const VERSION = 'ad-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];
const MIENS = new Set(FILES.map(f => new URL(f, self.registration.scope).pathname));
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('ad-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const p = new URL(req.url).pathname;
  if (!MIENS.has(p)) return;   // une autre application : on laisse passer sans rien garder
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', cp)); return r; }).catch(() => caches.match('./index.html', { cacheName: VERSION })));
    return;
  }
  e.respondWith(caches.match(req, { cacheName: VERSION }).then(r => r || fetch(req)));
});
