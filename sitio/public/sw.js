/* Service worker del prototipo.
   - Guarda solo lo público, para abrir rápido y mostrar "Sin conexión".
   - NUNCA guarda el área de miembros, el checkout ni las respuestas del servidor privado. */
const VERSION = "jb-v1";
const PRECARGA = ["/sin-conexion", "/icons/icon-192.png", "/icons/icon-512.png"];
const PRIVADO = ["/mi-espacio", "/checkout", "/api", "/ingresar", "/crear-cuenta"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(PRECARGA)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const privado = PRIVADO.some((p) => url.pathname.startsWith(p));

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (!privado && res.ok) {
            const copia = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copia));
          }
          return res;
        })
        .catch(async () => (!privado && (await caches.match(req))) || caches.match("/sin-conexion"))
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copia = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copia));
            return res;
          })
      )
    );
  }
});
