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
  DEBIT:               { label: 'Sent',              emoji: '↗', color: '#c94040' },
  CREDIT:              { label: 'Received',          emoji: '↙', color: '#2d9e5f' },
  SPRAY:               { label: 'Sprayed',           emoji: '💦', color: '#6b4fbb' },
  ESCROW_LOCK:         { label: 'Pot Sealed',        emoji: '🏺', color: '#e8a020' },
  ESCROW_RELEASE:      { label: 'Pot Released',      emoji: '🎉', color: '#2d9e5f' },
  ESCROW_REVERSED:     { label: 'Pot Reversed',      emoji: '↩', color: '#c94040' },
  AJO_CONTRIBUTION:    { label: 'Ajo Contribution',  emoji: '🔄', color: '#2d6a9e' },
  AJO_PAYOUT:          { label: 'Ajo Payout',        emoji: '💰', color: '#e8a020' },
  HARAMBEE:            { label: 'Harambee Gift',     emoji: '🤝', color: '#4a8c5c' },
  SPIRIT_VAULT_LOCK:   { label: 'Spirit Locked',     emoji: '🕯', color: '#6b4fbb' },
  SPIRIT_VAULT_UNLOCK: { label: 'Heritage Released', emoji: '🌟', color: '#e8a020' },
  SEASON_LOCK:         { label: 'Grain Deposited',   emoji: '🌾', color: '#7a9e6e' },
  SEASON_UNLOCK:       { label: 'Harvest Withdrawn', emoji: '🌻', color: '#e8a020' },
  CORRIDOR_SEND:       { label: 'Sent Abroad',       emoji: '✈', color: '#2d6a9e' },
  CORRIDOR_RECEIVE:    { label: 'Received from Abroad', emoji: '🏠', color: '#2d9e5f' },
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
