
// Tethonic PWA Service Worker
const CACHE_NAME = 'tethonic-v1.0.0';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('Tethonic SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Tethonic SW: Caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        console.log('Tethonic SW: App shell cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Tethonic SW: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Tethonic SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Tethonic SW: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Tethonic SW: Serving from cache:', event.request.url);
          return response;
        }

        console.log('Tethonic SW: Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response before caching
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('Tethonic SW: Background sync triggered');
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync tasks here
      console.log('Tethonic SW: Performing background sync')
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Tethonic SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New trading signal available',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Signal',
        icon: '/favicon-16x16.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon-16x16.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Tethonic', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Tethonic SW: Notification clicked');
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard/signals')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Tethonic Service Worker registered successfully');
