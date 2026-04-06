// ============================================================
// Afrikonnect 360 — API Client
// ============================================================

const BASE = process.env.NEXT_PUBLIC_API_URL || ''
const MOCK = process.env.NEXT_PUBLIC_MOCK === 'true'

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: RequestInit = {}
): Promise<T> {
  // Read token from zustand persist (supports both accessToken and legacy token)
  let token: string | null = null
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('afk-auth')
      const state = stored ? JSON.parse(stored)?.state : null
      token = state?.accessToken ?? state?.token ?? null
    } catch {
      token = null
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Client': 'viewdicon-web/0.1.0',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers as Record<string, string> ?? {}),
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...opts,
  })

  if (!res.ok) {
    let code = 'UNKNOWN_ERROR'
    let msg = `HTTP ${res.status}`
    try {
      const err = await res.json()
      code = err?.error?.code ?? code
      msg  = err?.error?.message ?? msg
    } catch {}

    // Auto-clear session and redirect on 401 (expired/invalid token)
    if (res.status === 401 && typeof window !== 'undefined' && !path.includes('/auth/')) {
      localStorage.removeItem('afk-auth')
      localStorage.removeItem('afk_token')
      document.cookie = 'afk_token=; Max-Age=0; path=/'
      document.cookie = 'afk_ceremony_done=; Max-Age=0; path=/'
      window.location.href = '/login'
    }

    throw new ApiError(res.status, code, msg)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  get:    <T>(path: string)              => request<T>('GET', path),
  post:   <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch:  <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  put:    <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string)              => request<T>('DELETE', path),
}

// ── Auth (wired to auth-core on port 4000 via next.config rewrites) ──
export const authApi = {
  register: (data: {
    phone: string
    countryCode: string
    firstName?: string
    lastName?: string
    fullName?: string
    dateOfBirth?: string
    gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'
    heritage?: string
    heritageSelections?: string[]
    tribe?: string
    heritageCircle: 'continental' | 'diaspora' | 'ally'
    languageCode?: string
    displayName?: string
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
    altContact?: string
    voiceSignature?: string
    faceSignature?: string
    fingerprintSignature?: string
    villageId?: string
    roleKey?: string
  }) => api.post<{ userId: string; accessToken: string; refreshToken: string; message: string }>(
    '/api/v1/auth/register', data
  ),

  sendOtp: (phone: string, languageCode = 'en') =>
    api.post<{ message: string; devCode?: string }>('/api/v1/auth/send-otp', { phone, languageCode }),

  verifyPhone: (data: { phone: string; otp: string }) =>
    api.post<{ verified: boolean; message: string }>('/api/v1/auth/verify-phone', data),

  ceremonyHeartbeat: (phone: string) =>
    api.post<{ ok: boolean }>('/api/v1/auth/ceremony-heartbeat', { phone }),

  verifyOtp: (data: { phone: string; otp: string; deviceName?: string; platform?: string }) =>
    api.post<{ accessToken: string; refreshToken: string; user: Record<string, unknown> }>(
      '/api/v1/auth/verify-otp', data
    ),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>('/api/v1/auth/refresh', { refreshToken }),

  revealAfroId: () =>
    api.post<{ afroId: string }>('/api/v1/auth/reveal-afroid', {}),

  me: () =>
    api.get<Record<string, unknown>>('/api/v1/me'),

  updateMe: (data: Record<string, unknown>) =>
    api.patch<Record<string, unknown>>('/api/v1/me', data),

  loginAfroId: (data: { afroId: string; platform?: string }) =>
    api.post<{ accessToken: string; refreshToken: string; user: Record<string, unknown> }>(
      '/api/v1/auth/login/afroid', data
    ),

  logout: () => api.post('/api/v1/auth/logout', {}),
}

// ── Identity — Layer 1 (Afro-ID private core) ─────────────────
export const identityApi = {
  // Owner-only: fetch own private AfroIdentity record
  myAfroId:        () => api.get('/api/v1/identity/me'),
  // Reveal own Afro-ID to another user (trust handshake)
  initiateHandshake: (targetHandle: string) =>
    api.post('/api/v1/identity/handshake/initiate', { targetHandle }),
  acceptHandshake:   (handshakeId: string) =>
    api.post(`/api/v1/identity/handshake/${handshakeId}/accept`, {}),
  // Palm Mark device binding
  bindPalmMark:    (data: { teeKey: string; simHash: string; livenessVector: string }) =>
    api.post('/api/v1/identity/palm-mark', data),
}

// ── Profile — Layer 2 (Public Handle / Display Name) ──────────
export const profileApi = {
  // Public: fetch any profile by @handle (no Afro-ID exposed)
  get:         (handle: string) => api.get(`/api/v1/profiles/${handle}`),
  // Owner: update own display name, pronouns, bio, etc.
  update:      (data: unknown)  => api.patch('/api/v1/profiles/me', data),
  search:      (q: string)      => api.get(`/api/v1/profiles/search?q=${encodeURIComponent(q)}`),
}

// ── Connections — Layer 3 (Consent-Gated Contact Channel) ──────
export const connectionApi = {
  // Send a "Request to Connect" (BlackBerry PIN style)
  sendRequest:     (handle: string, message?: string) =>
    api.post('/api/v1/connections/request', { handle, message }),
  respondToRequest: (requestId: string, accept: boolean) =>
    api.post(`/api/v1/connections/request/${requestId}/respond`, { accept }),
  // List connections by ring
  list:            (ring?: string) =>
    api.get(`/api/v1/connections${ring ? `?ring=${ring}` : ''}`),
  // Change which ring a connection is in
  moveToRing:      (connectionId: string, ring: string) =>
    api.patch(`/api/v1/connections/${connectionId}/ring`, { ring }),
  // Pending inbound/outbound requests
  pendingInbound:  () => api.get('/api/v1/connections/requests/inbound'),
  pendingOutbound: () => api.get('/api/v1/connections/requests/outbound'),
  block:           (handle: string) => api.post('/api/v1/connections/block', { handle }),
}

// ── Feed (legacy — removed, use sorosokeApi instead) ────────

// ── Banking (use bankingExtApi + cowrieApi instead) ─────────

// ── Villages ──────────────────────────────────────────────────
export const villageApi = {
  list:   () => api.get('/api/villages'),
  get:    (id: string) => api.get(`/api/villages/${id}`),
  join:   (id: string) => api.post(`/api/villages/${id}/join`, {}),
  leave:  (id: string) => api.post(`/api/villages/${id}/leave`, {}),
  create: (data: unknown) => api.post('/api/villages', data),
  // Register user into village_memberships table (called after ceremony)
  createMembership: (data: { userAfroId: string; villageId: string; roleKey: string; isPrimary?: boolean }) =>
    api.post<{ ok: boolean; data: { id: string; userAfroId: string; villageId: string; roleKey: string } }>(
      '/api/v1/village-memberships', data
    ),
}

// ── TV/Streaming (use jollofTvApi instead) ──────────────────

// ── AfriChat (use sesoChatApi instead) ──────────────────────

// ── Masquerade Protocol ───────────────────────────────────────
export const masqueradeApi = {
  // PIN verification — returns pinToken stored in Redis 4h
  verifyPin: (pin: string) =>
    api.post<{ ok: boolean; data: { pinToken: string } }>('/api/v1/auth/pin/verify', { pin }),
  // Skin switch audit log
  switchSkin: (skin: 'ise' | 'egbe' | 'idile', pinToken?: string) =>
    api.post('/api/v1/auth/skin/switch', { skin, ...(pinToken ? { pinToken } : {}) }),
  // Village tools, filtered by crest tier
  villageTools: (villageId: string, crestTier = 0) =>
    api.get<{ ok: boolean; data: { villageId: string; crestTier: number; tools: unknown[] } }>(
      `/api/v1/villages/${villageId}/tools?crestTier=${crestTier}`
    ),
  // Connections by skin context
  connections: (skin: 'egbe' | 'ise') =>
    api.get(`/api/v1/connections?skin=${skin}`),
  // Family tree — Idile only, requires X-Pin-Token header
  familyTree: () =>
    api.get('/api/v1/family/tree'),
  // Vault — Idile only, requires X-Pin-Token header
  vaultList: () =>
    api.get('/api/v1/vault'),
  vaultCreate: (data: { type: string; description: string; clanOnly?: boolean; ipfsCid?: string }) =>
    api.post('/api/v1/vault', data),
}

// ── Soro Soke Feed Engine ─────────────────────────────────────
export const sorosokeApi = {
  villageFeed: (skinContext: string, villageId?: string | null, cursor?: string, sort?: 'hot' | 'fresh' | 'ready') => {
    const p = new URLSearchParams({ skinContext })
    if (villageId) p.set('villageId', villageId)
    if (cursor)    p.set('cursor', cursor)
    if (sort)      p.set('sort', sort)
    return api.get<{ ok: boolean; data: unknown[]; cursor: string | null }>(`/api/feed?${p}`)
  },
  nationFeed: (cursor?: string) =>
    api.get<{ ok: boolean; data: unknown[]; cursor: string | null }>(
      `/api/feed/nation${cursor ? `?cursor=${cursor}` : ''}`
    ),
  createPost: (data: { body: string; villageId: string; skinContext: string; type?: string; mediaUrls?: string[] }) =>
    api.post('/api/posts', data),
  kila:       (postId: string) => api.post(`/api/posts/${postId}/kila`, {}),
  stir:       (postId: string) => api.post(`/api/posts/${postId}/stir`, {}),
  drum:       (postId: string, data: { content: string }) =>
    api.post(`/api/posts/${postId}/drum`, data),
  ubuntu:     (postId: string) => api.post(`/api/posts/${postId}/ubuntu`, {}),
  spray:      (postId: string, data: { amount: number }) =>
    api.post(`/api/posts/${postId}/spray`, data),
  comments:   (postId: string) => api.get(`/api/posts/${postId}/comments`),
  addComment: (postId: string, body: string) =>
    api.post(`/api/posts/${postId}/comments`, { body }),
  trending:   () => api.get('/api/sorosoke/posts/hashtags/trending'),
  /** Fetch posts by a specific author (for profile) */
  userPosts: (authorId: string, cursor?: string) => {
    const p = new URLSearchParams({ authorId })
    if (cursor) p.set('cursor', cursor)
    return api.get<{ ok: boolean; data: unknown[]; cursor: string | null }>(`/api/feed?${p}`)
  },
}

// ── AI Gods API ──────────────────────────────────────────────
export const aiGodsApi = {
  list:        ()                                                  => api.get('/api/ai/gods'),
  get:         (godId: string)                                     => api.get(`/api/ai/gods/${godId}`),
  query:       (godId: string, message: string, context?: unknown) =>
    api.post('/api/ai/gods/query', { godId, message, context }),
  powers:      (godId: string)                                     => api.get(`/api/ai/gods/${godId}/powers`),
  invoke:      (godId: string, powerId: string, params?: unknown)  =>
    api.post('/api/ai/gods/power/invoke', { godId, powerId, params }),
  orchestrate: (message: string, context?: unknown)               =>
    api.post('/api/ai/gods/zeus/orchestrate', { message, context }),
  chat:        (godId: string, limit?: number)                     =>
    api.get(`/api/ai/gods/${godId}/chat${limit ? `?limit=${limit}` : ''}`),
  memory:      (godId: string)                                     =>
    api.get(`/api/ai/gods/${godId}/memory`),
}

// ── AI Advisors (Orisha) — now delegates to AI Gods ──────────
export const orishaApi = {
  query: (advisor: string, prompt: string, context?: unknown) =>
    aiGodsApi.query(advisor, prompt, context),
}

// ── Jollof TV (Streaming) ────────────────────────────────────
export const jollofTvApi = {
  list:        (params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params)}` : ''
    return api.get<{ ok: boolean; data: unknown[] }>(`/api/jollof/streams${q}`)
  },
  get:         (id: string) => api.get<{ ok: boolean; data: unknown }>(`/api/jollof/streams/${id}`),
  create:      (data: unknown) => api.post('/api/jollof/streams', data),
  reels:       () => api.get<{ ok: boolean; data: unknown[] }>('/api/jollof/reels'),
  addToPot:    (streamId: string, productId: string) =>
    api.post<{ sessionId: string; chatId: string; productSnapshot: unknown }>(
      `/api/jollof/streams/${streamId}/add-to-pot`, { productId }
    ),
  spray:       (streamId: string, amount: number) =>
    api.post(`/api/jollof/streams/${streamId}/spray`, { amount }),
  kila:        (streamId: string) =>
    api.patch(`/api/jollof/streams/${streamId}/kila`, {}),
  endStream:   (streamId: string) =>
    api.patch(`/api/jollof/streams/${streamId}/end`, {}),

  // Channels
  channels:        () => api.get<{ channels: any[] }>('/api/jollof/channels'),
  channel:         (id: string) => api.get<any>(`/api/jollof/channels/${id}`),
  updateChannel:   (id: string, data: Record<string, any>) => api.patch<any>(`/api/jollof/channels/${id}`, data),
  channelSchedule: (id: string) => api.get<{ schedules: any[] }>(`/api/jollof/channels/${id}/schedule`),
  channelPrograms: (id: string) => api.get<{ programs: any[] }>(`/api/jollof/channels/${id}/programs`),
  channelChat:     (id: string, limit = 50) => api.get<{ chats: any[] }>(`/api/jollof/channels/${id}/chat?limit=${limit}`),
  sendChat:        (channelId: string, data: { userId: string; message: string; type?: string; amountPaid?: number }) =>
    api.post<any>(`/api/jollof/channels/${channelId}/chat`, data),

  // Programs
  programs:      (params?: { channelId?: string; hostId?: string }) =>
    api.get<{ programs: any[] }>(`/api/jollof/programs${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
  program:       (id: string) => api.get<any>(`/api/jollof/programs/${id}`),
  createProgram: (data: Record<string, any>) => api.post<any>('/api/jollof/programs', data),
  bookSchedule:  (data: { channelId: string; programId?: string; startTime: string; endTime: string; price?: number; bookedBy?: string }) =>
    api.post<any>('/api/jollof/schedules/book', data),

  // Reality TV
  realityShows:       (params?: { isActive?: boolean }) =>
    api.get<{ shows: any[] }>(`/api/jollof/reality-shows${params?.isActive !== undefined ? `?isActive=${params.isActive}` : ''}`),
  realityShow:        (id: string) => api.get<any>(`/api/jollof/reality-shows/${id}`),
  realityLeaderboard: (id: string) => api.get<{ leaderboard: any[] }>(`/api/jollof/reality-shows/${id}/leaderboard`),
  realityVote:        (showId: string, data: { contestantId: string; voterId: string; amountPaid?: number; votes?: number }) =>
    api.post<any>(`/api/jollof/reality-shows/${showId}/vote`, data),

  // Audio Rooms
  audioRooms:      (params?: { villageId?: string; isLive?: boolean }) =>
    api.get<{ rooms: any[] }>(`/api/jollof/audio-rooms${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
  audioRoom:       (id: string) => api.get<any>(`/api/jollof/audio-rooms/${id}`),
  createAudioRoom: (data: { title: string; hostId: string; villageId?: string; topic?: string }) =>
    api.post<any>('/api/jollof/audio-rooms', data),
  joinAudioRoom:   (id: string, userId: string) => api.post<any>(`/api/jollof/audio-rooms/${id}/join`, { userId }),
  endAudioRoom:    (id: string) => api.patch<any>(`/api/jollof/audio-rooms/${id}/end`, {}),

  // Podcasts
  podcasts:         (params?: { villageId?: string; category?: string; creatorId?: string }) =>
    api.get<{ podcasts: any[] }>(`/api/jollof/podcasts${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
  podcast:          (id: string) => api.get<any>(`/api/jollof/podcasts/${id}`),
  createPodcast:    (data: Record<string, any>) => api.post<any>('/api/jollof/podcasts', data),
  podcastEpisodes:  (id: string) => api.get<{ episodes: any[] }>(`/api/jollof/podcasts/${id}/episodes`),
  addPodcastEpisode:(id: string, data: Record<string, any>) => api.post<any>(`/api/jollof/podcasts/${id}/episodes`, data),

  // Radio
  radioStreams: (params?: { villageId?: string; isLive?: boolean }) =>
    api.get<{ streams: any[] }>(`/api/jollof/radio${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
  createRadio:  (data: Record<string, any>) => api.post<any>('/api/jollof/radio', data),
  radioStream:  (id: string) => api.get<any>(`/api/jollof/radio/${id}`),

  // Ads
  adCampaigns:    (params?: { creatorId?: string; isActive?: boolean }) =>
    api.get<{ campaigns: any[] }>(`/api/jollof/ads/campaigns${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
  adCampaign:     (id: string) => api.get<any>(`/api/jollof/ads/campaigns/${id}`),
  createAdSlot:   (data: { channelId: string; startTime: string; endTime: string; basePrice: number }) =>
    api.post<any>('/api/jollof/ads/slots', data),
  channelAdSlots: (channelId: string) => api.get<{ slots: any[] }>(`/api/jollof/channels/${channelId}/ads/slots`),
  bookAd:         (data: { adId: string; slotId: string; costPaid: number; bookedBy?: string }) =>
    api.post<any>('/api/jollof/ads/book', data),
}

// ── Plant Your Root (Subscriptions) ──────────────────────────
export const rootApi = {
  plant:      (creatorId: string, tier: 'FREE_ROOT' | 'PAID_ROOT' | 'ANCESTRAL_ROOT', cowriePerMonth?: number) =>
    api.post('/api/jollof/roots/plant', { creatorId, tier, cowriePerMonth }),
  lift:       (creatorId: string) =>
    api.delete(`/api/jollof/roots/lift`),
  myRoots:    () =>
    api.get<{ ok: boolean; data: unknown[] }>('/api/jollof/roots/mine'),
  rootsInMe:  () =>
    api.get<{ ok: boolean; data: { free: number; paid: number; ancestral: number; planters: unknown[] } }>(
      '/api/jollof/roots/in-me'
    ),
}

// ── Cowrie Flow (Creator Monetization Dashboard) ─────────────
export const cowrieFlowApi = {
  stats:      (afroId: string) =>
    api.get<{ ok: boolean; data: { spraysToday: number; rootCommission: number; activeRoots: number; channelAds: number; balance: number } }>(
      `/api/cowrie-flow/summary/${afroId}`
    ),
  withdraw:   (amount: number) =>
    api.post('/api/jollof/creator/withdraw', { amount }),
  sprays:     () =>
    api.get<{ ok: boolean; data: unknown[] }>('/api/jollof/creator/sprays'),
  roots:      () =>
    api.get<{ ok: boolean; data: unknown[] }>('/api/jollof/creator/roots'),
  potHistory: () =>
    api.get<{ ok: boolean; data: unknown[] }>('/api/jollof/creator/pot-history'),
}

// ── Seso Chat (consent-gated messaging) ──────────────────────
export const sesoChatApi = {
  listChats:        () => api.get<{ ok: boolean; data: unknown[] }>('/api/seso/chats'),
  getChat:          (chatId: string) => api.get(`/api/seso/chats/${chatId}`),
  sendMessage:      (chatId: string, data: { body: string; type?: string }) =>
    api.post(`/api/seso/messages`, { chatId, ...data }),
  listMessages:     (chatId: string, cursor?: string) =>
    api.get<{ ok: boolean; data: unknown[]; cursor: string | null }>(
      `/api/seso/messages?chatId=${chatId}${cursor ? `&cursor=${cursor}` : ''}`
    ),
  react:            (messageId: string, emoji: string) =>
    api.post(`/api/seso/messages/${messageId}/react`, { emoji }),
  translate:        (messageId: string, targetLang: string) =>
    api.post(`/api/seso/messages/${messageId}/translate`, { targetLang }),
  sendWhisper:      (targetHandle: string, message: string, skin: string) =>
    api.post('/api/seso/requests', { targetHandle, message, skin }),
  respondToWhisper: (requestId: string, action: 'accept' | 'decline' | 'block') =>
    api.post(`/api/seso/requests/${requestId}/respond`, { action }),
  listConnections:  () => api.get('/api/seso/connections'),
  startBusiness:    (participantId: string, subject: string) =>
    api.post('/api/seso/business', { participantId, subject }),
  markRead:         (chatId: string) =>
    api.post(`/api/seso/chats/${chatId}/read`, {}),
  createChat:       (data: { participantIds: string[]; type?: string }) =>
    api.post('/api/seso/chats', data),
  deleteChat:       (chatId: string) =>
    api.delete(`/api/seso/chats/${chatId}`),
  updateTrust:      (chatId: string, tier: string) =>
    api.post(`/api/seso/chats/${chatId}/trust`, { tier }),
  blockUser:        (userId: string) =>
    api.post(`/api/seso/connections/${userId}/block`, {}),
}

// ── Ajo 3.0 (Rotating Savings Circles) ───────────────────────
export const ajoApi = {
  list:          () => api.get<{ ok: boolean; data: unknown[] }>('/api/bank/ajo/circles'),
  get:           (circleId: string) => api.get(`/api/bank/ajo/circle/${circleId}`),
  create:        (data: {
    circleName: string; memberAccountIds: string[]; contributionAmount: number;
    currency: string; frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'; startDate: string;
    idempotencyKey: string
  }) => api.post('/api/bank/ajo/circle/create', data),
  contribute:    (circleId: string, amount: number) =>
    api.post(`/api/bank/ajo/circle/${circleId}/contribute`, { amount }),
  myCircles:     () => api.get<{ ok: boolean; data: unknown[] }>('/api/bank/ajo/my-circles'),
}

// ── Ogbo Ụtụ Honour Escrow ────────────────────────────────────
export const escrowApi = {
  list:          () => api.get<{ ok: boolean; data: unknown[] }>('/api/bank/escrow/list'),
  get:           (escrowId: string) => api.get(`/api/bank/escrow/${escrowId}`),
  create:        (data: { buyerAccountId: string; sellerAccountId: string; amount: number; currency: string; description: string; proofOfHandType: string }) =>
    api.post('/api/bank/escrow/create', data),
  approve:       (escrowId: string, role: 'buyer' | 'seller') =>
    api.post(`/api/bank/escrow/${escrowId}/approve`, { role }),
  submitProof:   (escrowId: string, proofType: string, proofData: unknown) =>
    api.post(`/api/bank/escrow/${escrowId}/proof`, { proofType, proofData }),
  release:       (escrowId: string) => api.post(`/api/bank/escrow/${escrowId}/release`, {}),
  dispute:       (escrowId: string, reason: string) =>
    api.post(`/api/bank/escrow/${escrowId}/dispute`, { reason }),
  split:         (escrowId: string, splits: Record<string, { accountId: string; share: number; amount: number }>) =>
    api.post('/api/bank/escrow/split', { escrowAccountId: escrowId, splits }),
}

// ── Cowrie Mesh (Offline BLE/NFC P2P) ────────────────────────
export const meshApi = {
  generateVoucher: (amount: number, currency: string) =>
    api.post<{ voucherId: string; qrCode: string; expiresAt: string }>(
      '/api/bank/mesh/voucher/generate', { amount, currency }
    ),
  redeemVoucher:   (voucherId: string, recipientAccountId: string) =>
    api.post('/api/bank/mesh/voucher/redeem', { voucherId, recipientAccountId }),
  pendingVouchers: () =>
    api.get<{ ok: boolean; data: unknown[] }>('/api/bank/mesh/vouchers/pending'),
  peerTransfer:    (data: { recipientAfroId: string; amount: number; currency: string; bluetoothSignature: string }) =>
    api.post('/api/bank/mesh/peer-transfer', data),
}

// ── TLP (Talking Lock-up Protocol) ────────────────────────────
export const tlpApi = {
  lockFunds:     (data: { accountId: string; amount: number; unlockCondition: string; releaseDate?: string }) =>
    api.post('/api/bank/tlp/lock', data),
  unlock:        (lockId: string, proof: unknown) =>
    api.post(`/api/bank/tlp/${lockId}/unlock`, { proof }),
  myLocks:       () => api.get<{ ok: boolean; data: unknown[] }>('/api/bank/tlp/my-locks'),
}

// ── Harambee Community Pools ──────────────────────────────────
export const harambeeApi = {
  list:       (villageId?: string) =>
    api.get<{ ok: boolean; data: unknown[] }>(
      `/api/bank/harambee/pools${villageId ? `?villageId=${villageId}` : ''}`
    ),
  create:     (data: { title: string; goalCowrie: number; organiser?: string; scope?: string; villageId?: string; emoji?: string; description?: string }) =>
    api.post('/api/bank/harambee/create', data),
  contribute: (poolId: string, afroId: string, amountCowrie: number) =>
    api.post(`/api/bank/harambee/${poolId}/contribute`, { afroId, amountCowrie }),
}

// ── Virtual & Physical Cards ──────────────────────────────────
export const cardApi = {
  list:      () =>
    api.get<{ ok: boolean; data: unknown[] }>('/api/bank/cards'),
  create:    (data: { accountId: string; tier: string; currency?: string }) =>
    api.post('/api/bank/cards/create', data),
  topUp:     (cardId: string, amount: number, fromAccountId: string) =>
    api.post(`/api/bank/cards/${cardId}/topup`, { amount, fromAccountId }),
  freeze:    (cardId: string) =>
    api.post(`/api/bank/cards/${cardId}/freeze`, {}),
  unfreeze:  (cardId: string) =>
    api.post(`/api/bank/cards/${cardId}/unfreeze`, {}),
  setLimit:  (cardId: string, dailyLimit: number, monthlyLimit: number) =>
    api.post(`/api/bank/cards/${cardId}/limit`, { dailyLimit, monthlyLimit }),
  details:   (cardId: string) =>
    api.get(`/api/bank/cards/${cardId}`),
}

// ── CowrieChain L2 Bridge ─────────────────────────────────────
export const chainApi = {
  bridgeIn:      (amount: number, fromCurrency: string) =>
    api.post('/api/bank/chain/bridge-in', { amount, fromCurrency }),
  bridgeOut:     (amount: number, toCurrency: string, toAddress: string) =>
    api.post('/api/bank/chain/bridge-out', { amount, toCurrency, toAddress }),
  chainBalance:  () => api.get<{ ok: boolean; data: { afc: number; cwr: number; nativeAfro: number } }>('/api/bank/chain/balance'),
  recentBlocks:  () => api.get<{ ok: boolean; data: unknown[] }>('/api/bank/chain/blocks/recent'),
  validators:    () => api.get<{ ok: boolean; data: { active: number; total: number; finality: string } }>('/api/bank/chain/validators'),
}

// ── Extended Banking (Transfers, Rates, Ledger) ───────────────
export const bankingExtApi = {
  balance:       (accountId?: string) =>
    api.get<{ cowrie: number; afcoin: number; escrowLocked: number; tlpLocked: number }>(
      `/api/bank/account${accountId ? `/${accountId}/balance` : '/balance'}`
    ),
  transfer:      (data: { toHandle: string; amount: number; currency: string; memo?: string; rail?: string }) =>
    api.post('/api/bank/transfer-direct', data),
  history:       (cursor?: string, type?: string) =>
    api.get<{ ok: boolean; data: unknown[]; cursor: string | null }>(
      `/api/bank/ledger/transactions?${new URLSearchParams({ ...(cursor ? { cursor } : {}), ...(type ? { type } : {}) })}`
    ),
  rates:         () => api.get<Record<string, number>>('/api/bank/ledger/rates'),
  kowe:          (txId: string) => api.get(`/api/bank/ledger/kowe/${txId}`),
  corridors:     () => api.get<{ ok: boolean; data: unknown[] }>('/api/bank/reserve/corridors'),
  openAccount:   (data: { accountType: 'CHECKING' | 'SAVINGS' | 'ESCROW'; kycTier: string; currency: string; idempotencyKey: string }) =>
    api.post('/api/bank/account/open', data),
}

// ── Cowrie Union (dual-currency wallet) ──────────────────────
export const cowrieApi = {
  balance: (afroId: string) =>
    fetch(`/api/cowrie/balance?afroId=${encodeURIComponent(afroId)}`).then(r => r.json()),
  transfer: (from: string, to: string, amount: number, currency: string, reason: string, pocket?: string) =>
    fetch('/api/cowrie/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromAfroId: from, toAfroId: to, amount, currency, reason, pocket }),
    }).then(r => r.json()),
  ledger: (afroId: string, limit = 50) =>
    fetch(`/api/cowrie/ledger?afroId=${encodeURIComponent(afroId)}&limit=${limit}`).then(r => r.json()),
  claimDrop: (code: string, claimerAfroId: string) =>
    fetch('/api/cowrie/claim-drop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, claimerAfroId }),
    }).then(r => r.json()),
  generateDrop: (afroId: string, amount: number, currency: string, note: string) =>
    fetch('/api/cowrie/generate-drop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ afroId, amount, currency, note }),
    }).then(r => r.json()),
}

// ── Ogbo Ụtụ Pot Engine ───────────────────────────────────────
export const ogboApi = {
  create: (data: { title: string; amount: number; currency: string; buyerAfroId: string; sellerAfroId: string; terms: string }) =>
    fetch('/api/ogbo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  get: (potId: string) => fetch(`/api/ogbo?potId=${potId}`).then(r => r.json()),
  submitProof: (potId: string, proofType: string, proofData: string) =>
    fetch(`/api/ogbo/${potId}/proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proofType, proofData }),
    }).then(r => r.json()),
}

// ── Corridor Banks (Interbank Transfers) ──────────────────────
export const corridorBanksApi = {
  allBanks: () => api.get('/api/bank/corridor-banks/banks'),
  banksByCountry: (countryCode: string) => api.get(`/api/bank/corridor-banks/banks/${countryCode}`),
  interbankTransfer: (data: {
    fromAfroId: string; toBank: string; toBankAccount: string; toAccountName: string;
    amount: number; currency: string; reason: string; rail?: string
  }) => api.post('/api/bank/corridor-banks/interbank-transfer', data),
}

// ── Esusu Clock (Rotating Savings) ────────────────────────────
export const esusuClockApi = {
  cycles: () => api.get('/api/bank/esusu-clock/cycles'),
  myCycles: () => api.get('/api/bank/esusu-clock/my-cycles'),
  join: (cycleKey: string, afroId: string, contributionAmount: number) =>
    api.post('/api/bank/esusu-clock/join', { cycleKey, afroId, contributionAmount }),
  contribute: (cycleId: string, afroId: string, amount: number) =>
    api.post(`/api/bank/esusu-clock/contribute/${cycleId}`, { afroId, amount }),
}

// ── Ancestral Buffer (Emergency Reserve) ──────────────────────
export const ancestralBufferApi = {
  status: () => api.get('/api/bank/ancestral-buffer/status'),
  history: () => api.get('/api/bank/ancestral-buffer/history'),
  tap: (afroId: string, amount: number, reason: string, tier: string) =>
    api.post('/api/bank/ancestral-buffer/tap', { afroId, amount, reason, tier }),
}

// ── Griot Credit Score ────────────────────────────────────────
export const griotCreditApi = {
  score: (afroId: string) => api.get(`/api/bank/griot-credit/score?afroId=${encodeURIComponent(afroId)}`),
  factors: () => api.get('/api/bank/griot-credit/factors'),
  share: (afroId: string) => api.post('/api/bank/griot-credit/share', { afroId }),
}

// ── Village Applications (Circle 3 Friend/Ally access) ────────
export const villageApplicationApi = {
  submit: (data: { villageId: string; personalConnection: string; quizScore: number; quizAnswers: unknown; contributionPlan: string }) =>
    api.post<{ ok: boolean; applicationId: string }>('/api/v1/village-applications', data),
  myApplications: () =>
    api.get<{ ok: boolean; data: unknown[] }>('/api/v1/village-applications/me'),
  endorse: (applicationId: string, data: { endorserAfroId: string; note?: string }) =>
    api.post(`/api/v1/village-applications/${applicationId}/endorse`, data),
}

// ── Honor Service ─────────────────────────────────────────────
export const honorApi = {
  getProfile: (afroId: string) =>
    api.get<any>(`/api/honor/${afroId}`),
  getTiers: () =>
    api.get<any>('/api/honor/tiers'),
  getUnlocks: (tier?: number) =>
    api.get<any>(`/api/honor/unlocks${tier ? `?tier=${tier}` : ''}`),
  getVillageLife: (afroId: string, villageId: string) =>
    api.get<any>(`/api/honor/village-life/${afroId}/${villageId}`),
  getStreamEligibility: (afroId: string, villageId: string, streamType: string) =>
    api.get<any>(`/api/honor/stream-eligibility/${afroId}/${villageId}/${streamType}`),
}

// ── Rings (Social Bonds) ───────────────────────────────────────
export const ringsApi = {
  getBonds: (userId: string) =>
    api.get<any>(`/api/rings/${userId}`),
  sendInvite: (data: { fromAfroId: string; toAfroId: string; proposedLevel: string; message?: string } | string) =>
    api.post<any>('/api/rings/invite', typeof data === 'string' ? { fromAfroId: data, toAfroId: data, proposedLevel: 'IJOBA' } : data),
  getInvites: () =>
    api.get<any>('/api/rings/invites'),
  acceptBond: (invitationId: string) =>
    api.post<any>('/api/rings/accept', { invitationId }),
}

// ── Business Sessions ─────────────────────────────────────────
export const sessionsApi = {
  myActive:    () => api.get<{ sessions: unknown[]; count: number }>('/api/sessions/my/active'),
  myCompleted: () => api.get<{ sessions: unknown[]; count: number; summary?: { totalSealed: number } }>('/api/sessions/my/completed'),
  getById:     (id: string) => api.get<unknown>(`/api/sessions/${id}`),
}

// ── Events (Event-Engine on port 3058) ─────────────────────────
export const eventsApi = {
  // Listing & CRUD
  list: (params?: { villageId?: string; category?: string; tierLevel?: string; status?: string; limit?: number }) => {
    const q = params ? '?' + new URLSearchParams(Object.entries(params).filter(([,v]) => v != null).map(([k,v]) => [k, String(v)])) : ''
    return api.get<{ success: boolean; events: unknown[] }>(`/api/events${q}`)
  },
  get: (eventId: string) =>
    api.get<{ success: boolean; event: unknown }>(`/api/events/${eventId}`),
  create: (data: unknown) =>
    api.post<{ success: boolean; eventId: string; id?: string }>('/api/events', data),
  update: (eventId: string, data: unknown) =>
    api.patch<{ success: boolean }>(`/api/events/${eventId}`, data),
  publish: (eventId: string) =>
    api.post<{ success: boolean }>(`/api/events/${eventId}/publish`, {}),
  cancel: (eventId: string, reason: string) =>
    api.post<{ success: boolean }>(`/api/events/${eventId}/cancel`, { reason }),

  // Tickets
  buyTicket: (eventId: string, data: { tierId?: string; tierName?: string; quantity: number; buyerAfroId: string; paymentMethod?: string }) =>
    api.post<{ success: boolean; tickets: unknown[]; ticketHash?: string; escrowId?: string; totalCharged?: number; platformFee?: number }>(`/api/events/${eventId}/ticket/buy`, data),
  myTickets: () =>
    api.get<{ success: boolean; tickets: unknown[] }>('/api/tickets/mine'),
  getTicket: (ticketId: string) =>
    api.get<{ success: boolean; ticket: unknown }>(`/api/tickets/${ticketId}`),
  transferTicket: (ticketId: string, toAfroId: string) =>
    api.post<{ success: boolean }>(`/api/tickets/${ticketId}/transfer`, { toAfroId }),
  listForResale: (ticketId: string, askingPrice: number) =>
    api.post<{ success: boolean }>(`/api/tickets/${ticketId}/resale/list`, { askingPrice }),
  buyResale: (ticketId: string, buyerAfroId: string) =>
    api.post<{ success: boolean; ticket: unknown; platformFee?: number }>(`/api/tickets/${ticketId}/resale/buy`, { buyerAfroId }),
  reportFraud: (ticketId: string, reason: string) =>
    api.post<{ success: boolean }>(`/api/tickets/${ticketId}/fraud`, { reason }),

  // Gate Guardian
  verify: (eventId: string, data: { ticketCode: string; gateId?: string; coords?: { lat: number; lng: number }; deviceId?: string; nfc?: boolean }) =>
    api.post<{ success: boolean; result: string; ticket?: unknown; message?: string }>(`/api/events/${eventId}/verify`, data),
  syncGate: (eventId: string) =>
    api.get<{ success: boolean; event: unknown; tierCount: number; totalTickets: number }>(`/api/events/${eventId}`),

  // Organizer
  analytics: (eventId: string) =>
    api.get<{ success: boolean; analytics: unknown }>(`/api/events/${eventId}/analytics`),
  releaseEscrow: (eventId: string) =>
    api.post<{ success: boolean; amountReleased: number }>(`/api/events/${eventId}/escrow/release`, {}),
  exportAttendees: (eventId: string) =>
    api.get<unknown>(`/api/events/${eventId}/attendees/export`),
  addStaff: (eventId: string, staff: { afroId: string; role: string; name: string }) =>
    api.post<{ success: boolean }>(`/api/events/${eventId}/staff`, staff),
  addSponsor: (eventId: string, sponsor: { name: string; tier: string }) =>
    api.post<{ success: boolean }>(`/api/events/${eventId}/sponsors`, sponsor),

  // Social
  boost: (eventId: string, data: { budget: number; durationDays: number }) =>
    api.post<{ success: boolean; boostId: string }>(`/api/events/${eventId}/boost`, data),
  drumToFeed: (eventId: string) =>
    api.post<{ success: boolean }>(`/api/events/${eventId}/drum`, {}),
  donate: (eventId: string, amount: number) =>
    api.post<{ success: boolean }>(`/api/events/${eventId}/donate`, { amount }),
  rsvp: (eventId: string) =>
    api.post<{ success: boolean }>(`/api/events/${eventId}/rsvp`, {}),

  // Vendors
  registerVendor: (eventId: string, data: { businessName: string; boothType: string; description: string }) =>
    api.post<{ success: boolean; vendorId: string; fee: number }>(`/api/events/${eventId}/vendors`, data),

  // Streaming (Advanced tier)
  startStream: (eventId: string, data: { rtmpUrl?: string; title: string }) =>
    api.post<{ success: boolean; streamId: string; rtmpIngest?: string }>(`/api/events/${eventId}/stream/start`, data),
  endStream: (eventId: string) =>
    api.post<{ success: boolean }>(`/api/events/${eventId}/stream/end`, {}),

  // Waiting compound
  joinWaiting: (eventId: string, tierId: string) =>
    api.post<{ success: boolean; position: number }>(`/api/events/${eventId}/waiting`, { tierId }),
}

// ── Love World API ────────────────────────────────────────────
export const loveWorldApi = {
  // Profiles
  createProfile: (data: any) => api.post<any>('/api/love/profiles', data),
  getMyProfile: () => api.get<any>('/api/love/profiles/me'),
  updateProfile: (data: any) => api.patch<any>('/api/love/profiles/me', data),
  getProfile: (afroId: string) => api.get<any>(`/api/love/profiles/${afroId}`),
  pauseProfile: () => api.post<any>('/api/love/profiles/me/pause', {}),
  resumeProfile: () => api.post<any>('/api/love/profiles/me/resume', {}),

  // Genotype
  getGenotype: () => api.get<any>('/api/love/genotype/me'),
  submitGenotype: (data: { genotype: string; verification?: string; labDocUrl?: string }) =>
    api.post<any>('/api/love/genotype', data),
  updateGenotype: (data: any) => api.patch<any>('/api/love/genotype', data),

  // Verification
  getVerification: () => api.get<any>('/api/love/verification/me'),
  verifyPhoto: (photoUrl: string) => api.post<any>('/api/love/verification/photo', { photoUrl }),
  verifyVideo: () => api.post<any>('/api/love/verification/video', {}),
  verifyVillageVouch: () => api.post<any>('/api/love/verification/village-vouch', {}),

  // Matching
  getMatchQueue: () => api.get<any>('/api/love/matches/queue'),
  getMatches: (status?: string) => api.get<any>(`/api/love/matches${status ? `?status=${status}` : ''}`),
  getMatch: (matchId: string) => api.get<any>(`/api/love/matches/${matchId}`),
  acceptMatch: (candidateId: string) => api.post<any>(`/api/love/matches/${candidateId}/accept`, {}),
  declineMatch: (matchId: string) => api.post<any>(`/api/love/matches/${matchId}/decline`, {}),
  refreshQueue: () => api.post<any>('/api/love/matches/refresh', {}),

  // Cultural Wall (Station 1)
  getWallPosts: (matchId: string) => api.get<any>(`/api/love/matches/${matchId}/wall`),
  createWallPost: (matchId: string, data: { mediaType?: string; content?: string; mediaUrl?: string; promptId?: string }) =>
    api.post<any>(`/api/love/matches/${matchId}/wall`, data),
  kilaWallPost: (matchId: string, postId: string) =>
    api.post<any>(`/api/love/matches/${matchId}/wall/${postId}/kila`, {}),
  getWallPrompts: (matchId: string) => api.get<any>(`/api/love/matches/${matchId}/wall/prompts`),

  // Guided Chat (Station 2)
  getChatMessages: (matchId: string) => api.get<any>(`/api/love/matches/${matchId}/chat`),
  sendChatMessage: (matchId: string, data: { content: string; isIcebreaker?: boolean; icebreakerPrompt?: string }) =>
    api.post<any>(`/api/love/matches/${matchId}/chat`, data),
  getIcebreakers: (matchId: string) => api.get<any>(`/api/love/matches/${matchId}/chat/icebreakers`),

  // Virtual Dates (Station 3)
  getDates: (matchId: string) => api.get<any>(`/api/love/matches/${matchId}/dates`),
  scheduleDate: (matchId: string, data: { dateType?: string; scheduledAt: string }) =>
    api.post<any>(`/api/love/matches/${matchId}/dates`, data),
  updateDate: (matchId: string, dateId: string, action: 'start' | 'end') =>
    api.patch<any>(`/api/love/matches/${matchId}/dates/${dateId}`, { action }),
  rateDate: (matchId: string, dateId: string, data: { rating: number; reflection?: string }) =>
    api.post<any>(`/api/love/matches/${matchId}/dates/${dateId}/rate`, data),

  // Stations
  getStationStatus: (matchId: string) => api.get<any>(`/api/love/matches/${matchId}/station`),
  getStationChecklist: (matchId: string) => api.get<any>(`/api/love/matches/${matchId}/station/checklist`),
  advanceStation: (matchId: string) => api.post<any>(`/api/love/matches/${matchId}/station/advance`, {}),

  // Reports
  fileReport: (data: { targetAfroId: string; matchId?: string; flagType: string; description?: string }) =>
    api.post<any>('/api/love/report', data),

  // Question Engine (200-Question System)
  getStationQuestionData: (matchId: string, station: number) =>
    api.get<any>(`/api/love/questions/${matchId}/station/${station}`),
  submitAnswer: (matchId: string, data: { questionId: string; station: number; answerType: string; mcqChoice?: string; textAnswer?: string; scaleValue?: number; explanation?: string }) =>
    api.post<any>(`/api/love/questions/${matchId}/answer`, data),
  getRevealedAnswers: (matchId: string, station?: number) =>
    api.get<any>(`/api/love/questions/${matchId}/answers${station ? `?station=${station}` : ''}`),
  getQuestionProgress: (matchId: string) =>
    api.get<any>(`/api/love/questions/${matchId}/progress`),
  startDailySession: (matchId: string, station: number) =>
    api.post<any>(`/api/love/questions/${matchId}/session`, { station }),

  // Journey (Treasure Map + Wedding + Counselor)
  getTreasureMap: (matchId: string) =>
    api.get<any>(`/api/love/journey/${matchId}/map`),
  addMilestone: (matchId: string, data: { milestone: string; title: string; description?: string; photoUrl?: string; locationName?: string }) =>
    api.post<any>(`/api/love/journey/${matchId}/map`, data),
  getWeddingPlan: (matchId: string) =>
    api.get<any>(`/api/love/journey/${matchId}/wedding`),
  updateWeddingPlan: (matchId: string, data: any) =>
    api.patch<any>(`/api/love/journey/${matchId}/wedding`, data),
  getCounselorLogs: (matchId: string) =>
    api.get<any>(`/api/love/journey/${matchId}/counselor`),
  requestCounselor: (matchId: string, type: string) =>
    api.post<any>(`/api/love/journey/${matchId}/counselor/request`, { type }),
}

// ── Kerawa Zone API ────────────────────────────────────────────
export const kerawaApi = {
  // Profiles
  createProfile: (data: any) => api.post<any>('/api/kerawa/profiles', data),
  getMyProfile: () => api.get<any>('/api/kerawa/profiles/me'),
  updateProfile: (data: any) => api.patch<any>('/api/kerawa/profiles/me', data),
  getProfile: (afroId: string) => api.get<any>(`/api/kerawa/profiles/${afroId}`),

  // Matching
  discover: (params?: { zone?: string; mood?: string }) => api.get<any>(`/api/kerawa/matches/discover${params?.zone ? `?zone=${params.zone}` : ''}${params?.mood ? `${params?.zone ? '&' : '?'}mood=${params.mood}` : ''}`),
  connect: (targetAfroId: string) => api.post<any>(`/api/kerawa/matches/${targetAfroId}/connect`, {}),
  extendMatch: (matchId: string) => api.post<any>(`/api/kerawa/matches/${matchId}/extend`, {}),
  getMatches: () => api.get<any>('/api/kerawa/matches'),
  getMatch: (matchId: string) => api.get<any>(`/api/kerawa/matches/${matchId}`),

  // Messages
  sendMessage: (matchId: string, data: { content: string; mediaUrl?: string; mediaType?: string; isViewOnce?: boolean }) => api.post<any>(`/api/kerawa/matches/${matchId}/messages`, data),
  getMessages: (matchId: string) => api.get<any>(`/api/kerawa/matches/${matchId}/messages`),
  viewMessage: (messageId: string) => api.post<any>(`/api/kerawa/messages/${messageId}/view`, {}),

  // Escrow
  depositEscrow: (data: { matchId: string; amount: number; meetupLocation?: string; scheduledAt?: string }) => api.post<any>('/api/kerawa/escrow/deposit', data),
  acceptEscrow: (escrowId: string) => api.post<any>(`/api/kerawa/escrow/${escrowId}/accept`, {}),
  checkinEscrow: (escrowId: string, data: { lat: number; lng: number }) => api.post<any>(`/api/kerawa/escrow/${escrowId}/checkin`, data),
  disputeEscrow: (escrowId: string) => api.post<any>(`/api/kerawa/escrow/${escrowId}/dispute`, {}),
  getMyEscrows: () => api.get<any>('/api/kerawa/escrow/my'),

  // Consent
  giveConsent: (data: { matchId: string; type: string }) => api.post<any>('/api/kerawa/consent', data),
  revokeConsent: (consentId: string) => api.post<any>(`/api/kerawa/consent/${consentId}/revoke`, {}),
  getMatchConsents: (matchId: string) => api.get<any>(`/api/kerawa/consent/match/${matchId}`),

  // Content
  uploadContent: (data: { type: string; mediaUrl: string; price?: number }) => api.post<any>('/api/kerawa/content', data),
  getMyContent: () => api.get<any>('/api/kerawa/content/my'),
  getContent: (contentId: string) => api.get<any>(`/api/kerawa/content/${contentId}`),
  unlockContent: (contentId: string) => api.post<any>(`/api/kerawa/content/${contentId}/unlock`, {}),
  tipContent: (contentId: string, data: { amount: number }) => api.post<any>(`/api/kerawa/content/${contentId}/tip`, data),

  // Rooms
  createRoom: (data: { type: string; title: string; entryPrice?: number }) => api.post<any>('/api/kerawa/rooms', data),
  getRooms: () => api.get<any>('/api/kerawa/rooms'),
  joinRoom: (roomId: string) => api.post<any>(`/api/kerawa/rooms/${roomId}/join`, {}),
  endRoom: (roomId: string) => api.post<any>(`/api/kerawa/rooms/${roomId}/end`, {}),

  // Safety
  panic: (data: { lat: number; lng: number; matchId?: string }) => api.post<any>('/api/kerawa/panic', data),
  report: (data: { targetAfroId: string; flagType: string; description?: string }) => api.post<any>('/api/kerawa/report', data),
  getTrustScore: (afroId: string) => api.get<any>(`/api/kerawa/trust/${afroId}`),

  // Zones
  getZones: () => api.get<any>('/api/kerawa/zones'),
  getHeatmap: () => api.get<any>('/api/kerawa/zones/heatmap'),
  getSafeSpots: () => api.get<any>('/api/kerawa/zones/safe-spots'),
}

export { ApiError }
