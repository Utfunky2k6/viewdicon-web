import { NextRequest, NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../../_lib/proxy'

// Empty fallback — real data comes from banking backend
const EMPTY_ESCROW: never[] = []

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization') || ''
  const { data, live } = await proxyOrMock(
    `${UPSTREAM.BANKING}/bank/escrow/list`,
    { escrows: EMPTY_ESCROW },
    { headers: { Authorization: token } },
  )
  return NextResponse.json({ ok: true, live, data })
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization') || ''
  const body  = await req.json()
  const { data, live } = await proxyOrMock(
    `${UPSTREAM.BANKING}/bank/escrow/create`,
    { escrowId: '', state: 'INITIATED' },
    { method: 'POST', body: JSON.stringify(body), headers: { Authorization: token } },
  )
  return NextResponse.json({ ok: true, live, data }, { status: live ? 201 : 200 })
}
