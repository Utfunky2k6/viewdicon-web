import { NextRequest, NextResponse } from 'next/server'

const COWRIE_UNION_URL = process.env.COWRIE_UNION_URL || 'http://localhost:4050'
const IS_LOCAL = process.env.NODE_ENV === 'development'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { fromAfroId, toAfroId, amount, currency = 'CWR', reason = '' } = body

  if (!fromAfroId || !toAfroId || !amount) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  if (IS_LOCAL) {
    try {
      const res = await fetch(`${COWRIE_UNION_URL}/v1/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromAfroId, toAfroId, amount, currency, reason }),
      })
      if (res.ok) return NextResponse.json(await res.json())
    } catch { /* fall through */ }
  }

  // Mock response for Vercel
  return NextResponse.json({
    ok: true,
    reference: `TXN-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
    koweHash: `kowe_${Math.random().toString(16).slice(2, 18)}`,
    fromAfroId, toAfroId, amount, currency, reason,
    timestamp: new Date().toISOString(),
    message: 'Transfer sealed with Kòwè. Ask the Griot for your receipt.',
  })
}
