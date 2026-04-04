// ============================================================
// Sòrò Sókè Feed — Shared Post Types
// Imported by all feed card components
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
  kilaCount: number
  stirCount: number
  ubuntuCount: number
  commentCount: number
  drumScope: 1 | 2 | 3
  heatScore: number
  crestTier: number
  nkisi: 'GREEN' | 'AMBER' | 'RED'
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
}
