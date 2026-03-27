import { NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../../_lib/proxy'

// Empty fallback — real data comes from village-registry backend
const EMPTY_VILLAGES: never[] = []

export async function GET() {
  const { data, live } = await proxyOrMock(
    `${UPSTREAM.VILLAGE}/v1/villages`,
    { ok: true, villages: EMPTY_VILLAGES },
  )
  // Normalise: real backend wraps in { ok, data } or may return array
  const villages = Array.isArray(data)
    ? data
    : (data as any).villages || (data as any).data || []
  return NextResponse.json({ ok: true, live, data: villages })
}
