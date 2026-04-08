// ── /api/honor/[...path] ──────────────────────────────────────────
// Proxies ALL honor-service endpoints to honor-service (port 3065).
// Examples:
//   GET  /api/honor/:afroId        → user honor state (XP, tier, level)
//   GET  /api/honor/tiers          → all tiers
//   GET  /api/honor/unlocks        → unlocks for current tier
//   GET  /api/honor/stream-eligibility/:afroId/:villageId/:streamType
// Falls back to a zeroed honor state — never crashes the UI.
import { NextRequest, NextResponse } from 'next/server'

const HONOR_URL  = process.env.HONOR_SERVICE_URL || 'http://localhost:3065'
const TIMEOUT_MS = 3000

const EMPTY_HONOR_STATE = {
  afroId:     '',
  xp:         0,
  level:      1,
  tier:       'SEED',
  tierLabel:  'Seed',
  nextTier:   'SPROUT',
  xpToNext:   100,
  badges:     [],
  unlocks:    [],
  live:       false,
}

async function proxyHonor(req: NextRequest, pathSegs: string[]): Promise<NextResponse> {
  const auth    = req.headers.get('authorization') ?? ''
  const subPath = pathSegs.join('/')
  const url     = `${HONOR_URL}/honor/${subPath}${req.nextUrl.search || ''}`

  const ctrl = new AbortController()
  const t    = setTimeout(() => ctrl.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
      signal: ctrl.signal,
    })
    clearTimeout(t)
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    clearTimeout(t)
    // If the first segment looks like an afroId, return zeroed state for that user
    const isUserQuery = pathSegs.length === 1 && !['tiers', 'unlocks'].includes(pathSegs[0])
    if (isUserQuery) {
      return NextResponse.json({ ...EMPTY_HONOR_STATE, afroId: pathSegs[0] })
    }
    if (pathSegs[0] === 'tiers')   return NextResponse.json({ tiers: [], total: 0 })
    if (pathSegs[0] === 'unlocks') return NextResponse.json({ unlocks: [] })
    return NextResponse.json(EMPTY_HONOR_STATE)
  }
}

export function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyHonor(req, params.path)
}
export function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyHonor(req, params.path)
}
