/**
 * Service Worker for caching audio files, environment assets, and progressive loading
 */

const CACHE_NAME = 'study-platform-v1';
const STATIC_CACHE_NAME = 'study-platform-static-v1';
const AUDIO_CACHE_NAME = 'study-platform-audio-v1';
const ENVIRONMENT_CACHE_NAME = 'study-platform-environments-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add other critical static assets
];

// Audio files to cache
const AUDIO_ASSETS = [
  '/sounds/page-turn.mp3',
  '/sounds/pencil-write.mp3',
  '/sounds/keyboard-type.mp3',
  '/sounds/mouse-click.mp3',
  '/sounds/coffee-pour.mp3',
  '/sounds/cafe-chatter.mp3',
  '/sounds/birds-chirp.mp3',
  '/sounds/wind-leaves.mp3',
];

// Environment assets to cache
const ENVIRONMENT_ASSETS = [
  '/environments/classroom-bg.jpg',
  '/environments/office-bg.jpg',
  '/environments/cafe-bg.jpg',
  '/environments/forest-bg.jpg',
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),

      // Cache audio assets
      caches.open(AUDIO_CACHE_NAME).then(cache => {
        console.log('Caching audio assets');
        return cache.addAll(
          AUDIO_ASSETS.map(url => new Request(url, { mode: 'no-cors' }))
        );
      }),

      // Cache environment assets
      caches.open(ENVIRONMENT_CACHE_NAME).then(cache => {
        console.log('Caching environment assets');
        return cache.addAll(
          ENVIRONMENT_ASSETS.map(url => new Request(url, { mode: 'no-cors' }))
        );
      }),
    ]).then(() => {
      console.log('Service Worker installed successfully');
      // Force activation of new service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete old caches
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== AUDIO_CACHE_NAME &&
              cacheName !== ENVIRONMENT_CACHE_NAME
            ) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content and implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);

  try {
    // Strategy 1: Static assets - Cache First
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }

    // Strategy 2: Audio files - Cache First with fallback
    if (isAudioAsset(url.pathname)) {
      return await cacheFirstWithFallback(request, AUDIO_CACHE_NAME);
    }

    // Strategy 3: Environment assets - Cache First with progressive loading
    if (isEnvironmentAsset(url.pathname)) {
      return await cacheFirstWithProgressiveLoading(
        request,
        ENVIRONMENT_CACHE_NAME
      );
    }

    // Strategy 4: API requests - Network First with cache fallback
    if (isApiRequest(url.pathname)) {
      return await networkFirstWithCache(request, CACHE_NAME);
    }

    // Strategy 5: Everything else - Network First
    return await networkFirst(request);
  } catch (error) {
    console.error('Fetch error:', error);

    // Return offline fallback for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return await getOfflineFallback();
    }

    // Return empty response for other requests
    return new Response('', { status: 408, statusText: 'Request Timeout' });
  }
}

// Caching strategies

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Network request failed:', error);
    throw error;
  }
}

async function cacheFirstWithFallback(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.error('Audio fetch failed:', error);
  }

  // Return silent audio fallback
  return new Response(new ArrayBuffer(0), {
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}

async function cacheFirstWithProgressiveLoading(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Return cached version immediately
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache the response
      cache.put(request, networkResponse.clone());

      // Return response with progressive loading headers
      const headers = new Headers(networkResponse.headers);
      headers.set('X-Progressive-Loading', 'true');

      return new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers,
      });
    }

    return networkResponse;
  } catch (error) {
    console.error('Environment asset fetch failed:', error);

    // Return placeholder image
    return await getPlaceholderImage();
  }
}

async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Network request failed, trying cache:', error);

    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Network request failed:', error);
    throw error;
  }
}

// Helper functions

function isStaticAsset(pathname) {
  return pathname.match(
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/
  );
}

function isAudioAsset(pathname) {
  return (
    pathname.match(/\.(mp3|wav|ogg|m4a|aac)$/) ||
    pathname.startsWith('/sounds/')
  );
}

function isEnvironmentAsset(pathname) {
  return (
    pathname.startsWith('/environments/') ||
    pathname.startsWith('/themes/') ||
    (pathname.match(/\.(jpg|jpeg|png|gif|webp)$/) &&
      (pathname.includes('environment') || pathname.includes('background')))
  );
}

function isApiRequest(pathname) {
  return pathname.startsWith('/api/');
}

async function getOfflineFallback() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  return (
    (await cache.match('/index.html')) ||
    new Response('Offline', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })
  );
}

async function getPlaceholderImage() {
  // Return a simple 1x1 transparent pixel
  const pixel = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  return new Response(pixel, {
    headers: { 'Content-Type': 'image/png' },
  });
}

// Message handling for cache management
self.addEventListener('message', event => {
  const { type, data } = event.data;

  switch (type) {
    case 'CACHE_AUDIO':
      handleCacheAudio(data.urls);
      break;

    case 'CACHE_ENVIRONMENT':
      handleCacheEnvironment(data.urls);
      break;

    case 'PRELOAD_ASSETS':
      handlePreloadAssets(data.urls);
      break;

    case 'CLEAR_CACHE':
      handleClearCache(data.cacheName);
      break;

    case 'GET_CACHE_STATUS':
      handleGetCacheStatus();
      break;

    default:
      console.log('Unknown message type:', type);
  }
});

async function handleCacheAudio(urls) {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const requests = urls.map(url => new Request(url, { mode: 'no-cors' }));
    await cache.addAll(requests);

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CACHE_AUDIO_COMPLETE',
          data: { urls, success: true },
        });
      });
    });
  } catch (error) {
    console.error('Failed to cache audio:', error);

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CACHE_AUDIO_COMPLETE',
          data: { urls, success: false, error: error.message },
        });
      });
    });
  }
}

async function handleCacheEnvironment(urls) {
  try {
    const cache = await caches.open(ENVIRONMENT_CACHE_NAME);
    const requests = urls.map(url => new Request(url, { mode: 'no-cors' }));
    await cache.addAll(requests);

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CACHE_ENVIRONMENT_COMPLETE',
          data: { urls, success: true },
        });
      });
    });
  } catch (error) {
    console.error('Failed to cache environment assets:', error);

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CACHE_ENVIRONMENT_COMPLETE',
          data: { urls, success: false, error: error.message },
        });
      });
    });
  }
}

async function handlePreloadAssets(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);

    // Preload assets in batches to avoid overwhelming the network
    const batchSize = 5;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const requests = batch.map(url => new Request(url, { mode: 'no-cors' }));

      await Promise.allSettled(
        requests.map(async request => {
          try {
            const response = await fetch(request);
            if (response.ok) {
              await cache.put(request, response);
            }
          } catch (error) {
            console.warn('Failed to preload asset:', request.url, error);
          }
        })
      );

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'PRELOAD_ASSETS_COMPLETE',
          data: { urls, success: true },
        });
      });
    });
  } catch (error) {
    console.error('Failed to preload assets:', error);

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'PRELOAD_ASSETS_COMPLETE',
          data: { urls, success: false, error: error.message },
        });
      });
    });
  }
}

async function handleClearCache(cacheName) {
  try {
    if (cacheName) {
      await caches.delete(cacheName);
    } else {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CLEAR_CACHE_COMPLETE',
          data: { cacheName, success: true },
        });
      });
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CLEAR_CACHE_COMPLETE',
          data: { cacheName, success: false, error: error.message },
        });
      });
    });
  }
}

async function handleGetCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const cacheStatus = {};

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      cacheStatus[cacheName] = {
        count: keys.length,
        urls: keys.map(request => request.url),
      };
    }

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CACHE_STATUS_RESPONSE',
          data: { cacheStatus, success: true },
        });
      });
    });
  } catch (error) {
    console.error('Failed to get cache status:', error);

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CACHE_STATUS_RESPONSE',
          data: { success: false, error: error.message },
        });
      });
    });
  }
}

console.log('Service Worker loaded');
