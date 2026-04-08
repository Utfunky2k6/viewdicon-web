// ============================================================
// Realm Design Tokens — JS constants for realm-specific theming
// Maps to CSS custom properties from globals.css
// Source of truth for names/icons: config/realm.config.ts
// ============================================================

export const REALM = {
  love: {
    key: 'love' as const,
    name: 'UFÈ',
    subtitle: 'Love World',
    fullName: 'UFÈ · Love World',
    icon: '💛',
    accent: '#c9a55c',
    accentLight: '#dfc07a',
    bgPage: '#0c0904',
    bgCard: '#14110a',
    border: 'rgba(201,165,92,0.13)',
    textDim: 'rgba(255,235,180,0.55)',
    textMuted: 'rgba(255,235,180,0.28)',
    gradient: 'linear-gradient(135deg, #c9a55c, #dfc07a)',
    navBg: 'rgba(12,9,4,0.92)',
    navBorder: 'rgba(201,165,92,0.12)',
  },
  kerawa: {
    key: 'kerawa' as const,
    name: 'KÈRÉWÀ',
    subtitle: 'Social Zone',
    fullName: 'KÈRÉWÀ · Social Zone',
    icon: '🔥',
    accent: '#e8627a',
    accentLight: '#f08a9c',
    bgPage: '#0c0406',
    bgCard: '#14080d',
    border: 'rgba(232,98,122,0.13)',
    textDim: 'rgba(255,200,180,0.55)',
    textMuted: 'rgba(255,200,180,0.28)',
    gradient: 'linear-gradient(135deg, #e8627a, #f08a9c)',
    navBg: 'rgba(12,4,6,0.92)',
    navBorder: 'rgba(232,98,122,0.12)',
  },
  ajo: {
    key: 'ajo' as const,
    name: 'ÀJỌ CONNECT',
    subtitle: 'Services & Skills',
    fullName: 'ÀJỌ CONNECT',
    icon: '🤝',
    accent: '#4ade80',
    accentLight: '#86efac',
    bgPage: '#040c06',
    bgCard: '#081408',
    border: 'rgba(74,222,128,0.10)',
    textDim: 'rgba(167,243,160,0.5)',
    textMuted: 'rgba(167,243,160,0.28)',
    gradient: 'linear-gradient(135deg, #4ade80, #22c55e)',
    navBg: 'rgba(4,12,6,0.92)',
    navBorder: 'rgba(74,222,128,0.12)',
  },
} as const

export type RealmKey = keyof typeof REALM
