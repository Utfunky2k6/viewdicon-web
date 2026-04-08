/**
 * LOVE WORLD — Design System Tokens
 * Single source of truth for all visual decisions.
 *
 * Typography: fixed scale, no randomness.
 * Spacing: strict 4/8px grid.
 * Color: functional, not aesthetic.
 * Three realm themes: UFÈ, KÈRÉWÀ, ÀJỌ CONNECT.
 */

import { REALM_MAP, type RealmId, type RealmDef } from '@/config/realm.config'
export type { RealmId }

/* ─── Typography scale ─── */

export const TYPE = {
  display: { fontSize: '2rem',      lineHeight: '2.5rem',   fontWeight: 700, letterSpacing: '-0.025em' },
  h1:      { fontSize: '1.5rem',    lineHeight: '2rem',     fontWeight: 600, letterSpacing: '-0.02em' },
  h2:      { fontSize: '1.25rem',   lineHeight: '1.75rem',  fontWeight: 600, letterSpacing: '-0.015em' },
  h3:      { fontSize: '1.0625rem', lineHeight: '1.5rem',   fontWeight: 500, letterSpacing: '-0.01em' },
  body:    { fontSize: '0.9375rem', lineHeight: '1.375rem', fontWeight: 400, letterSpacing: '0' },
  caption: { fontSize: '0.8125rem', lineHeight: '1.125rem', fontWeight: 400, letterSpacing: '0' },
  micro:   { fontSize: '0.6875rem', lineHeight: '1rem',     fontWeight: 500, letterSpacing: '0.04em' },
} as const

/* ─── Spacing (4px base, 8px grid) ─── */

export const SPACE = {
  0:    0,
  px:   1,
  0.5:  2,
  1:    4,
  1.5:  6,
  2:    8,
  3:    12,
  4:    16,
  5:    20,
  6:    24,
  8:    32,
  10:   40,
  12:   48,
  16:   64,
  20:   80,
} as const

/* ─── Border radius ─── */

export const RADIUS = {
  none: '0',
  sm:   '6px',
  md:   '10px',
  lg:   '14px',
  xl:   '20px',
  '2xl': '28px',
  full: '9999px',
} as const

/* ─── Color — functional palette ─── */

export const COLOR = {
  // Surfaces
  bg:         '#09090b',
  card:       '#131316',
  elevated:   '#1a1a1e',
  overlay:    'rgba(0,0,0,0.64)',
  scrim:      'rgba(0,0,0,0.4)',

  // Text
  textPrimary:   '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted:     '#63636e',
  textInverse:   '#09090b',

  // Borders
  border:      '#222226',
  borderStrong:'#38383e',

  // Status
  success:  '#22c55e',
  warning:  '#eab308',
  danger:   '#ef4444',
  info:     '#3b82f6',
} as const

/* ─── Realm themes ─── */

export interface RealmTheme extends RealmDef {
  gradient: string
  symbol: string
}

// Extend canonical realm config with design-only tokens (gradient, symbol).
export const REALM: Record<RealmId, RealmTheme> = {
  ufe: {
    ...REALM_MAP.ufe,
    gradient: 'linear-gradient(135deg, #c9a55c 0%, #dfc07a 50%, #c9a55c 100%)',
    symbol: '💛',
  },
  kerawa: {
    ...REALM_MAP.kerawa,
    gradient: 'linear-gradient(135deg, #e8627a 0%, #f08a9c 50%, #e8627a 100%)',
    symbol: '🔥',
  },
  ajo: {
    ...REALM_MAP.ajo,
    gradient: 'linear-gradient(135deg, #4ade80 0%, #86efac 50%, #4ade80 100%)',
    symbol: '🤝',
  },
}

/* ─── Timing ─── */

export const DURATION = {
  instant:  '100ms',
  fast:     '150ms',
  normal:   '250ms',
  slow:     '400ms',
  enter:    '300ms',
  exit:     '200ms',
} as const

export const EASE = {
  default: 'cubic-bezier(0.16, 1, 0.3, 1)',
  in:      'cubic-bezier(0.55, 0, 1, 0.45)',
  out:     'cubic-bezier(0, 0.55, 0.45, 1)',
  spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

/* ─── Shadows ─── */

export const SHADOW = {
  sm:   '0 1px 2px rgba(0,0,0,0.3)',
  md:   '0 2px 8px rgba(0,0,0,0.3)',
  lg:   '0 4px 16px rgba(0,0,0,0.4)',
  xl:   '0 8px 32px rgba(0,0,0,0.5)',
  glow: (color: string) => `0 0 24px ${color}`,
} as const

/* ─── Z-index scale ─── */

export const Z = {
  base:    0,
  card:    1,
  sticky:  10,
  overlay: 20,
  modal:   30,
  toast:   40,
  max:     50,
} as const

/* ─── Currency formatting ─── */

export const CURRENCY_MAP: Record<string, { symbol: string; code: string; locale: string }> = {
  NG: { symbol: '\u20A6', code: 'NGN', locale: 'en-NG' },
  GH: { symbol: 'GH\u20B5', code: 'GHS', locale: 'en-GH' },
  KE: { symbol: 'KSh',     code: 'KES', locale: 'en-KE' },
  ZA: { symbol: 'R',       code: 'ZAR', locale: 'en-ZA' },
  US: { symbol: '$',       code: 'USD', locale: 'en-US' },
  GB: { symbol: '\u00A3',  code: 'GBP', locale: 'en-GB' },
  CA: { symbol: 'C$',      code: 'CAD', locale: 'en-CA' },
  EU: { symbol: '\u20AC',  code: 'EUR', locale: 'de-DE' },
}

export function formatPrice(amountUSD: number, countryCode = 'US'): string {
  const cfg = CURRENCY_MAP[countryCode] || CURRENCY_MAP.US
  // Rough conversion ratios — production would use live rates
  const RATES: Record<string, number> = {
    NGN: 1600, GHS: 15, KES: 155, ZAR: 19, GBP: 0.79, CAD: 1.37, EUR: 0.92, USD: 1,
  }
  const rate = RATES[cfg.code] || 1
  const amount = amountUSD * rate
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency', currency: cfg.code, minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${cfg.symbol}${Math.round(amount)}`
  }
}

/* ─── Subscription tiers ─── */

export const SUBSCRIPTION = {
  ufe:    { priceUSD: 29.99, period: 'month', label: 'UFÈ Premium' },
  kerawa: { priceUSD: 9.99,  period: 'month', label: 'KÈRÉWÀ Access' },
  ajo:    { priceUSD: 4.99,  period: 'month', label: 'ÀJỌ Professional' },
} as const
