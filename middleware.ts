import { NextRequest, NextResponse } from 'next/server'

// Protected routes require auth token
const PROTECTED = ['/dashboard']
// Auth routes — redirect to dashboard if already logged in (NOT ceremony — new users need it)
const AUTH_ROUTES = ['/login', '/register']

// ── Rate limiter (in-memory, per-IP) ─────────────────────────
const rateMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 120   // requests per window
const RATE_WINDOW = 60_000 // 1 minute

// Lazy cleanup: prune expired entries every ~100 requests
// NOTE: setInterval is not available in Edge Runtime — use counter-based approach
let reqCount = 0
function pruneRateMap() {
  if (++reqCount % 100 !== 0) return
  const now = Date.now()
  for (const [key, val] of rateMap.entries()) {
    if (val.reset < now) rateMap.delete(key)
  }
}

function checkRateLimit(ip: string): boolean {
  pruneRateMap()
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW })
    return true
  }
  entry.count++
  return entry.count <= RATE_LIMIT
}

// ── Suspicious pattern detector ──────────────────────────────
const SUSPICIOUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,        // onerror=, onclick= etc
  /data:text\/html/i,
  /\.\.\//,             // path traversal (no g flag — prevents alternating bypass)
  /%3cscript/i,         // URL-encoded <script
  /union\s+select/i,    // SQL injection
  /;\s*drop\s+/i,       // SQL drop
]

function isSuspicious(url: string): boolean {
  const decoded = decodeURIComponent(url)
  return SUSPICIOUS_PATTERNS.some(p => p.test(decoded))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'

  // ── Rate limiting (API routes only — skip for localhost/internal) ──
  const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'unknown'
  if (pathname.startsWith('/api/') && !isLocalhost) {
    if (!checkRateLimit(ip)) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests. Slow down.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      })
    }
  }

  // ── Block suspicious URLs ──
  if (isSuspicious(req.url)) {
    return new NextResponse('Blocked', { status: 403 })
  }

  // ── Block large request bodies on API mutations ──
  const contentLength = parseInt(req.headers.get('content-length') || '0', 10)
  if (contentLength > 5_000_000) { // 5MB max
    return new NextResponse(JSON.stringify({ error: 'Request too large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rawToken = req.cookies.get('afk_token')?.value
    || req.headers.get('authorization')?.replace('Bearer ', '')

  // ── JWT expiry check (no secret needed — just decode payload) ──
  function isTokenValid(t: string | undefined): boolean {
    if (!t) return false
    // Local/synthetic tokens (generated when backend is offline) are always valid
    if (t.startsWith('local_')) return true
    // Standard JWT: base64url-encoded header.payload.signature
    const parts = t.split('.')
    if (parts.length !== 3) return false
    try {
      // base64url → base64 → JSON
      const pad = (s: string) => s + '='.repeat((4 - s.length % 4) % 4)
      const payload = JSON.parse(atob(pad(parts[1].replace(/-/g, '+').replace(/_/g, '/'))))
      // If exp claim is present, check it against current time
      if (typeof payload.exp === 'number') {
        return payload.exp * 1000 > Date.now()
      }
      // No exp claim — treat as valid
      return true
    } catch {
      return false
    }
  }

  const token = rawToken
  const tokenValid = isTokenValid(token)

  const isProtected  = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthRoute  = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  if (isProtected && !tokenValid) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    // Preserve full path + search so login can redirect back
    const nextPath = pathname + (req.nextUrl.search || '')
    url.searchParams.set('next', nextPath)
    return NextResponse.redirect(url)
  }

  // Fix 2: Accept both 'true' and '1' for legacy support
  const ceremonyCookie = req.cookies.get('afk_ceremony_done')?.value
  const ceremonyDone = ceremonyCookie === 'true' || ceremonyCookie === '1'
  const isCeremony   = pathname.startsWith('/ceremony')

  // Case 1: Trying to access dashboard without ceremony
  if (isProtected && tokenValid && !ceremonyDone) {
    const url = req.nextUrl.clone()
    url.pathname = '/ceremony'
    return NextResponse.redirect(url)
  }

  // Case 2: Trying to access ceremony when already done
  if (isCeremony && tokenValid && ceremonyDone) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Case 3: Logged in users trying to access login/register
  if (isAuthRoute && tokenValid) {
    const url = req.nextUrl.clone()
    url.pathname = ceremonyDone ? '/dashboard' : '/ceremony'
    return NextResponse.redirect(url)
  }

  // ── Add security headers to response ──
  const res = NextResponse.next()
  res.headers.set('X-Request-ID', crypto.randomUUID())
  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/ceremony',
    '/api/:path*',
  ],
}
