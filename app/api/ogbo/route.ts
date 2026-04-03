import { NextRequest, NextResponse } from 'next/server'

const IS_LOCAL = process.env.NODE_ENV === 'development'
const OGBO_URL = process.env.OGBO_UTU_URL || 'http://localhost:3051'

const MOCK_POTS = [
  {
    id: 'pot-market-001',
    state: 'HELD',
    buyerAfroId: 'demo-user',
    sellerAfroId: 'mama-ngozi',
    amountCowrie: 3000,
    escrowType: 'MARKETPLACE_HOLD',
    description: 'Handwoven Kente cloth — 3 yards',
    eventHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    sellerNkisi: 'GREEN',
    buyerNkisi: 'GREEN',
  },
  {
    id: 'pot-service-002',
    state: 'PENDING_VERIFICATION',
    buyerAfroId: 'demo-user',
    sellerAfroId: 'bro-kwame-artisan',
    amountCowrie: 1500,
    escrowType: 'SERVICE_HOLD',
    description: 'Logo design — 3 concepts',
    eventHash: 'b2c3d4e5f6g7b2c3d4e5f6g7b2c3d4e5f6g7b2c3',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lockedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    sellerNkisi: 'GREEN',
    buyerNkisi: 'AMBER',
  },
]

export async function GET(req: NextRequest) {
  const afroId = req.nextUrl.searchParams.get('afroId') || 'demo-user'

  if (IS_LOCAL) {
    try {
      const res = await fetch(`${OGBO_URL}/v1/pots/active/${afroId}`, { next: { revalidate: 0 } })
      if (res.ok) return NextResponse.json(await res.json())
    } catch { /* fall through */ }
  }

  return NextResponse.json({ afroId, pots: MOCK_POTS, count: MOCK_POTS.length })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action = 'create', potId, ...rest } = body

  if (IS_LOCAL) {
    try {
      const url = action === 'create'
        ? `${OGBO_URL}/v1/pot/create`
        : `${OGBO_URL}/v1/pot/${potId}/${action}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest),
      })
      if (res.ok) return NextResponse.json(await res.json())
    } catch { /* fall through */ }
  }

  if (action === 'create') {
    return NextResponse.json({
      potId: `pot-${Date.now()}`,
      state: 'HELD',
      ...rest,
      eventHash: `kowe_pot_${Math.random().toString(16).slice(2, 18)}`,
      message: 'Pot sealed. Funds locked until Proof of Hand.',
    })
  }

  return NextResponse.json({
    potId,
    state: action === 'release' ? 'SETTLED' : action === 'revert' ? 'REVERSED' : 'PENDING_VERIFICATION',
    message: 'Pot state updated.',
  })
}
