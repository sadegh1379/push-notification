// Service Worker برای مدیریت پوش نوتیفیکیشن

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(clients.claim());
});

// دریافت پوش نوتیفیکیشن
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

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// کلیک روی نوتیفیکیشن
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
        // اگر تب باز است، focus کن
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // وگرنه تب جدید باز کن
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// بستن نوتیفیکیشن
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

