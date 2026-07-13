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
      const absoluteTargetUrl = new URL(targetUrl, self.location.origin).href;

      // Buscar si el usuario ya tiene abierta alguna pestaña de nuestra app (mismo origen/dominio)
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        const clientUrl = new URL(client.url);
        
        if (clientUrl.origin === self.location.origin && 'focus' in client) {
          if ('navigate' in client) {
            return client.navigate(absoluteTargetUrl).then(c => c ? c.focus() : null);
          }
          return client.focus();
        }
      }

      // Si no hay pestañas abiertas del sitio, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(absoluteTargetUrl);
      }
    })
  );
});
