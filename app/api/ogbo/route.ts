import { NextRequest, NextResponse } from 'next/server'

const OGBO_URL = process.env.OGBO_UTU_URL || 'http://localhost:3051'

const MOCK_POTS = [
  {
    id: 'pot-market-001',
    state: 'HELD',
    buyerAfroId: 'user',
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
    buyerAfroId: 'user',
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
  const afroId = req.nextUrl.searchParams.get('afroId')
  if (!afroId) {
    return NextResponse.json({ error: 'afroId required' }, { status: 400 })
  }

  const auth = req.headers.get('authorization')
  try {
    const headers: Record<string, string> = {}
    if (auth) headers['Authorization'] = auth

    const res = await fetch(`${OGBO_URL}/v1/pots/active/${afroId}`, {
      headers,
      signal: AbortSignal.timeout(4_000),
    })
    if (res.ok) return NextResponse.json(await res.json())
  } catch { /* fall through */ }

  return NextResponse.json({ afroId, pots: MOCK_POTS, count: MOCK_POTS.length })
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { action = 'create', potId, ...rest } = body

  try {
    const url = action === 'create'
      ? `${OGBO_URL}/v1/pot/create`
      : `${OGBO_URL}/v1/pot/${potId}/${action}`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
      },
      body: JSON.stringify(rest),
      signal: AbortSignal.timeout(10_000),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Upstream unavailable' }, { status: 502 })
  }
}
