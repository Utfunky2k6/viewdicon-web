import { NextRequest, NextResponse } from 'next/server'

// Protected routes require auth token
const PROTECTED = ['/dashboard']
// Auth routes — redirect to dashboard if already logged in
const AUTH_ROUTES = ['/login', '/register']

// Dev mode: allow all traffic through without auth checks
const DEV_MODE = process.env.NODE_ENV === 'development'

// ── Rate limiter (in-memory, per-IP) ─────────────────────────
const rateMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 120   // requests per window
const RATE_WINDOW = 60_000 // 1 minute

function checkRateLimit(ip: string): boolean {
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
  /\.\.\//g,            // path traversal
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

  // ── Rate limiting (API routes only) ──
  if (pathname.startsWith('/api/')) {
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

  // In development, let everything through — no auth barriers
  if (DEV_MODE) return NextResponse.next()

  const token = req.cookies.get('afk_token')?.value
    || req.headers.get('authorization')?.replace('Bearer ', '')

  const isProtected  = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthRoute  = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  if (isProtected && !token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && token) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
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
    '/api/:path*',
  ],
}
