// ═══════════════════════════════════════════════════════════════
//  VILLAGE AIRWAVES — TV SCHEDULE SYSTEM
//  20 villages × 2 time slots per day = 40 hours of programming
//  Cowrie-priced bookable slots, live programming, applications
// ═══════════════════════════════════════════════════════════════

export type SlotTier   = 'DAWN' | 'MORNING' | 'MIDDAY' | 'PRIME' | 'NIGHT'
export type SlotStatus = 'LIVE' | 'UPCOMING' | 'BOOKABLE' | 'BOOKED' | 'COMPLETED'
export type ShowCategory = 'market' | 'wellness' | 'education' | 'music' | 'talk' | 'craft' | 'news' | 'sport' | 'spirit' | 'business' | 'culture' | 'tech'

export interface TVProgram {
  title: string
  host: string
  category: ShowCategory
  desc: string
  viewers?: number
}

export interface TVSlot {
  id: string
  villageId: string
  villageName: string
  villageEmoji: string
  villageColor: string
  startTime: string   // 'HH:MM'
  endTime: string
  durationHours: number
  tier: SlotTier
  cowriePrice: number  // to book this slot
  status: SlotStatus
  program: TVProgram | null
  isBookable: boolean
  isHighlighted?: boolean   // featured / sponsored
  applyCount?: number       // how many people applied for this slot
}

// ── Cowrie price by tier ──────────────────────────────────────
export const SLOT_PRICES: Record<SlotTier, number> = {
  DAWN:    300,
  MORNING: 800,
  MIDDAY:  1_500,
  PRIME:   5_000,
  NIGHT:   1_200,
}

export function getTier(startTime: string): SlotTier {
  const h = parseInt(startTime.split(':')[0])
  if (h >= 4 && h < 8)   return 'DAWN'
  if (h >= 8 && h < 12)  return 'MORNING'
  if (h >= 12 && h < 17) return 'MIDDAY'
  if (h >= 17 && h < 21) return 'PRIME'
  return 'NIGHT'
}

// ── Village schedule (2 slots per village per day) ────────────
// Format: [startTime, endTime, status, program | null]
type RawSlot = [string, string, SlotStatus, TVProgram | null]

const VILLAGE_PROGRAMS: Record<string, [RawSlot, RawSlot]> = {
  commerce: [
    ['06:00', '08:00', 'UPCOMING', { title: 'Ọjà Morning Market', host: 'Mama Ngozi', category: 'market', desc: 'Daily price reports, trader interviews, product showcases from the Commerce Village marketplace.', viewers: 1240 }],
    ['18:00', '20:00', 'LIVE',     { title: 'Trade Secrets with Alhaji Sumo', host: 'Alhaji Sumo', category: 'business', desc: 'Prime time commerce: negotiation masterclass, deal reviews, Cowrie flow analysis.', viewers: 4821 }],
  ],
  agriculture: [
    ['05:00', '07:00', 'UPCOMING', { title: "Ìjókòó Àgbàdo — Farmer's Dawn", host: 'Emeka Obi', category: 'talk', desc: 'Morning agricultural briefing: planting calendar, weather, crop tips from village farmers.', viewers: 890 }],
    ['16:00', '18:00', 'BOOKABLE', null],
  ],
  health: [
    ['07:00', '09:00', 'UPCOMING', { title: 'Alafia Morning — Health & Wellness', host: 'Dr. Aisha Bello', category: 'wellness', desc: 'Holistic African medicine, symptom checks, mental wellness circles.', viewers: 2100 }],
    ['20:00', '22:00', 'BOOKABLE', null],
  ],
  education: [
    ['09:00', '11:00', 'UPCOMING', { title: 'Sankofa School — Learn Forward', host: 'Prof. Kofi Mensah', category: 'education', desc: 'African history, STEM in Yoruba & Igbo, coding for youth.', viewers: 3200 }],
    ['19:00', '21:00', 'BOOKABLE', null],
  ],
  technology: [
    ['10:00', '12:00', 'UPCOMING', { title: 'Code & Cowrie — Tech in Africa', host: 'Tunde Dev', category: 'tech', desc: 'African tech founders, build-in-public, startup pitches.', viewers: 1800 }],
    ['22:00', '00:00', 'BOOKABLE', null],
  ],
  finance: [
    ['11:00', '13:00', 'UPCOMING', { title: 'Cowrie Compass — Money Matters', host: 'Fatima Al-Rasheed', category: 'business', desc: 'Personal finance, remittances, AfriCoin investment, escrow secrets.', viewers: 2400 }],
    ['17:00', '19:00', 'UPCOMING', { title: 'AfriInvest Prime Time', host: 'Chukwuemeka Osei', category: 'business', desc: 'Live market analysis, investment Q&A, village wealth-building strategies.', viewers: 6100 }],
  ],
  hospitality: [
    ['12:00', '14:00', 'UPCOMING', { title: 'Jollof Kitchen — Lunch Hour', host: 'Aunty Blessing', category: 'culture', desc: 'Pan-African cooking, food commerce, restaurant management tips.', viewers: 5400 }],
    ['20:00', '22:00', 'BOOKABLE', null],
  ],
  fashion: [
    ['13:00', '15:00', 'UPCOMING', { title: 'Asọ-Ọpọ — African Style Hour', host: 'Zainab Threads', category: 'culture', desc: 'Ankara trends, sustainable fashion, marketplace spotlights.', viewers: 7200 }],
    ['18:00', '20:00', 'BOOKABLE', null],
  ],
  arts: [
    ['14:00', '16:00', 'UPCOMING', { title: 'Ẹwa Art Hour', host: 'Kwame Brushstroke', category: 'craft', desc: 'African art showcase, NFT minting live, craft tutorials.', viewers: 980 }],
    ['22:00', '00:00', 'BOOKABLE', null],
  ],
  media: [
    ['15:00', '17:00', 'UPCOMING', { title: 'Talking Drum News', host: 'Nkechi Reports', category: 'news', desc: 'Pan-African current affairs, village governance, global diaspora news.', viewers: 4300 }],
    ['19:00', '21:00', 'BOOKABLE', null],
  ],
  sports: [
    ['06:00', '08:00', 'UPCOMING', { title: 'BalaBala — African Sports Hour', host: 'Coach Chidi', category: 'sport', desc: 'Football analysis, athletics, youth sports news, village league updates.', viewers: 8900 }],
    ['20:00', '22:00', 'BOOKABLE', null],
  ],
  builders: [
    ['08:00', '10:00', 'UPCOMING', { title: 'Build Africa — Construction & DIY', host: 'Oga Solomon', category: 'craft', desc: 'Architecture, self-build projects, affordable housing tips.', viewers: 1100 }],
    ['16:00', '18:00', 'BOOKABLE', null],
  ],
  transport: [
    ['07:00', '09:00', 'UPCOMING', { title: 'Ọnà — Roads & Routes', host: 'Captain Amara', category: 'talk', desc: 'Logistics in Africa, road safety, delivery services, trade routes.', viewers: 760 }],
    ['18:00', '20:00', 'BOOKABLE', null],
  ],
  family: [
    ['15:00', '17:00', 'UPCOMING', { title: 'Ìdílé Time — Family Hour', host: 'Mama Tosin', category: 'culture', desc: 'Parenting tips, family tree stories, kinship ceremony guides.', viewers: 3100 }],
    ['19:00', '21:00', 'UPCOMING',    { title: 'Family Fire — Prime Evening', host: 'Elder Adamu', category: 'spirit', desc: 'Evening family gathering show. Stories, proverbs, Ancestor flame.', viewers: 5600 }],
  ],
  spirituality: [
    ['04:00', '06:00', 'UPCOMING', { title: 'Ìjúba — Morning Devotion', host: 'Baba Odu', category: 'spirit', desc: 'Orisha prayers, morning devotion across all faiths, ancestral greetings.', viewers: 2900 }],
    ['21:00', '23:00', 'BOOKABLE', null],
  ],
  energy: [
    ['06:00', '08:00', 'UPCOMING', { title: 'Power Africa — Energy Solutions', host: 'Engr. Tolani', category: 'tech', desc: 'Solar, wind, community grids — African energy solutions.', viewers: 640 }],
    ['21:00', '23:00', 'BOOKABLE', null],
  ],
  security: [
    ['09:00', '11:00', 'UPCOMING', { title: 'Nkisi Shield — Safety Circle', host: 'Capt. Babatunde', category: 'talk', desc: 'Community security, digital safety, protecting your Cowrie flow.', viewers: 1500 }],
    ['22:00', '00:00', 'BOOKABLE', null],
  ],
  justice: [
    ['14:00', '16:00', 'UPCOMING', { title: 'Ẹjọ́ — Justice Hour', host: 'Barrister Yomi', category: 'talk', desc: 'African law made simple, tenant rights, trade dispute resolution.', viewers: 1800 }],
    ['17:00', '19:00', 'BOOKABLE', null],
  ],
  government: [
    ['10:00', '12:00', 'UPCOMING', { title: 'Ìjọba — Governance Watch', host: 'Iyalode Funmi', category: 'news', desc: 'Civic education, community council sessions, policy made simple.', viewers: 920 }],
    ['18:00', '20:00', 'BOOKABLE', null],
  ],
  holdings: [
    ['13:00', '15:00', 'UPCOMING', { title: 'Vault Chronicles — Asset Class', host: 'The Holdings Elder', category: 'business', desc: 'Portfolio management, sovereignty economics, multi-village investments.', viewers: 2100 }],
    ['23:00', '01:00', 'BOOKABLE', null],
  ],
}

// ── Village metadata for schedule display ────────────────────
export const TV_VILLAGE_META: Record<string, { name: string; emoji: string; color: string }> = {
  commerce:     { name: 'Commerce',     emoji: '🧺', color: '#e07b00' },
  agriculture:  { name: 'Agriculture',  emoji: '🌾', color: '#1a7c3e' },
  health:       { name: 'Health',       emoji: '⚕',  color: '#0369a1' },
  education:    { name: 'Education',    emoji: '🎓', color: '#4f46e5' },
  technology:   { name: 'Technology',  emoji: '💻', color: '#0f766e' },
  finance:      { name: 'Finance',      emoji: '💰', color: '#047857' },
  hospitality:  { name: 'Hospitality', emoji: '🍽', color: '#92400e' },
  fashion:      { name: 'Fashion',      emoji: '👗', color: '#c2410c' },
  arts:         { name: 'Arts',          emoji: '🎨', color: '#7c3aed' },
  media:        { name: 'Media',        emoji: '📰', color: '#6d28d9' },
  sports:       { name: 'Sports',       emoji: '⚽', color: '#9d174d' },
  builders:     { name: 'Builders',     emoji: '🏗', color: '#b45309' },
  transport:    { name: 'Transport',    emoji: '🚛', color: '#0891b2' },
  family:       { name: 'Family',       emoji: '🏠', color: '#065f46' },
  spirituality: { name: 'Spirituality', emoji: '🙏', color: '#5b21b6' },
  energy:       { name: 'Energy',       emoji: '⚡', color: '#b91c1c' },
  security:     { name: 'Security',     emoji: '🛡', color: '#374151' },
  justice:      { name: 'Justice',      emoji: '⚖️', color: '#4338ca' },
  government:   { name: 'Government',  emoji: '🏛', color: '#1e3a5f' },
  holdings:     { name: 'Holdings',     emoji: '🚪', color: '#6b7280' },
}

// ── Build full slot list ──────────────────────────────────────
function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function buildTodaySchedule(): TVSlot[] {
  const slots: TVSlot[] = []
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  Object.entries(VILLAGE_PROGRAMS).forEach(([villageId, [slot1, slot2]]) => {
    const meta = TV_VILLAGE_META[villageId]
    if (!meta) return

    ;[slot1, slot2].forEach(([startTime, endTime, rawStatus, program], i) => {
      const tier = getTier(startTime)
      const startMin = toMinutes(startTime)
      const endMin   = endTime === '00:00' || endTime === '01:00' ? 24 * 60 : toMinutes(endTime)
      let status: SlotStatus = rawStatus

      // Override status based on current time
      if (status !== 'BOOKABLE') {
        if (currentMinutes >= startMin && currentMinutes < endMin) {
          status = 'LIVE'
        } else if (currentMinutes >= endMin) {
          status = 'COMPLETED'
        } else {
          status = 'UPCOMING'
        }
      }

      slots.push({
        id: `${villageId}-slot${i + 1}`,
        villageId,
        villageName: meta.name,
        villageEmoji: meta.emoji,
        villageColor: meta.color,
        startTime,
        endTime,
        durationHours: Math.round((endMin - startMin) / 60),
        tier,
        cowriePrice: SLOT_PRICES[tier],
        status,
        program: status === 'BOOKABLE' ? null : program,
        isBookable: status === 'BOOKABLE',
        isHighlighted: tier === 'PRIME',
        applyCount: status === 'BOOKABLE' ? Math.floor(Math.random() * 8) : 0,
      })
    })
  })

  return slots.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
}

// ── Helper: get live slots right now ─────────────────────────
export function getLiveSlots(schedule: TVSlot[]) {
  return schedule.filter(s => s.status === 'LIVE')
}

// ── Helper: slots by village ──────────────────────────────────
export function getVillageSlots(schedule: TVSlot[], villageId: string) {
  return schedule.filter(s => s.villageId === villageId)
}

// ── Show category config ──────────────────────────────────────
export const SHOW_CATEGORY_META: Record<ShowCategory, { label: string; color: string; emoji: string }> = {
  market:    { label: 'Market',     color: '#e07b00', emoji: '🧺' },
  wellness:  { label: 'Wellness',   color: '#059669', emoji: '💚' },
  education: { label: 'Education',  color: '#4f46e5', emoji: '🎓' },
  music:     { label: 'Music',      color: '#9333ea', emoji: '🎵' },
  talk:      { label: 'Talk Show',  color: '#0891b2', emoji: '🎙' },
  craft:     { label: 'Craft/DIY',  color: '#b45309', emoji: '🔨' },
  news:      { label: 'News',       color: '#dc2626', emoji: '📰' },
  sport:     { label: 'Sports',     color: '#9d174d', emoji: '⚽' },
  spirit:    { label: 'Spiritual',  color: '#5b21b6', emoji: '🙏' },
  business:  { label: 'Business',   color: '#047857', emoji: '💼' },
  culture:   { label: 'Culture',    color: '#c2410c', emoji: '🌍' },
  tech:      { label: 'Tech',       color: '#0f766e', emoji: '💻' },
}

export const TIER_META: Record<SlotTier, { label: string; color: string; desc: string }> = {
  DAWN:    { label: 'Dawn',      color: '#6b7280', desc: '04:00–08:00 · 300 Cowrie' },
  MORNING: { label: 'Morning',   color: '#d4a017', desc: '08:00–12:00 · 800 Cowrie' },
  MIDDAY:  { label: 'Midday',    color: '#e07b00', desc: '12:00–17:00 · 1,500 Cowrie' },
  PRIME:   { label: 'Prime Time',color: '#ef4444', desc: '17:00–21:00 · 5,000 Cowrie' },
  NIGHT:   { label: 'Night',     color: '#8b5cf6', desc: '21:00–04:00 · 1,200 Cowrie' },
}
