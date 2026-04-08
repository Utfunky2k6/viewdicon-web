// ── /api/love/[...path] ───────────────────────────────────────────
// Catch-all proxy for love-world-service (UFÈ African Marriage System).
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LOVE = process.env.LOVE_WORLD_SERVICE_URL || 'http://localhost:3070'
const TIMEOUT_MS = 4000

function forwardHeaders(req: NextRequest): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = req.headers.get('authorization')
  if (auth) h['Authorization'] = auth
  return h
}

function getFallback(path: string[]): unknown {
  const p = path.join('/')
  if (p.includes('questions') && p.includes('progress')) return { totalAnswered: 0, totalQuestions: 200, station1: 0, station2: 0, station3: 0, conflictsFound: 0 }
  if (p.includes('questions') && p.includes('answers')) return []
  if (p.includes('questions')) return { questions: [], answeredIds: [], totalAnswered: 0, totalQuestions: 0, station: 1 }
  if (p.includes('profiles')) return { profile: null, exists: false }
  if (p.includes('matches')) return { matches: [], count: 0 }
  if (p.includes('compatibility')) return { score: 0, breakdown: {} }
  if (p.includes('stations')) return { station: null, currentStation: 1 }
  if (p.includes('wall')) return { posts: [], count: 0 }
  if (p.includes('chat')) return { messages: [], count: 0 }
  if (p.includes('dates')) return { dates: [], count: 0 }
  if (p.includes('journey')) return { stage: null }
  if (p.includes('rewards')) return { rewards: [], points: 0 }
  if (p.includes('session')) return { session: null }
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
  return upstream(req, `${LOVE}/love/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${LOVE}/love/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${LOVE}/love/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const p = params.path ?? []
  return upstream(req, `${LOVE}/love/${p.join('/')}${req.nextUrl.search || ''}`, getFallback(p))
}
