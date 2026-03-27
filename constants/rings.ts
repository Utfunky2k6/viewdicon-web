// ── Rings of Belonging — the replacement for Follow/Follower ────────────────
// "We do not pray to have more money but to have more kinsmen."
// — Achebe, Things Fall Apart
//
// 4 concentric rings of relationship depth. You earn your way in through
// action — not by clicking a button.

export type RingLevel = 1 | 2 | 3 | 4

export interface RingMeta {
  level: RingLevel
  key: string        // IDILE | EGBE | ILU | IJOBA
  yoruba: string
  subtitle: string
  description: string
  emoji: string
  color: string
  whatTheySee: string
  whatTheyCanDo: string
}

export const RINGS: RingMeta[] = [
  {
    level: 1,
    key: 'IDILE',
    yoruba: 'Ìdílé',
    subtitle: 'The Hearth',
    description: 'The family that shares your fire',
    emoji: '🔥',
    color: '#D97706',
    whatTheySee: 'Your Clan Skin feed, private Heritage Drops, WorkLedger highlights',
    whatTheyCanDo: 'Cast Ajo votes, vouch in Mbongi disputes, co-sign Pledge Stone, Family Circle quorum',
  },
  {
    level: 2,
    key: 'EGBE',
    yoruba: 'Ẹgbẹ́',
    subtitle: 'The Age-Set',
    description: 'Those who began the journey at the same time',
    emoji: '🤝',
    color: '#7C3AED',
    whatTheySee: 'Your Social Skin feed and village work',
    whatTheyCanDo: 'KÍLA and DRUM your content, nominate for Moon Harvest, invite to shared Ajo circles',
  },
  {
    level: 3,
    key: 'ILU',
    yoruba: 'Ìlú',
    subtitle: 'The Village',
    description: 'The town that knows your name',
    emoji: '🏘',
    color: '#1a7c3e',
    whatTheySee: 'Your Work Skin — public village profile, crest tier, trade listings',
    whatTheyCanDo: 'Hire you, KÍLA your posts, attend your events, send a Whisper Request',
  },
  {
    level: 4,
    key: 'IJOBA',
    yoruba: 'Ìjọba',
    subtitle: 'The Nation',
    description: 'The people who share the same land',
    emoji: '🌍',
    color: '#6b7280',
    whatTheySee: 'Only content you have DRUMed to the nation. Nothing private',
    whatTheyCanDo: 'KÍLA from afar, request a Whisper handshake, attend public events',
  },
]

export const RING_BY_LEVEL: Record<RingLevel, RingMeta> = {
  1: RINGS[0],
  2: RINGS[1],
  3: RINGS[2],
  4: RINGS[3],
}

export const RING_BY_KEY: Record<string, RingMeta> = {
  IDILE: RINGS[0],
  EGBE:  RINGS[1],
  ILU:   RINGS[2],
  IJOBA: RINGS[3],
}

export interface RingCounts {
  ring1: number  // Ìdílé
  ring2: number  // Ẹgbẹ́
  ring3: number  // Ìlú
  ring4: number  // Ìjọba
}

/** Empty ring counts -- populated from backend */
export const EMPTY_RING_COUNTS: RingCounts = {
  ring1: 0,
  ring2: 0,
  ring3: 0,
  ring4: 0,
}

/** Total kinsmen across all rings */
export function totalKinsmen(counts: RingCounts): number {
  return counts.ring1 + counts.ring2 + counts.ring3 + counts.ring4
}

/** Inner kinsmen = Ring 1 + Ring 2 (the ones who truly know you) */
export function innerKinsmen(counts: RingCounts): number {
  return counts.ring1 + counts.ring2
}
