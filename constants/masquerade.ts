// ── Masquerade Protocol — ISE / EGBE / IDILE ──────────────────────────────

export type SkinType = 'ISE' | 'EGBE' | 'IDILE'

export interface SkinConfig {
  id: SkinType
  yorubaName: string
  englishName: string
  description: string
  primary: string
  light: string
  background: string
  border: string
  emoji: string
}

export const SKINS: Record<SkinType, SkinConfig> = {
  ISE: {
    id: 'ISE',
    yorubaName: 'Isé',
    englishName: 'Work',
    description: 'Your professional face — trade, tools, villages',
    primary: '#1a7c3e',
    light: '#4ade80',
    background: '#0a1f0f',
    border: '#1e3a20',
    emoji: '⚒',
  },
  EGBE: {
    id: 'EGBE',
    yorubaName: 'Ẹgbẹ́',
    englishName: 'Social',
    description: 'Your public face — posts, connections, heat',
    primary: '#d97706',
    light: '#fbbf24',
    background: '#1c0e00',
    border: '#3d2000',
    emoji: '🎭',
  },
  IDILE: {
    id: 'IDILE',
    yorubaName: 'Ìdílé',
    englishName: 'Clan',
    description: 'Your ancestral space — family, vault, bloodline',
    primary: '#7c3aed',
    light: '#a78bfa',
    background: '#130626',
    border: '#2e1265',
    emoji: '🏛',
  },
}

export const SKIN_ORDER: SkinType[] = ['ISE', 'EGBE', 'IDILE']

// ── ISE (Work) Tabs ─────────────────────────────────────────────────────────
export type IseTab = 'profile' | 'tools' | 'villages'
export const ISE_TABS: { id: IseTab; label: string; emoji: string }[] = [
  { id: 'profile', label: 'Profile', emoji: '👤' },
  { id: 'tools', label: 'Tools', emoji: '⚒' },
  { id: 'villages', label: 'Villages', emoji: '🛖' },
]

// ISE work stats displayed on profile
export const ISE_STATS = [
  { key: 'sealedTrades', label: 'Sealed Trades', emoji: '🔒' },
  { key: 'roots', label: 'Roots', emoji: '🌳' },
  { key: 'toolSessions', label: 'Tool Sessions', emoji: '⚒' },
  { key: 'posts', label: 'Posts', emoji: '🥁' },
] as const

export const ISE_WORK_STATS = [
  { key: 'revenue', label: 'Revenue', emoji: '💰' },
  { key: 'rating', label: 'Rating', emoji: '⭐' },
  { key: 'streak', label: 'Streak', emoji: '🔥' },
  { key: 'crest', label: 'Crest', emoji: '🏅' },
] as const

// ISE tools grid (8 tools from the prototype)
export const ISE_QUICK_TOOLS = [
  { key: 'quick_invoice', name: 'Quick Invoice', emoji: '🧾', locked: false },
  { key: 'price_checker', name: 'Price Checker', emoji: '💹', locked: false },
  { key: 'stock_tracker', name: 'Stock Tracker', emoji: '📦', locked: false },
  { key: 'business_session', name: 'Business Session', emoji: '🤝', locked: false },
  { key: 'runner_dispatch', name: 'Runner Dispatch', emoji: '🏃', locked: false },
  { key: 'live_auction', name: 'Live Auction', emoji: '🔨', locked: false },
  { key: 'buyer_shadow', name: 'Buyer Shadow Score', emoji: '👁', locked: false },
  { key: 'bulk_buyer', name: 'Bulk Buyer Board', emoji: '📋', locked: true, requiredCrest: 4 },
] as const

// ── EGBE (Social) Tabs ──────────────────────────────────────────────────────
export type EgbeTab = 'profile' | 'posts' | 'connections'
export const EGBE_TABS: { id: EgbeTab; label: string; emoji: string }[] = [
  { id: 'profile', label: 'Profile', emoji: '🎭' },
  { id: 'posts', label: 'Posts', emoji: '🥁' },
  { id: 'connections', label: 'Connections', emoji: '🔥' },
]

// EGBE post action bar
export const EGBE_POST_ACTIONS = [
  { key: 'kila', label: 'Kila', emoji: '⭐', color: '#4ade80' },
  { key: 'stir', label: 'Stir', emoji: '🌶', color: '#ef4444' },
  { key: 'drum', label: 'Drum', emoji: '🥁', color: '#fbbf24' },
  { key: 'trade', label: 'Trade', emoji: '🤝', color: '#4ade80' },
  { key: 'spray', label: 'Spray', emoji: '💰', color: '#d4a017' },
] as const

// EGBE post types with accent colors
export type EgbePostType = 'personal' | 'village' | 'oracle'
export const EGBE_POST_TYPES: Record<EgbePostType, { accent: string; label: string }> = {
  personal: { accent: '#4ade80', label: 'Personal' },
  village: { accent: '#42a5f5', label: 'Village' },
  oracle: { accent: '#ef4444', label: 'Oracle / Issue' },
}

// ── IDILE (Clan) Tabs ───────────────────────────────────────────────────────
export type IdileTab = 'profile' | 'ancestor-tree' | 'vault'
export const IDILE_TABS: { id: IdileTab; label: string; emoji: string }[] = [
  { id: 'profile', label: 'Profile', emoji: '🏛' },
  { id: 'ancestor-tree', label: 'Ancestor Tree', emoji: '🌳' },
  { id: 'vault', label: 'Vault', emoji: '🔐' },
]

// Vault item types
export type VaultItemType = 'voice' | 'document' | 'photo' | 'oral_history'
export const VAULT_ITEM_TYPES: { id: VaultItemType; label: string; emoji: string }[] = [
  { id: 'voice', label: 'Voice Recording', emoji: '🎙' },
  { id: 'document', label: 'Document', emoji: '📄' },
  { id: 'photo', label: 'Photo', emoji: '📸' },
  { id: 'oral_history', label: 'Oral History', emoji: '📿' },
]

// Ghost mode config
export const GHOST_MODE = {
  avatarFilter: 'blur(2px) brightness(.7)',
  nameDisplay: '■■■■■■',
  tag: 'Ghost Mode Active — Invisible to the World',
  color: '#7c3aed',
} as const

// Recovery quorum config
export const RECOVERY_QUORUM = {
  minApprovals: 4,
  maxMembers: 7,
  description: 'If you ever lose access, 4 family members must approve recovery. This communal safety net replaces passwords with bloodlines.',
} as const

// ── Root Planting Tiers ─────────────────────────────────────────────────────
export interface RootTier {
  id: string
  name: string
  emoji: string
  price: number  // Cowrie per month, 0 = free
  perks: string[]
  badge?: string  // e.g. "Most Planted"
}

export const ROOT_TIERS: RootTier[] = [
  {
    id: 'free',
    name: 'Free Root',
    emoji: '🌱',
    price: 0,
    perks: [
      'Drum Calls when live',
      'Posts in Village Drum feed',
      'Village community access',
    ],
  },
  {
    id: 'strong',
    name: 'Strong Root',
    emoji: '🌿',
    price: 200,
    perks: [
      'Everything in Free Root',
      'Exclusive Oracle Sessions',
      'Direct Village Chat',
      'Behind-the-scenes posts',
      'Name on Root Leaderboard',
    ],
    badge: 'Most Planted',
  },
  {
    id: 'elder',
    name: 'Elder Root',
    emoji: '🌳',
    price: 500,
    perks: [
      'Everything in Strong Root',
      'Personal Oracle (1:1)',
      'AfroID in Ancestral Vault',
      'Blood-Call obligation',
      'Elder status in village',
    ],
  },
]

// Platform takes 10%, creator gets 90%
export const ROOT_REVENUE_SPLIT = { creator: 0.9, platform: 0.1 } as const

// ── Settings Sections ───────────────────────────────────────────────────────
export interface SettingsSection {
  id: string
  title: string
  emoji: string
  items: SettingsItem[]
}

export interface SettingsItem {
  key: string
  label: string
  description?: string
  type: 'link' | 'toggle' | 'info' | 'danger'
  value?: string
  locked?: boolean  // e.g. Blood-Call cannot be disabled
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile & Identity',
    emoji: '👤',
    items: [
      { key: 'edit_profile', label: 'Edit Profile', description: 'Name, bio, avatar, links', type: 'link' },
      { key: 'afro_id', label: 'Afro-ID Settings', type: 'link' },
      { key: 'nkisi_shield', label: 'Nkisi Shield', type: 'info' },
      { key: 'village_memberships', label: 'Village Memberships', type: 'link' },
      { key: 'honor_rank', label: 'Honor Rank', type: 'link' },
      { key: 'my_events', label: 'My Events', type: 'link' },
      { key: 'root_planting', label: 'Root Planting', type: 'link' },
    ],
  },
  {
    id: 'masquerade',
    title: 'Masquerade Protocol',
    emoji: '🎭',
    items: [
      { key: 'skin_ise', label: 'ISÉ — Work Skin', type: 'link' },
      { key: 'skin_egbe', label: 'ẸGBẸ́ — Social Skin', type: 'link' },
      { key: 'skin_idile', label: 'ÌDÍLÉ — Clan Skin', description: 'PIN-gated', type: 'link' },
      { key: 'idile_auto_timeout', label: 'Auto-timeout IDILE', description: 'Re-lock after 30 min', type: 'toggle' },
      { key: 'change_idile_pin', label: 'Change IDILE PIN', description: '6-digit Palm Mark', type: 'link' },
    ],
  },
  {
    id: 'cowrie',
    title: 'Cowrie & Commerce',
    emoji: '💰',
    items: [
      { key: 'cowrie_wallet', label: 'Cowrie Wallet', type: 'link' },
      { key: 'bank_link', label: 'Bank Link & Withdrawal', type: 'link' },
      { key: 'ajo_circles', label: 'Ajo Circles', type: 'link' },
      { key: 'tax_compliance', label: 'Tax & Compliance Documents', type: 'link' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications — Drum Calls',
    emoji: '🔔',
    items: [
      { key: 'village_drum', label: 'Village Drum Calls', type: 'toggle' },
      { key: 'kila_received', label: 'Kila Received', type: 'toggle' },
      { key: 'trade_alerts', label: 'Trade & Business Alerts', type: 'toggle' },
      { key: 'root_planted', label: 'Root Planted', type: 'toggle' },
      { key: 'event_reminders', label: 'Event Reminders', type: 'toggle' },
      { key: 'go_live_alerts', label: 'Go Live Alerts', type: 'toggle' },
      { key: 'blood_call', label: 'Blood-Call', description: 'ALWAYS ON — Cannot be disabled', type: 'toggle', locked: true },
    ],
  },
  {
    id: 'language',
    title: 'Language & Accessibility',
    emoji: '🗣',
    items: [
      { key: 'spirit_voice_lang', label: 'Spirit Voice Language', type: 'link' },
      { key: 'theme', label: 'Theme', description: 'Dark Forest (default)', type: 'link' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    emoji: '📜',
    items: [
      { key: 'caws', label: 'CAWS Law Group', description: 'Village laws & rules', type: 'link' },
      { key: 'privacy', label: 'Privacy Policy', type: 'link' },
      { key: 'tos', label: 'Terms of Service', description: 'African Sovereign Standard', type: 'link' },
      { key: 'help', label: 'Help & Support', type: 'link' },
      { key: 'version', label: 'App Version', value: 'Viewdicon 2.4.1', type: 'info' },
    ],
  },
  {
    id: 'danger',
    title: 'Danger Zone',
    emoji: '⚠',
    items: [
      { key: 'deactivate', label: 'Deactivate Account', description: 'Pause, reactivate within 90 days', type: 'danger' },
      { key: 'delete_account', label: 'Delete Account', type: 'danger' },
    ],
  },
]

// ── Delete Account Consequences ─────────────────────────────────────────────
export const DELETE_CONSEQUENCES = [
  'All Cowrie must be withdrawn before deletion',
  'All active escrow sessions must be resolved',
  'All Root Planters refunded automatically',
  'Honor Rank and XP permanently lost',
  'Vault documents transferred to family key holder',
  '14-day grace period before permanent deletion',
] as const

// ── Nkisi Shield Levels ─────────────────────────────────────────────────────
export type NkisiLevel = 'GREEN' | 'AMBER' | 'RED'
export const NKISI_LEVELS: Record<NkisiLevel, { color: string; label: string; description: string }> = {
  GREEN: { color: '#4ade80', label: 'Trusted', description: 'Clean record, full access' },
  AMBER: { color: '#fbbf24', label: 'Caution', description: 'Minor violations, some restrictions' },
  RED: { color: '#ef4444', label: 'Restricted', description: 'Major violations, limited access' },
}

// ── Events Config ───────────────────────────────────────────────────────────
export interface EventTicketTier {
  name: string
  price: number  // Cowrie
  description?: string
}

export const EVENT_TYPES = [
  { id: 'conference', label: 'Conference', emoji: '🏛' },
  { id: 'virtual', label: 'Virtual', emoji: '📡' },
  { id: 'workshop', label: 'Workshop', emoji: '⚒' },
  { id: 'concert', label: 'Concert', emoji: '🎵' },
  { id: 'market', label: 'Market', emoji: '🏪' },
  { id: 'ceremony', label: 'Ceremony', emoji: '🔥' },
] as const

// ── Helper Functions ────────────────────────────────────────────────────────

/** Get skin config by type */
export function getSkin(skin: SkinType): SkinConfig {
  return SKINS[skin]
}

/** Get CSS variables for a skin */
export function getSkinCSS(skin: SkinType): Record<string, string> {
  const s = SKINS[skin]
  return {
    '--skin-primary': s.primary,
    '--skin-light': s.light,
    '--skin-bg': s.background,
    '--skin-border': s.border,
  }
}

/** Get root tier by id */
export function getRootTier(id: string): RootTier | undefined {
  return ROOT_TIERS.find(t => t.id === id)
}

/** Check if a feature requires a specific crest level */
export function requiresCrest(toolKey: string): number | null {
  const tool = ISE_QUICK_TOOLS.find(t => t.key === toolKey)
  if (tool && 'requiredCrest' in tool) return (tool as any).requiredCrest
  return null
}
