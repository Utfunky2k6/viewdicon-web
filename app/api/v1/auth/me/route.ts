import { NextRequest, NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../../_lib/proxy'

// Empty fallback — real data comes from auth-core backend
const EMPTY_USER = {
  id: '',
  handle: '',
  displayName: '',
  crestTier: 0,
  skin: '',
  villageId: '',
  afroId: '',
  cowrieBalance: 0,
  afcoinBalance: 0,
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization') || ''
  const { data, live } = await proxyOrMock(
    `${UPSTREAM.AUTH}/api/v1/auth/me`,
    EMPTY_USER,
    { headers: { Authorization: token } },
  )
  return NextResponse.json({ ok: true, live, data })
}
