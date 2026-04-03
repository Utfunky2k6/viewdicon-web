import { NextRequest, NextResponse } from 'next/server'

const AUTH_CORE_URL = process.env.NEXT_PUBLIC_AUTH_CORE_URL || 'http://localhost:4000'

async function proxy(req: NextRequest): Promise<NextResponse> {
  const target = `${AUTH_CORE_URL}/api/v1/me${req.nextUrl.search ?? ''}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  }
  const auth = req.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  let body: string | undefined
  if (!['GET', 'HEAD'].includes(req.method)) {
    try { body = JSON.stringify(await req.json()) } catch { body = undefined }
  }

  try {
    const upstream = await fetch(target, { method: req.method, headers, body })
    const json = await upstream.json().catch(() => ({}))
    return NextResponse.json(json, { status: upstream.status })
  } catch {
    return NextResponse.json({ error: 'auth-core unreachable' }, { status: 502 })
  }
}

export const GET = proxy
export const PATCH = proxy
