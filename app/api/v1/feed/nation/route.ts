import { NextRequest, NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../../_lib/proxy'

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get('limit') || '6'
  const { data, live } = await proxyOrMock(
    `${UPSTREAM.SOROSOKE}/feed/posts?scope=NATION&limit=${limit}`,
    [],
  )
  return NextResponse.json(Array.isArray(data) ? data : (data as { data?: unknown[] }).data ?? [], {
    headers: { 'X-Live': live ? '1' : '0' },
  })
}
