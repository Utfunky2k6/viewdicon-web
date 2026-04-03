/**
 * Unified Kinship Data for the AFRO Platform
 * Defines the three tiers of African household/royal connection.
 */

export type KinshipTier = 1 | 2 | 3

export interface KinshipOption {
  type: string
  en: string
  af: string
  tier: KinshipTier
  emoji: string
}

export interface FamilyMember {
  id: string
  name: string
  rel: string
  afRel: string
  phone: string
  tier: KinshipTier
  emoji?: string
  seed?: boolean
}

export const KINSHIP_CATS = [
  { id: 'parents',      emoji: '👨‍👩‍👧', label: 'Parents',      color: '#1a7c3e' },
  { id: 'grandparents', emoji: '👴',     label: 'Grandparents', color: '#d4a017' },
  { id: 'siblings',     emoji: '👫',     label: 'Siblings',     color: '#8b5cf6' },
  { id: 'children',     emoji: '👶',     label: 'Children',     color: '#3b82f6' },
  { id: 'extended',     emoji: '🏠',     label: 'Extended',     color: '#e07b00' },
  { id: 'sworn',        emoji: '🤝',     label: 'Sworn Family', color: '#ec4899' },
] as const

export const KINSHIP_OPTIONS: Record<string, KinshipOption[]> = {
  parents: [
    { type: 'father', en: 'Father', af: 'Bàbá (Dad)', tier: 1, emoji: '👨' },
    { type: 'mother', en: 'Mother', af: 'Ìyá (Mama)', tier: 1, emoji: '👩' }
  ],
  grandparents: [
    { type: 'grandfather_paternal', en: "Grandfather (Dad's)", af: 'Bàbá Àgbà', tier: 1, emoji: '👴' },
    { type: 'grandmother_paternal', en: "Grandmother (Dad's)", af: 'Ìyá Àgbà', tier: 1, emoji: '👵' },
    { type: 'grandfather_maternal', en: "Grandfather (Mum's)", af: 'Bàbá Ìyá', tier: 1, emoji: '👴' },
    { type: 'grandmother_maternal', en: "Grandmother (Mum's)", af: 'Ìyá Ìyá', tier: 1, emoji: '👵' }
  ],
  siblings: [
    { type: 'older_brother',   en: 'Older Brother',   af: 'Egbon (Àgbà)',   tier: 1, emoji: '👦' },
    { type: 'younger_brother', en: 'Younger Brother', af: "Abúrò (Kékeré)", tier: 1, emoji: '👦' },
    { type: 'older_sister',    en: 'Older Sister',    af: 'Egbon (Obìnrin)', tier: 1, emoji: '👧' },
    { type: 'younger_sister',  en: 'Younger Sister',  af: "Abúrò (Obìnrin)", tier: 1, emoji: '👧' }
  ],
  children: [
    { type: 'son',      en: 'Son',      af: 'Ọmọkùnrin', tier: 1, emoji: '👦' },
    { type: 'daughter', en: 'Daughter', af: 'Ọmọbìnrin', tier: 1, emoji: '👧' }
  ],
  extended: [
    { type: 'uncle_paternal',   en: "Uncle (Dad's)",   af: 'Bàbá Kékeré',   tier: 2, emoji: '🧔' },
    { type: 'aunt_paternal',    en: "Aunt (Dad's)",    af: 'Àánù Bàbá',     tier: 2, emoji: '👩' },
    { type: 'uncle_maternal',   en: "Uncle (Mum's)",   af: 'Ègbón Ìyá',     tier: 2, emoji: '🧔' },
    { type: 'aunt_maternal',    en: "Aunt (Mum's)",    af: 'Àbúrò Ìyá',     tier: 2, emoji: '👩' },
    { type: 'cousin_paternal',  en: 'Cousin (Paternal)', af: 'Ẹgbọn Baba',  tier: 2, emoji: '🫂' },
    { type: 'cousin_maternal',  en: 'Cousin (Maternal)', af: 'Ẹgbọn Ìyá',   tier: 2, emoji: '🫂' }
  ],
  sworn: [
    { type: 'spouse',        en: 'Spouse',         af: 'Ọkọ / Ìyàwó',     tier: 3, emoji: '💍' },
    { type: 'godfather',     en: 'Godfather',      af: 'Bàbá Ìdúpẹ́',      tier: 3, emoji: '🧔' },
    { type: 'godmother',     en: 'Godmother',      af: 'Ìyá Ìdúpẹ́',       tier: 3, emoji: '👩' },
    { type: 'sworn_friend',  en: 'Sworn Friend',   af: 'Ẹgbẹ́ (Age-Grade)', tier: 3, emoji: '🤝' },
    { type: 'village_elder', en: 'Village Elder',  af: 'Agbàlagbà',        tier: 3, emoji: '🧓' }
  ],
}

export const TIER_PERMS: Record<KinshipTier, { can: string[]; cannot: string[] }> = {
  1: {
    can: [
      '🔐 Can recover your account (2-of-N quorum)',
      '👁 Can see your Ìdílé (Clan) skin',
      '🥁 Receives your Blood-Call SOS',
      '💬 Invited to Family Circle chat',
      '🏛 Holds one key to Ancestral Vault'
    ],
    cannot: []
  },
  2: {
    can: [
      '🥁 Receives your Blood-Call SOS',
      '👁 Can see your Ìdílé skin',
      '💬 Invited to Family Circle chat'
    ],
    cannot: ['❌ Cannot recover your account (Blood Line only)']
  },
  3: {
    can: ['🥁 Receives your Blood-Call SOS'],
    cannot: ['❌ Cannot see Ìdílé skin (Family only)', '❌ Cannot recover your account']
  },
}

export const TIER_LABELS: Record<KinshipTier, string> = {
  1: 'Tier 1 · Blood Line (Ẹjẹ)',
  2: 'Tier 2 · Extended Clan (Ìdílé)',
  3: 'Tier 3 · Sworn Family (Egbé)'
}

export const TIER_COLORS: Record<KinshipTier, string> = {
  1: '#4ade80',
  2: '#fbbf24',
  3: '#60a5fa'
}
