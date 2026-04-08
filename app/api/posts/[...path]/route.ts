// ── /api/posts/[...path] ──────────────────────────────────────
// Catch-all proxy for soro-soke-feed post interactions (comments, reactions).
// Falls back to smart empty responses per path — never leaks internals.
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SOROSOKE = process.env.NEXT_PUBLIC_SOROSOKE_URL || 'http://localhost:3003'
const TIMEOUT_MS = 3000

function forwardHeaders(req: NextRequest): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = req.headers.get('authorization')
  if (auth) h['Authorization'] = auth
  return h
}

const REACTION_ACTIONS = ['kila', 'stir', 'drum', 'ubuntu', 'spray']

function getFallback(path: string[]): unknown {
  const pathStr = path.join('/')
  if (pathStr.includes('comments')) return { comments: [], count: 0 }
  if (REACTION_ACTIONS.some(a => pathStr.includes(a))) return { ok: true, count: 0 }
  return { ok: false }
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
  return upstream(req, `${SOROSOKE}/posts/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${SOROSOKE}/posts/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${SOROSOKE}/posts/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${SOROSOKE}/posts/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}
