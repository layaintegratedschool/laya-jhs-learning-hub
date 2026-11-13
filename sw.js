
const CACHE_NAME = "laya-jhs-shell-v2";
const PDF_CACHE = "laya-jhs-pdfs-v1";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key =>
              key !== CACHE_NAME &&
              key !== PDF_CACHE
            )
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Previously unlocked PDFs
  if (url.pathname.includes("/offline-pdfs/")) {
    event.respondWith(
      caches.open(PDF_CACHE).then(async cache => {
        const saved = await cache.match(request);

        return saved || new Response(
          "This PDF has not been saved on this device yet. Connect to the internet and unlock it first.",
          {
            status: 404,
            headers: {
              "Content-Type": "text/plain"
            }
          }
        );
      })
    );
    return;
  }

  // Website pages: network first, cached page if offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async response => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(
              new URL("./index.html", self.registration.scope),
              response.clone()
            );
          }

          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);

          return await cache.match(
            new URL("./index.html", self.registration.scope)
          ) || new Response(
            "The Learning Hub is not available offline yet.",
            { status: 503 }
          );
        })
    );
    return;
  }

  // Other same-origin website files
  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(request);

      if (cached) return cached;

      try {
        const response = await fetch(request);

        if (response.ok && response.type === "basic") {
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        return new Response("This resource is unavailable offline.", {
          status: 503
        });
      }
    })
  );
});
