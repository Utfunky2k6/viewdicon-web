// ── /api/bank/[...path] ───────────────────────────────────────
// Catch-all proxy for banking-api-gateway extended bank operations.
// Uses a 4-second timeout (banking ops take longer).
// Falls back to smart empty responses per path — never leaks internals.
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BANKING = process.env.NEXT_PUBLIC_BANKING_GATEWAY_URL || 'http://localhost:9000'
const TIMEOUT_MS = 4000

function forwardHeaders(req: NextRequest): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = req.headers.get('authorization')
  if (auth) h['Authorization'] = auth
  return h
}

function getFallback(path: string[]): unknown {
  const pathStr = path.join('/')
  if (pathStr.includes('request-money')) return { ok: false, message: 'Service offline' }
  if (pathStr.includes('season/my-locks') || pathStr.includes('my-locks')) return { locks: [], active: null }
  if (pathStr.includes('council/disputes') || pathStr.includes('disputes')) return { disputes: [], count: 0 }
  if (pathStr.includes('subscriptions')) return { subscriptions: [], count: 0 }
  if (pathStr.includes('budget')) return { budget: null, categories: [] }
  return { ok: false, message: 'Service temporarily unavailable' }
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
  return upstream(req, `${BANKING}/bank/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${BANKING}/bank/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${BANKING}/bank/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${BANKING}/bank/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${BANKING}/bank/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}
