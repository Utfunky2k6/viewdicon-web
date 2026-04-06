// Afrikonnect 360 — Production Service Worker
// Cache strategy: offline-first with network fallback
// Version: afrikonnect-v2

const CACHE_NAME = 'afrikonnect-v2'
const STATIC_CACHE = 'afrikonnect-v2-static'
const IMAGE_CACHE  = 'afrikonnect-v2-images'

const PRECACHE_ASSETS = ['/offline', '/manifest.json', '/favicon.ico']

const IMAGE_MAX_AGE_MS  = 7 * 24 * 60 * 60 * 1000   // 7 days
const FEED_CACHE_MAX    = 50
const NETWORK_TIMEOUT   = 3000   // 3 s

// ---------------------------------------------------------------------------
// Minimal IndexedDB helper
// ---------------------------------------------------------------------------

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('afro-offline-db', 1)
    req.onupgradeneeded = e => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('banking-queue')) db.createObjectStore('banking-queue', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('post-queue'))    db.createObjectStore('post-queue',    { keyPath: 'id' })
    }
    req.onsuccess = e => resolve(e.target.result)
    req.onerror   = e => reject(e.target.error)
  })
}

function idbGetAll(storeName) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  }))
}

function idbDelete(storeName, id) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).delete(id)
    req.onsuccess = () => resolve()
    req.onerror   = () => reject(req.error)
  }))
}

// ---------------------------------------------------------------------------
// Cache trimming helper — keeps most-recent N entries
// ---------------------------------------------------------------------------

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys  = await cache.keys()
  if (keys.length > maxEntries) {
    const excess = keys.slice(0, keys.length - maxEntries)
    await Promise.all(excess.map(k => cache.delete(k)))
  }
}

// ---------------------------------------------------------------------------
// Offline fallback HTML
// ---------------------------------------------------------------------------

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Afrikonnect — Offline</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#050a06;color:#fff;font-family:'Segoe UI',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center}
    .kente{width:100%;height:4px;background:repeating-linear-gradient(90deg,#4ade80 0 20px,#fbbf24 20px 40px,#ef4444 40px 60px,#1e40af 60px 80px);position:fixed;top:0;left:0}
    .card{background:#0d1f10;border:1px solid #1a4025;border-radius:16px;padding:40px 32px;max-width:440px;width:90%;text-align:center;margin-top:4px}
    h1{font-size:2rem;background:linear-gradient(135deg,#4ade80,#22c55e);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:16px 0 8px}
    .subtitle{color:#fbbf24;font-size:1rem;margin-bottom:20px}
    p{color:#9ca3af;font-size:.9rem;line-height:1.6;margin-bottom:28px}
    .actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    button{padding:10px 24px;border:none;border-radius:8px;font-size:.9rem;cursor:pointer;font-weight:600;transition:opacity .2s}
    .btn-primary{background:#1a7c3e;color:#fff}
    .btn-secondary{background:#1a1a2e;color:#4ade80;border:1px solid #4ade80}
    button:hover{opacity:.85}
  </style>
</head>
<body>
  <div class="kente"></div>
  <div class="card">
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Gye Nyame">
      <circle cx="50" cy="50" r="46" stroke="#4ade80" stroke-width="3"/>
      <path d="M50 15 C30 15 18 28 18 42 C18 56 28 64 50 64 C72 64 82 56 82 42 C82 28 70 15 50 15Z" stroke="#4ade80" stroke-width="2.5" fill="none"/>
      <path d="M50 64 C50 72 44 80 36 82" stroke="#4ade80" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M50 64 C50 72 56 80 64 82" stroke="#4ade80" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="34" cy="36" r="5" stroke="#4ade80" stroke-width="2" fill="none"/>
      <circle cx="66" cy="36" r="5" stroke="#4ade80" stroke-width="2" fill="none"/>
      <path d="M29 42 Q50 55 71 42" stroke="#4ade80" stroke-width="2" fill="none"/>
      <line x1="50" y1="15" x2="50" y2="8" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="50" cy="6" r="3" fill="#fbbf24"/>
    </svg>
    <h1>Afrikonnect</h1>
    <div class="subtitle">The drum is silent — last known data shown below</div>
    <p>You are offline. The last known state of the village is preserved below. Reconnect to sync your actions.</p>
    <div class="actions">
      <button class="btn-primary" onclick="window.location.reload()">Try Again</button>
      <button class="btn-secondary" onclick="window.location.href='/dashboard'">Go Home</button>
    </div>
  </div>
</body>
</html>`

// ---------------------------------------------------------------------------
// Install — precache shell assets
// ---------------------------------------------------------------------------

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ---------------------------------------------------------------------------
// Activate — delete stale caches
// ---------------------------------------------------------------------------

self.addEventListener('activate', event => {
  const validCaches = new Set([CACHE_NAME, STATIC_CACHE, IMAGE_CACHE])
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names
          .filter(n => !validCaches.has(n))
          .map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  )
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Race a fetch against a timeout; resolves with the fetch or rejects on timeout */
function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Network timeout')), ms)
    fetch(request)
      .then(res => { clearTimeout(timer); resolve(res) })
      .catch(err => { clearTimeout(timer); reject(err) })
  })
}

// ---------------------------------------------------------------------------
// Fetch strategies
// ---------------------------------------------------------------------------

/** CacheFirst — serve from cache, fall back to network (and cache response) */
async function cacheFirst(event, cacheName) {
  const cached = await caches.match(event.request)
  if (cached) return cached

  const response = await fetch(event.request)
  if (response.ok) {
    const cache = await caches.open(cacheName)
    cache.put(event.request, response.clone())
  }
  return response
}

/** CacheFirst with expiry for images */
async function cacheFirstWithExpiry(event, cacheName, maxAgeMs) {
  const cache  = await caches.open(cacheName)
  const cached = await cache.match(event.request)
  if (cached) {
    const dateHeader = cached.headers.get('date')
    if (dateHeader) {
      const age = Date.now() - new Date(dateHeader).getTime()
      if (age < maxAgeMs) return cached
    } else {
      return cached
    }
  }

  const response = await fetch(event.request)
  if (response.ok) cache.put(event.request, response.clone())
  return response
}

/** NetworkFirst — try network with timeout, fall back to cache; caches successful responses */
async function networkFirst(event, cacheName, timeoutMs = NETWORK_TIMEOUT) {
  try {
    const response = await fetchWithTimeout(event.request, timeoutMs)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(event.request, response.clone())
    }
    return response
  } catch (_) {
    const cached = await caches.match(event.request)
    if (cached) return cached
    // For navigation, serve offline page
    if (event.request.mode === 'navigate') {
      return new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html' } })
    }
    return new Response(JSON.stringify({ offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/** NetworkFirst with feed-specific cache trimming */
async function networkFirstFeed(event) {
  const FEED_CACHE = CACHE_NAME + '-feed'
  try {
    const response = await fetchWithTimeout(event.request, NETWORK_TIMEOUT)
    if (response.ok) {
      const cache = await caches.open(FEED_CACHE)
      cache.put(event.request, response.clone())
      trimCache(FEED_CACHE, FEED_CACHE_MAX)  // fire-and-forget
    }
    return response
  } catch (_) {
    const cached = await caches.match(event.request, { cacheName: FEED_CACHE })
                || await caches.match(event.request)
    if (cached) return cached
    return new Response(JSON.stringify({ offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/** StaleWhileRevalidate — serve cache immediately, update in background */
async function staleWhileRevalidate(event, cacheName) {
  const cache      = await caches.open(cacheName)
  const cached     = await cache.match(event.request)
  const fetchPromise = fetch(event.request).then(response => {
    if (response.ok) cache.put(event.request, response.clone())
    return response
  }).catch(() => null)

  return cached || fetchPromise
}

// ---------------------------------------------------------------------------
// Fetch event router
// ---------------------------------------------------------------------------

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  const path = url.pathname

  // Only handle same-origin + a small allowlist of cross-origin CDN patterns
  if (url.origin !== self.location.origin && !path.startsWith('/_next/')) return

  // ── Static Next.js assets (immutable) ──────────────────────────────────
  if (path.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(event, STATIC_CACHE))
    return
  }

  // ── Next.js image optimisation ─────────────────────────────────────────
  if (path.startsWith('/_next/image')) {
    event.respondWith(cacheFirstWithExpiry(event, IMAGE_CACHE, IMAGE_MAX_AGE_MS))
    return
  }

  // ── Banking balance / ledger — NetworkFirst ────────────────────────────
  if (
    path === '/api/cowrie/balance' ||
    path === '/api/cowrie/ledger'  ||
    path === '/api/bank/account/balance'
  ) {
    event.respondWith(networkFirst(event, CACHE_NAME + '-banking'))
    return
  }

  // ── Feed / posts — NetworkFirst + trim ────────────────────────────────
  if (path.startsWith('/api/feed/') || path.startsWith('/api/posts/')) {
    event.respondWith(networkFirstFeed(event))
    return
  }

  // ── Villages — StaleWhileRevalidate ───────────────────────────────────
  if (path === '/api/villages' || path.startsWith('/api/villages/')) {
    event.respondWith(staleWhileRevalidate(event, CACHE_NAME + '-villages'))
    return
  }

  // ── Jollof / Ajo banking — NetworkFirst ───────────────────────────────
  if (path.startsWith('/api/jollof/') || path.startsWith('/api/bank/ajo/')) {
    event.respondWith(networkFirst(event, CACHE_NAME + '-finance'))
    return
  }

  // ── All other API routes — NetworkFirst ───────────────────────────────
  if (path.startsWith('/api/')) {
    event.respondWith(networkFirst(event, CACHE_NAME + '-api'))
    return
  }

  // ── Dashboard routes — StaleWhileRevalidate ───────────────────────────
  if (path.startsWith('/dashboard/')) {
    event.respondWith(staleWhileRevalidate(event, CACHE_NAME + '-pages'))
    return
  }

  // ── Everything else — NetworkFirst ────────────────────────────────────
  event.respondWith(networkFirst(event, CACHE_NAME))
})

// ---------------------------------------------------------------------------
// Background Sync — banking queue
// ---------------------------------------------------------------------------

async function replayBankingQueue() {
  const items = await idbGetAll('banking-queue')
  for (const item of items) {
    try {
      const response = await fetch(item.url, {
        method:  item.method || 'POST',
        headers: item.headers || { 'Content-Type': 'application/json' },
        body:    item.body,
      })
      if (response.ok) {
        await idbDelete('banking-queue', item.id)
      }
    } catch (_) {
      // Leave in queue for next sync attempt
    }
  }
}

// ---------------------------------------------------------------------------
// Background Sync — post queue
// ---------------------------------------------------------------------------

async function replayPostQueue() {
  const items = await idbGetAll('post-queue')
  for (const item of items) {
    try {
      const response = await fetch(item.url, {
        method:  item.method || 'POST',
        headers: item.headers || { 'Content-Type': 'application/json' },
        body:    item.body,
      })
      if (response.ok) {
        await idbDelete('post-queue', item.id)
      }
    } catch (_) {
      // Leave in queue for next sync attempt
    }
  }
}

self.addEventListener('sync', event => {
  if (event.tag === 'afro-banking-sync') {
    event.waitUntil(replayBankingQueue())
  }
  if (event.tag === 'afro-post-sync') {
    event.waitUntil(replayPostQueue())
  }
})

// ---------------------------------------------------------------------------
// Push notifications
// ---------------------------------------------------------------------------

self.addEventListener('push', event => {
  let message = 'You have a new notification'
  if (event.data) {
    try {
      const data = event.data.json()
      message = data.message || data.body || message
    } catch (_) {
      message = event.data.text() || message
    }
  }

  event.waitUntil(
    self.registration.showNotification('Afrikonnect', {
      body:    message,
      icon:    '/icon-192.png',
      badge:   '/icon-128.png',
      vibrate: [100, 50, 100],
      data:    { url: self.location.origin + '/dashboard' },
      actions: [
        { action: 'open',    title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action === 'dismiss') return
  const targetUrl = (event.notification.data && event.notification.data.url)
    || self.location.origin + '/dashboard'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(targetUrl)
    })
  )
})
