import { NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../_lib/proxy'

const EMPTY_VITALITY = {
  ubuntuScore: 0,
  crestProgress: 0,
  crestTier: 0,
  villageName: '',
  nkisiState: 'GREY',
  heritage: '',
}

export async function GET() {
  const { data } = await proxyOrMock(
    `${UPSTREAM.AUTH}/api/v1/auth/me/vitality`,
    EMPTY_VITALITY,
  )
  return NextResponse.json(data)
}
