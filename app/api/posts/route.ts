import { NextRequest, NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../_lib/proxy'

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.search || ''
  const { data } = await proxyOrMock(
    `${UPSTREAM.SOROSOKE}/posts${qs}`,
    { posts: [], count: 0 },
  )
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const auth = req.headers.get('authorization')
  const afroId = req.headers.get('x-afro-id')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) headers['Authorization'] = auth
  if (afroId) headers['x-afro-id'] = afroId

  const { data } = await proxyOrMock(
    `${UPSTREAM.SOROSOKE}/posts`,
    { error: 'Feed service unavailable' },
    { method: 'POST', headers, body: JSON.stringify(body) },
  )
  return NextResponse.json(data)
}
