// ── /api/cowrie/claim-drop ────────────────────────────────────
// Proxies daily Cowrie drop claims to cowrie-union-core.
// Falls back to { ok: false, message, amount: 0 } on service unavailability.
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COWRIE = 'http://localhost:4050'
const TIMEOUT_MS = 3000

function forwardHeaders(req: NextRequest): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = req.headers.get('authorization')
  if (auth) h['Authorization'] = auth
  return h
}

export async function POST(req: NextRequest) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    let body: string | undefined
    try { body = JSON.stringify(await req.json()) } catch { /* empty body */ }
    const res = await fetch(`${COWRIE}/drop/claim`, {
      method: 'POST',
      headers: forwardHeaders(req),
      body,
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    clearTimeout(timer)
    return NextResponse.json(
      { ok: false, message: 'Service temporarily unavailable', amount: 0 },
      { status: 200 },
    )
  }
}
