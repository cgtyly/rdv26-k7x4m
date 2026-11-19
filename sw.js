/* Offline support. Core page is cached on install; documents are cached when opened or saved. */
const V = "rdv26-20261119221130";
const CORE = ["./", "index.html", "vendor/leaflet.min.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "live.json"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("rdv26-") && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    const p = u.pathname;
    const page = p.endsWith("/") || p.endsWith("index.html");
    if (page || p.endsWith("live.json")) {
      const key = page ? "index.html" : "live.json";
      e.respondWith(fetch(r).then(res => {
        if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(key, cp)); }
        return res;
      }).catch(() => caches.match(key)));
      return;
    }
    e.respondWith(caches.match(r, {ignoreSearch: true}).then(hit => {
      const net = fetch(r).then(res => {
        if (res.ok) { const cp = res.clone(); caches.open("rdv-docs").then(c => c.put(r, cp)); }
        return res;
      });
      if (hit) { net.catch(() => {}); return hit; }
      return net;
    }));
    return;
  }
  if (u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
      const cp = res.clone(); caches.open("rdv-fonts").then(c => c.put(r, cp));
      return res;
    })));
  }
});
