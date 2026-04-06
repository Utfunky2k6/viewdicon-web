import { NextRequest, NextResponse } from 'next/server'

const AUTH_CORE = process.env.AUTH_CORE_URL ?? 'http://localhost:4000'

export async function GET(req: NextRequest, { params }: { params: Promise<{ godId: string }> }) {
  const { godId } = await params
  const url = new URL(req.url)
  const limit = url.searchParams.get('limit') || '50'

  try {
    const r = await fetch(`${AUTH_CORE}/api/v1/ai/gods/${godId}/chat?limit=${limit}`, {
      headers: { 'authorization': req.headers.get('authorization') ?? '' },
    })
    return NextResponse.json(await r.json())
  } catch {
    return NextResponse.json({ ok: true, data: { godId, messages: [], messageCount: 0 } })
  }
}
