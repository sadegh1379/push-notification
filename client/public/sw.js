self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push message received:', event);

  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'اعلان جدید',
        body: event.data.text(),
        icon: '/next.svg',
        badge: '/next.svg'
      };
    }
  }

  // old data option **************************************************
  const title = data.title || 'اعلان جدید';
  const options = {
    body: data.body || 'شما یک پیام جدید دارید',
    icon: data.icon || '/next.svg',
    badge: data.badge || '/next.svg',
    image: data.image,
    data: {
      url: data.url || '/',
      ...data
    },
    actions: data.actions || [
      { action: 'open', title: 'باز کردن' },
      { action: 'close', title: 'بستن' }
    ],
    vibrate: [200, 100, 200],
    tag: data.tag || 'default-tag',
    requireInteraction: data.requireInteraction || false
  };

  // new data option **************************************************
  // const normalizedData = {
  //   // android
  //   title: data.title || 'اعلان جدید',
  //   body: data.body || 'شما یک پیام جدید دارید',
  //   icon: data.icon || '/next.svg',
  //   badge: data.badge || '/next.svg',
  //   image: data.image,
  //   url: data.url || '/',

  //   // ios
  //   aps: {
  //     alert: {
  //       title: data.title,
  //       body: data.body,
  //       subtitle: ""
  //     },
  //     badge: 1,
  //     sound: 'default',
  //   },
  // };

  // const options = {
  //   title: normalizedData.title,
  //   body: normalizedData.body,
  //   icon: normalizedData.icon,
  //   badge: normalizedData.badge,
  //   image: normalizedData.image,
  //   data: normalizedData,
  //   actions: [
  //     { action: 'open', title: 'باز کردن' },
  //     { action: 'close', title: 'بستن' },
  //   ],
  //   vibrate: [200, 100, 200],
  //   tag: 'default-tag',
  //   requireInteraction: false,
  //   silent: false,
  // };


  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

