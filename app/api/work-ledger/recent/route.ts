import { NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../_lib/proxy'

export async function GET() {
  const { data } = await proxyOrMock(
    `${UPSTREAM.BANKING}/bank/work-ledger/recent?limit=8`,
    [],
  )
  return NextResponse.json(data)
}
