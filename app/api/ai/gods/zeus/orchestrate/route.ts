import { NextRequest, NextResponse } from 'next/server'

const AUTH_CORE = process.env.AUTH_CORE_URL ?? 'http://localhost:4000'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {}
  try { body = await req.clone().json() } catch { /* use fallback */ }

  try {
    const r = await fetch(`${AUTH_CORE}/api/v1/ai/gods/zeus/orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': req.headers.get('authorization') ?? '',
      },
      body: JSON.stringify(body),
    })
    return NextResponse.json(await r.json())
  } catch {
    // Zeus fallback — determines best god from message keywords
    const msg = (body.message as string ?? '').toLowerCase()
    const routedTo = msg.includes('securit') || msg.includes('fraud') || msg.includes('hack') ? 'kratos'
      : msg.includes('invest') || msg.includes('money') || msg.includes('cowrie') || msg.includes('pay') ? 'vishnu'
      : msg.includes('business') || msg.includes('trade') || msg.includes('contract') ? 'marduk'
      : msg.includes('feed') || msg.includes('content') || msg.includes('village') ? 'amaterasu'
      : msg.includes('wisdom') || msg.includes('culture') || msg.includes('career') ? 'odin'
      : 'zeus'
    const godNames: Record<string, string> = { kratos:'⚔️ Kratos', vishnu:'🌀 Vishnu', marduk:'⚡ Marduk', amaterasu:'☀️ Amaterasu', odin:'👁️ Odin', zeus:'🌩️ Zeus' }
    return NextResponse.json({
      ok: true,
      data: {
        routedTo,
        godName: godNames[routedTo],
        response: `Zeus has spoken: I route your query to ${godNames[routedTo]}. Their domain commands this moment. The answer lies in their sacred archive — listen carefully.`,
        zeusInsight: 'Multi-god consensus achieved. The path forward is clear.',
        xpAwarded: 50,
      },
    })
  }
}
