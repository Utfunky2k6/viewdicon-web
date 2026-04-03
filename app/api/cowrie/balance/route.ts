import { NextRequest, NextResponse } from 'next/server'

const COWRIE_UNION_URL = process.env.COWRIE_UNION_URL || 'http://localhost:4050'
const IS_LOCAL = process.env.NODE_ENV === 'development'

const MOCK_BALANCE = (id: string) => ({
  afroId: id,
  africoin: { balance: 3_200, currency: 'AFC', symbol: '₳', label: 'AfriCoin' },
  cowrie:   { balance: 12_450, currency: 'CWR', symbol: '₵', label: 'Cowrie' },
  heldInEscrow: 800,
  ubuntuScore: 647,
  nkisiShield: 'GREEN',
  marketDay: 'Afo',
  lastUpdated: new Date().toISOString(),
})

export async function GET(req: NextRequest) {
  const afroId = req.nextUrl.searchParams.get('afroId') || 'demo-user'

  if (IS_LOCAL) {
    try {
      const res = await fetch(`${COWRIE_UNION_URL}/v1/wallet/${afroId}`, { next: { revalidate: 0 } })
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json({ ...MOCK_BALANCE(afroId), ...data })
      }
    } catch {
      // fall through to mock
    }
  }

  return NextResponse.json(MOCK_BALANCE(afroId))
}
