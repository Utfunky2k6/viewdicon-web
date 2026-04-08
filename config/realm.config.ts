/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  REALM CONFIG — SINGLE SOURCE OF TRUTH                      ║
 * ║                                                              ║
 * ║  This file is the only permitted definition of realm         ║
 * ║  identity: names, icons, taglines, colors, descriptions.     ║
 * ║                                                              ║
 * ║  ALL UI layers consume from here.                            ║
 * ║  No hardcoded duplicates anywhere else in the codebase.      ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Canonical structure:
 *   Heart & Soul (section)
 *     💛  UFÈ · Love World          — Ritual matching · 200 Qs · Stage machine
 *     🔥  KÈRÉWÀ · Social Zone      — Casual connections · Events · Escrow
 *     🤝  ÀJỌ CONNECT               — Services · Skills · Mentors · Circle
 */

export type RealmId = 'ufe' | 'kerawa' | 'ajo'

export interface RealmDef {
  /** Internal identifier */
  id: RealmId
  /** Primary display name — used in headers, nav, cards */
  name: string
  /** Sub-label following the name */
  subtitle: string
  /** Full combined label e.g. "UFÈ · Love World" */
  label: string
  /** Single emoji icon — never changes */
  icon: string
  /** One-line description — used in entry cards and marketing */
  description: string
  /** Route path */
  href: string
  /** CSS hex accent colour */
  accent: string
  /** Muted variant of accent (rgba at ~10% opacity) */
  accentMuted: string
  /** Deep surface background */
  surface: string
  /** Card background */
  card: string
  /** Subscription price in USD */
  priceUSD: number
  /** Storage key for subscription state */
  storageKey: string
}

/* ─── THE ONLY PERMITTED REALM DEFINITIONS ─── */

export const REALMS: RealmDef[] = [
  {
    id: 'ufe',
    name: 'UFÈ',
    subtitle: 'Love World',
    label: 'UFÈ · Love World',
    icon: '💛',
    description: 'Ritual matching · 200 Qs · Stage machine',
    href: '/dashboard/love/ufe',
    accent: '#c9a55c',
    accentMuted: 'rgba(201,165,92,0.10)',
    surface: '#0c0904',
    card: '#14110a',
    priceUSD: 29.99,
    storageKey: 'realm_love_sub_v1',
  },
  {
    id: 'kerawa',
    name: 'KÈRÉWÀ',
    subtitle: 'Social Zone',
    label: 'KÈRÉWÀ · Social Zone',
    icon: '🔥',
    description: 'Casual connections · Events · Escrow',
    href: '/dashboard/love/kerawa',
    accent: '#e8627a',
    accentMuted: 'rgba(232,98,122,0.10)',
    surface: '#0c0406',
    card: '#14080d',
    priceUSD: 9.99,
    storageKey: 'realm_kerawa_sub_v1',
  },
  {
    id: 'ajo',
    name: 'ÀJỌ CONNECT',
    subtitle: 'Services & Skills',
    label: 'ÀJỌ CONNECT',
    icon: '🤝',
    description: 'Services · Skills · Mentors · Circle',
    href: '/dashboard/love/ajo',
    accent: '#4ade80',
    accentMuted: 'rgba(74,222,128,0.10)',
    surface: '#040c06',
    card: '#081408',
    priceUSD: 4.99,
    storageKey: 'realm_ajo_sub_v1',
  },
]

/** Keyed lookup — use REALM_MAP.ufe etc. */
export const REALM_MAP: Record<RealmId, RealmDef> = {
  ufe: REALMS[0],
  kerawa: REALMS[1],
  ajo: REALMS[2],
}

/** Section grouping used on home/baobab screens */
export const REALM_SECTION = {
  label: 'Heart & Soul',
  labelYoruba: 'Ọkàn àti Ẹmí',
} as const
