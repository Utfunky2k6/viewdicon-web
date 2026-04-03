import { NextRequest, NextResponse } from 'next/server'
import { VILLAGE_TOOL_MAP } from '@/lib/village-tool-map'

// This route is intentionally NOT under /api/v1/ to avoid the auth-core catch-all rewrite
// in next.config.mjs. It serves static tool data directly from the frontend bundle.
export async function GET(
  req: NextRequest,
  { params }: { params: { villageId: string } }
) {
  const villageId = params.villageId
  const roleKey = req.nextUrl.searchParams.get('roleKey') || ''

  const toolKeys: string[] = (VILLAGE_TOOL_MAP as Record<string, Record<string, string[]>>)[villageId]?.[roleKey] ?? []

  return NextResponse.json({
    ok: true,
    data: toolKeys.map((toolKey) => ({ toolKey })),
  })
}
