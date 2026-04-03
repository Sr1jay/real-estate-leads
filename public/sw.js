const CACHE = "leadar-v1";
const STATIC_EXTS = [".js", ".css", ".woff2", ".svg", ".png", ".ico"];

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  // API + export: network-first, no cache
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(fetch(request));
    return;
  }

  // Static assets (_next/static, fonts, icons): cache-first
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    STATIC_EXTS.some((ext) => url.pathname.endsWith(ext));

  if (isStatic) {
    e.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((res) => {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
            return res;
          })
      )
    );
    return;
  }

  // Navigation: network-first, fall back to cached shell
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request) ?? caches.match("/"))
    );
  }
});
