// יומיומי · Self-destructing Service Worker
// During development we don't want any cached responses.
// This SW unregisters itself and deletes all caches as soon as it activates.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Delete every cache
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    // Unregister this SW
    await self.registration.unregister();
    // Reload all clients
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => client.navigate(client.url));
  })());
});

// Don't cache anything — fall through to network
self.addEventListener('fetch', () => {});
