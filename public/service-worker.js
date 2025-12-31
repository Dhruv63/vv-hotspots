
self.addEventListener('push', function (event) {
  if (!event.data) {
    console.log('Push event but no data')
    return
  }

  try {
    const data = event.data.json()
    const options = {
      body: data.body || 'New notification',
      icon: '/icon-light-192x192.png',
      badge: '/icon-light-192x192.png', // Small monochrome icon for status bar usually, but using app icon for now
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/',
      },
    }

    event.waitUntil(self.registration.showNotification(data.title || 'VV Hotspots', options))
  } catch (err) {
    console.error('Error parsing push data:', err)
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      if (clientList.length > 0) {
        let client = clientList[0]
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i]
          }
        }
        return client.focus()
      }
      return clients.openWindow(event.notification.data.url || '/')
    }),
  )
})

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});
