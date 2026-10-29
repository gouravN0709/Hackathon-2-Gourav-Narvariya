/**
 * FitAI Service Worker (v1)
 *
 * Implements:
 * - Precache app shell routes, icons, and offline fallback.
 * - Cache-First for static assets (_next/static, fonts, icons).
 * - Network-First for HTML navigation with cache fallback, defaulting to /offline.
 * - Stale-While-Revalidate for images.
 * - Network-only for any future /api/* routes.
 * - Skip waiting on explicit message event.
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `fitai-static-${CACHE_VERSION}`;
const PAGES_CACHE = `fitai-pages-${CACHE_VERSION}`;
const IMAGES_CACHE = `fitai-images-${CACHE_VERSION}`;

const CURRENT_CACHES = [STATIC_CACHE, PAGES_CACHE, IMAGES_CACHE];

const PRECACHE_ROUTES = [
  '/',
  '/dashboard',
  '/workouts',
  '/workouts/details',
  '/workouts/active',
  '/nutrition',
  '/nutrition/add',
  '/coach',
  '/progress',
  '/profile',
  '/login',
  '/onboarding',
  '/offline',
];

const PRECACHE_ASSETS = [
  '/favicon.ico',
  '/icons/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
];

// Helper to extract static script & stylesheet URLs from HTML text
function extractStaticAssetUrls(html) {
  const urls = [];
  const scriptRegex = /<script[^>]+src="(\/_next\/static\/[^"]+)"/g;
  const linkRegex = /<link[^>]+href="(\/_next\/static\/[^"]+)"/g;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    urls.push(match[1]);
  }
  while ((match = linkRegex.exec(html)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      const pagesCache = await caches.open(PAGES_CACHE);

      // Precache static assets
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (assetUrl) => {
          try {
            const res = await fetch(assetUrl, { cache: 'no-cache' });
            if (res.ok) await staticCache.put(assetUrl, res);
          } catch (e) {
            console.warn('[FitAI SW] Precache asset failed:', assetUrl, e);
          }
        })
      );

      // Precache page shells and extract referenced _next/static scripts & css
      const staticUrlsToFetch = new Set();
      await Promise.allSettled(
        PRECACHE_ROUTES.map(async (routeUrl) => {
          try {
            const res = await fetch(routeUrl, { cache: 'no-cache' });
            if (res.ok) {
              const clone = res.clone();
              await pagesCache.put(routeUrl, res);
              try {
                const html = await clone.text();
                const extracted = extractStaticAssetUrls(html);
                extracted.forEach((url) => staticUrlsToFetch.add(url));
              } catch (_) {}
            }
          } catch (e) {
            console.warn('[FitAI SW] Precache route failed:', routeUrl, e);
          }
        })
      );

      // Precache extracted next static assets
      if (staticUrlsToFetch.size > 0) {
        await Promise.allSettled(
          Array.from(staticUrlsToFetch).map(async (url) => {
            try {
              const res = await fetch(url, { cache: 'no-cache' });
              if (res.ok) await staticCache.put(url, res);
            } catch (_) {}
          })
        );
      }
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => !CURRENT_CACHES.includes(name))
          .map((name) => {
            console.log('[FitAI SW] Deleting obsolete cache:', name);
            return caches.delete(name);
          })
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignore unsupported schemes (extensions, dev tools)
  if (!url.protocol.startsWith('http')) return;

  // Never cache future API calls or external domains
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  // Strategy 1: HTML Navigation (Network-First with fallback to cache, then /offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Timeout network fetch after 3 seconds if slow
          const fetchPromise = fetch(request);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), 3000)
          );

          const response = await Promise.race([fetchPromise, timeoutPromise]);
          if (response && response.ok) {
            const pagesCache = await caches.open(PAGES_CACHE);
            pagesCache.put(request, response.clone());
            return response;
          }
        } catch (_) {
          // Network failed or timed out: fall through to cache
        }

        // Try exact request in pages or static cache
        const cachedResponse =
          (await caches.match(request)) ||
          (await caches.match(url.pathname));

        if (cachedResponse) {
          return cachedResponse;
        }

        // Fallback to offline page
        const offlineResponse =
          (await caches.match('/offline')) ||
          (await caches.match(new Request('/offline')));

        if (offlineResponse) {
          return offlineResponse;
        }

        return new Response('You are offline. Please reconnect.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      })()
    );
    return;
  }

  // Strategy 2: Static assets and fonts (Cache-First, versioned)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff')
  ) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const res = await fetch(request);
          if (res.ok) {
            const staticCache = await caches.open(STATIC_CACHE);
            staticCache.put(request, res.clone());
          }
          return res;
        } catch (_) {
          return cached || new Response('', { status: 404 });
        }
      })()
    );
    return;
  }

  // Strategy 3: Images (Stale-While-Revalidate)
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|gif)$/)
  ) {
    event.respondWith(
      (async () => {
        const imagesCache = await caches.open(IMAGES_CACHE);
        const cached = await imagesCache.match(request);

        const networkFetch = fetch(request)
          .then((res) => {
            if (res.ok) {
              imagesCache.put(request, res.clone());
            }
            return res;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })()
    );
    return;
  }
});
