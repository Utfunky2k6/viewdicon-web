import { NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../_lib/proxy'

export async function GET() {
  const { data } = await proxyOrMock(
    `${UPSTREAM.SOROSOKE}/feed/posts?scope=NATION&sort=heat&limit=6`,
    [],
  )
  return NextResponse.json(Array.isArray(data) ? data : (data as { data?: unknown[] }).data ?? [])
}
