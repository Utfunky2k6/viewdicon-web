import { NextRequest, NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../../_lib/proxy'

// Empty fallback — real data comes from banking backend
const EMPTY_TXS: never[] = []

export async function GET(req: NextRequest) {
  const token  = req.headers.get('authorization') || ''
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || ''
  const type   = searchParams.get('type') || ''
  const qp     = new URLSearchParams({ ...(cursor ? { cursor } : {}), ...(type ? { type } : {}) })
  const { data, live } = await proxyOrMock(
    `${UPSTREAM.BANKING}/bank/transactions${qp.size ? '?' + qp : ''}`,
    { transactions: EMPTY_TXS, cursor: null },
    { headers: { Authorization: token } },
  )
  return NextResponse.json({ ok: true, live, data })
}
