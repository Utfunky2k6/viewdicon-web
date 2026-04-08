// ── /api/seso/[...path] ───────────────────────────────────────
// Catch-all proxy for seso-chat-service (chats, messages, connections, requests).
// Falls back to smart empty responses per path — never leaks internals.
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SESO = process.env.NEXT_PUBLIC_SESO_URL || 'http://localhost:3050'
const TIMEOUT_MS = 3000

function forwardHeaders(req: NextRequest): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = req.headers.get('authorization')
  if (auth) h['Authorization'] = auth
  return h
}

function getFallback(path: string[]): unknown {
  const pathStr = path.join('/')
  if (pathStr.includes('chats') || pathStr.includes('threads')) return { chats: [], count: 0 }
  if (pathStr.includes('messages')) return { messages: [], hasMore: false }
  if (pathStr.includes('connections')) return { connections: [], online: [], count: 0 }
  if (pathStr.includes('requests')) return { requests: [], incoming: [], outgoing: [] }
  return { data: null, ok: false }
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
  return upstream(req, `${SESO}/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${SESO}/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${SESO}/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${SESO}/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}
