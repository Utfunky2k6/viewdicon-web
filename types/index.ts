// ============================================================
// Afrikonnect 360 — Core Type Definitions
// ============================================================

export type HeritagCircle =
  | 'WEST_AFRICA'
  | 'EAST_AFRICA'
  | 'SOUTH_AFRICA'
  | 'CENTRAL_AFRICA'
  | 'NORTH_AFRICA'
  | 'DIASPORA'
  | 'ALLY'

export type UbuntuRank = 'SEED' | 'ROOTED' | 'ELDER' | 'SAGE'

export type NkisiState = 'GREEN' | 'AMBER' | 'RED'

export type ActiveSkin = 'WORK' | 'SOCIAL' | 'CLAN'

export type ConnectionRing =
  | 'SIT_AT_MY_FIRE'      // inner circle (🔥)
  | 'KEEP_MY_NAME'        // trusted network (🤲)
  | 'STAND_BESIDE_ME'     // extended village (🌿)

/** Ogbo Ụtụ Escrow 8-state machine — matches banking/page.tsx PotTab */
export type PotState =
  | 'CREATED'
  | 'HELD'
  | 'PENDING_VERIFICATION'
  | 'COMMITTED'
  | 'SETTLED'
  | 'REVERSED'
  | 'DISPUTED'
  | 'EXPIRED'

/** Legacy Ajo rotating-pot stages (kept for backward compat) */
export type AjoPotStage = 'EMBER' | 'SIMMER' | 'BOIL' | 'FEAST' | 'SHARE_OUT' | 'ASHES'

// ============================================================
// LAYER 1 — Afro-ID (Sacred / Private / Bank-Grade)
// Never shown publicly. Used for wallet, recovery, clan voting.
// ============================================================

export interface AfroID {
  raw: string           // NG-YOR-2764-8937 (never display raw)
  country: string       // NG
  tribe: string         // YOR
  numeric: string       // 2764-8937
  masked: string        // NG-YOR-••••-•••• (show this only)
}

export type VerificationLevel =
  | 'UNVERIFIED'
  | 'PHONE_VERIFIED'
  | 'VILLAGE_WITNESSED'   // vouched by 3+ village members
  | 'CLAN_BACKED'         // endorsed by clan elder
  | 'ELDER_STANDING'      // full identity verification

// Private core record — only visible to owner & high-trust ring
export interface AfroIdentity {
  afroId: AfroID
  verificationLevel: VerificationLevel
  palmMarkBound: boolean       // TEE device binding done
  recoveryPhraseSet: boolean
  createdAt: string
  // Only revealed to SIT_AT_MY_FIRE ring members
  phoneHash?: string
}

// ============================================================
// LAYER 2 — Public Handle (Username / Display Name)
// Searchable, shareable, URL-safe. NOT the Afro-ID.
// ============================================================

export interface PublicHandle {
  handle: string        // @amara_osei — unique, ASCII-safe, stable URL
  displayName: string   // "Amara Osei" — human name, can change, Unicode OK
  pronouns?: string
}

// ============================================================
// LAYER 3 — Contact Channel (Consent-Gated Messaging)
// "BlackBerry PIN" metaphor — request first, then unlock
// ============================================================

export type ContactRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'BLOCKED'

export interface ContactRequest {
  id: string
  fromHandle: string    // @requester
  toHandle: string      // @recipient
  message?: string      // optional intro note
  status: ContactRequestStatus
  createdAt: string
  respondedAt?: string
}

// After ACCEPTED: both sides share Afro-IDs unlocking full trust
export interface TrustHandshake {
  initiatorAfroId: AfroID
  recipientAfroId: AfroID
  completedAt: string
  ring: ConnectionRing  // which ring this connection falls into
}

// ============================================================
// Merged public-facing profile (Layer 2 surface)
// What the world sees — no Afro-ID exposed
// Fields are flattened for ergonomic access in components.
// ============================================================

export interface PublicProfile {
  id: string
  // Layer 2 identity — handle + displayName (NOT Afro-ID)
  handle: string          // @amara.yor — URL-safe, unique, searchable
  displayName: string     // "Amara Osei" — human name, Unicode OK
  username: string        // alias for handle (backwards-compat)
  pronouns?: string
  bio?: string
  avatarUrl?: string
  coverUrl?: string
  heritageCircle: HeritagCircle
  tribe?: string
  ubuntuRank: UbuntuRank
  ubuntuScore: number
  nkisiState: NkisiState
  activeSkin: ActiveSkin
  spiritualTitle?: string
  verificationLevel: VerificationLevel
  isVerified: boolean     // true when verificationLevel >= VILLAGE_WITNESSED
  ringCounts: { ring1: number; ring2: number; ring3: number; ring4: number }  // Ìdílé / Ẹgbẹ́ / Ìlú / Ìjọba
  connectionCount: number
  villageCount: number
  joinedAt: string
}

// Full profile — only available to authenticated owner
export interface UserProfile extends PublicProfile {
  afroId: AfroID           // Layer 1 masked view (raw never sent to client)
  afroIdentity: AfroIdentity
  firstName?: string       // Given name — from ceremony
  lastName?: string        // Family name — from ceremony
  fullName?: string        // Legal full name — collected at ceremony
  dateOfBirth?: string     // ISO date string YYYY-MM-DD — private
  gender?: string          // male|female|non-binary|prefer-not-to-say
  email?: string
  walletId?: string
  countryCode?: string
  languageCode?: string
  heritage?: string
  // ── Naming Ceremony fields ──
  ancestralNation?: string
  ethnicGroup?: string
  clanLineage?: string
  birthSeason?: string
  motherName?: string
  fatherName?: string
  totemAnimal?: string
  originState?: string
  originVillage?: string
  residenceCountry?: string
  residenceCity?: string
  occupation?: string
  // ── Village membership ──
  villageId?: string
  roleKey?: string
  // ── Gamification ──
  crestLevel?: number   // 1-5 badge level shown on avatar
  honorXp?: number      // total XP from honor-service
  phone?: string        // masked phone, shown in settings (never raw in public profile)
}

// ============================================================
// Connection Graph — ring-based social graph
// ============================================================

export interface ConnectionGraph {
  userId: string
  connections: Connection[]
  pendingInbound: ContactRequest[]
  pendingOutbound: ContactRequest[]
}

export interface Connection {
  id: string
  profile: PublicProfile
  ring: ConnectionRing
  connectedAt: string
  afroIdShared: boolean   // true once trust handshake completed
  sharedFires?: number    // mutual connections
}

export interface Village {
  id: string
  name: string
  archetype: VillageArchetype
  heritageCircle: HeritagCircle
  memberCount: number
  isPublic: boolean
  bannerUrl?: string
  avatarEmoji: string
  description: string
  toolDockRole?: ToolDockRole
}

export type VillageArchetype =
  | 'HEALING_CIRCLE'
  | 'CODE_FORGE'
  | 'FARM_COLLECTIVE'
  | 'GRIOT_HALL'
  | 'TRADE_POST'
  | 'ANCESTOR_SHRINE'
  | 'WAR_COUNCIL'
  | 'MUSIC_COMPOUND'
  | 'SCHOOL_OF_THOUGHT'
  | 'DIASPORA_BRIDGE'
  | 'CREATION_LAB'
  | 'GOVERNANCE_HUT'

export type ToolDockRole =
  | 'CLINIC_DESK'
  | 'CODE_FORGE'
  | 'FOUNDER_COCKPIT'
  | 'DIGITAL_GRIOT'
  | 'ANCESTRAL_DESK'
  | 'ONA_SCOPE'
  | 'FARM_BOARD'

export interface WalletBalance {
  cowries: number           // ₵ platform currency
  naira?: number
  cedi?: number
  shilling?: number
  rand?: number
}

export interface TVChannel {
  id: string
  name: string
  type: 'UMOJA_1' | 'AFRI_REALITY' | 'OPEN_RIVER'
  isLive: boolean
  viewerCount: number
  thumbnailUrl?: string
  hostId: string
  host: Pick<PublicProfile, 'avatarUrl'> & { displayName: string }
}

export type OrishaAdvisor = 'SANGO' | 'OGUN' | 'ORUNMILA' | 'OBATALA' | 'YEMOJA'

export interface ApiError {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

// ============================================================
// EVENTS SYSTEM — Canonical Types
// 3 Tiers: COMMUNITY (free) | STANDARD (paid) | ADVANCED (entertainment)
// ============================================================

export type EventTierLevel = 'COMMUNITY' | 'STANDARD' | 'ADVANCED'

export type EventType =
  // Community (free)
  | 'WEDDING' | 'FUNERAL' | 'BIRTHDAY' | 'FAMILY_REUNION' | 'RELIGIOUS'
  | 'COMMUNITY_MEETING' | 'SCHOOL' | 'LOCAL_SPORTS' | 'VILLAGE_MEETING'
  // Standard (paid ticketing)
  | 'PARTY' | 'WORKSHOP' | 'CONFERENCE' | 'TRAINING' | 'FESTIVAL'
  | 'CHURCH_PROGRAM' | 'FUNDRAISER' | 'SMALL_CONCERT'
  // Advanced (entertainment)
  | 'LARGE_CONCERT' | 'COMEDY_SHOW' | 'AWARD_SHOW' | 'FASHION_SHOW'
  | 'POLITICAL_RALLY' | 'SPORTS_EVENT' | 'TV_SHOW' | 'LIVE_SHOW'
  | 'OTHER'

export type TicketType =
  | 'FREE' | 'GENERAL' | 'VIP' | 'EARLY_BIRD' | 'LATE' | 'GROUP'
  | 'TABLE' | 'VENDOR_BOOTH' | 'DONATION' | 'BACKSTAGE' | 'STREAM'
  | 'REPLAY' | 'PARKING' | 'SHUTTLE'

export type EventTicketStatus =
  | 'ACTIVE' | 'USED' | 'RESOLD' | 'CANCELLED' | 'REFUNDED'
  | 'FRAUD_FLAGGED' | 'TRANSFERRED'

export type EventEscrowStatus =
  | 'NONE' | 'COLLECTING' | 'HELD' | 'RELEASING' | 'RELEASED' | 'REFUNDING' | 'REFUNDED'

export type GateCheckResult =
  | 'ADMIT' | 'VIP_ADMIT' | 'BACKSTAGE' | 'INVALID' | 'ALREADY_USED'
  | 'FRAUD_FLAGGED' | 'GEO_FAIL' | 'NFC_FAIL'

export interface EventTicket {
  id: string
  qrCode: string
  nfcCode: string
  ownerUserId: string
  eventId: string
  eventTitle: string
  ticketType: TicketType
  tierName: string
  status: EventTicketStatus
  resaleStatus: 'NOT_LISTED' | 'LISTED' | 'SOLD'
  resalePrice?: number
  checkInTime?: string
  checkOutTime?: string
  transferHistory: { fromUserId: string; toUserId: string; at: string }[]
  fraudFlag?: string
  price: number
  platformFee: number
  purchasedAt: string
  offlineCode: string
  eventDate: string
  venueName: string
  seatInfo?: string
}

export interface EventTierDraft {
  id?: string
  name: string
  type: TicketType
  price: number
  supply: number
  sold?: number
  available?: number
  perks: string[]
  gateLayer: 'QR' | 'NFC' | 'GEO' | 'FACE' | 'VOICE'
  resaleAllowed: boolean
  earlyBirdDeadline?: string
  discountCode?: string
  groupMinSize?: number
  description?: string
}

export interface EventStaffMember {
  id: string
  name: string
  role: string
  afroId: string
  status: 'CONFIRMED' | 'PENDING' | 'DECLINED'
  phone?: string
  emoji?: string
}

export interface EventVendor {
  id: string
  name: string
  category: string
  boothFee: number
  status: 'CONFIRMED' | 'PENDING' | 'DECLINED'
  expectedRevenue: number
  platformCut: number
  boothType?: string
}

export interface EventSponsor {
  id: string
  name: string
  tier: 'TITLE' | 'GOLD' | 'SILVER' | 'BRONZE'
  amount: number
  logoUrl?: string
}

export interface EventRevenueSummary {
  gross: number
  platformFees: number
  organizerNet: number
  vendorFees: number
  sponsorships: number
  donations: number
  escrowHeld: number
  withdrawn: number
  // legacy breakdown fields
  ticketFees?: number
  resaleFees?: number
  streamingFees?: number
  boostFees?: number
  adRevenue?: number
}

export interface PlatformEvent {
  id: string
  title: string
  description: string
  tierLevel: EventTierLevel
  eventType: EventType
  status: 'DRAFT' | 'PUBLISHED' | 'LIVE' | 'SOLD_OUT' | 'COMPLETED' | 'CANCELLED'
  coverEmoji: string
  coverImageUrl?: string
  posterUrl?: string
  date?: string
  startDate?: string
  endDate?: string
  time?: string
  timezone?: string
  venueName: string
  venueAddress?: string
  venueCoords?: { lat: number; lng: number }
  geoFenceRadius?: number
  capacity?: number
  registered?: number
  villageId: string
  villageName?: string
  villageEmoji?: string
  villageColor?: string
  hostAfroId?: string
  organizerAfroId?: string
  hostName?: string
  hostEmoji?: string
  drumScope?: 'VILLAGE' | 'NATION' | 'JOLLOF_TV'
  isVerified?: boolean
  tiers: EventTierDraft[]
  staff?: EventStaffMember[]
  sponsors?: EventSponsor[]
  vendors?: EventVendor[]
  totalTicketsSold?: number
  totalRevenue?: number
  platformRevenue?: number
  attendeeCount?: number
  escrowStatus?: EventEscrowStatus
  escrowBalance?: number
  escrowReleasableAt?: string
  streamUrl?: string
  isStreaming?: boolean
  streamViewerCount?: number
  revenue?: EventRevenueSummary
  createdAt?: string
  updatedAt?: string
}

// Platform fee calculator (frontend utility)
export function calcPlatformFee(price: number, tierLevel: EventTierLevel): number {
  if (price === 0) return 0
  if (tierLevel === 'COMMUNITY') return 0
  if (tierLevel === 'STANDARD') return Math.max(0.5, price * 0.05)
  return Math.max(1, price * 0.10)
}

export function calcOrganizerReceives(price: number, tierLevel: EventTierLevel): number {
  return price - calcPlatformFee(price, tierLevel)
}

export const TIER_CONFIG: Record<EventTierLevel, {
  label: string; emoji: string; color: string; bg: string;
  border: string; tagline: string; maxTicketFee: number
}> = {
  COMMUNITY: {
    label: 'Community', emoji: '🌳', color: '#4ade80', bg: 'rgba(74,222,128,.08)',
    border: 'rgba(74,222,128,.2)', tagline: 'Free · For everyone · No platform fee',
    maxTicketFee: 0,
  },
  STANDARD: {
    label: 'Standard', emoji: '🎫', color: '#fbbf24', bg: 'rgba(251,191,36,.08)',
    border: 'rgba(251,191,36,.2)', tagline: 'Paid tickets · 5% platform fee',
    maxTicketFee: 0.05,
  },
  ADVANCED: {
    label: 'Advanced', emoji: '🎬', color: '#c084fc', bg: 'rgba(192,132,252,.08)',
    border: 'rgba(192,132,252,.2)', tagline: 'Streaming · Broadcast · 10% platform fee',
    maxTicketFee: 0.10,
  },
}
