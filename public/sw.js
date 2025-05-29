const CACHE_NAME = 'nutriguide-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/login',
  '/register',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle background sync logic here
  console.log('Background sync triggered');
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received:', event)
  
  let notificationData = {
    title: 'NutriGuide',
    body: 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: {
      url: '/dashboard'
    }
  }

  // Parse notification data if available
  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        image: data.image,
        tag: data.tag || 'nutriguide-notification',
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        vibrate: data.vibrate || [100, 50, 100],
        data: data.data || notificationData.data,
        actions: data.actions || [
          {
            action: 'open',
            title: 'Ver más',
            icon: '/icons/icon-96x96.png'
          },
          {
            action: 'dismiss',
            title: 'Cerrar',
            icon: '/icons/icon-72x72.png'
          }
        ]
      }
    } catch (error) {
      console.error('Error parsing notification data:', error)
      // Use default data if parsing fails
      notificationData.body = event.data.text()
    }
  }

  console.log('📱 Showing notification:', notificationData.title)

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event.action)
  
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/dashboard'
  
  // Handle different actions
  if (event.action === 'dismiss') {
    // Just close the notification
    return
  }

  // For 'open' action or default click, open the app
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          console.log('📱 Focusing existing window')
          return client.focus()
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        console.log('📱 Opening new window:', urlToOpen)
        return clients.openWindow(urlToOpen)
      }
    })
  )
}) 