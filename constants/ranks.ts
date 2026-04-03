// ── Honor Rank System — Re-exports from 500-tier honor-system ─────────────────
// This file preserves backward compatibility for all existing imports.
// The actual data lives in honor-system.ts (500 tiers, 11 groups).

export {
  type RankGroup,
  type RankTier,
  type FeatureUnlock,
  RANK_GROUP_META,
  RANK_TIERS,
  XP_SOURCES,
  FEATURE_UNLOCKS,
  VILLAGE_LIFE_CONDITIONS,
  GO_LIVE_TYPES,
  NAMING_MILESTONES,
  VIOLATION_CONSEQUENCES,
  getRankByLevel,
  getRankFromXP,
  getXPProgress,
  getTiersByGroup,
  getXPForLevel,
  getGroupForLevelPublic,
} from './honor-system'
