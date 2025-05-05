/* eslint-disable no-restricted-globals */

// Default configuration
const DEFAULT_CONFIG = {
  appName: 'Charter Search',
  notificationIcon: '/notification-icon.png',
  notificationBadge: '/notification-badge.png'
};

let config = DEFAULT_CONFIG;

// Listen for config updates from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CONFIG_UPDATE') {
    config = { ...DEFAULT_CONFIG, ...event.data.config };
  }
});

self.addEventListener('push', function(event) {
  if (event.data) {
    let data;
    try {
      data = event.data.json();
    } catch (e) {
      // If JSON parsing fails, treat it as plain text
      data = {
        title: 'New Notification',
        body: event.data.text()
      };
    }

    const options = {
      body: data.body,
      icon: config.notificationIcon,
      badge: config.notificationBadge,
      data: {
        ...data.data,
        timestamp: new Date().getTime()
      },
      actions: data.actions || [],
      vibrate: [200, 100, 200],
      tag: 'charter-notification',
      renotify: true,
      requireInteraction: true,
      silent: false,
      timestamp: new Date().getTime()
    };

    const title = `${config.appName}: ${data.title}`;

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    );
  }
});

// Force the service worker to become active immediately
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// Take control of all clients as soon as the service worker is activated
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      self.skipWaiting()
    ])
  );
}); 