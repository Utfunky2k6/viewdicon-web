// ── /api/kerawa/[...path] ────────────────────────────────────
// Catch-all proxy for kerawa-service (KÈRÉWÀ casual connections zone).
// Falls back to smart empty responses per path — never leaks internals.
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const KERAWA = process.env.KERAWA_SERVICE_URL || 'http://localhost:3071'
const TIMEOUT_MS = 4000

function forwardHeaders(req: NextRequest): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = req.headers.get('authorization')
  if (auth) h['Authorization'] = auth
  return h
}

function getFallback(path: string[]): unknown {
  const p = path.join('/')
  if (p.includes('profiles')) return { profile: null, exists: false }
  if (p.includes('discover') || p.includes('nearby')) return { profiles: [], count: 0 }
  if (p.includes('matches')) return { matches: [], count: 0 }
  if (p.includes('trust')) return { score: 50, level: 'NEW', canInvite: false }
  if (p.includes('meetup')) return { meetup: null, escrow: null }
  if (p.includes('safety') || p.includes('panic')) return { ok: true, alerted: false }
  if (p.includes('content')) return { items: [], count: 0 }
  if (p.includes('rooms')) return { rooms: [], active: [] }
  if (p.includes('report')) return { ok: true }
  if (p.includes('chat')) return { messages: [], count: 0, expired: false }
  if (p.includes('heat')) return { zones: [], total: 0 }
  return { data: null, ok: false }
}

async function upstream(req: NextRequest, url: string, fallback: unknown): Promise<NextResponse> {
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
    return NextResponse.json(fallback, { status: 200 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${KERAWA}/kerawa/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${KERAWA}/kerawa/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${KERAWA}/kerawa/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${KERAWA}/kerawa/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}
