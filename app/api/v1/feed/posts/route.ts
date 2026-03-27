import { NextRequest, NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../../_lib/proxy'

// Empty fallback — real data comes from soro-soke-feed backend
const EMPTY_POSTS: never[] = []

export async function GET(req: NextRequest) {
  const token       = req.headers.get('authorization') || ''
  const { searchParams } = new URL(req.url)
  const skin        = searchParams.get('skin')        || 'ise'
  const villageId   = searchParams.get('villageId')   || ''
  const cursor      = searchParams.get('cursor')      || ''
  const geo         = searchParams.get('geo')         || 'village'
  const sort        = searchParams.get('sort')        || 'hot'

  const qp = new URLSearchParams({ skinContext: skin, sort })
  if (villageId) qp.set('villageId', villageId)
  if (cursor)    qp.set('cursor', cursor)

  const { data, live } = await proxyOrMock(
    `${UPSTREAM.SOROSOKE}/posts/feed?${qp}`,
    { ok: true, data: EMPTY_POSTS, cursor: null },
    { headers: { Authorization: token } },
  )
  const posts = Array.isArray(data)
    ? data
    : (data as any).data || (data as any).posts || []
  return NextResponse.json({ ok: true, live, data: posts, cursor: (data as any).cursor ?? null })
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization') || ''
  const body  = await req.json()
  const { data, live } = await proxyOrMock(
    `${UPSTREAM.SOROSOKE}/posts`,
    { id: '', status: 'CREATED' },
    { method: 'POST', body: JSON.stringify(body), headers: { Authorization: token } },
  )
  return NextResponse.json({ ok: true, live, data }, { status: live ? 201 : 200 })
}
