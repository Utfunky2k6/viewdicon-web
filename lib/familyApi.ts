// ── Family Service API Client ─────────────────────────────────
// Wraps all calls to family-service (port 3055) via the Next.js proxy.
// All requests go through /api/v1/family/* which is rewritten to http://localhost:3055.

export interface FamilyMemberInput {
  kinshipType: string
  kinshipTier?: number
  fullName: string
  nickName?: string
  memberPhone: string
  memberAfroId?: string
}

export interface FamilyMemberRecord {
  id: string
  afroId: string
  memberAfroId?: string
  memberPhone: string
  fullName: string
  nickName?: string
  kinshipType: string
  kinshipTier: 1 | 2 | 3
  verificationStatus: 'PENDING' | 'SMS_SENT' | 'VERIFIED' | 'REJECTED' | 'FAILED' | 'DECEASED'
  verifiedAt?: string
  canRecoverAccount: boolean
  canSeeIdileSkin: boolean
  receivesBloodCall: boolean
  inFamilyChat: boolean
  hasVaultKey: boolean
  isDeceased: boolean
  isActive: boolean
  addedAt: string
}

export interface FamilyTree {
  tier1: FamilyMemberRecord[]
  tier2: FamilyMemberRecord[]
  tier3: FamilyMemberRecord[]
}

export interface QuorumStatus {
  tier1Total: number
  tier1Verified: number
  recoveryPower: number  // 0-100 percent
  isReady: boolean
  members: FamilyMemberRecord[]
}

const BASE = '/api/v1/family'

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const familyApi = {
  /** Add a family member. Automatically triggers SMS verification. */
  addMember: (afroId: string, data: FamilyMemberInput) =>
    req<FamilyMemberRecord>('POST', '/members', { ...data, afroId }),

  /** Full family tree grouped by tier. */
  getTree: (afroId: string) =>
    req<FamilyTree>('GET', `/tree?afroId=${encodeURIComponent(afroId)}`),

  /** Initiate SMS verification for a family member. */
  initiateVerification: (familyMemberId: string, method: 'sms' | 'voice' = 'sms') =>
    req<{ ok: boolean }>('POST', '/verify/initiate', { familyMemberId, method }),

  /** Process verification confirmation (called from SMS link). */
  confirmVerification: (token: string, action: 'confirm' | 'reject') =>
    req<{ ok: boolean; status: string }>('POST', '/verify/confirm', { token, action }),

  /** Submit cultural answer for Tier 1 members (hashed server-side). */
  culturalVerification: (familyMemberId: string, answer: string) =>
    req<{ match: boolean }>('POST', '/verify/cultural', { familyMemberId, answer }),

  /** Recovery quorum health — how many Tier 1 are verified. */
  getQuorumStatus: (afroId: string) =>
    req<QuorumStatus>('GET', `/quorum/status?afroId=${encodeURIComponent(afroId)}`),

  /** Start account recovery — broadcasts to all verified Tier 1 via god-bus. */
  initiateRecovery: (afroId: string, deviceInfo: string, location: string) =>
    req<{ sessionId: string }>('POST', '/recovery/initiate', { afroId, deviceInfo, location }),

  /** Family member approves recovery (from family chat card). */
  approveRecovery: (recoverySessionId: string, familyMemberId: string, culturalAnswer: string) =>
    req<{ approved: boolean; message: string }>('POST', '/recovery/approve', {
      recoverySessionId, familyMemberId, culturalAnswer,
    }),

  /** Remove a family member. Returns 409 if it breaks quorum. */
  deleteMember: (id: string) =>
    req<{ ok: boolean }>('DELETE', `/members/${id}`),

  /** Request vault unlock — appears as approval card in family chat. */
  vaultUnlockRequest: (vaultItemId: string, reason: string) =>
    req<{ ok: boolean }>('POST', '/vault/unlock-request', { vaultItemId, reason }),
}
