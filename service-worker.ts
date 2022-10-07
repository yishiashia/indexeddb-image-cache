import { cachePut, cacheMatch } from './idb';

declare var self: ServiceWorkerGlobalScope;
export {};

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('fetch', async (event) => {
  const url = new URL(event.request.url);
  if (event.request.destination === 'image' && url.pathname.startsWith('/sticker/')) {
    // Handle sticker images cache here
    event.respondWith(
      cacheMatch(url.pathname)
      .then(sticker => {
        if (sticker !== undefined) {
          // 0. Sticker image cache found in indexedDB,
          //    reply with cached payload.
          return new Response(sticker?.blob)
        } else {
          throw new Error(`Sticker not found in DB: ${url.pathname}`);
        }
      })
      .catch(err => {
        // 1. Sticker not found in indexedDB,
        //    fetch from backend web server.
        console.error(err);
        return fetch(event.request)
          .then(async (httpResponse) => {
              const httpResponseToCache = httpResponse.clone();
              const imgBlob = await httpResponse.blob();
              cachePut({
                id: url.pathname,
                blob: imgBlob
              })
              return httpResponseToCache;
          })
          .catch(err => {
            throw err;
          })
      })
    ); // end event.respondWith()
  }
});
