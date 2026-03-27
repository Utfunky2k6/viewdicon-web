/**
 * ══════════════════════════════════════════════════════════════
 *  MOTHERLAND SOVEREIGNTY LAW
 *  These laws govern access to the Viewdicon Digital Civilization.
 *  They are enforced programmatically — not merely documented.
 *  Import and apply these laws at every sovereignty boundary.
 * ══════════════════════════════════════════════════════════════
 */

// ── The Four Laws ──────────────────────────────────────────────

export const MOTHERLAND_SOVEREIGNTY_LAW = {
  LAW_1: {
    id: 'AFRICAN_SIM_AUTO_CIRCLE_1',
    title: 'Law of the Soil',
    text: 'An African SIM card is sovereign proof of belonging. Holders are auto-assigned Circle 1 (Child of the Soil) and skip circle selection entirely.',
    enforcement: 'ceremony:skip-circles',
  },
  LAW_2: {
    id: 'NON_AFRICAN_CIRCLES_RESTRICTED',
    title: 'Law of the Journey',
    text: 'Non-African SIM holders may only enter Circle 2 (Diaspora) or Circle 3 (Ally). Circle 1 is reserved for those whose drum beats on African soil.',
    enforcement: 'ceremony:filter-circles',
  },
  LAW_3: {
    id: 'VILLAGE_REQUIRES_SOIL_OR_HERITAGE',
    title: 'Law of the Village Gate',
    text: "The 20 Villages are Africa's professional guilds, protected by sovereignty. Access requires either African soil status or completed Heritage Verification.",
    enforcement: 'ceremony:village-gate',
  },
  LAW_4: {
    id: 'HERITAGE_REQUIRED_NON_CIRCLE_1',
    title: 'Law of Heritage',
    text: 'All users not in Circle 1 must complete Heritage Verification before receiving village access. This is sovereignty, not gatekeeping.',
    enforcement: 'ceremony:heritage-required',
  },
} as const

// ── Step Arrays Governed by the Law ───────────────────────────

export type CeremonyStep = 'TERMS' | 'CIRCLES' | 'PHONE' | 'OTP' | 'HERITAGE' | 'NAMING' | 'DEVICE' | 'BIOMETRIC' | 'FAMILY' | 'VILLAGE' | 'ROLE' | 'CONFIRM' | 'CORONATION'

/** LAW 1: African SIM — no CIRCLES, no HERITAGE */
export const AFRICAN_STEPS: CeremonyStep[] = [
  'TERMS', 'PHONE', 'OTP', 'NAMING', 'DEVICE', 'BIOMETRIC', 'FAMILY', 'VILLAGE', 'ROLE', 'CONFIRM', 'CORONATION'
]

/** Circle 1 (Continental African, manual selection) — no HERITAGE needed */
export const BASE_STEPS: CeremonyStep[] = [
  'TERMS', 'PHONE', 'OTP', 'CIRCLES', 'NAMING', 'DEVICE', 'BIOMETRIC', 'FAMILY', 'VILLAGE', 'ROLE', 'CONFIRM', 'CORONATION'
]

/** Circles 2 & 3 (Diaspora + Ally) — HERITAGE required before VILLAGE */
export const HERITAGE_STEPS: CeremonyStep[] = [
  'TERMS', 'PHONE', 'OTP', 'CIRCLES', 'HERITAGE', 'NAMING', 'DEVICE', 'BIOMETRIC', 'FAMILY', 'VILLAGE', 'ROLE', 'CONFIRM', 'CORONATION'
]

// ── Enforcement Functions ──────────────────────────────────────

/**
 * Check if a user can access village selection.
 * LAW 3: Village requires African soil OR completed heritage.
 */
export function canAccessVillage(isAfrican: boolean, heritageCompleted: boolean): boolean {
  return isAfrican || heritageCompleted
}
