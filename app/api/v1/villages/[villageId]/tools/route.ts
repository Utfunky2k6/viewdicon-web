import { NextRequest, NextResponse } from 'next/server'
import { VILLAGE_TOOL_MAP } from '@/lib/village-tool-map'

export async function GET(
  _req: NextRequest,
  { params }: { params: { villageId: string } }
) {
  const villageId = params.villageId
  const roleKey = _req.nextUrl.searchParams.get('roleKey') || ''

  const roleTools = VILLAGE_TOOL_MAP[villageId]?.[roleKey] ?? []

  return NextResponse.json({
    ok: true,
    data: roleTools.map((toolKey: string) => ({ toolKey })),
  })
}
