import { NextRequest, NextResponse } from 'next/server'

const AUTH_CORE = process.env.AUTH_CORE_URL ?? 'http://localhost:4000'

const FALLBACKS: Record<string, string> = {
  kratos:    'Your security fortress stands. I have scanned all threat vectors and found no breach. Stay vigilant — the enemy tests the walls daily.',
  amaterasu: 'Your community radiates with energy today! Three new voices from your village have something powerful to say. Let their light reach you.',
  vishnu:    'The Cowrie flows in perfect balance when guided by wisdom. Your wealth dharma calls for patience — the harvest comes to those who plant with intention.',
  marduk:    'From chaos, empire is built. Your business idea has merit — but it needs the right timing and the right village allies. I see the path clearly.',
  odin:      'The ravens have returned with knowledge from across the continent. "The forest would be silent if no bird sang except the one that sang best." — What gift will you share?',
  zeus:      'I have consulted all five gods. Their wisdom is unified on this: Move boldly, protect fiercely, build wisely, illuminate constantly, and let ancestral wisdom guide every step.',
}

export async function POST(req: NextRequest) {
  let body: { godId?: string; message?: string; context?: unknown } = {}
  try {
    body = await req.clone().json()
  } catch {
    // ignore parse error, will use fallback
  }

  try {
    const authHeader = req.headers.get('authorization') ?? ''
    const r = await fetch(`${AUTH_CORE}/api/v1/ai/gods/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'authorization': authHeader },
      body: JSON.stringify(body),
    })
    const data = await r.json()
    return NextResponse.json(data)
  } catch {
    const godId = body.godId ?? 'zeus'
    return NextResponse.json({
      ok: true,
      data: { response: FALLBACKS[godId] ?? FALLBACKS.zeus, xpAwarded: 10 },
    })
  }
}
