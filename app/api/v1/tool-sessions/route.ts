// ── /api/v1/tool-sessions ────────────────────────────────────────
// Used by /dashboard/tools/[toolKey]/page.tsx to open and close tool sessions.
// POST  /api/v1/tool-sessions         → open session
// PATCH /api/v1/tool-sessions/:id     → close / save session
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

const SESSION_URL = process.env.NEXT_PUBLIC_SESSION_URL || 'http://localhost:3006'
const TIMEOUT_MS  = 4000

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

export async function POST(req: NextRequest) {
  const auth   = req.headers.get('authorization') ?? ''
  const afroId = afroIdFromAuth(auth)

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* empty */ }

  // Map to business session type
  const categoryMap: Record<string, string> = {
    commerce: 'GOODS_SALE', health: 'SERVICE_DELIVERY',
    agriculture: 'GOODS_SALE', transport: 'DELIVERY_ONLY',
    media: 'PROFESSIONAL', arts: 'PROFESSIONAL', technology: 'PROFESSIONAL',
  }
  const sessionType = categoryMap[String(body.toolCategory || '')] || 'SERVICE_DELIVERY'
  const title       = `Tool: ${String(body.toolKey || 'session')}`

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${SESSION_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-afro-id': afroId || String(body.userAfroId || ''),
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({ sessionType, title }),
      signal: ctrl.signal,
    })
    clearTimeout(timer)

    if (res.ok) {
      const upstream = await res.json()
      // The tools page expects data.data.id shape
      return NextResponse.json({ data: upstream.session }, { status: 201 })
    }
    throw new Error(`upstream ${res.status}`)
  } catch {
    clearTimeout(timer)
    // Fallback local session — tools still work, no XP since offline
    const mockId   = nanoid(12)
    const year     = new Date().getFullYear()
    const mockCode = `TS-${year}-${nanoid(4).toUpperCase()}`
    return NextResponse.json(
      { data: { id: mockId, sessionCode: mockCode, status: 'PROPOSED', _offline: true } },
      { status: 201 },
    )
  }
}
