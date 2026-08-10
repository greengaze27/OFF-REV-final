const CACHE_NAME = "off-rev-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./upload.html",
    "./flashcard.html",
    "./quiz.html",
    "./result.html",
    "./style.css",
    "./upload.js",
    "./quiz.js"
];


self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                return cachedResponse || fetch(event.request);
            })
    );
});
