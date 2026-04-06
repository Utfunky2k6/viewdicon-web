import { NextRequest, NextResponse } from 'next/server'

const AUTH_CORE = process.env.AUTH_CORE_URL ?? 'http://localhost:4000'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {}
  try { body = await req.clone().json() } catch { /* use fallback */ }

  try {
    const r = await fetch(`${AUTH_CORE}/api/v1/ai/gods/power/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': req.headers.get('authorization') ?? '',
      },
      body: JSON.stringify(body),
    })
    return NextResponse.json(await r.json())
  } catch {
    const power = body.powerId as string ?? 'unknown'
    return NextResponse.json({
      ok: true,
      data: {
        powerId: power,
        response: `Power "${power}" invoked. The gods have received your call and are channeling their response through the divine circuits.`,
        xpAwarded: 50,
      },
    })
  }
}
