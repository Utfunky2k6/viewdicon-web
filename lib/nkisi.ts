import type { NkisiState, UbuntuRank } from '@/types'

export function deriveNkisiState(ubuntuScore: number): NkisiState {
  if (ubuntuScore >= 70) return 'GREEN'
  if (ubuntuScore >= 30) return 'AMBER'
  return 'RED'
}

export function deriveUbuntuRank(ubuntuScore: number): UbuntuRank {
  if (ubuntuScore >= 90) return 'SAGE'
  if (ubuntuScore >= 60) return 'ELDER'
  if (ubuntuScore >= 25) return 'ROOTED'
  return 'SEED'
}

export const NKISI_META: Record<NkisiState, { color: string; label: string; emoji: string; tw: string }> = {
  GREEN: { color: '#22C55E', label: 'Trusted',        emoji: '🟢', tw: 'ring-nkisi-green' },
  AMBER: { color: '#F59E0B', label: 'Under Review',   emoji: '🟡', tw: 'ring-nkisi-amber' },
  RED:   { color: '#EF4444', label: 'Sanctioned',     emoji: '🔴', tw: 'ring-nkisi-red'   },
}

export const RANK_META: Record<UbuntuRank, { label: string; emoji: string; color: string; minScore: number }> = {
  SEED:   { label: 'Seed',   emoji: '🌱', color: '#6B7280', minScore: 0  },
  ROOTED: { label: 'Rooted', emoji: '🌳', color: '#22C55E', minScore: 25 },
  ELDER:  { label: 'Elder',  emoji: '🦅', color: '#F59E0B', minScore: 60 },
  SAGE:   { label: 'Sage',   emoji: '✨', color: '#A855F7', minScore: 90 },
}
