import { NextRequest, NextResponse } from 'next/server'
import { AI_GODS } from '@/constants/aiGods'
import type { GodId } from '@/constants/aiGods'

export async function GET(
  _req: NextRequest,
  { params }: { params: { godId: string } }
) {
  const god = AI_GODS[params.godId as GodId]
  if (!god) return NextResponse.json({ error: 'God not found' }, { status: 404 })
  return NextResponse.json({ ok: true, data: god })
}
