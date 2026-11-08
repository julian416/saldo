// Zorgt dat Saldo ook zonder internet opent. Verhoog VERSION bij een nieuwe versie van de app.
const VERSION = "saldo-5";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png", "./favicon-48.png", "./xlsx.full.min.js", "./fonts/hedvig-letters-serif-latin-400-normal.woff2", "./fonts/geist-latin-300-normal.woff2", "./fonts/geist-latin-400-normal.woff2", "./fonts/geist-latin-500-normal.woff2", "./fonts/geist-latin-600-normal.woff2"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Eerst uit de opslag (snel en offline), op de achtergrond bijwerken voor de volgende keer.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const key = req.mode === "navigate" ? "./index.html" : req;
      const hit = await cache.match(key);
      const fresh = fetch(req).then(res => {
        if (res && res.ok) cache.put(key, res.clone());
        return res;
      }).catch(() => null);
      return hit || (await fresh) || new Response("Offline", { status: 503 });
    })
  );
});
