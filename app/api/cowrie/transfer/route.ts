import { NextRequest, NextResponse } from 'next/server'

const COWRIE_UNION_URL = process.env.COWRIE_UNION_URL || 'http://localhost:4050'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { fromAfroId, toAfroId, amount, currency = 'CWR', reason = '' } = body

  if (!fromAfroId || !toAfroId || !amount) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  try {
    const res = await fetch(`${COWRIE_UNION_URL}/v1/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
      },
      body: JSON.stringify({ fromAfroId, toAfroId, amount, currency, reason }),
      signal: AbortSignal.timeout(10_000),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Upstream unavailable' }, { status: 502 })
  }
}
