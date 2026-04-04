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

export type PotState = 'EMBER' | 'SIMMER' | 'BOIL' | 'FEAST' | 'SHARE_OUT' | 'ASHES'

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
