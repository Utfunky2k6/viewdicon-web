import { NextRequest, NextResponse } from 'next/server'

const SERVICES: Record<string, string> = {
  auth: 'http://localhost:3001',
  village: 'http://localhost:3022',
  soro: 'http://localhost:3003',
  family: 'http://localhost:3055',
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const service = params.path[0]
  if (!SERVICES[service]) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  const restPath = params.path.slice(1).join('/')
  const targetUrl = `${SERVICES[service]}/${restPath}${req.nextUrl.search}`

  const DEMO_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vLXVzZXIiLCJ0eXBlIjoiYWNjZXNzIiwiZEhhc2giOiJkZW1vIiwiaWF0IjoxNzc0Mzk5NzUwLCJleHAiOjE4MDU5NTczNTB9.C13lK7TsKiUfjuaED4tKENSazGvUXGE9i2rwXKxTVKo';
  const headers: Record<string, string> = { accept: 'application/json', 'Authorization': `Bearer ${DEMO_TOKEN}` }
  
  try {
    const res = await fetch(targetUrl, { headers, cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: 'Proxy GET failed', targetUrl }, { status: 502 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const service = params.path[0]
  if (!SERVICES[service]) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

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
      body: body ? JSON.stringify(body) : undefined
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: 'Proxy POST failed', targetUrl }, { status: 502 })
  }
}
