// Panthiya service worker: the app opens instantly and works offline. Data has its own offline
// cache (Firestore), so this only keeps the app's files and fonts.
const VERSION = 'b65c2cd001';
const SHELL = ["/panthiya/","/panthiya/index.html","/panthiya/app-2223e65d.css","/panthiya/app-JQUQND6F.js","/panthiya/manifest.webmanifest","/panthiya/icon.svg","/panthiya/icon-192.png","/panthiya/icon-512.png"];
const CACHE = 'panthiya-' + VERSION;
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('panthiya-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Firebase traffic is handled by the Firebase SDK itself.
  if (/googleapis\.com$|firebaseio\.com$/.test(url.hostname) && !url.hostname.startsWith('fonts.')) return;
  if (req.mode === 'navigate') { e.respondWith(fetch(req).catch(() => caches.match('/panthiya/index.html'))); return; }
  const cacheable = url.origin === location.origin || /^(fonts\.(googleapis|gstatic)\.com|www\.gstatic\.com|cdn\.jsdelivr\.net)$/.test(url.hostname);
  if (!cacheable) return;
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  })));
});
