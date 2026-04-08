// ── /api/v1/users/search ──────────────────────────────────────
// Proxies user search queries to auth-core.
// Falls back to { users: [], count: 0 } on service unavailability.
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AUTH_CORE = process.env.NEXT_PUBLIC_AUTH_CORE_URL || 'http://localhost:4000'
const TIMEOUT_MS = 3000

function forwardHeaders(req: NextRequest): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = req.headers.get('authorization')
  if (auth) h['Authorization'] = auth
  return h
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q') || ''
  const limit = searchParams.get('limit') || '20'
  const url = `${AUTH_CORE}/api/v1/users/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: forwardHeaders(req),
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    clearTimeout(timer)
    return NextResponse.json({ users: [], count: 0 }, { status: 200 })
  }
}
