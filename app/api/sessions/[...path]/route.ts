// ── /api/sessions/[...path] ───────────────────────────────────────
// Generic proxy for all /api/sessions/* sub-routes:
//   GET  /api/sessions/my/active
//   GET  /api/sessions/my/completed
//   GET  /api/sessions/:id
//   POST /api/sessions/:id/join
//   POST /api/sessions/:id/messages
//   POST /api/sessions/:id/propose-price   ... etc.
// Falls back to empty/offline responses when service is down.
import { NextRequest, NextResponse } from 'next/server'

const SESSION_URL = process.env.NEXT_PUBLIC_SESSION_URL || 'http://localhost:3006'
const TIMEOUT_MS  = 4000

/** Extract afroId from Authorization header JWT (middleware already validates) */
function afroIdFromAuth(auth: string | null): string {
  if (!auth) return ''
  try {
    const parts = auth.replace('Bearer ', '').split('.')
    if (parts.length !== 3) return ''
    const pad = (s: string) => s + '='.repeat((4 - s.length % 4) % 4)
    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(pad(parts[1].replace(/-/g, '+').replace(/_/g, '/'))), c => c.charCodeAt(0))
      )
    )
    return payload.afroId || payload.sub || ''
  } catch { return '' }
}

async function proxy(req: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const auth    = req.headers.get('authorization') ?? ''
  const afroId  = afroIdFromAuth(auth)
  const subPath = pathSegments.join('/')
  const url     = `${SESSION_URL}/sessions/${subPath}${req.nextUrl.search || ''}`

  const ctrl  = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)

  try {
    let body: string | undefined
    if (!['GET', 'HEAD'].includes(req.method)) {
      try { body = JSON.stringify(await req.json()) } catch { /* empty */ }
    }

    const res = await fetch(url, {
      method:  req.method,
      headers: {
        'Content-Type': 'application/json',
        'x-afro-id':    afroId,
        ...(auth ? { Authorization: auth } : {}),
      },
      body,
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    clearTimeout(timer)
    // Return sensible empty payloads per endpoint
    const path = '/' + subPath
    if (path.includes('/my/active'))    return NextResponse.json({ sessions: [], count: 0 })
    if (path.includes('/my/completed')) return NextResponse.json({ sessions: [], count: 0, summary: { totalSealed: 0 } })
    return NextResponse.json({ error: 'service_unavailable', _offline: true }, { status: 503 })
  }
}

export function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path)
}
export function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path)
}
export function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path)
}
export function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path)
}
export function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path)
}
