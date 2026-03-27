import { NextRequest, NextResponse } from 'next/server'
import { routeToVillage } from '@/lib/village-routing'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { answers, heritage } = body as { answers?: unknown; heritage?: unknown }

  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: 'Missing answers array' }, { status: 400 })
  }

  const sanitizedAnswers = answers
    .slice(0, 5)
    .map((answer) => typeof answer === 'string' ? answer.slice(0, 500) : '')

  const result = routeToVillage(sanitizedAnswers)

  return NextResponse.json({
    ...result,
    heritage: typeof heritage === 'string' ? heritage.slice(0, 100) : null,
  })
}
