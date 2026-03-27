import { NextRequest, NextResponse } from 'next/server'

// ── Commerce Bridge: Add to Pot ───────────────────────────────────
// Viewer taps "🫙 Add to Pot" on a live stream product.
// 1. Validates streamId + productId from the request body
// 2. Tries to proxy to jollof-tv-service-ts (port 3046)
// 3. Falls back to a mock response so the UI always works
// ─────────────────────────────────────────────────────────────────
const JOLLOF_URL = process.env.JOLLOF_TV_URL || 'http://localhost:3046'

export async function POST(
  request: NextRequest,
  { params }: { params: { streamId: string } }
) {
  const { streamId } = params

  if (!streamId || streamId.length > 100) {
    return NextResponse.json({ error: { code: 'INVALID_STREAM_ID', message: 'Invalid stream ID' } }, { status: 400 })
  }

  let body: { productId?: string; viewerId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: { code: 'INVALID_BODY', message: 'Request body must be JSON' } }, { status: 400 })
  }

  const { productId, viewerId } = body

  if (!productId || typeof productId !== 'string' || productId.length > 100) {
    return NextResponse.json({ error: { code: 'INVALID_PRODUCT_ID', message: 'productId is required' } }, { status: 400 })
  }

  // ── Forward to jollof-tv-service-ts ─────────────────────────────
  try {
    const upstream = await fetch(`${JOLLOF_URL}/streams/${streamId}/add-to-pot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Client': 'viewdicon-web' },
      body: JSON.stringify({ productId, viewerId }),
      signal: AbortSignal.timeout(5000),
    })

    if (upstream.ok) {
      const data = await upstream.json()
      return NextResponse.json(data)
    }
  } catch {
    // Upstream unavailable — use mock response so the UI always works
  }

  // ── Mock fallback ─────────────────────────────────────────────────
  // Generates a deterministic chatId from streamId + productId so
  // the commerce flow continues seamlessly in demo / offline mode.
  const mockChatId   = `chat-from-${streamId}-${productId}`.slice(0, 30)
  const mockSessionId = `session-${Date.now()}`

  return NextResponse.json({
    ok: true,
    data: {
      sessionId: mockSessionId,
      chatId: mockChatId,
      potStatus: 'OPEN',
      productSnapshot: {
        id: productId,
        streamId,
        name: 'Product from Stream',
        price: 0,
        currency: 'COWRIE',
        addedAt: new Date().toISOString(),
      },
    },
  }, { status: 201 })
}
