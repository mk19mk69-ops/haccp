/* Service worker minimal : sert uniquement à afficher les notifications de la démo (aucun cache, aucune donnée envoyée). */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then(function (l) { if (l.length) return l[0].focus(); return self.clients.openWindow("./#demos"); }));
});
