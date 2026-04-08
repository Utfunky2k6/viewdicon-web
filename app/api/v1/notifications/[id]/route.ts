// ── /api/v1/notifications/[id] ── mark-read, delete etc.
import { NextRequest, NextResponse } from 'next/server'

const AUTH_CORE = process.env.NEXT_PUBLIC_AUTH_CORE_URL || 'http://localhost:4000'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const url = `${AUTH_CORE}/api/v1/notifications/${params.id}`
  const auth = req.headers.get('authorization') ?? ''
  try {
    let body: string | undefined
    try { body = JSON.stringify(await req.json()) } catch { /* no body */ }
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
      body,
    })
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 }) // optimistic update
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const url = `${AUTH_CORE}/api/v1/notifications/${params.id}`
  const auth = req.headers.get('authorization') ?? ''
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { ...(auth ? { Authorization: auth } : {}) },
    })
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 })
  }
}
