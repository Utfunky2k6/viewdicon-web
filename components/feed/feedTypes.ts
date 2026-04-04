// ============================================================
// Sòrò Sókè Feed — Canonical Post Types
// Single source of truth — used by all feed components & pages
// ============================================================

export type PostType =
  | 'TEXT_DRUM'
  | 'VOICE_STORY'
  | 'MARKET_LISTING'
  | 'PROVERB_CHAIN'
  | 'VILLAGE_NOTICE'
  | 'TRADE_PROOF'
  | 'BLOOD_CALL'
  | 'ORACLE_SESSION'
  | 'KILA_MOMENT'
  | 'GRIOT_WISDOM'
  | 'EVENT_DRUM'
  | 'VIDEO_STORY'
  | 'IMAGE_JOURNAL'
  | 'AUDIO_LETTER'

/** The 4 sacred drums — which feed surface a post belongs to */
export type DrumChannel = 'soro_soke' | 'oriki' | 'aworan' | 'idile_circle'

/** Heat lifecycle stages */
export type HeatStage = 'COLD' | 'EMBER' | 'SIMMER' | 'BOIL' | 'FEAST'

export interface ProverbBranch {
  author: string
  text: string
  lang: string
  flag: string
  kilaCount: number
}

export interface Post {
  id: string
  type: PostType
  drum: DrumChannel
  author: string
  afroId: string
  avatarColor: string
  village: string
  villageEmoji: string
  role: string
  skinContext: 'ise' | 'egbe' | 'idile'
  content: string
  tags: string[]
  time: string
  // Interaction counts
  kilaCount: number
  stirCount: number
  ubuntuCount: number
  sprayTotal: number
  commentCount: number
  // Scope & ranking
  drumScope: 1 | 2 | 3
  heatScore: number
  stage: HeatStage
  crestTier: number
  nkisi: 'GREEN' | 'AMBER' | 'RED'
  // Legacy/compat — inline page used these
  geoMin?: 'village' | 'state' | 'country' | 'continent' | 'global'
  scope?: 'village' | 'region' | 'nation'
  // Market listing
  productName?: string
  productPrice?: number
  marketPricePercent?: number
  productImageEmoji?: string
  // Proverb chain
  proverbOrigin?: string
  proverbLang?: string
  chainCount?: number
  proverbBranches?: ProverbBranch[]
  // Trade proof
  tradePartner?: string
  tradeAmount?: number
  tradeType?: string
  // Voice story
  waveformBars?: number[]
  audioDurationSec?: number
  // Oracle session
  oracleTopic?: string
  oracleAgree?: number
  speakerCount?: number
  listenerCount?: number
  // Blood call
  bloodCallType?: string
  urgencyLevel?: 'critical' | 'urgent' | 'notice'
  // Video story (motion feed)
  videoUrl?: string
  videoDurationSec?: number
  thumbnailUrl?: string
  // Image journal (motion feed)
  imageUrls?: string[]
  captionLocale?: string
  // Audio letter (motion feed)
  audioUrl?: string
  spiritVoiceEnabled?: boolean
  // Event drum
  eventPayload?: string
  // Text fields from inline page
  duration?: string
  translation?: string
  noticeContent?: string
  location?: string
}

// ── Village metadata for post enrichment ──────────────────
const VILLAGE_META: Record<string, { emoji: string; name: string }> = {
  commerce:     { emoji: '🧺', name: 'Commerce' },
  agriculture:  { emoji: '🌾', name: 'Agriculture' },
  arts:         { emoji: '🎨', name: 'Arts' },
  health:       { emoji: '⚕', name: 'Health' },
  builders:     { emoji: '🏗', name: 'Builders' },
  media:        { emoji: '🎙', name: 'Media' },
  education:    { emoji: '📚', name: 'Education' },
  finance:      { emoji: '💰', name: 'Finance' },
  family:       { emoji: '🌳', name: 'Family' },
  technology:   { emoji: '⚡', name: 'Technology' },
  security:     { emoji: '🛡', name: 'Security' },
  spirituality: { emoji: '🕯', name: 'Spirituality' },
  fashion:      { emoji: '👗', name: 'Fashion' },
  transport:    { emoji: '🚛', name: 'Transport' },
  energy:       { emoji: '⚡', name: 'Energy' },
  hospitality:  { emoji: '🍽', name: 'Hospitality' },
  government:   { emoji: '🏛', name: 'Government' },
  sports:       { emoji: '🏅', name: 'Sports' },
  justice:      { emoji: '⚖', name: 'Justice' },
  holdings:     { emoji: '🏦', name: 'Holdings' },
}

/** Derive heat stage from score */
export function heatStageFromScore(score: number): HeatStage {
  if (score >= 78)  return 'FEAST'
  if (score >= 40)  return 'BOIL'
  if (score >= 10)  return 'SIMMER'
  if (score >= 1)   return 'EMBER'
  return 'COLD'
}

/** Derive drum channel from post type + skin */
export function drumFromType(type: PostType, skin: string): DrumChannel {
  if (type === 'VIDEO_STORY') return 'oriki'
  if (type === 'IMAGE_JOURNAL' || type === 'MARKET_LISTING') return 'aworan'
  if (skin === 'idile') return 'idile_circle'
  return 'soro_soke'
}

/** Map backend soro-soke-feed API response to canonical Post */
export function mapBackendPost(raw: Record<string, unknown>): Post {
  const type = (raw.type as PostType) || 'TEXT_DRUM'
  const skin = (raw.skinContext as string) || 'egbe'
  const heatScore = Number(raw.heatScore) || 0
  const vm = VILLAGE_META[(raw.villageId as string)] || { emoji: '🏠', name: String(raw.villageId || 'Village') }

  return {
    id: String(raw.id || raw.calabashId || ''),
    type,
    drum: drumFromType(type, skin),
    author: String(raw.authorName || raw.author || 'Villager'),
    afroId: String(raw.authorAfroId || raw.afroId || ''),
    avatarColor: String(raw.authorAvatarColor || `rgba(26,124,62,.15)`),
    village: String(raw.villageName || vm.name),
    villageEmoji: String(raw.villageIcon || vm.emoji),
    role: String(raw.authorRole || raw.role || ''),
    skinContext: (skin === 'ise' || skin === 'idile') ? skin : 'egbe',
    content: String(raw.body || raw.content || ''),
    tags: Array.isArray(raw.hashtags) ? raw.hashtags.map(String) : [],
    time: raw.createdAt ? formatTimeAgo(String(raw.createdAt)) : 'now',
    kilaCount: Number(raw.kilaCount) || 0,
    stirCount: Number(raw.stirCount) || 0,
    ubuntuCount: Number(raw.ubuntuCount) || 0,
    sprayTotal: Number(raw.sprayTotal) || 0,
    commentCount: Number(raw.commentCount) || 0,
    drumScope: Math.min(3, Math.max(1, Number(raw.drumScope) || 1)) as 1 | 2 | 3,
    heatScore,
    stage: heatStageFromScore(heatScore),
    crestTier: Number(raw.crestTier) || 0,
    nkisi: 'GREEN',
    // Pass through optional media fields
    videoUrl: raw.videoUrl as string | undefined,
    videoDurationSec: raw.videoDurationSec as number | undefined,
    thumbnailUrl: raw.thumbnailUrl as string | undefined,
    imageUrls: raw.imageUrls as string[] | undefined,
    captionLocale: raw.captionLocale as string | undefined,
    audioUrl: raw.audioUrl as string | undefined,
    audioDurationSec: raw.audioDurationSec as number | undefined,
    spiritVoiceEnabled: raw.spiritVoiceEnabled as boolean | undefined,
    eventPayload: raw.eventPayload as string | undefined,
    productName: raw.productName as string | undefined,
    productPrice: raw.productPrice as number | undefined,
    location: raw.location as string | undefined,
  }
}

/** Format ISO timestamp to relative time */
function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
