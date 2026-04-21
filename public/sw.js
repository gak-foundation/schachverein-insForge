const CACHE_NAME = "schachverein-v2"; // Version erhöht
const STATIC_ASSETS = ["/manifest.json", "/favicon.ico"]; // Nur absolute Basics

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  
  // Nur GET-Requests cachen
  if (request.method !== "GET") return;

  // API-Requests oder Auth-Routen immer direkt vom Netzwerk
  if (request.url.includes("/api/") || request.url.includes("/auth/")) {
    return;
  }

  // Network-First Strategie: Erst Netzwerk, dann Cache als Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Wenn Netzwerk erfolgreich, Cache aktualisieren
        if (response.ok && request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Wenn Netzwerk fehlschlägt, aus Cache laden
        return caches.match(request);
      })
  );
});
