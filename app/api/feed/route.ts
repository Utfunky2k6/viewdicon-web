import { NextRequest, NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../_lib/proxy'

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.search || ''
  const { data } = await proxyOrMock(
    `${UPSTREAM.SOROSOKE}/feed${qs}`,
    { posts: [], count: 0 },
  )
  return NextResponse.json(data)
}
