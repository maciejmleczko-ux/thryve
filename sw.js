const CACHE_NAME = 'mekkio-cache-v24';
const URLS_TO_CACHE = ['./', './index.html', './lottie.min.js', './success.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Deleting old caches also drops the Supabase API responses (user data)
  // that versions up to v23 cached by mistake.
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Only the app's own files. Cross-origin GETs (Supabase REST = the user's
  // workouts/plans, CDN, analytics) go straight to the network: user data
  // must never sit in Cache Storage, where it would outlive sign-out.
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    // 'no-cache' (not 'no-store'): always revalidated with the server, so a
    // deploy shows up immediately, but an unchanged index.html comes back
    // as a 304 instead of re-downloading ~2.7 MB on every launch.
    fetch(event.request, { cache: 'no-cache' })
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
