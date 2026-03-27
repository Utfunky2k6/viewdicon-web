import { NextRequest, NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../../_lib/proxy'

// Empty fallback — real data comes from banking backend
const EMPTY_CIRCLES: never[] = []

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization') || ''
  const { data, live } = await proxyOrMock(
    `${UPSTREAM.BANKING}/bank/ajo/my-circles`,
    { circles: EMPTY_CIRCLES },
    { headers: { Authorization: token } },
  )
  return NextResponse.json({ ok: true, live, data })
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization') || ''
  const body  = await req.json()
  const { data, live } = await proxyOrMock(
    `${UPSTREAM.BANKING}/bank/ajo/circle/create`,
    { circleId: '', status: 'CREATED' },
    { method: 'POST', body: JSON.stringify(body), headers: { Authorization: token } },
  )
  return NextResponse.json({ ok: true, live, data })
}
