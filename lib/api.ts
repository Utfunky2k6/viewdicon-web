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

// ── Banking ───────────────────────────────────────────────────
export const bankingApi = {
  balance:  () => api.get('/api/banking/balance'),
  transfer: (data: unknown) => api.post('/api/banking/transfer', data),
  history:  (cursor?: string) =>
    api.get(`/api/banking/transactions${cursor ? `?cursor=${cursor}` : ''}`),
  rates:    () => api.get('/api/banking/rates'),
}

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

// ── TV/Streaming ──────────────────────────────────────────────
export const tvApi = {
  channels: () => api.get('/api/tv/channels'),
  live:     () => api.get('/api/tv/live'),
  schedule: () => api.get('/api/tv/schedule'),
  startStream: (data: unknown) => api.post('/api/tv/stream/start', data),
}

// ── AfriChat ──────────────────────────────────────────────────
export const chatApi = {
  inbox:    () => api.get('/api/chat/inbox'),
  thread:   (threadId: string) => api.get(`/api/chat/threads/${threadId}`),
  send:     (data: unknown) => api.post('/api/chat/messages', data),
  consent:  (requestId: string, accept: boolean) =>
    api.post(`/api/chat/consent/${requestId}`, { accept }),
}

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

// ── AI Advisors (Orisha) ──────────────────────────────────────
export const orishaApi = {
  query: (advisor: string, prompt: string, context?: unknown) =>
    api.post('/api/ai/orisha', { advisor, prompt, context }),
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
    api.post(`/api/jollof/streams/${streamId}/kila`, {}),
  endStream:   (streamId: string) =>
    api.post(`/api/jollof/streams/${streamId}/end`, {}),

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
  realityVote:        (showId: string, data: { contestantId: string; voterId: string; amountPaid?: number }) =>
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
    api.post('/api/jollof/subscriptions/root/plant', { creatorId, tier, cowriePerMonth }),
  lift:       (creatorId: string) =>
    api.delete(`/api/jollof/subscriptions/root/lift/${creatorId}`),
  myRoots:    () =>
    api.get<{ ok: boolean; data: unknown[] }>('/api/jollof/subscriptions/root/my-roots'),
  rootsInMe:  () =>
    api.get<{ ok: boolean; data: { free: number; paid: number; ancestral: number; planters: unknown[] } }>(
      '/api/jollof/subscriptions/root/roots-in-me'
    ),
}

// ── Cowrie Flow (Creator Monetization Dashboard) ─────────────
export const cowrieFlowApi = {
  stats:      () =>
    api.get<{ ok: boolean; data: { spraysToday: number; rootCommission: number; activeRoots: number; channelAds: number; balance: number } }>(
      '/api/jollof/creator/cowrie-flow'
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
    api.post('/api/bank/transfer', data),
  history:       (cursor?: string, type?: string) =>
    api.get<{ ok: boolean; data: unknown[]; cursor: string | null }>(
      `/api/bank/transactions?${new URLSearchParams({ ...(cursor ? { cursor } : {}), ...(type ? { type } : {}) })}`
    ),
  rates:         () => api.get<Record<string, number>>('/api/bank/rates'),
  kowe:          (txId: string) => api.get(`/api/bank/kowe/${txId}`),
  corridors:     () => api.get<{ ok: boolean; data: unknown[] }>('/api/bank/corridors'),
  openAccount:   (data: { accountType: 'CHECKING' | 'SAVINGS' | 'ESCROW'; kycTier: string; currency: string; idempotencyKey: string }) =>
    api.post('/api/bank/account/open', data),
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
  getUnlocks: (afroId: string) =>
    api.get<any>(`/api/honor/unlocks/${afroId}`),
  getVillageLife: (afroId: string, villageId: string) =>
    api.get<any>(`/api/honor/village-life/${afroId}/${villageId}`),
  getStreamEligibility: (afroId: string, villageId: string, streamType: string) =>
    api.get<any>(`/api/honor/stream-eligibility/${afroId}/${villageId}/${streamType}`),
}

// ── Rings (Social Bonds) ───────────────────────────────────────
export const ringsApi = {
  getBonds: (userId: string) =>
    api.get<any>(`/api/rings/bonds/${userId}`),
  sendInvite: (to: string) =>
    api.post<any>('/api/rings/invite', { to }),
  getInvites: () =>
    api.get<any>('/api/rings/invites'),
  acceptBond: (bondId: string) =>
    api.patch<any>(`/api/rings/bonds/${bondId}/accept`, {}),
}

// ── Business Sessions ─────────────────────────────────────────
export const sessionsApi = {
  myActive:    () => api.get<{ sessions: unknown[]; count: number }>('/api/sessions/my/active'),
  myCompleted: () => api.get<{ sessions: unknown[]; count: number; summary?: { totalSealed: number } }>('/api/sessions/my/completed'),
  getById:     (id: string) => api.get<unknown>(`/api/sessions/${id}`),
}

export { ApiError }
