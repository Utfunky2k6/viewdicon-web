import { NextRequest, NextResponse } from 'next/server'

const COWRIE_UNION_URL = process.env.COWRIE_UNION_URL || 'http://localhost:4050'
const IS_LOCAL = process.env.NODE_ENV === 'development'

function mockLedger(afroId: string) {
  const types = [
    { type: 'CREDIT', label: 'Ajo Payout', amount: 4800, from: 'ajo-circle-esusu' },
    { type: 'DEBIT',  label: 'Sent to Market', amount: -1200, to: 'mama-ngozi' },
    { type: 'SPRAY',  label: 'Sprayed Creator', amount: -500, to: 'jollof-tv-stream-42' },
    { type: 'CREDIT', label: 'Harambee Gift',   amount: 2000, from: 'village-health-pool' },
    { type: 'ESCROW_LOCK',    label: 'Pot Sealed',    amount: -3000, ref: 'pot-market-trade' },
    { type: 'ESCROW_RELEASE', label: 'Pot Released',  amount: 3000,  ref: 'pot-market-trade' },
    { type: 'AJO_CONTRIBUTION', label: 'Ajo Contribution', amount: -800, ref: 'circle-ubuntu-grove' },
    { type: 'SEASON_LOCK',   label: 'Grain Deposited', amount: -5000, ref: 'vault-rainy-season' },
    { type: 'CORRIDOR_SEND', label: 'Sent via NIBSS',  amount: -10000, to: 'family-lagos' },
    { type: 'CREDIT',        label: 'Village Reward',  amount: 250, from: 'village-treasury' },
  ]
  return types.map((t, i) => ({
    id: `kowe-${i + 1}`,
    afroId,
    ...t,
    currency: 'CWR',
    koweHash: `kowe_${Math.random().toString(16).slice(2, 18)}`,
    timestamp: new Date(Date.now() - i * 86400000 * 1.5).toISOString(),
    eventType: t.type,
  }))
}

export async function GET(req: NextRequest) {
  const afroId = req.nextUrl.searchParams.get('afroId') || 'demo-user'

  if (IS_LOCAL) {
    try {
      const res = await fetch(`${COWRIE_UNION_URL}/v1/ledger/${afroId}`, { next: { revalidate: 0 } })
      if (res.ok) return NextResponse.json(await res.json())
    } catch { /* fall through */ }
  }

  return NextResponse.json({ afroId, entries: mockLedger(afroId), count: 10 })
}
