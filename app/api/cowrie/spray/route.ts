import { NextRequest, NextResponse } from 'next/server'

const COWRIE_UNION_URL = process.env.COWRIE_UNION_URL || 'http://localhost:4050'
const IS_LOCAL = process.env.NODE_ENV === 'development'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { fromAfroId, recipients, totalCowrie, streamId } = body

  if (!fromAfroId || !recipients || !totalCowrie) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  if (IS_LOCAL) {
    try {
      const res = await fetch(`${COWRIE_UNION_URL}/v1/spray`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromAfroId, recipients, totalCowrie, streamId }),
      })
      if (res.ok) return NextResponse.json(await res.json())
    } catch { /* fall through */ }
  }

  return NextResponse.json({
    ok: true,
    koweHash: `kowe_spray_${Math.random().toString(16).slice(2, 16)}`,
    totalSprayed: totalCowrie,
    platformTax: Math.floor(totalCowrie * 0.05),
    distributed: Math.floor(totalCowrie * 0.95),
    recipients: (recipients as { afroId: string; percent: number }[]).map(r => ({
      afroId: r.afroId,
      received: Math.floor(totalCowrie * 0.95 * r.percent),
    })),
    message: 'Rain falls on the village. The Griot saw it.',
  })
}
