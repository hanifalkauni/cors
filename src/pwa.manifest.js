// Cache images
workbox.routing.registerRoute(
  /\.(?:jpg|jpeg|png|gif|webp|ico|svg)$/,
  new workbox.strategies.CacheFirst({
    cacheName: "images",
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
      })
    ]
  })
);
// Cache JavaScript and CSS Files
workbox.routing.registerRoute(
  /\.(?:js|mjs|css)$/,
  new workbox.strategies.CacheFirst({
    cacheName: "static",
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 300 // 5 minutes
      })
    ]
  })
);
// Router
//workbox.routing.registerNavigationRoute("/");
// Force service worker to update immediately after installing
self.addEventListener("install", function(event) {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", function(event) {
  self.clients.claim();
});
// Google Analytics offline
workbox.googleAnalytics.initialize();
