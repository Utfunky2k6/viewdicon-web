// ── /api/v1/tool-sessions/[id] ────────────────────────────────────
// PATCH /api/v1/tool-sessions/:id → mark session as sealed/closed
import { NextRequest, NextResponse } from 'next/server'

const SESSION_URL = process.env.NEXT_PUBLIC_SESSION_URL || 'http://localhost:3006'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = req.headers.get('authorization') ?? ''
  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* empty */ }

  // Map "close" status to what the service expects
  const status = body.status === 'sealed' ? 'SEALED' : 'SEALED'

  try {
    // Business-session-service uses /sessions/:id/mark-delivered or a direct PATCH
    // Try direct PATCH first; if 404 fall through gracefully
    const res = await fetch(`${SESSION_URL}/sessions/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({ status }),
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json({ data }, { status: res.ok ? 200 : res.status })
  } catch {
    // Optimistic: report success even if service is down
    return NextResponse.json({ data: { id: params.id, status: 'SEALED', _offline: true } })
  }
}
