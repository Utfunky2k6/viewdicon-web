/**
 * AFRO Banking Constants — Rooted in African Financial History
 *
 * From the cowrie shells of pre-colonial West Africa, to the Ajo savings
 * circles of Yorubaland, to the Harambee spirit of Kenya — African
 * communities invented sophisticated financial systems millennia before
 * Western banking existed.
 *
 * Every concept here is real. Every system here worked.
 */

// ─── MARKET DAY SYSTEM (Igbo 4-Day Week) ─────────────────────────────────────
// The Igbo people of southeast Nigeria divided time into 4-day weeks.
// Each day had a major market. Financial deals were sealed on market days.
// This is the world's oldest known rotating banking calendar.

export const MARKET_EPOCH = new Date('2024-01-01') // Eke reference date

export const MARKET_DAYS = ['Eke', 'Orie', 'Afo', 'Nkwo'] as const
export type MarketDay = typeof MARKET_DAYS[number]

export const MARKET_DAY_META: Record<MarketDay, {
  emoji: string
  color: string
  theme: string
  bonus: string
  description: string
}> = {
  Eke: {
    emoji: '🌅',
    color: '#e8a020',
    theme: 'Grand Market',
    bonus: 'Ajo Payout Day — rotation completed today',
    description: 'The grand market day. Ajo circles pay out. Deals are sealed. The community gathers.',
  },
  Orie: {
    emoji: '🌿',
    color: '#2d9e5f',
    theme: 'Spirit Day',
    bonus: 'Season Vault deposits earn +2% Ubuntu Score',
    description: 'A day of reflection and ancestral honour. Best for long-term savings and Spirit Vault offerings.',
  },
  Afo: {
    emoji: '🔥',
    color: '#c94040',
    theme: 'Harvest Day',
    bonus: 'Harambee pools receive +10% village matching',
    description: 'The harvest day. Communities pool resources. Harambee fundraising is amplified today.',
  },
  Nkwo: {
    emoji: '🌙',
    color: '#6b4fbb',
    theme: 'Rest & Craft',
    bonus: 'Cowrie spray to creators earns double Ubuntu',
    description: 'The artisan day. Craft markets, creator economy. Spray your favourite creators double today.',
  },
}

export function getTodayMarketDay(): MarketDay {
  const daysSinceEpoch = Math.floor((Date.now() - MARKET_EPOCH.getTime()) / 86400000)
  return MARKET_DAYS[((daysSinceEpoch % 4) + 4) % 4]
}

// ─── AJO / SUSU / TONTINE — Rotating Savings Circle ─────────────────────────
// Ajo (Yoruba), Susu (Akan/Caribbean), Tontine (West Africa/Haiti),
// Chama (Kenya), Upatu (Tanzania) — all the same ancient concept.
// A group of people contribute equal amounts at regular intervals.
// Each cycle, one member takes the entire pot. Trusted for millennia.

export const AJO_CADENCES = [
  { key: 'WEEKLY',      label: 'Weekly',      days: 7,   emoji: '📅' },
  { key: 'FORTNIGHTLY', label: 'Fortnightly', days: 14,  emoji: '🌓' },
  { key: 'MONTHLY',     label: 'Monthly',     days: 30,  emoji: '🌕' },
  { key: 'MARKET_DAY',  label: 'Every Eke',   days: 4,   emoji: '🥁' },
] as const

export type AjoCadence = typeof AJO_CADENCES[number]['key']

export const AJO_STATUSES = {
  FORMING:   { label: 'Forming', color: '#888', emoji: '🫧' },
  ACTIVE:    { label: 'Active',  color: '#2d9e5f', emoji: '🔥' },
  PAUSED:    { label: 'Paused',  color: '#e8a020', emoji: '⏸' },
  COMPLETED: { label: 'Done',    color: '#6b4fbb', emoji: '✅' },
}

// ─── UBUNTU SCORE — Community Credit Rating ───────────────────────────────────
// "Ubuntu" — "I am because we are." An ancient Bantu philosophy.
// Your creditworthiness is not your salary — it is how your community
// vouches for you. 7 witnesses = no collateral needed for a loan.

export const UBUNTU_SCORE_TIERS = [
  { key: 'SEED',    min: 0,   max: 200,  label: 'Seed',    emoji: '🌱', color: '#7a9e6e', desc: 'New to the community. Build trust by participating.' },
  { key: 'SAPLING', min: 201, max: 400,  label: 'Sapling', emoji: '🌿', color: '#4a8c5c', desc: 'Growing roots. Eligible for small Ajo circles.' },
  { key: 'TREE',    min: 401, max: 600,  label: 'Tree',     emoji: '🌳', color: '#2d7a4a', desc: 'Trusted member. Eligible for Grain Bank loans.' },
  { key: 'GROVE',   min: 601, max: 800,  label: 'Grove',    emoji: '🌲', color: '#1a6038', desc: 'Village anchor. Can witness Spirit Vaults.' },
  { key: 'FOREST',  min: 801, max: 1000, label: 'Forest',   emoji: '🌴', color: '#0d4a28', desc: 'Elder trust. Can sit on the Elder Council.' },
] as const

export function getUbuntuTier(score: number) {
  return UBUNTU_SCORE_TIERS.find(t => score >= t.min && score <= t.max) ?? UBUNTU_SCORE_TIERS[0]
}

// ─── HARVEST SEASONS — Time-Locked Savings (Grain Bank Heritage) ─────────────
// Pre-colonial African grain banks: families deposited grain surplus
// after harvest, withdrew during lean seasons. The granary was the bank.
// We replicate this with Cowrie: lock funds, unlock at your "harvest."

export const HARVEST_SEASONS = [
  {
    key: 'PLANTING',
    label: 'Planting Season',
    emoji: '🌱',
    days: 90,
    color: '#4a8c5c',
    interestRate: 0.05, // 5% Cowrie earned on unlock
    grainBankRate: 0.50, // can borrow up to 50% against lock
    desc: '90 days — plant your seed, harvest the yield.',
  },
  {
    key: 'RAINY',
    label: 'Rainy Harvest',
    emoji: '🌧',
    days: 180,
    color: '#2d6a9e',
    interestRate: 0.10, // 10%
    grainBankRate: 0.60, // 60%
    desc: '180 days — the long rains bring the greatest harvest.',
  },
  {
    key: 'DRY',
    label: 'Dry Season Vault',
    emoji: '☀️',
    days: 365,
    color: '#c94040',
    interestRate: 0.18, // 18%
    grainBankRate: 0.70, // 70%
    desc: '365 days — endure the dry season, reap abundance.',
  },
] as const

export type HarvestSeason = typeof HARVEST_SEASONS[number]['key']

// ─── REMITTANCE CORRIDORS — Diaspora Railways ────────────────────────────────
// Africans in the diaspora send over $100B home annually.
// Africa-to-Africa remittance is the fastest-growing global corridor.
// These "rails" are the arteries of the African economy.

export const CORRIDOR_RAILS = [
  {
    key: 'NIBSS',
    label: 'NIBSS',
    fullName: 'Nigerian Interbank Settlement System',
    flag: '🇳🇬',
    color: '#008751',
    countries: ['Nigeria'],
    feePct: 0.015, // 1.5%
    etaMinutes: 5,
    currency: 'NGN',
    minAmount: 100,
    maxAmount: 5_000_000,
  },
  {
    key: 'GHIPSS',
    label: 'GHIPSS',
    fullName: 'Ghana Interbank Payment & Settlement System',
    flag: '🇬🇭',
    color: '#006b3f',
    countries: ['Ghana'],
    feePct: 0.02,
    etaMinutes: 10,
    currency: 'GHS',
    minAmount: 50,
    maxAmount: 1_000_000,
  },
  {
    key: 'PESALINK',
    label: 'PesaLink',
    fullName: 'Kenya Interbank Payments System',
    flag: '🇰🇪',
    color: '#006600',
    countries: ['Kenya'],
    feePct: 0.01,
    etaMinutes: 3,
    currency: 'KES',
    minAmount: 10,
    maxAmount: 999_999,
  },
  {
    key: 'MPESA',
    label: 'M-Pesa',
    fullName: 'Safaricom M-Pesa (20 countries)',
    flag: '🌍',
    color: '#e31837',
    countries: ['Kenya', 'Tanzania', 'Ghana', 'Mozambique', 'DRC', 'Lesotho', 'Egypt', 'Ethiopia'],
    feePct: 0.025,
    etaMinutes: 1,
    currency: 'USD',
    minAmount: 1,
    maxAmount: 70_000,
  },
  {
    key: 'SWIFT',
    label: 'SWIFT AFC',
    fullName: 'SWIFT with AfriCoin Settlement Layer',
    flag: '🌐',
    color: '#003087',
    countries: ['All 54 African nations'],
    feePct: 0.035,
    etaMinutes: 240,
    currency: 'USD',
    minAmount: 10,
    maxAmount: 10_000_000,
  },
] as const

export type CorridorRail = typeof CORRIDOR_RAILS[number]['key']

// ─── NKISI SHIELD — Fraud & Risk Protection ──────────────────────────────────
// The Nkisi is a Kongo spiritual container holding protective power.
// It guards against evil forces. In the AFRO economy, it guards against fraud.

export const NKISI_SHIELD_LEVELS = {
  GREEN: { label: 'Protected',  emoji: '🟢', color: '#2d9e5f', desc: 'Fully trusted. No suspicious activity detected.' },
  AMBER: { label: 'Caution',   emoji: '🟡', color: '#e8a020', desc: 'Some flags raised. Transactions monitored.' },
  RED:   { label: 'Shielded',  emoji: '🔴', color: '#c94040', desc: 'High risk. New pots blocked. Dispute in progress.' },
} as const

export type NkisiLevel = keyof typeof NKISI_SHIELD_LEVELS

// ─── PROOF OF HAND — Ogbo Ụtụ Verification Types ─────────────────────────────
// Inspired by the Igbo hand-sealing of deals: "We sealed it with our hands."
// Different levels of proof for different transaction sizes.

export const PROOF_OF_HAND_TYPES = [
  { key: 'CLIENT_CONFIRM',     label: 'My Confirmation',     emoji: '✋', desc: 'You confirm delivery in the app. Quick, for small amounts.' },
  { key: 'COMMUNITY_WITNESS',  label: 'Community Witness',   emoji: '👥', desc: '2+ members witness the exchange. Traditional Igbo method.' },
  { key: 'GPS_GEOFENCE',       label: 'Location Proof',      emoji: '📍', desc: 'Your GPS confirms you are at the delivery location.' },
  { key: 'VOICE_PHRASE',       label: 'Ọ̀rọ̀ Voice Key',      emoji: '🥁', desc: 'Spoken 3-word seal — your voice unlocks the pot.' },
  { key: 'AI_MATERIAL_SCAN',   label: 'Ògún Scan',           emoji: '🤖', desc: 'AI verifies physical goods match the description.' },
  { key: 'ATM_EYE_LIVENESS',   label: 'Silent ATM Eye',      emoji: '👁', desc: 'Liveness face match. Required for amounts over 50,000 CWR.' },
] as const

// ─── KÒWÈ EVENT TYPES — Immutable Receipt Categories ─────────────────────────
// Every transaction gets a tamper-proof Kòwè receipt hash.
// Like the ancient oral contracts — permanent, witnessed, indelible.

export const KOWE_EVENT_TYPES = {
  DEBIT:               { label: 'Ranṣẹ',             emoji: '↗', color: '#c94040' },
  CREDIT:              { label: 'Gbà',               emoji: '↙', color: '#2d9e5f' },
  SPRAY:               { label: 'Fọ̀n Cowrie',        emoji: '💦', color: '#6b4fbb' },
  ESCROW_LOCK:         { label: 'Ìmúdí Pot',         emoji: '🏺', color: '#e8a020' },
  ESCROW_RELEASE:      { label: 'Ìtúsílẹ̀ Pot',      emoji: '🎉', color: '#2d9e5f' },
  ESCROW_REVERSED:     { label: 'Ìpadà Pot',         emoji: '↩', color: '#c94040' },
  AJO_CONTRIBUTION:    { label: 'Ajo Contribution',  emoji: '🔄', color: '#2d6a9e' },
  AJO_PAYOUT:          { label: 'Ajo Payout',        emoji: '💰', color: '#e8a020' },
  HARAMBEE:            { label: 'Harambee Gift',     emoji: '🤝', color: '#4a8c5c' },
  SPIRIT_VAULT_LOCK:   { label: 'Ẹmí Ìsapẹ̀',       emoji: '🕯', color: '#6b4fbb' },
  SPIRIT_VAULT_UNLOCK: { label: 'Ìtúsílẹ̀ Ogún',    emoji: '🌟', color: '#e8a020' },
  SEASON_LOCK:         { label: 'Àgbàdo Fipamọ',    emoji: '🌾', color: '#7a9e6e' },
  SEASON_UNLOCK:       { label: 'Ìkórè Gbà',        emoji: '🌻', color: '#e8a020' },
  CORRIDOR_SEND:       { label: 'Ranṣẹ Ìjọba',      emoji: '✈', color: '#2d6a9e' },
  CORRIDOR_RECEIVE:    { label: 'Gbà Ìjọba',        emoji: '🏠', color: '#2d9e5f' },
} as const

// ─── FX RATES — The Khanda Exchange ──────────────────────────────────────────
// "Khanda" — a historical African market exchange point.
// These are indicative rates. Live rates come from the banking-gateway.

export const MOCK_FX_RATES = {
  UFC_TO_NGN: 1_600,    // 1 AfriCoin = 1,600 NGN
  UFC_TO_GHS: 14.5,
  UFC_TO_KES: 145,
  UFC_TO_ZAR: 21.2,
  UFC_TO_USD: 1.0,
  UFC_TO_EUR: 0.92,
  UFC_TO_GBP: 0.79,
  CWR_TO_USD: 0.001,    // 1,000 Cowrie = $1
  CWR_TO_UFC: 0.001,    // 1,000 Cowrie = 1 AfriCoin
} as const

// ─── SPIRIT VAULT — Ancestral Inheritance ─────────────────────────────────────
// In many African traditions, elders would set aside wealth for descendants —
// sometimes in the ground, sometimes with a trusted kin-keeper.
// The Spirit Vault digitises this: lock funds → name heir → 3 elder witnesses.

export const SPIRIT_VAULT_UNLOCK_TRIGGERS = [
  { key: 'DATE',      label: 'On a Date',           emoji: '📅', desc: 'Unlock on a specific date — like a time capsule.' },
  { key: 'CEREMONY',  label: 'At Naming Ceremony',  emoji: '🥁', desc: 'Unlock when the heir completes their AfroID ceremony.' },
  { key: 'COUNCIL',   label: 'Elder Council Vote',  emoji: '⚖️', desc: '3 elders vote to unlock — for contested inheritance.' },
  { key: 'MILESTONE', label: 'Ubuntu Milestone',    emoji: '🌳', desc: 'Unlock when heir reaches Ubuntu score threshold.' },
] as const

// ─── HARAMBEE — Community Fundraising ────────────────────────────────────────
// "Harambee" is a Swahili word meaning "pull together."
// It was declared the national motto of Kenya by Jomo Kenyatta in 1964.
// Communities have used it for centuries to build schools, hospitals, homes.

export const HARAMBEE_SCOPES = [
  { key: 'FAMILY',  label: 'Family Only',    emoji: '👨‍👩‍👧', desc: 'Private — only your Ìdílé family can see and contribute.' },
  { key: 'VILLAGE', label: 'My Village',     emoji: '🏘',   desc: 'Your entire village can contribute to this cause.' },
  { key: 'GLOBAL',  label: 'All Villages',   emoji: '🌍',   desc: 'Open to all 20 villages — maximum reach.' },
] as const

// ─── BANTU MONEY PROVERBS — The wisdom of African finance ────────────────────

export const AFRICAN_BANKING_PROVERBS = [
  { text: 'The forest would be silent if no bird sang there except the one that sang best.', origin: 'Kenyan' },
  { text: 'Rain does not fall on one roof alone.', origin: 'Cameroonian' },
  { text: 'A child who is not embraced by the village will burn it down to feel its warmth.', origin: 'African' },
  { text: 'He who learns, teaches.', origin: 'Ethiopian (Amharic)' },
  { text: 'The axe forgets, but the tree remembers.', origin: 'Zimbabwean' },
  { text: 'Sticks in a bundle are unbreakable.', origin: 'Bondei (Tanzania)' },
  { text: 'A single bracelet does not jingle.', origin: 'Congolese' },
  { text: 'Until the lion learns to write, every story will glorify the hunter.', origin: 'Pan-African' },
] as const

// ─── ACCOUNT TYPES — Pan-African Named Account System ────────────────────────
// Every account type name is rooted in an African financial tradition or
// philosophical concept that pre-dates Western banking by millennia.

export const ACCOUNT_TYPES = [
  {
    id: 'cowrie_shell',
    name: 'Cowrie Shell',
    subtitle: 'Ile Owo Eni',
    description: 'Your everyday wallet. Free, instant, no barriers. The starter account for every citizen.',
    emoji: '🐚',
    color: '#C9A84C',
    bg: '#1a150a',
    maxBalance: 50_000,
    features: ['Free P2P transfers', 'Spray enabled', 'Ajo participation', 'Oral Ledger'],
    kycTier: 'TIER_1',
    monthlyFee: 0,
    africanOrigin: 'Cowrie shells were Africa\'s first standardised currency — used from West Africa to the Swahili Coast for over 3,000 years before European contact.',
  },
  {
    id: 'ile_owo',
    name: 'Ile Owo',
    subtitle: 'House of Money',
    description: 'Full-featured personal account. Higher limits, corridor access, Harambee.',
    emoji: '🏠',
    color: '#42A5F5',
    bg: '#0A1525',
    maxBalance: 500_000,
    features: ['Higher limits', 'All 5 corridors', 'Harambee pools', 'Season vault', 'Business meetings'],
    kycTier: 'TIER_2',
    monthlyFee: 0,
    africanOrigin: 'Ile Owo — Yoruba for "House of Money". The family compound served as the original financial institution across Yorubaland.',
  },
  {
    id: 'susu',
    name: 'Susu Vault',
    subtitle: 'Igba Oro',
    description: 'Locked savings with guaranteed yields. The ancient tontine, digitised.',
    emoji: '🏺',
    color: '#AB47BC',
    bg: '#14061A',
    maxBalance: 200_000,
    features: ['18% annual yield', '90/180/365-day locks', 'Market day bonuses', 'Auto-save triggers'],
    kycTier: 'TIER_1',
    monthlyFee: 0,
    africanOrigin: 'Susu (Ghana/Caribbean) and Esusu (Yoruba) — the rotating savings circle that survived the Middle Passage and became the bedrock of diaspora economies.',
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu Account',
    subtitle: 'Umuntu ngumuntu ngabantu',
    description: 'Community credit with collective backing. 7 elders vouch = instant credit line.',
    emoji: '🤝',
    color: '#4CAF50',
    bg: '#051205',
    maxBalance: 1_000_000,
    features: ['Community credit line', 'Ubuntu score multiplier', 'Elder endorsements', 'Kola Nut microcredit'],
    kycTier: 'TIER_2',
    monthlyFee: 50,
    africanOrigin: 'Ubuntu — "I am because we are." The Nguni Bantu philosophy of collective humanity, now weaponised as a credit system. No collateral needed — only community trust.',
  },
  {
    id: 'agbo',
    name: 'Agbo Business',
    subtitle: 'Ile Iṣẹ',
    description: 'Built for traders, artisans, and compound-level entrepreneurs.',
    emoji: '⚒️',
    color: '#FF7043',
    bg: '#1A0800',
    maxBalance: 5_000_000,
    features: ['Merchant QR', 'Invoice generation', 'Staff sub-accounts', 'Escrow access', 'Payroll tools'],
    kycTier: 'TIER_2',
    monthlyFee: 200,
    africanOrigin: 'Agbo — Igbo word for a gathering of traders. The marketplace as a distributed financial node; each stall a branch of a living bank.',
  },
  {
    id: 'nne',
    name: 'Nne Account',
    subtitle: 'Mother\'s Protection',
    description: 'Designated family protection vault. Locked for ceremonies, unlocked by love.',
    emoji: '🌺',
    color: '#E91E63',
    bg: '#1A0010',
    maxBalance: 500_000,
    features: ['Ceremony-locked releases', 'Family access only', 'Auto-save on income', 'Inheritance-ready'],
    kycTier: 'TIER_1',
    monthlyFee: 0,
    africanOrigin: 'Nne — Igbo for "Mother". In matrilineal societies across the Congo Basin, the Akan and Ewe peoples, mothers controlled the household treasury and inheritance.',
  },
  {
    id: 'oba',
    name: 'Oba Sovereign',
    subtitle: 'The King\'s Treasury',
    description: 'Premium personal banking. Priority processing, all corridors, Midnight Ebony card included.',
    emoji: '👑',
    color: '#C9A84C',
    bg: '#0D0A00',
    maxBalance: 10_000_000,
    features: ['Priority settlement', 'Dedicated Griot advisor', 'Midnight Ebony card', 'Ancestral vault', 'All 5 corridors + SWIFT'],
    kycTier: 'TIER_3',
    monthlyFee: 500,
    africanOrigin: 'Oba — Yoruba title of royalty. The Oba\'s treasury funded public works, maintained peace bonds, and guaranteed merchant disputes. Sovereignty means financial autonomy.',
  },
  {
    id: 'cowrie_black',
    name: 'Cowrie Black',
    subtitle: 'Obsidian Sovereign',
    description: 'Invitation-only. For builders of the civilisation. No limits. No fees visible. You are the fee.',
    emoji: '🖤',
    color: '#888',
    bg: '#000000',
    maxBalance: null,
    features: ['Unlimited balance', 'Zero visible fees', 'TLP priority routing', 'CowrieChain L2 access', 'Ancestral Onyx card', 'Personal Griot concierge'],
    kycTier: 'TIER_3',
    monthlyFee: 2000,
    africanOrigin: 'Inspired by Mansa Musa of the Mali Empire — whose wealth was so immense his 1324 hajj deflated Cairo\'s gold economy for 12 years. Reserved for today\'s Musa-class builders.',
  },
  {
    id: 'nkosi',
    name: 'Nkosi Royale',
    subtitle: 'Compound Treasury',
    description: 'Combined enterprise and personal sovereignty. For compound heads, lineage leaders, village anchors.',
    emoji: '🦁',
    color: '#FFD700',
    bg: '#0A0700',
    maxBalance: null,
    features: ['Multi-currency treasury', 'Village AI allocation', 'Reserve access', 'Compound sweep', 'Commission from staff transactions'],
    kycTier: 'TIER_3',
    monthlyFee: 5000,
    africanOrigin: 'Nkosi — Zulu/Ndebele for "King" or "Chief". The compound head held resources in trust for the entire lineage — food, seed, tools, and currency. The original CFO.',
  },
] as const

export type AccountTypeId = typeof ACCOUNT_TYPES[number]['id']

// ─── CARD TIERS — Five Pan-African Virtual & Physical Cards ───────────────────
// Card names come from African languages and cultural concepts.
// Designs pull from Kente cloth, Adinkra symbols, Nsibidi script, and cowrie motifs.

export const CARD_TIERS = [
  {
    id: 'cowrie_shell',
    name: 'Cowrie Shell',
    subtitle: 'Owo Eleye',
    emoji: '🐚',
    gradient: 'linear-gradient(135deg, #6B3A1F 0%, #A0522D 45%, #C9A84C 100%)',
    chipColor: '#C9A84C',
    shimmer: 'rgba(201,168,76,0.15)',
    textColor: '#FFF8E7',
    patternDesc: 'Scattered cowrie shell motifs on terracotta',
    accountTypes: ['cowrie_shell', 'susu'],
    monthlyFee: 0,
    spendingLimit: 50_000,
    features: ['Online payments', 'Ajo contributions', 'QR pay'],
    physical: false,
    color: '#C9A84C',
  },
  {
    id: 'obi_select',
    name: 'Obi Select',
    subtitle: 'Ẹnu Ọba',
    emoji: '🔑',
    gradient: 'linear-gradient(135deg, #4A148C 0%, #880E4F 50%, #C9A84C 100%)',
    chipColor: '#FFD700',
    shimmer: 'rgba(255,215,0,0.12)',
    textColor: '#FFFFFF',
    patternDesc: 'Kente cloth stripe pattern',
    accountTypes: ['ile_owo', 'ubuntu', 'nne'],
    monthlyFee: 250,
    spendingLimit: 500_000,
    features: ['Online + POS globally', 'Corridor sends', 'Airport access'],
    physical: true,
    color: '#9C27B0',
  },
  {
    id: 'midnight_ebony',
    name: 'Midnight Ebony',
    subtitle: 'Dudu Aidajosẹ',
    emoji: '🖤',
    gradient: 'linear-gradient(135deg, #0A0A0A 0%, #1C1C1C 55%, #2D1A12 100%)',
    chipColor: '#CD7F32',
    shimmer: 'rgba(205,127,50,0.18)',
    textColor: '#DEB887',
    patternDesc: 'Subtle Adinkra symbols in near-black',
    accountTypes: ['agbo', 'oba'],
    monthlyFee: 1000,
    spendingLimit: 5_000_000,
    features: ['Globally accepted', 'Griot concierge', 'TLP priority', 'Lounge access', 'Dispute priority'],
    physical: true,
    color: '#CD7F32',
  },
  {
    id: 'ancestral_onyx',
    name: 'Ancestral Onyx',
    subtitle: 'Ọpẹ Ìdílé',
    emoji: '⚫',
    gradient: 'linear-gradient(135deg, #050505 0%, #0F0A1A 50%, #1A0E08 100%)',
    chipColor: '#C9A84C',
    shimmer: 'rgba(201,168,76,0.22)',
    textColor: '#C9A84C',
    patternDesc: 'Nsibidi script border in gold',
    accountTypes: ['cowrie_black', 'nkosi'],
    monthlyFee: 2500,
    spendingLimit: null,
    features: ['No limits', 'Metal card', 'Personal Griot', 'CowrieChain L2', 'All corridors + SWIFT'],
    physical: true,
    color: '#C9A84C',
    metalCard: true,
  },
  {
    id: 'compound',
    name: 'Compound',
    subtitle: 'Ile Agbo',
    emoji: '🏛️',
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4E342E 100%)',
    chipColor: '#FF8F00',
    shimmer: 'rgba(255,143,0,0.14)',
    textColor: '#F9FBE7',
    patternDesc: 'Village compound map watermark in forest green',
    accountTypes: ['agbo', 'nkosi'],
    monthlyFee: 1500,
    spendingLimit: 10_000_000,
    features: ['Staff cards (up to 10)', 'Payroll engine', 'Inventory escrow', 'Merchant QR', 'Village bridge'],
    physical: true,
    color: '#4CAF50',
    businessCard: true,
  },
] as const

export type CardTierId = typeof CARD_TIERS[number]['id']

// ─── OGBo UTU POT STATES — 8-State Machine ───────────────────────────────────
// The 8 states of an escrow pot, from creation to resolution.

export const POT_STATES = {
  CREATED:              { label: 'Pot Created',         emoji: '🏺', color: '#888',     desc: 'Pot is created, awaiting both parties to join.' },
  HELD:                 { label: 'Funds Held',          emoji: '🔒', color: '#42A5F5',  desc: 'Cowrie is locked in the pot. Deal is in progress.' },
  PENDING_VERIFICATION: { label: 'Proof Needed',        emoji: '👁',  color: '#E8A030',  desc: 'Seller needs to submit proof of delivery.' },
  COMMITTED:            { label: 'Proof Submitted',     emoji: '✋', color: '#AB47BC',  desc: 'Proof submitted. Awaiting buyer confirmation.' },
  SETTLED:              { label: 'Pot Settled',         emoji: '✅', color: '#4CAF50',  desc: 'Deal complete. Cowrie released to seller.' },
  REVERSED:             { label: 'Pot Reversed',        emoji: '↩',  color: '#E53935',  desc: 'Refunded. Cowrie returned to buyer.' },
  DISPUTED:             { label: 'Under Dispute',       emoji: '⚖️', color: '#FF7043',  desc: 'Elder Council is reviewing this dispute.' },
  EXPIRED:              { label: 'Pot Expired',         emoji: '⌛', color: '#555',     desc: 'Pot timed out without resolution. Auto-reversed.' },
} as const

export type EscrowState = keyof typeof POT_STATES

// ─── 20 PAN-AFRICAN BANKING IDEAS — The Vision Horizon ───────────────────────
// These are the next 20 financial innovations being built into the AFRO ecosystem.
// Each is rooted in African tradition, solving real African problems.

export const PAN_AFRICAN_IDEAS = [
  {
    id: 'gbese_cleanse',
    name: 'Gbese Cleanse Protocol',
    subtitle: 'Ẹbọ Igbẹsẹ',
    emoji: '🕊️',
    origin: 'Yoruba — gbese means "debt"',
    problem: 'Bad credit history in Africa follows you forever with no path to redemption.',
    solution: '12 consecutive on-time Ajo contributions auto-triggers a ceremony that wipes your negative Ubuntu history. Debt forgiveness as ceremony.',
    status: 'COMING_SOON',
    color: '#4CAF50',
  },
  {
    id: 'okwu_voice_banking',
    name: 'Ọkwụ Voice Banking',
    subtitle: 'Bank Without Reading',
    emoji: '🥁',
    origin: 'Igbo — ọkwụ means "word/speech"',
    problem: '40% of sub-Saharan Africa has low literacy. Banking should not require reading.',
    solution: 'Full voice command banking in Yoruba, Igbo, Hausa, Swahili, Amharic, Zulu. Say "Send 500 cowrie to Chidi" — done. ASR → NLU → TTS loop under 900ms.',
    status: 'IN_BUILD',
    color: '#E8A030',
  },
  {
    id: 'kola_nut_credit',
    name: 'Kola Nut Credit',
    subtitle: 'The Original Credit Score',
    emoji: '🌰',
    origin: 'Pan-West African — kola nut is the seal of trust and agreement',
    problem: 'No credit bureau covers 80% of African adults. Formal credit is inaccessible.',
    solution: '5 elders "kola-vouch" for you = instant Cowrie credit line with no paperwork. Not your income — your relationships are your collateral.',
    status: 'COMING_SOON',
    color: '#C9A84C',
  },
  {
    id: 'moon_harvest_save',
    name: 'Moon Harvest Auto-Saver',
    subtitle: 'Egwuregwu Ọnwa',
    emoji: '🌕',
    origin: 'Pan-African lunar calendar systems',
    problem: 'Irregular incomes make scheduled saving impossible for most African workers.',
    solution: 'Every lunar cycle (28 days), auto-sweep 10% of received Cowrie to grain bank. Adjusts with income — saves more in rich months, less in lean ones.',
    status: 'COMING_SOON',
    color: '#6B4FBB',
  },
  {
    id: 'cattle_bridge',
    name: 'Cattle-Cowrie Bridge',
    subtitle: 'Eran → Owo',
    emoji: '🐄',
    origin: 'Across Sahel, East and Southern Africa — livestock as the primary store of value',
    problem: '70% of rural African wealth is held in livestock. It is illiquid and invisible to digital banking.',
    solution: 'Register 1 cow = receive a "Cattle Token" NFT. Token is backed by verified livestock value from live data feeds in your region. Collateral for loans, transferable.',
    status: 'BLUEPRINT',
    color: '#8D6E63',
  },
  {
    id: 'nsibidi_card',
    name: 'Nsibidi Script Card',
    subtitle: 'The Invisible Card',
    emoji: '✍️',
    origin: 'Nsibidi — ancient Igbo/Cross River pictographic script, 2000+ years old',
    problem: 'Cards with numbers visible = fraud vectors. Visual card data is stolen constantly.',
    solution: 'Physical metal card with NO visible number. All data encoded in Nsibidi script — a 2000-year-old African writing system only readable by the cardholder. NFC chip + fingerprint biometric. The most secure card ever designed.',
    status: 'BLUEPRINT',
    color: '#E91E63',
  },
  {
    id: 'oral_contract',
    name: 'Oral Contract Record',
    subtitle: 'Ọrọ Adehun',
    emoji: '🎙️',
    origin: 'Across Africa — oral tradition as the legally binding form of agreement',
    problem: 'Written contracts exclude the majority of informal economy participants.',
    solution: 'Record a 30-second voice agreement in any African language. The recording is SHA-256 hashed, timestamped, dual-signed (both speakers say "I witness" in their language), and stored as a "Kòwè Voice Bond." Legally valid oral tradition, permanently sealed.',
    status: 'IN_BUILD',
    color: '#FF7043',
  },
  {
    id: 'midnight_market',
    name: 'Midnight Market Protocol',
    subtitle: 'Ọja Oru',
    emoji: '🌙',
    origin: 'West African night markets — Oja Oru (Yoruba), Benin night market tradition',
    problem: 'Lagos, Accra, and Nairobi trade 24/7. Financial rails charge the same fees at 3am as noon.',
    solution: 'Special banking rates during 2am-6am. Night market surcharge removed. Higher spray tips redistributed. Lower FX spreads. The night belongs to the traders — now their finances agree.',
    status: 'LIVE',
    color: '#7E57C2',
  },
  {
    id: 'ancestors_vault',
    name: 'Ancestors Vault',
    subtitle: 'Ile Baba',
    emoji: '⚱️',
    origin: 'African generational wealth traditions — Akan stool wealth, Yoruba compound inheritance',
    problem: 'Generational wealth transfer across Africa has no formal mechanism. Estate courts take years.',
    solution: 'Programmable inheritance: lock funds with smart conditions ("release to Adaeze on her 18th birthday" / "release 20% each year to Chukwuma until age 25"). 3 elder witness signatures required to modify. Legally immutable digital Akan stool.',
    status: 'COMING_SOON',
    color: '#C9A84C',
  },
  {
    id: 'ubuntu_credit_ring',
    name: 'Ubuntu Credit Ring',
    subtitle: 'Ìgbìmọ̀ Ìgbẹkẹlẹ',
    emoji: '💍',
    origin: 'Stokvels (South Africa), Chamas (Kenya), Djanggi (Cameroon)',
    problem: 'Individual credit scoring punishes people in collective economies.',
    solution: '7-person credit rings where each member\'s score is linked to the group\'s collective repayment rate. If the ring repays 100%, all 7 credit scores rise. Designed around actual African communal financial behaviour.',
    status: 'COMING_SOON',
    color: '#26C6DA',
  },
  {
    id: 'praise_singer_invoice',
    name: 'Praise-Singer Invoice',
    subtitle: 'Oriki Ìgbẹ̀sẹ̀',
    emoji: '🎤',
    origin: 'Oriki — Yoruba oral praise poetry tradition. The original personalised branding.',
    problem: 'Payment requests are impersonal. Following up on unpaid invoices destroys relationships.',
    solution: 'Send your payment request as an oriki (praise poem + invoice) voice message. The recipient receives: your voice praising them, the amount they owe, and a single-tap payment button. Honour makes the payment irreversible.',
    status: 'COMING_SOON',
    color: '#EF5350',
  },
  {
    id: 'egungun_trail',
    name: 'Egungun Audit Trail',
    subtitle: 'Privacy as Masquerade',
    emoji: '🎭',
    origin: 'Egungun masquerade (Yoruba) — the masked ancestor. The entity transacts; the face stays hidden.',
    problem: 'African financial activists, journalists, and women in conservative contexts need privacy.',
    solution: 'Request a "Masquerade Account" — all transactions appear under a community-verified alias. The Egungun exists and spends; the identity is known only by the Elder Council. Privacy as Pan-African cultural norm, not VPN-bro behaviour.',
    status: 'BLUEPRINT',
    color: '#FF8A65',
  },
  {
    id: 'cowrie_rain_fund',
    name: 'Cowrie Rain Emergency',
    subtitle: 'Ẹjọ Àjọ Ìdásí',
    emoji: '☔',
    origin: 'Solidarity economies across Africa — community emergency response as lived culture',
    problem: 'House fire, medical emergency, flood — African families have no safety net beyond family.',
    solution: '0.5% of every platform transaction is swept to your village\'s Rain Fund. When tragedy strikes, the village "rains cowrie" on you automatically. The fund is community-governed with Elder Council as trustees.',
    status: 'COMING_SOON',
    color: '#42A5F5',
  },
  {
    id: 'griot_advisor',
    name: 'Griot Financial Advisor',
    subtitle: 'Your Personal Jeli',
    emoji: '📯',
    origin: 'Jeli/Griot — West African oral historian, wisdom keeper, and community advisor',
    problem: 'Financial advice in Africa speaks to Western concepts. "Diversify your portfolio" means nothing to a Kano trader.',
    solution: 'AI financial advisor that speaks to you in proverbs, cultural context, and local economic reality. "You are spending like the dry season — your reserves will not survive to planting time." Speaks Yoruba, Igbo, Hausa, Swahili, Amharic, Twi, Zulu, Wolof.',
    status: 'IN_BUILD',
    color: '#FFCA28',
  },
  {
    id: 'kente_wealth',
    name: 'Kente Wealth Weave',
    subtitle: 'Asante Visual Finance',
    emoji: '🧵',
    origin: 'Kente cloth (Asante/Ewe, Ghana) — each pattern encodes meaning about the wearer\'s status and values',
    problem: 'Financial health dashboards are boring numbers that tell you nothing about the story.',
    solution: 'Your entire financial profile rendered as a living Kente cloth. Colours and patterns shift daily based on income, savings, spending, Ajo status, Ubuntu score. Your money tells a story — the Griot reads it back to you.',
    status: 'BLUEPRINT',
    color: '#FF7043',
  },
  {
    id: 'drum_otp',
    name: 'Drum Code Authentication',
    subtitle: 'Ẹ̀kọ Ìyàwó',
    emoji: '🥁',
    origin: 'Talking drums (Yoruba, Akan) — encrypted communication across distances for centuries',
    problem: 'SMS OTP fails in rural areas with no signal. USSD is slow. This is 2026, not 1976.',
    solution: 'Replace SMS OTP with a rhythm tap pattern shown on-screen. Tap the pattern to confirm a transfer. Works offline via device accelerometer. Accessible, cultural, and impossible to SIM-swap.',
    status: 'IN_BUILD',
    color: '#EC407A',
  },
  {
    id: 'reparations_pool',
    name: 'Ẹ̀san Diaspora Pool',
    subtitle: 'Pan-African Reconnection Fund',
    emoji: '⚓',
    origin: 'Ẹ̀san — Yoruba word for reparation, restitution, making whole',
    problem: 'Diaspora Africans want to invest in the continent but lack trusted entry points.',
    solution: 'Community crowdfunded pool for diaspora-to-Africa reconnection: scholarships, village infrastructure, heritage visits. Every contribution is 100% traceable on CowrieChain. Governed by elected Continental Council.',
    status: 'COMING_SOON',
    color: '#78909C',
  },
  {
    id: 'umoja_merchant',
    name: 'Umoja Merchant Network',
    subtitle: 'Onye Ọchịchọ Ọha',
    emoji: '🤲',
    origin: 'Umoja — Swahili for "unity". Also the first principle of Kwanzaa.',
    problem: 'Accepting Cowrie needs community endorsement to succeed against existing network effects.',
    solution: 'Merchants who accept Cowrie and resolve all customer pots cleanly earn a "Umoja Merchant" badge on the village map. Community is incentivised to patronise Umoja merchants. Merchants earn bonus Ubuntu score for each clean transaction.',
    status: 'LIVE',
    color: '#66BB6A',
  },
  {
    id: 'stokvel_digital',
    name: 'Digital Stokvel',
    subtitle: 'Revolving Wealth Circle',
    emoji: '🔁',
    origin: 'Stokvel — South African rotating investment club. Name from "stock fair" but fully African in practice since 1900s.',
    problem: '11.4 million South Africans belong to stokvels. They are entirely offline, trust-based, and uninsured.',
    solution: 'Bring the full stokvel model on-chain: investment clubs, burial societies, grocery stokvels, and salary advance groups — all with Kòwè receipts, Ubuntu insurance, and Elder audit trails. Fully interoperable with EFT and Cowrie.',
    status: 'IN_BUILD',
    color: '#26A69A',
  },
  {
    id: 'grain_bank',
    name: 'Ogbono Grain Bank',
    subtitle: 'The Original Savings Account',
    emoji: '🌾',
    origin: 'Pre-colonial African granaries — the food surplus bank existed across the continent millennia before European contact.',
    problem: 'Smallholder farmers receive lowest prices at harvest (glut) and pay highest prices at planting (scarcity). This is the poverty cycle.',
    solution: 'Lock your cowrie at harvest time at "grain price". Redeem at planting time at guaranteed rate. Granary economics applied to Cowrie — the village vault absorbs seasonal price shocks so you never have to sell low again.',
    status: 'COMING_SOON',
    color: '#FFA726',
  },
] as const

export type PanAfricanIdeaStatus = 'LIVE' | 'IN_BUILD' | 'COMING_SOON' | 'BLUEPRINT'

// ─── AFRICAN BANKS — Pan-African Banking Directory ────────────────────────────
// Covers 11 African nations + 4 diaspora hubs.
// Includes commercial banks, Islamic banks, microfinance institutions,
// and mobile money operators — the real financial fabric of the continent.

export const AFRICAN_BANKS: Record<string, { code: string; name: string; swift: string; flag: string; type: 'bank' | 'mobile_money' | 'microfinance' | 'islamic'; sortCode?: string }[]> = {
  NG: [
    { code: 'ACCESS', name: 'Access Bank', swift: 'ABNGNGLA', flag: '🇳🇬', type: 'bank', sortCode: '044' },
    { code: 'GTB', name: 'Guaranty Trust Bank', swift: 'GTBINGLA', flag: '🇳🇬', type: 'bank', sortCode: '058' },
    { code: 'UBA', name: 'United Bank for Africa', swift: 'UBNINGLA', flag: '🇳🇬', type: 'bank', sortCode: '033' },
    { code: 'ZENITH', name: 'Zenith Bank', swift: 'ZEIBNGLA', flag: '🇳🇬', type: 'bank', sortCode: '057' },
    { code: 'FIRST_NG', name: 'First Bank Nigeria', swift: 'FBNINGLA', flag: '🇳🇬', type: 'bank', sortCode: '011' },
    { code: 'FIDELITY', name: 'Fidelity Bank', swift: 'FIDTNGLA', flag: '🇳🇬', type: 'bank', sortCode: '070' },
    { code: 'STERLING', name: 'Sterling Bank', swift: 'NAMENGLA', flag: '🇳🇬', type: 'bank', sortCode: '232' },
    { code: 'FCMB', name: 'First City Monument Bank', swift: 'FCMBNGLA', flag: '🇳🇬', type: 'bank', sortCode: '214' },
    { code: 'STANBIC_NG', name: 'Stanbic IBTC Bank', swift: 'SBICNGLA', flag: '🇳🇬', type: 'bank', sortCode: '221' },
    { code: 'JAIZ', name: 'Jaiz Bank (Non-Interest)', swift: 'JAIZNGLA', flag: '🇳🇬', type: 'islamic', sortCode: '301' },
    { code: 'WEMA', name: 'Wema Bank (ALAT)', swift: 'WEMANGLA', flag: '🇳🇬', type: 'bank', sortCode: '035' },
    { code: 'POLARIS', name: 'Polaris Bank', swift: 'PLRISNGLA', flag: '🇳🇬', type: 'bank', sortCode: '076' },
    { code: 'UNION_NG', name: 'Union Bank Nigeria', swift: 'UBNINGLA', flag: '🇳🇬', type: 'bank', sortCode: '032' },
    { code: 'KEYSTONE', name: 'Keystone Bank', swift: 'PLBINGLA', flag: '🇳🇬', type: 'bank', sortCode: '082' },
  ],
  GH: [
    { code: 'GCB', name: 'GCB Bank', swift: 'GHCBGHAC', flag: '🇬🇭', type: 'bank' },
    { code: 'ECOBANK_GH', name: 'Ecobank Ghana', swift: 'ECOCGHAC', flag: '🇬🇭', type: 'bank' },
    { code: 'ACCESS_GH', name: 'Access Bank Ghana', swift: 'ABNGGHAC', flag: '🇬🇭', type: 'bank' },
    { code: 'UBA_GH', name: 'UBA Ghana', swift: 'UBNINGGH', flag: '🇬🇭', type: 'bank' },
    { code: 'FIDELITY_GH', name: 'Fidelity Bank Ghana', swift: 'FIDTGHAC', flag: '🇬🇭', type: 'bank' },
    { code: 'STANBIC_GH', name: 'Stanbic Bank Ghana', swift: 'SBICGHAC', flag: '🇬🇭', type: 'bank' },
    { code: 'ABSA_GH', name: 'Absa Bank Ghana', swift: 'BARCGHAC', flag: '🇬🇭', type: 'bank' },
    { code: 'MTNMOMO', name: 'MTN MoMo Ghana', swift: 'MTNMGHAC', flag: '🇬🇭', type: 'mobile_money' },
    { code: 'AIRTEL_GH', name: 'AirtelTigo Cash Ghana', swift: 'ARTTGHAC', flag: '🇬🇭', type: 'mobile_money' },
    { code: 'VPAY_GH', name: 'Vodafone Cash Ghana', swift: 'VODAGHAC', flag: '🇬🇭', type: 'mobile_money' },
  ],
  KE: [
    { code: 'KCB', name: 'KCB Bank Kenya', swift: 'KCBLKENX', flag: '🇰🇪', type: 'bank' },
    { code: 'EQUITY_KE', name: 'Equity Bank Kenya', swift: 'EQBLKENX', flag: '🇰🇪', type: 'bank' },
    { code: 'COOP_KE', name: 'Cooperative Bank Kenya', swift: 'COOPKENX', flag: '🇰🇪', type: 'bank' },
    { code: 'NCBA', name: 'NCBA Bank Kenya', swift: 'CBAFKENX', flag: '🇰🇪', type: 'bank' },
    { code: 'STANCHART_KE', name: 'Standard Chartered Kenya', swift: 'SCBLKENX', flag: '🇰🇪', type: 'bank' },
    { code: 'ABSA_KE', name: 'Absa Kenya', swift: 'BARCKENX', flag: '🇰🇪', type: 'bank' },
    { code: 'DTB', name: 'Diamond Trust Bank Kenya', swift: 'DTKEKENA', flag: '🇰🇪', type: 'bank' },
    { code: 'MPESA', name: 'M-Pesa (Safaricom)', swift: 'MPESKENX', flag: '🇰🇪', type: 'mobile_money' },
    { code: 'FAMILY_KE', name: 'Family Bank Kenya', swift: 'FABLKENX', flag: '🇰🇪', type: 'microfinance' },
    { code: 'IM_KE', name: 'I&M Bank Kenya', swift: 'IMBLKENX', flag: '🇰🇪', type: 'bank' },
  ],
  ZA: [
    { code: 'FNB', name: 'First National Bank', swift: 'FIRNZAJJ', flag: '🇿🇦', type: 'bank' },
    { code: 'STANDARD', name: 'Standard Bank SA', swift: 'SBZAZAJJ', flag: '🇿🇦', type: 'bank' },
    { code: 'ABSA', name: 'Absa Bank SA', swift: 'ABSAZAJJ', flag: '🇿🇦', type: 'bank' },
    { code: 'NEDBANK', name: 'Nedbank', swift: 'NEDZAJJJ', flag: '🇿🇦', type: 'bank' },
    { code: 'CAPITEC', name: 'Capitec Bank', swift: 'CABLZAJJ', flag: '🇿🇦', type: 'bank' },
    { code: 'INVESTEC', name: 'Investec Bank', swift: 'IVESZAJJ', flag: '🇿🇦', type: 'bank' },
    { code: 'TYME', name: 'TymeBank', swift: 'TYMEZAJJ', flag: '🇿🇦', type: 'bank' },
    { code: 'DISCOVERY', name: 'Discovery Bank', swift: 'DISCAJJJ', flag: '🇿🇦', type: 'bank' },
  ],
  ET: [
    { code: 'CBE', name: 'Commercial Bank of Ethiopia', swift: 'CBETETAA', flag: '🇪🇹', type: 'bank' },
    { code: 'BOA_ET', name: 'Bank of Abyssinia', swift: 'ABYSETAA', flag: '🇪🇹', type: 'bank' },
    { code: 'DASHEN', name: 'Dashen Bank', swift: 'DASNEWET', flag: '🇪🇹', type: 'bank' },
    { code: 'AWASH', name: 'Awash Bank', swift: 'AWASEWWT', flag: '🇪🇹', type: 'bank' },
    { code: 'NIB', name: 'NIB International Bank', swift: 'NIBIETAA', flag: '🇪🇹', type: 'bank' },
    { code: 'TELEBIRR', name: 'Telebirr (Ethio Telecom)', swift: 'TELEEWWT', flag: '🇪🇹', type: 'mobile_money' },
  ],
  SN: [
    { code: 'SGBS', name: 'SG Sénégal', swift: 'SGBSSNDA', flag: '🇸🇳', type: 'bank' },
    { code: 'ECOBANK_SN', name: 'Ecobank Sénégal', swift: 'ECOCSNDA', flag: '🇸🇳', type: 'bank' },
    { code: 'CORIS_SN', name: 'Coris Bank Sénégal', swift: 'CORSBFBF', flag: '🇸🇳', type: 'bank' },
    { code: 'ORANGE_SN', name: 'Orange Money Sénégal', swift: 'ORNMSNDA', flag: '🇸🇳', type: 'mobile_money' },
    { code: 'WAVE', name: 'Wave Mobile Money', swift: 'WAVESNDA', flag: '🇸🇳', type: 'mobile_money' },
    { code: 'BICIS', name: 'BICIS Sénégal', swift: 'BICISNS', flag: '🇸🇳', type: 'bank' },
  ],
  TZ: [
    { code: 'CRDB', name: 'CRDB Bank Tanzania', swift: 'CRDBTZTZ', flag: '🇹🇿', type: 'bank' },
    { code: 'NMB_TZ', name: 'NMB Bank Tanzania', swift: 'NMIBTZTZ', flag: '🇹🇿', type: 'bank' },
    { code: 'NBC', name: 'NBC Bank Tanzania', swift: 'NLIBTZTZ', flag: '🇹🇿', type: 'bank' },
    { code: 'EXIM_TZ', name: 'Exim Bank Tanzania', swift: 'EXIMTZTZ', flag: '🇹🇿', type: 'bank' },
    { code: 'MPESA_TZ', name: 'M-Pesa Tanzania', swift: 'MPESTZTZ', flag: '🇹🇿', type: 'mobile_money' },
  ],
  UG: [
    { code: 'CENTENARY', name: 'Centenary Bank Uganda', swift: 'CERUUGUG', flag: '🇺🇬', type: 'microfinance' },
    { code: 'STANBIC_UG', name: 'Stanbic Bank Uganda', swift: 'SBICUGUG', flag: '🇺🇬', type: 'bank' },
    { code: 'DFCU', name: 'DFCU Bank Uganda', swift: 'DFCUUGUG', flag: '🇺🇬', type: 'bank' },
    { code: 'AIRTEL_UG', name: 'Airtel Money Uganda', swift: 'AIRTUGUG', flag: '🇺🇬', type: 'mobile_money' },
  ],
  CI: [
    { code: 'ECOBANK_CI', name: "Ecobank Côte d'Ivoire", swift: 'ECOCCIAB', flag: '🇨🇮', type: 'bank' },
    { code: 'SGBCI', name: "SG Côte d'Ivoire", swift: 'SGBICIAB', flag: '🇨🇮', type: 'bank' },
    { code: 'NSIA', name: 'NSIA Banque CI', swift: 'NSIAQIAB', flag: '🇨🇮', type: 'bank' },
    { code: 'ORANGE_CI', name: 'Orange Money CI', swift: 'ORNMCIAB', flag: '🇨🇮', type: 'mobile_money' },
    { code: 'MTN_MOMO_CI', name: 'MTN MoMo CI', swift: 'MTNMCIAB', flag: '🇨🇮', type: 'mobile_money' },
    { code: 'WAVE_CI', name: 'Wave CI', swift: 'WAVCIABS', flag: '🇨🇮', type: 'mobile_money' },
  ],
  RW: [
    { code: 'BOK', name: 'Bank of Kigali', swift: 'BKIGRWRW', flag: '🇷🇼', type: 'bank' },
    { code: 'IMB_RW', name: 'I&M Bank Rwanda', swift: 'IMBKRWRW', flag: '🇷🇼', type: 'bank' },
    { code: 'BPR', name: 'BPR Bank Rwanda', swift: 'BPRWRWRW', flag: '🇷🇼', type: 'bank' },
    { code: 'MOMO_RW', name: 'MTN MoMo Rwanda', swift: 'MTNMRWRW', flag: '🇷🇼', type: 'mobile_money' },
  ],
  CM: [
    { code: 'AFRILAND', name: 'Afriland First Bank', swift: 'CCBKCMCX', flag: '🇨🇲', type: 'bank' },
    { code: 'SGBC', name: 'Société Générale Cameroun', swift: 'SOGEKCMX', flag: '🇨🇲', type: 'bank' },
    { code: 'ECOBANK_CM', name: 'Ecobank Cameroun', swift: 'ECOCCMCX', flag: '🇨🇲', type: 'bank' },
    { code: 'MTN_MOMO_CM', name: 'MTN MoMo Cameroun', swift: 'MTNMCMCX', flag: '🇨🇲', type: 'mobile_money' },
  ],
  EG: [
    { code: 'AAFB', name: 'Arab African International Bank', swift: 'ARABEGCA', flag: '🇪🇬', type: 'bank' },
    { code: 'CIB_EG', name: 'Commercial International Bank', swift: 'CIBEEGCA', flag: '🇪🇬', type: 'bank' },
    { code: 'NBE', name: 'National Bank of Egypt', swift: 'NBEGEGCA', flag: '🇪🇬', type: 'bank' },
    { code: 'QNB_EG', name: 'QNB Al Ahli', swift: 'QNBAEGCA', flag: '🇪🇬', type: 'bank' },
  ],
  MA: [
    { code: 'ATW', name: 'Attijariwafa Bank', swift: 'BCMAMAMC', flag: '🇲🇦', type: 'bank' },
    { code: 'BCP', name: 'Banque Centrale Populaire', swift: 'BCPOMAMC', flag: '🇲🇦', type: 'bank' },
    { code: 'BMCE', name: 'BMCE Bank of Africa', swift: 'BMCEMAMC', flag: '🇲🇦', type: 'bank' },
  ],
  TN: [
    { code: 'BT', name: 'Banque de Tunisie', swift: 'BTUNTNTT', flag: '🇹🇳', type: 'bank' },
    { code: 'AMEN', name: 'Amen Bank', swift: 'AMENTNTT', flag: '🇹🇳', type: 'bank' },
    { code: 'STB', name: 'Société Tunisienne de Banque', swift: 'STBKTNTT', flag: '🇹🇳', type: 'bank' },
  ],
  DZ: [
    { code: 'BNP_DZ', name: 'BNP Paribas El Djazaïr', swift: 'BNPADZDZ', flag: '🇩🇿', type: 'bank' },
    { code: 'SGA', name: 'Société Générale Algérie', swift: 'SOGEDZDZ', flag: '🇩🇿', type: 'bank' },
    { code: 'CPA', name: "Crédit Populaire d'Algérie", swift: 'CPAADZDZ', flag: '🇩🇿', type: 'bank' },
  ],
  AO: [
    { code: 'BAI', name: 'Banco Angolano de Investimentos', swift: 'BAIAANLU', flag: '🇦🇴', type: 'bank' },
    { code: 'BIC_AO', name: 'Banco BIC Angola', swift: 'BICAANLU', flag: '🇦🇴', type: 'bank' },
    { code: 'BFA', name: 'Banco de Fomento Angola', swift: 'BFANAANLU', flag: '🇦🇴', type: 'bank' },
  ],
  MZ: [
    { code: 'MBIM', name: 'Millennium BIM', swift: 'BIMMZMAM', flag: '🇲🇿', type: 'bank' },
    { code: 'BCI_MZ', name: 'BCI Mozambique', swift: 'BNCIMZMX', flag: '🇲🇿', type: 'bank' },
    { code: 'MPESA_MZ', name: 'M-Pesa Mozambique', swift: 'MPESMZMZ', flag: '🇲🇿', type: 'mobile_money' },
  ],
  ZM: [
    { code: 'ZANACO', name: 'Zanaco', swift: 'ZANAZMLX', flag: '🇿🇲', type: 'bank' },
    { code: 'FNB_ZM', name: 'First National Bank Zambia', swift: 'FIRNZMLU', flag: '🇿🇲', type: 'bank' },
    { code: 'STANBIC_ZM', name: 'Stanbic Bank Zambia', swift: 'SBICZMLX', flag: '🇿🇲', type: 'bank' },
  ],
  ZW: [
    { code: 'CBZ', name: 'CBZ Bank', swift: 'CBZWZWHA', flag: '🇿🇼', type: 'bank' },
    { code: 'FBC_ZW', name: 'FBC Bank', swift: 'FBCBZWHA', flag: '🇿🇼', type: 'bank' },
    { code: 'STEWARD', name: 'Steward Bank (EcoCash)', swift: 'STEBZWHA', flag: '🇿🇼', type: 'mobile_money' },
  ],
  BW: [
    { code: 'FNB_BW', name: 'First National Bank Botswana', swift: 'FIRNBWGA', flag: '🇧🇼', type: 'bank' },
    { code: 'STANCHART_BW', name: 'Standard Chartered Botswana', swift: 'SCBLBWGA', flag: '🇧🇼', type: 'bank' },
    { code: 'ABSA_BW', name: 'Absa Bank Botswana', swift: 'BARCBWGA', flag: '🇧🇼', type: 'bank' },
  ],
  MW: [
    { code: 'NBM', name: 'National Bank of Malawi', swift: 'NIMWMWMW', flag: '🇲🇼', type: 'bank' },
    { code: 'STANBIC_MW', name: 'Standard Bank Malawi', swift: 'SBICMWMW', flag: '🇲🇼', type: 'bank' },
    { code: 'NBS_MW', name: 'NBS Bank Malawi', swift: 'NBSMMWMW', flag: '🇲🇼', type: 'bank' },
  ],
  NA: [
    { code: 'FNB_NA', name: 'First National Bank Namibia', swift: 'FIRNNANX', flag: '🇳🇦', type: 'bank' },
    { code: 'BANKWINDHK', name: 'Bank Windhoek', swift: 'NCRANANX', flag: '🇳🇦', type: 'bank' },
    { code: 'STANBIC_NA', name: 'Stanbic Bank Namibia', swift: 'SBICNANX', flag: '🇳🇦', type: 'bank' },
  ],
  SL: [
    { code: 'ROKEL', name: 'Rokel Commercial Bank', swift: 'ROCLSLFS', flag: '🇸🇱', type: 'bank' },
    { code: 'SLCB', name: 'Sierra Leone Commercial Bank', swift: 'SLCBSLFS', flag: '🇸🇱', type: 'bank' },
    { code: 'ECOBANK_SL', name: 'Ecobank Sierra Leone', swift: 'ECOCSLFS', flag: '🇸🇱', type: 'bank' },
  ],
  LR: [
    { code: 'ECOBANK_LR', name: 'Ecobank Liberia', swift: 'ECOCLRMO', flag: '🇱🇷', type: 'bank' },
    { code: 'UBA_LR', name: 'United Bank for Africa Liberia', swift: 'UBINLRMO', flag: '🇱🇷', type: 'bank' },
    { code: 'LBDI', name: 'Liberian Bank for Dev & Investment', swift: 'LBDILRMO', flag: '🇱🇷', type: 'bank' },
  ],
}

// ─── INTL_BANKS — Diaspora Hub Banks ─────────────────────────────────────────
// The four diaspora hubs where the most African-origin wealth lives.
// Supporting corridors GB → NG, US → GH/NG, FR → SN/CI, AE → ET/KE.

export const INTL_BANKS: Record<string, { code: string; name: string; swift: string; flag: string; type: string }[]> = {
  GB: [
    { code: 'BARCLAYS', name: 'Barclays UK', swift: 'BARCGB22', flag: '🇬🇧', type: 'bank' },
    { code: 'NATWEST', name: 'NatWest UK', swift: 'NWBKGB2L', flag: '🇬🇧', type: 'bank' },
    { code: 'HSBC_UK', name: 'HSBC UK', swift: 'MIDLGB22', flag: '🇬🇧', type: 'bank' },
    { code: 'LLOYDS', name: 'Lloyds Bank', swift: 'LOYDGB2L', flag: '🇬🇧', type: 'bank' },
    { code: 'MONZO', name: 'Monzo', swift: 'MNZOGB2L', flag: '🇬🇧', type: 'bank' },
    { code: 'REVOLUT', name: 'Revolut UK', swift: 'REVOGB2L', flag: '🇬🇧', type: 'bank' },
  ],
  US: [
    { code: 'CHASE', name: 'JPMorgan Chase', swift: 'CHASUS33', flag: '🇺🇸', type: 'bank' },
    { code: 'BOA', name: 'Bank of America', swift: 'BOFAUS3N', flag: '🇺🇸', type: 'bank' },
    { code: 'CITI', name: 'Citibank USA', swift: 'CITIUS33', flag: '🇺🇸', type: 'bank' },
    { code: 'WELLS', name: 'Wells Fargo', swift: 'WFBIUS6S', flag: '🇺🇸', type: 'bank' },
    { code: 'REMITLY', name: 'Remitly / Zelle', swift: 'REMLUSD1', flag: '🇺🇸', type: 'mobile_money' },
  ],
  FR: [
    { code: 'BNP', name: 'BNP Paribas', swift: 'BNPAFRPP', flag: '🇫🇷', type: 'bank' },
    { code: 'CREDIT_AG', name: 'Crédit Agricole', swift: 'AGRIFRPP', flag: '🇫🇷', type: 'bank' },
    { code: 'SG_FR', name: 'Société Générale', swift: 'SOGEFRPP', flag: '🇫🇷', type: 'bank' },
  ],
  AE: [
    { code: 'ADCB', name: 'Abu Dhabi Commercial Bank', swift: 'ADCBAEAA', flag: '🇦🇪', type: 'bank' },
    { code: 'FAB', name: 'First Abu Dhabi Bank', swift: 'NBADAEAA', flag: '🇦🇪', type: 'bank' },
    { code: 'WISE_AE', name: 'Wise (UAE)', swift: 'TRWIBEB1', flag: '🇦🇪', type: 'bank' },
  ],
}

// ─── AFRICAN_COUNTRY_NAMES — Display names for all supported country codes ────

export const AFRICAN_COUNTRY_NAMES: Record<string, string> = {
  NG: 'Nigeria', GH: 'Ghana', KE: 'Kenya', ZA: 'South Africa',
  ET: 'Ethiopia', SN: 'Senegal', TZ: 'Tanzania', UG: 'Uganda',
  CI: "Côte d'Ivoire", RW: 'Rwanda', CM: 'Cameroon',
  EG: 'Egypt', MA: 'Morocco', TN: 'Tunisia', DZ: 'Algeria',
  AO: 'Angola', MZ: 'Mozambique', ZM: 'Zambia', ZW: 'Zimbabwe',
  BW: 'Botswana', MW: 'Malawi', NA: 'Namibia', SL: 'Sierra Leone', LR: 'Liberia',
  GB: 'United Kingdom', US: 'United States', FR: 'France', AE: 'UAE',
}

// ─── ESUSU CLOCK CYCLES — Igbo 4-Day Market Week for Savings Circles ─────────
// Each cycle aligns with the traditional Igbo market week.
// Esusu (Yoruba) / Ajo — rotating savings groups timed to market rhythms.

export const ESUSU_CLOCK_CYCLES = [
  { key: 'EKE', label: 'Ẹgbẹ Ẹkẹ', marketDay: 'Eke', rhythm: 'Every 4 days', emoji: '🌑', color: '#1a3a1a', desc: 'The first market day cycle — moon phase opening' },
  { key: 'ORIE', label: 'Ẹgbẹ Orié', marketDay: 'Orie', rhythm: 'Every 4 days', emoji: '🌒', color: '#1a2a3a', desc: 'The second cycle — waxing moon trade' },
  { key: 'AFO', label: 'Ẹgbẹ Àfò', marketDay: 'Afo', rhythm: 'Every 4 days', emoji: '🌕', color: '#3a2a00', desc: 'The third cycle — full moon abundance' },
  { key: 'NKWO', label: 'Ẹgbẹ Nkwọ', marketDay: 'Nkwo', rhythm: 'Every 4 days', emoji: '🌘', color: '#2a1a3a', desc: 'The fourth cycle — waning moon harvest' },
] as const

// ─── ANCESTRAL BUFFER TIERS — Community Emergency Vault Tiers ────────────────
// Three levels of communal emergency fund access.
// Rooted in the African tradition of collective crisis response.

export const ANCESTRAL_BUFFER_TIERS = [
  { key: 'MEDICAL', label: 'Egbogi Buffer', emoji: '🏥', maxTap: 50000, minUbuntu: 201, desc: 'Emergency medical, surgery, childbirth complications', color: '#0369a1' },
  { key: 'CEREMONY', label: 'Ìṣẹ́ Àṣà Buffer', emoji: '🎺', maxTap: 150000, minUbuntu: 401, desc: 'Funeral rites, naming ceremonies, harvest festivals', color: '#7c3aed' },
  { key: 'DISASTER', label: 'Ìkógun Buffer', emoji: '🌊', maxTap: 500000, minUbuntu: 0, requiresElderVote: true, desc: 'Flood, fire, drought, community-wide crisis', color: '#b91c1c' },
] as const

// ─── GRIOT CREDIT GRADES — African-Named Credit Score Bands ──────────────────
// Five bands from Iron Root to Diamond Sovereignty.
// Each grade name is drawn from African metallurgy and oral tradition.

export const GRIOT_CREDIT_GRADES = [
  { key: 'IRON', min: 0, max: 249, label: 'Iron Root', emoji: '⚙️', color: '#6b7280', desc: 'Building credit history — the journey begins' },
  { key: 'BRONZE', min: 250, max: 499, label: 'Bronze Leaf', emoji: '🍂', color: '#b45309', desc: 'Growing trust within the village circle' },
  { key: 'OGUN', min: 500, max: 699, label: 'Ogun Steel', emoji: '🛡️', color: '#4338ca', desc: 'Reliable and village-trusted — iron holds its shape' },
  { key: 'GOLD', min: 700, max: 899, label: 'Gold Cowrie', emoji: '🪙', color: '#d4a017', desc: 'Deep trust — elders speak your name with respect' },
  { key: 'DIAMOND', min: 900, max: 1000, label: 'Diamond Sovereignty', emoji: '💎', color: '#0ea5e9', desc: 'Ancestral trust — your word is a bond certificate' },
] as const

// ─── TRANSFER ACCOUNT TYPES — Pan-African Account Classifications ─────────────
// Maps Western account type labels onto African naming tradition.
// Used in the transfer flow to let users specify the recipient account type.

export const TRANSFER_ACCOUNT_TYPES = [
  { key: 'savings', label: 'Savings Account', emoji: '🏦', desc: 'Standard savings — interest bearing, African ceremony name: Àpò Owó' },
  { key: 'current', label: 'Current / Checking', emoji: '🔄', desc: 'Daily transactions — high frequency: Àpòpò Ọjọ́' },
  { key: 'domiciliary', label: 'Domiciliary (FCY)', emoji: '🌍', desc: 'Foreign currency: USD/GBP/EUR: Àpò Ìlú Òkun' },
  { key: 'fixed_deposit', label: 'Fixed Deposit', emoji: '🔒', desc: 'Time-locked savings with high interest: Àrọ Owó' },
  { key: 'mobile_money', label: 'Mobile Money Wallet', emoji: '📱', desc: 'SIM-based wallet: M-Pesa, MTN MoMo, Orange Money' },
] as const

// ─── COWRIE KEYS TYPES — Payment Aliases (like UPI VPA / PIX Keys) ────────────
// Three sovereign payment identifiers. Each one is a Cowrie Key — a unique
// alias that routes money to you without exposing your account number.
// Inspired by Brazil's PIX Key system and India's UPI VPA — but rooted in
// the African cowrie shell, historically the unit of exchange.

export const COWRIE_KEYS_TYPES = [
  {
    key:   'AFROID',
    label: 'AfroID',
    emoji: '🪬',
    color: '#4ade80',
    desc:  'Primary key — works everywhere on the platform',
    hint:  '@handle format — universal across all AfroID services',
    example: '@name.village',
  },
  {
    key:   'PHONE',
    label: 'Phone',
    emoji: '📱',
    color: '#fbbf24',
    desc:  'USSD + mobile money payable — works offline',
    hint:  'International format with country code (+234, +254…)',
    example: '+234 800 000 0000',
  },
  {
    key:   'EMAIL',
    label: 'Email',
    emoji: '📧',
    color: '#60a5fa',
    desc:  'For diaspora + online payments from any country',
    hint:  'Shareable via email link — amount pre-filled',
    example: 'name@afro.id',
  },
] as const

export type CowrieKeyType = typeof COWRIE_KEYS_TYPES[number]['key']

// ─── DIASPORA CORRIDORS — Top 8 Remittance Routes into Africa ────────────────
// Real data on the largest Africa-bound diaspora money flows.
// Each corridor lists volume, dominant operators, and receiving endpoints.
// Source: World Bank Remittance Data 2023, IFAD, GSMA.

export const DIASPORA_CORRIDORS = [
  {
    code:     'US→NG',
    flag:     '🇺🇸→🇳🇬',
    from:     'United States',
    to:       'Nigeria',
    amount:   '$4.2B/yr',
    ops:      'Remitly · Chipper · Sendwave',
    endpoint: 'GTBank · PalmPay · Polaris',
    color:    '#009e60',
    note:     'Largest single corridor into Nigeria',
  },
  {
    code:     'UK→NG',
    flag:     '🇬🇧→🇳🇬',
    from:     'United Kingdom',
    to:       'Nigeria',
    amount:   '$3.4B/yr',
    ops:      'Sendwave · WorldRemit · Wise',
    endpoint: 'GTBank · Access · Zenith',
    color:    '#009e60',
    note:     '4M+ Nigerian diaspora in the UK',
  },
  {
    code:     'FR→SN',
    flag:     '🇫🇷→🇸🇳',
    from:     'France',
    to:       'Sénégal / WAEMU zone',
    amount:   '$2.8B/yr',
    ops:      'Wave · Orange Money · Wizall',
    endpoint: 'Wave · Orange · Free Money',
    color:    '#fbbf24',
    note:     'Francophone corridor — XOF zone dominates',
  },
  {
    code:     'CN→AF',
    flag:     '🇨🇳→🌍',
    from:     'China',
    to:       'Pan-Africa',
    amount:   '$2.1B/yr',
    ops:      'Alipay · WeChat Pay · UnionPay',
    endpoint: 'Bank transfer · Mobile money',
    color:    '#ef4444',
    note:     'Belt & Road workers + trade settlements',
  },
  {
    code:     'AE→ET',
    flag:     '🇦🇪→🇪🇹',
    from:     'Gulf (UAE + KSA)',
    to:       'Ethiopia',
    amount:   '$1.2B/yr',
    ops:      'Dahabshiil · Telebirr · Nala',
    endpoint: 'CBE Birr · Telebirr',
    color:    '#60a5fa',
    note:     'Ethiopian workers across Gulf states',
  },
  {
    code:     'ZA→ZW',
    flag:     '🇿🇦→🇿🇼',
    from:     'South Africa',
    to:       'Zimbabwe / SADC',
    amount:   '$1.0B+/yr',
    ops:      'Mukuru · HelloPaisa · EcoCash',
    endpoint: 'EcoCash · FBC · CBZ',
    color:    '#a78bfa',
    note:     'Intra-African corridor — USD preferred',
  },
  {
    code:     'UK→GH',
    flag:     '🇬🇧→🇬🇭',
    from:     'United Kingdom',
    to:       'Ghana',
    amount:   '$890M/yr',
    ops:      'WorldRemit · Azimo · Sendwave',
    endpoint: 'MTN MoMo · Vodafone Cash',
    color:    '#fbbf24',
    note:     '500K+ Ghanaian diaspora in UK',
  },
  {
    code:     'US→KE',
    flag:     '🇺🇸→🇰🇪',
    from:     'United States',
    to:       'Kenya',
    amount:   '$620M/yr',
    ops:      'Sendwave · Wise · Chipper',
    endpoint: 'M-Pesa · Equity · KCB',
    color:    '#4ade80',
    note:     'M-Pesa makes Kenya fastest-settling corridor',
  },
] as const

export type DiasporaCorridor = typeof DIASPORA_CORRIDORS[number]
