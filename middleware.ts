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
  /\.\.\//,             // path traversal
  /%3cscript/i,         // URL-encoded <script
  /union\s+select/i,    // SQL injection
  /;\s*drop\s+/i,       // SQL drop
]

function isSuspicious(url: string): boolean {
  try {
    const decoded = decodeURIComponent(url)
    return SUSPICIOUS_PATTERNS.some(p => p.test(decoded))
  } catch {
    return true // malformed URL encoding is suspicious
  }
}

// ── JWT validation with HMAC-SHA256 signature verification (Edge Runtime) ──
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || ''
let cachedKey: CryptoKey | null = null

async function getSigningKey(): Promise<CryptoKey | null> {
  if (cachedKey) return cachedKey
  if (!JWT_SECRET) return null
  try {
    cachedKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    return cachedKey
  } catch { return null }
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function verifyJwt(token: string): Promise<{ valid: boolean; payload?: Record<string, unknown> }> {
  const parts = token.split('.')
  if (parts.length !== 3) return { valid: false }

  try {
    const payloadStr = new TextDecoder().decode(base64UrlDecode(parts[1]))
    const payload = JSON.parse(payloadStr) as Record<string, unknown>

    // Check expiry
    if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
      return { valid: false }
    }

    // Verify HMAC signature if we have a secret
    const key = await getSigningKey()
    if (key) {
      const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
      const signature = base64UrlDecode(parts[2])
      const isValid = await crypto.subtle.verify('HMAC', key, signature.buffer as ArrayBuffer, data)
      return { valid: isValid, payload: isValid ? payload : undefined }
    }

    // Fallback: no secret available (dev mode) — accept based on expiry only
    return { valid: true, payload }
  } catch {
    return { valid: false }
  }
}

// Lightweight sync check for page routing (non-API paths)
// Full verification happens on API calls via backend
function isTokenPresentAndNotExpired(t: string | undefined): boolean {
  if (!t) return false
  const parts = t.split('.')
  if (parts.length !== 3) return false
  try {
    const pad = (s: string) => s + '='.repeat((4 - s.length % 4) % 4)
    const payload = JSON.parse(atob(pad(parts[1].replace(/-/g, '+').replace(/_/g, '/'))))
    if (typeof payload.exp === 'number') {
      return payload.exp * 1000 > Date.now()
    }
    return false // tokens without exp are invalid
  } catch {
    return false
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Get client IP (handle missing x-forwarded-for safely) ──
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = req.headers.get('x-real-ip')
  const ip = forwardedFor || realIp || 'unknown'

  // ── Rate limiting (API routes only) ──
  // Rate-limit ALL IPs including unknown (fixes bypass via stripped headers)
  if (pathname.startsWith('/api/')) {
    const isActualLocalhost = ip === '127.0.0.1' || ip === '::1'
    if (!isActualLocalhost) {
      if (!checkRateLimit(ip)) {
        return new NextResponse(JSON.stringify({ error: 'Too many requests. Slow down.' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
        })
      }
    }
  }

  // ── Block suspicious URLs ──
  if (isSuspicious(req.url)) {
    return new NextResponse('Blocked', { status: 403 })
  }

  // ── Block oversized request bodies ──
  const contentLength = parseInt(req.headers.get('content-length') || '0', 10)
  if (contentLength > 5_000_000) { // 5MB max
    return new NextResponse(JSON.stringify({ error: 'Request too large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rawToken = req.cookies.get('afk_token')?.value
    || req.headers.get('authorization')?.replace('Bearer ', '')

  const tokenValid = isTokenPresentAndNotExpired(rawToken)

  const isProtected  = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthRoute  = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  if (isProtected && !tokenValid) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    const nextPath = pathname + (req.nextUrl.search || '')
    url.searchParams.set('next', nextPath)
    return NextResponse.redirect(url)
  }

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
