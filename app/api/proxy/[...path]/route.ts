import { NextRequest, NextResponse } from 'next/server'

const SERVICES: Record<string, string> = {
  auth: process.env.AUTH_CORE_URL || 'http://localhost:3001',
  village: process.env.VILLAGE_URL || 'http://localhost:3022',
  soro: process.env.SOROSOKE_URL || 'http://localhost:3003',
  family: process.env.FAMILY_URL || 'http://localhost:3055',
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const service = params.path[0]
  if (!SERVICES[service]) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const restPath = params.path.slice(1).join('/')
  const targetUrl = `${SERVICES[service]}/${restPath}${req.nextUrl.search}`

  // Forward the caller's token — never inject a hardcoded token
  const headers: Record<string, string> = { accept: 'application/json' }
  const auth = req.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  try {
    const res = await fetch(targetUrl, { headers, cache: 'no-store', signal: AbortSignal.timeout(10_000) })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    // Never expose internal targetUrl in error responses
    return NextResponse.json({ error: 'Upstream unavailable' }, { status: 502 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const service = params.path[0]
  if (!SERVICES[service]) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const restPath = params.path.slice(1).join('/')
  const targetUrl = `${SERVICES[service]}/${restPath}${req.nextUrl.search}`

  try {
    let body = null;
    try { body = await req.json() } catch {}

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const auth = req.headers.get('authorization')
    if (auth) headers['Authorization'] = auth

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10_000),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Upstream unavailable' }, { status: 502 })
  }
}
