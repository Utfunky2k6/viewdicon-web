// ── /api/v1/notifications ─────────────────────────────────────
// Proxies to auth-core notification endpoints.
// Falls back to empty list on service unavailability — never mocks fake data.
import { NextRequest, NextResponse } from 'next/server'

const AUTH_CORE = process.env.NEXT_PUBLIC_AUTH_CORE_URL || 'http://localhost:4000'
const TIMEOUT_MS = 3000

function forwardHeaders(req: NextRequest): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = req.headers.get('authorization')
  if (auth) h['Authorization'] = auth
  return h
}

async function upstream(req: NextRequest, path: string): Promise<NextResponse> {
  const url = `${AUTH_CORE}/api/v1/notifications${path}${req.nextUrl.search || ''}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    let body: string | undefined
    if (!['GET', 'HEAD'].includes(req.method)) {
      try { body = JSON.stringify(await req.json()) } catch { /* empty body */ }
    }
    const res = await fetch(url, {
      method: req.method,
      headers: forwardHeaders(req),
      body,
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    clearTimeout(timer)
    // Service down — return empty list, never fake data
    return NextResponse.json(
      { notifications: [], unreadCount: 0, total: 0, live: false },
      { status: 200 },
    )
  }
}

export async function GET(req: NextRequest) {
  return upstream(req, '')
}

export async function POST(req: NextRequest) {
  return upstream(req, '')
}

export async function PATCH(req: NextRequest) {
  return upstream(req, '')
}
