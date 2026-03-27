import { NextRequest, NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../../_lib/proxy'

// Empty fallback — real data comes from banking backend
const EMPTY_BALANCE = {
  ok: true, live: false,
  data: { cowrie: 0, afcoin: 0, escrowLocked: 0, tlpLocked: 0 }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization') || ''
  const { data, live } = await proxyOrMock(
    `${UPSTREAM.BANKING}/bank/account/balance`,
    EMPTY_BALANCE.data,
    { headers: { Authorization: token } },
  )
  return NextResponse.json({ ok: true, live, data })
}
