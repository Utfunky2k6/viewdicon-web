import { NextResponse } from 'next/server'
import { proxyOrMock, UPSTREAM } from '../../../_lib/proxy'

const EMPTY_CIRCLE = {
  circleId: '',
  name: '',
  members: [],
  collectionDay: '',
  myPayout: '₡ 0',
  paidCount: 0,
  totalCount: 0,
  totalCollected: '₡ 0',
  totalTarget: '₡ 0',
  daysUntilCollection: 0,
  unpaidCount: 0,
}

export async function GET() {
  const { data, live } = await proxyOrMock(
    `${UPSTREAM.BANKING}/bank/ajo/my-circle`,
    EMPTY_CIRCLE,
  )
  return NextResponse.json({ ...data, live })
}
