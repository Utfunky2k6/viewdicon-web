// ── Phase 0 LOCKDOWN — single source of truth for mock behavior ──
// When true: existing mock fallback behavior preserved (development).
// When false (production default): catch blocks log errors, show empty states.

export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'

export function logApiFailure(context: string, error?: unknown): void {
  if (USE_MOCKS) return
  console.error(`[LOCKDOWN] ${context}`, error instanceof Error ? error.message : error ?? '')
}
