self.addEventListener('push', function(event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Khora';
    const options = {
      body: data.body || 'Tienes una nueva actualización en Khora.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/dashboard'
      }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (e) {
    console.error('Error parsing push notification payload:', e);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Intentar enfocar una pestaña existente con la misma URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // O abrir una nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
