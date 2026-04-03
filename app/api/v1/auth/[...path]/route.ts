import { NextRequest, NextResponse } from 'next/server'

const AUTH_CORE_URL = process.env.NEXT_PUBLIC_AUTH_CORE_URL || 'http://localhost:4000'

type Ctx = { params: { path: string[] } }

async function proxy(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const subPath = params.path.join('/')
  const search  = req.nextUrl.search ?? ''
  const target  = `${AUTH_CORE_URL}/api/v1/auth/${subPath}${search}`

  const headers: Record<string, string> = {
    'Content-Type':               'application/json',
    'ngrok-skip-browser-warning': 'true',
    'X-Forwarded-Host':           req.headers.get('host') ?? '',
  }
  const auth = req.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  let body: string | undefined
  if (!['GET', 'HEAD'].includes(req.method)) {
    try { body = JSON.stringify(await req.json()) } catch { body = undefined }
  }

  try {
    const upstream = await fetch(target, {
      method:  req.method,
      headers,
      body,
    })
    const json = await upstream.json().catch(() => ({}))
    return NextResponse.json(json, { status: upstream.status })
  } catch {
    return NextResponse.json({ error: 'auth-core unreachable' }, { status: 502 })
  }
}

export const GET    = proxy
export const POST   = proxy
export const PUT    = proxy
export const PATCH  = proxy
export const DELETE = proxy
