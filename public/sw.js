// Trailhead Service Worker for Phone Push & Background Reminders
const CACHE_NAME = 'trailhead-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming push notifications
self.addEventListener('push', (event) => {
  let data = { title: 'Trailhead Reminder', body: 'You have a scheduled expedition alert!' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [300, 150, 300, 150, 300],
    data: {
      url: data.url || '/',
      id: data.id,
    },
    actions: [
      { action: 'open', title: 'Open Trailhead' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    tag: data.tag || 'trailhead-reminder',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Trailhead Alert', options)
  );
});

// Handle notification interaction / taps on phone
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

