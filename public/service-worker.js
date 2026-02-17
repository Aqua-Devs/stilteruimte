const CACHE_NAME = 'stille-ruimte-v1'
const OFFLINE_URL = '/offline'

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/journal/new',
  '/offline',
  '/manifest.json'
]

// Install service worker and cache essentials
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    })
  )
  self.skipWaiting()
})

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch strategy: Network first, fall back to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API requests (always need fresh data)
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response and cache it
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          
          // If offline page requested, return it
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }
        })
      })
  )
})

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'StilleRuimte'
  const options = {
    body: data.body || 'Tijd voor je dagelijkse reflectie',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/journal/new'
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  const urlToOpen = event.notification.data?.url || '/journal/new'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})
