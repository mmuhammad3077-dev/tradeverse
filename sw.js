/* TradeVerse service worker: offline-first app shell. Bump VERSION when files change. */
const VERSION = "sukoon-v17";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const save = res => { if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); } return res; };
  // Pages (the game itself): network first, so a new version shows right away; cache when offline.
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(save).catch(() => caches.match(e.request).then(h => h || caches.match("./index.html"))));
    return;
  }
  // Other files: cache first, refresh in the background.
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(save).catch(() => hit || Response.error());
    return hit || net;
  }));
});
