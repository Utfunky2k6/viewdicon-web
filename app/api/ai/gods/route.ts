import { NextRequest, NextResponse } from 'next/server'

const AUTH_CORE = process.env.AUTH_CORE_URL ?? 'http://localhost:4000'

export async function GET(req: NextRequest) {
  try {
    const r = await fetch(`${AUTH_CORE}/api/v1/ai/gods`, { headers: { 'Content-Type': 'application/json' } })
    const data = await r.json()
    return NextResponse.json(data)
  } catch {
    // Return static fallback from constants
    return NextResponse.json({ ok: true, data: { gods: ['kratos', 'amaterasu', 'vishnu', 'marduk', 'odin', 'zeus'] } })
  }
}
