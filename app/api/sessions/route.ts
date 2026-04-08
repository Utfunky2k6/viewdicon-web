// ── /api/sessions ─────────────────────────────────────────────────
// Handles POST /api/sessions (create business session).
// Proxies to business-session-service with auth forwarding + mock fallback.
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

const SESSION_URL = process.env.NEXT_PUBLIC_SESSION_URL || 'http://localhost:3006'
const TIMEOUT_MS  = 4000

/** Extract afroId from a JWT payload (no verification needed — middleware already did that) */
function afroIdFromToken(token: string | null): string {
  if (!token) return ''
  try {
    const parts = token.replace('Bearer ', '').split('.')
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
  const afroId = afroIdFromToken(auth)
  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* empty body */ }

  // Map tool category to business session type
  const categoryToType: Record<string, string> = {
    commerce:        'GOODS_SALE',
    health:          'SERVICE_DELIVERY',
    agriculture:     'GOODS_SALE',
    education:       'SERVICE_DELIVERY',
    media:           'PROFESSIONAL',
    arts:            'PROFESSIONAL',
    technology:      'PROFESSIONAL',
    legal:           'PROFESSIONAL',
    justice:         'PROFESSIONAL',
    finance:         'PROFESSIONAL',
    transport:       'DELIVERY_ONLY',
    spirituality:    'COMMUNITY',
    family:          'COMMUNITY',
  }
  const sessionType = categoryToType[String(body.toolCategory || body.category || '')] || 'SERVICE_DELIVERY'
  const title       = String(body.title || body.toolKey || 'Business Session')

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${SESSION_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'x-afro-id':     afroId || String(body.userAfroId || ''),
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({
        sessionType,
        title,
        description: String(body.description || ''),
      }),
      signal: ctrl.signal,
    })
    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data, { status: 201 })
    }
    throw new Error(`upstream ${res.status}`)
  } catch {
    clearTimeout(timer)
    // Graceful fallback — generate a local session (survives Vercel deploy without the service)
    const mockId   = nanoid(12)
    const year     = new Date().getFullYear()
    const mockCode = `BS-${year}-${nanoid(4).toUpperCase()}`
    return NextResponse.json(
      {
        session: {
          id:          mockId,
          sessionCode: mockCode,
          status:      'PROPOSED',
          sessionType,
          title,
          createdAt:   new Date().toISOString(),
          _offline:    true,   // flag so loader knows it's a local session
        },
      },
      { status: 201 },
    )
  }
}
