// BFF: home vitality aggregates data from multiple backends
import { NextRequest, NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../../_lib/proxy'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization') || ''
  const hdrs  = { Authorization: token }

  // Fan-out to 3 backends in parallel; any failure falls back to empty defaults
  const [balRes, feedRes, ajoRes] = await Promise.all([
    proxyOrMock(
      `${UPSTREAM.BANKING}/bank/account/balance`,
      { cowrie: 0, afcoin: 0, escrowLocked: 0 },
      { headers: hdrs },
    ),
    proxyOrMock(
      `${UPSTREAM.SOROSOKE}/posts/feed/stats`,
      { kilaEarned: 0, activePosts: 0 },
      { headers: hdrs },
    ),
    proxyOrMock(
      `${UPSTREAM.BANKING}/bank/ajo/stats`,
      { activeCircles: 0, nextPayout: '--' },
      { headers: hdrs },
    ),
  ])

  const bal  = (balRes.data  as any)
  const feed = (feedRes.data as any)
  const ajo  = (ajoRes.data  as any)

  return NextResponse.json({
    ok: true,
    live: balRes.live || feedRes.live || ajoRes.live,
    data: {
      cowrieBalance: bal?.cowrie       ?? 0,
      afcoinBalance: bal?.afcoin       ?? 0,
      escrowLocked:  bal?.escrowLocked ?? 0,
      kilaEarned:    feed?.kilaEarned  ?? 0,
      activePosts:   feed?.activePosts ?? 0,
      activeCircles: ajo?.activeCircles ?? 0,
      nextAjoPayout: ajo?.nextPayout    ?? '--',
    },
  })
}
