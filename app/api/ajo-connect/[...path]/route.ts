// ── /api/ajo-connect/[...path] ────────────────────────────────────
// Catch-all proxy for ajo-connect-service (professional networking).
// Falls back to smart empty responses per path — never leaks internals.
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AJO_CONNECT = 'http://localhost:3072'
const TIMEOUT_MS = 3000

function forwardHeaders(req: NextRequest): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = req.headers.get('authorization')
  if (auth) h['Authorization'] = auth
  return h
}

function getFallback(path: string[]): unknown {
  const p = path.join('/')
  if (p.includes('profiles/browse'))        return { profiles: [], count: 0 }
  if (p.includes('profiles/match'))         return { matches: [] }
  if (p.includes('bookings/my/client'))     return { bookings: [], count: 0 }
  if (p.includes('bookings/my/provider'))   return { bookings: [], count: 0 }
  if (p.includes('mentorship/mentors'))     return { mentors: [], count: 0 }
  if (p.includes('mentorship/sessions/my')) return { sessions: [], count: 0 }
  if (p.includes('circles'))               return { circles: [], count: 0 }
  if (p.includes('services'))              return { services: [], count: 0 }
  if (p.includes('reviews'))              return { reviews: [], count: 0, averageRating: 0 }
  if (p.includes('escrow'))              return { data: null, live: false }
  return { data: null, live: false }
}

async function upstream(
  req: NextRequest,
  url: string,
  fallback: unknown,
): Promise<NextResponse> {
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
  return upstream(req, `${AJO_CONNECT}/ajo-connect/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${AJO_CONNECT}/ajo-connect/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${AJO_CONNECT}/ajo-connect/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${AJO_CONNECT}/ajo-connect/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}
