// ── Family Kinship Constants ──────────────────────────────────
// Central source of truth for all kinship data across the platform.
// Used by: FamilyTreeBuilder, FamilyTreeVisual, FamilyCircleChat, ceremony FamilyStep.

export type KinshipTier = 1 | 2 | 3

export type KinshipType =
  // Tier 1 — Blood Line (Ẹjẹ) — Recovery Quorum eligible
  | 'father' | 'mother'
  | 'grandfather_paternal' | 'grandmother_paternal'
  | 'grandfather_maternal' | 'grandmother_maternal'
  | 'older_brother' | 'younger_brother' | 'older_sister' | 'younger_sister'
  | 'son' | 'daughter'
  // Tier 2 — Extended Clan (Ìdílé)
  | 'uncle_paternal' | 'aunt_paternal' | 'uncle_maternal' | 'aunt_maternal'
  | 'cousin_paternal' | 'cousin_maternal' | 'nephew' | 'niece'
  | 'grandson' | 'granddaughter'
  // Tier 3 — Sworn Family (Egbé)
  | 'godfather' | 'godmother' | 'father_in_law' | 'mother_in_law'
  | 'brother_in_law' | 'sister_in_law' | 'spouse' | 'sworn_friend' | 'village_elder'

export interface KinshipOption {
  type: KinshipType
  en: string
  af: string      // African cultural name (Yoruba)
  tier: KinshipTier
  emoji: string
}

// ── Category grid tiles ────────────────────────────────────────
export const KINSHIP_CATS = [
  { id: 'parents',      emoji: '👨‍👩‍👧', label: 'Parents',      color: '#1a7c3e' },
  { id: 'grandparents', emoji: '👴',      label: 'Grandparents', color: '#d4a017' },
  { id: 'siblings',     emoji: '👫',      label: 'Siblings',     color: '#8b5cf6' },
  { id: 'children',     emoji: '👶',      label: 'Children',     color: '#3b82f6' },
  { id: 'extended',     emoji: '🏠',      label: 'Extended',     color: '#e07b00' },
  { id: 'sworn',        emoji: '🤝',      label: 'Sworn Family', color: '#ec4899' },
] as const

// ── Specific relationship options per category ─────────────────
export const KINSHIP_OPTIONS: Record<string, KinshipOption[]> = {
  parents: [
    { type: 'father', en: 'Father', af: 'Bàbá (Dad)', tier: 1, emoji: '👨' },
    { type: 'mother', en: 'Mother', af: 'Ìyá (Mama)', tier: 1, emoji: '👩' },
  ],
  grandparents: [
    { type: 'grandfather_paternal', en: "Grandfather (Dad's side)", af: 'Bàbá Àgbà', tier: 1, emoji: '👴' },
    { type: 'grandmother_paternal', en: "Grandmother (Dad's side)", af: 'Ìyá Àgbà',  tier: 1, emoji: '👵' },
    { type: 'grandfather_maternal', en: "Grandfather (Mum's side)", af: 'Bàbá Ìyá',  tier: 1, emoji: '👴' },
    { type: 'grandmother_maternal', en: "Grandmother (Mum's side)", af: 'Ìyá Ìyá',   tier: 1, emoji: '👵' },
  ],
  siblings: [
    { type: 'older_brother',   en: 'Older Brother',   af: 'Egbon (Àgbà)',    tier: 1, emoji: '👦' },
    { type: 'younger_brother', en: 'Younger Brother', af: "Abúrò (Kékeré)",  tier: 1, emoji: '👦' },
    { type: 'older_sister',    en: 'Older Sister',    af: 'Egbon (Obìnrin)', tier: 1, emoji: '👧' },
    { type: 'younger_sister',  en: 'Younger Sister',  af: "Abúrò (Obìnrin)", tier: 1, emoji: '👧' },
  ],
  children: [
    { type: 'son',      en: 'Son',      af: 'Ọmọkùnrin', tier: 1, emoji: '👦' },
    { type: 'daughter', en: 'Daughter', af: 'Ọmọbìnrin', tier: 1, emoji: '👧' },
  ],
  extended: [
    { type: 'uncle_paternal',  en: "Uncle (Dad's side)",     af: 'Bàbá Kékeré', tier: 2, emoji: '🧔' },
    { type: 'aunt_paternal',   en: "Aunt (Dad's side)",      af: 'Àánù Bàbá',   tier: 2, emoji: '👩' },
    { type: 'uncle_maternal',  en: "Uncle (Mum's side)",     af: 'Ègbón Ìyá',   tier: 2, emoji: '🧔' },
    { type: 'aunt_maternal',   en: "Aunt (Mum's side)",      af: 'Àbúrò Ìyá',   tier: 2, emoji: '👩' },
    { type: 'cousin_paternal', en: 'Cousin (Paternal)',      af: 'Ẹgbọn Baba',  tier: 2, emoji: '🫂' },
    { type: 'cousin_maternal', en: 'Cousin (Maternal)',      af: 'Ẹgbọn Ìyá',   tier: 2, emoji: '🫂' },
    { type: 'nephew',          en: 'Nephew',                 af: 'Ọmọ Ẹgbọn',   tier: 2, emoji: '👦' },
    { type: 'niece',           en: 'Niece',                  af: 'Ọmọ Ẹgbọn',   tier: 2, emoji: '👧' },
    { type: 'grandson',        en: 'Grandson',               af: 'Ọmọ Ọmọ',     tier: 2, emoji: '👦' },
    { type: 'granddaughter',   en: 'Granddaughter',          af: 'Ọmọ Ọmọbìnrin',tier: 2, emoji: '👧' },
  ],
  sworn: [
    { type: 'spouse',          en: 'Spouse',           af: 'Ọkọ / Ìyàwó',      tier: 3, emoji: '💍' },
    { type: 'godfather',       en: 'Godfather',        af: 'Bàbá Ìdúpẹ́',       tier: 3, emoji: '🧔' },
    { type: 'godmother',       en: 'Godmother',        af: 'Ìyá Ìdúpẹ́',        tier: 3, emoji: '👩' },
    { type: 'father_in_law',   en: 'Father-in-Law',    af: 'Bàbá Ìyàwó',        tier: 3, emoji: '👨' },
    { type: 'mother_in_law',   en: 'Mother-in-Law',    af: 'Ìyá Ìyàwó',         tier: 3, emoji: '👩' },
    { type: 'brother_in_law',  en: 'Brother-in-Law',   af: 'Ẹgbọn Ìyàwó',       tier: 3, emoji: '🤵' },
    { type: 'sister_in_law',   en: 'Sister-in-Law',    af: 'Àbúrò Ìyàwó',       tier: 3, emoji: '👰' },
    { type: 'sworn_friend',    en: 'Sworn Friend',     af: 'Ẹgbẹ́ (Age-Grade)',  tier: 3, emoji: '🤝' },
    { type: 'village_elder',   en: 'Village Elder',    af: 'Agbàlagbà',          tier: 3, emoji: '🧓' },
  ],
}

// ── Tier display config ────────────────────────────────────────
export const TIER_COLORS: Record<KinshipTier, string> = {
  1: '#4ade80',
  2: '#fbbf24',
  3: '#60a5fa',
}

export const TIER_LABELS: Record<KinshipTier, string> = {
  1: 'Blood Line · Ẹjẹ',
  2: 'Extended Clan · Ìdílé',
  3: 'Sworn Family · Egbé',
}

export const TIER_PERMS: Record<KinshipTier, { can: string[]; cannot: string[] }> = {
  1: {
    can: [
      '🔐 Can recover your account (2-of-N quorum)',
      '👁 Can see your Ìdílé (Clan) skin',
      '🥁 Receives your Blood-Call SOS',
      '💬 Invited to Family Circle chat',
      '🏛 Holds one key to Ancestral Vault',
    ],
    cannot: [],
  },
  2: {
    can: [
      '🥁 Receives your Blood-Call SOS',
      '👁 Can see your Ìdílé skin',
      '💬 Invited to Family Circle chat',
    ],
    cannot: ['❌ Cannot recover your account (Blood Line only)'],
  },
  3: {
    can: ['🥁 Receives your Blood-Call SOS'],
    cannot: [
      '❌ Cannot see Ìdílé skin (Family only)',
      '❌ Cannot recover your account',
    ],
  },
}

// ── Utility ────────────────────────────────────────────────────
export function getKinshipTier(type: string): KinshipTier {
  const t1 = ['father','mother','grandfather_paternal','grandmother_paternal','grandfather_maternal','grandmother_maternal','older_brother','younger_brother','older_sister','younger_sister','son','daughter']
  const t2 = ['uncle_paternal','aunt_paternal','uncle_maternal','aunt_maternal','cousin_paternal','cousin_maternal','nephew','niece','grandson','granddaughter']
  if (t1.includes(type)) return 1
  if (t2.includes(type)) return 2
  return 3
}

// LocalFamilyMember — stored in localStorage and passed to familyApi
export interface LocalFamilyMember {
  id: string
  name: string
  nickName?: string
  kinshipType: KinshipType
  kinshipTier: KinshipTier
  en: string          // English label (e.g. "Father")
  af: string          // African name (e.g. "Bàbá")
  phone: string
  memberAfroId?: string
  emoji: string
  verificationStatus: 'PENDING' | 'SMS_SENT' | 'VERIFIED'
  isDeceased?: boolean
  addedAt: string
}
