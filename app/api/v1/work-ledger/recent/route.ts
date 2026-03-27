import { NextRequest, NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../../_lib/proxy'

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get('limit') || '8'
  const { data, live } = await proxyOrMock(
    `${UPSTREAM.BANKING}/bank/work-ledger/recent?limit=${limit}`,
    [],
  )
  return NextResponse.json(data, {
    headers: { 'X-Live': live ? '1' : '0' },
  })
}
