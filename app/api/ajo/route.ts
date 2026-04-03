import { NextRequest, NextResponse } from 'next/server'

const IS_LOCAL = process.env.NODE_ENV === 'development'
const BANKING_GW = process.env.BANKING_GW_URL || 'http://localhost:9000'

const MOCK_CIRCLES = [
  {
    id: 'circle-ubuntu-grove-1',
    name: 'Ubuntu Grove Ajo',
    cadence: 'MONTHLY',
    amountPerCycle: 2000,
    memberCount: 8,
    myPosition: 3,
    currentRound: 2,
    totalRounds: 8,
    potSize: 16000,
    status: 'ACTIVE',
    nextContributionDate: new Date(Date.now() + 86400000 * 12).toISOString(),
    nextPayoutAfroId: 'mama-ngozi',
    myContributions: [{ round: 1, paid: true, date: new Date(Date.now() - 86400000 * 30).toISOString() }],
    members: [
      { afroId: 'mama-ngozi', crest: 3, position: 1, paid: true },
      { afroId: 'bro-kwame', crest: 2, position: 2, paid: true },
      { afroId: 'demo-user', crest: 2, position: 3, paid: true },
      { afroId: 'sis-amara', crest: 1, position: 4, paid: false },
    ],
    marketDay: 'Eke',
    villageId: 'finance',
  },
  {
    id: 'circle-harvest-women',
    name: 'Harvest Women Susu',
    cadence: 'WEEKLY',
    amountPerCycle: 500,
    memberCount: 12,
    myPosition: 7,
    currentRound: 5,
    totalRounds: 12,
    potSize: 6000,
    status: 'ACTIVE',
    nextContributionDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    nextPayoutAfroId: 'sis-fatima',
    myContributions: [],
    members: [],
    marketDay: 'Nkwo',
    villageId: 'agriculture',
  },
]

const MOCK_POOLS = [
  {
    id: 'pool-hospital-extension',
    title: 'Village Health Centre Extension',
    organiser: 'Dr Eze Okafor',
    goalCowrie: 50000,
    raisedCowrie: 34200,
    contributorCount: 68,
    daysLeft: 21,
    scope: 'VILLAGE',
    villageId: 'health',
    emoji: '🏥',
    description: 'Building a new maternity wing for 200 births per year.',
  },
  {
    id: 'pool-borehole-northeast',
    title: 'Northeast Quarter Borehole',
    organiser: 'Elder Musa Aliyu',
    goalCowrie: 20000,
    raisedCowrie: 18750,
    contributorCount: 42,
    daysLeft: 5,
    scope: 'VILLAGE',
    villageId: 'energy',
    emoji: '💧',
    description: 'Clean water access for 400 families.',
  },
]

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') || 'circles'

  if (type === 'pools') return NextResponse.json({ pools: MOCK_POOLS })

  if (IS_LOCAL) {
    try {
      const res = await fetch(`${BANKING_GW}/bank/ajo/circles`, { next: { revalidate: 0 } })
      if (res.ok) return NextResponse.json(await res.json())
    } catch { /* fall through */ }
  }

  return NextResponse.json({ circles: MOCK_CIRCLES })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  // create circle or harambee pool
  return NextResponse.json({
    ok: true,
    id: `new-${Date.now()}`,
    ...body,
    status: 'FORMING',
    createdAt: new Date().toISOString(),
    message: 'The circle is drawn. Invite your people.',
  })
}
