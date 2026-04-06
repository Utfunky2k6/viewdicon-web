/**
 * Multi-currency display lens — every price in the app can render in any currency.
 * The ledger always stores AfriCoin internally; the lens is display-only.
 */

export type LensCurrency = 'CWR' | 'AFC' | 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'XOF' | 'USD' | 'GBP'

export interface LensConfig {
  code:       LensCurrency
  symbol:     string        // ₦, ₵, KSh, R, CFA, $, £, ₡, ◈
  flag:       string        // emoji flag
  name:       string        // Nigerian Naira, etc.
  cowrieRate: number        // How many Cowrie = 1 unit of this currency
                            // e.g. NGN: 1 NGN = 2.38 CWR (CWR ≈ ₦0.42)
  decimals:   number        // 2 for fiat, 0 for CWR, 4 for AFC
  format:     (amount: number) => string  // formatted display string
}

// ─── Rate definitions ─────────────────────────────────────────────────────────
// CWR is the base unit (1 CWR = 1 CWR).
// All other cowrieRates express: "1 unit of this currency = N CWR".
//
// CWR ≈ ₦0.42  →  1 NGN = 2.38 CWR
// AFC: 1 AFC = 12,420 CWR
// GHS: 1 GHS ≈ 5.56 CWR  (GHS is stronger than NGN)
// KES: 1 KES ≈ 0.19 CWR  (weaker)
// ZAR: 1 ZAR ≈ 0.50 CWR
// XOF: 1 XOF ≈ 1.38 CWR  (CFA franc)
// USD: 1 USD ≈ 2,381 CWR  (≈ ₦1,000 / 0.42)
// GBP: 1 GBP ≈ 3,095 CWR

function _fmt(amount: number, symbol: string, decimals: number): string {
  const fixed = amount.toFixed(decimals)
  // Insert thousands separator on the integer part
  const [intPart, decPart] = fixed.split('.')
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const result = decimals > 0 ? `${intFormatted}.${decPart}` : intFormatted
  return `${symbol}${result}`
}

export const LENS_CONFIGS: Record<LensCurrency, LensConfig> = {
  CWR: {
    code: 'CWR',
    symbol: '₡',
    flag: '🪙',
    name: 'Cowrie',
    cowrieRate: 1,
    decimals: 0,
    format: (a) => _fmt(a, '₡', 0),
  },
  AFC: {
    code: 'AFC',
    symbol: '◈',
    flag: '🌍',
    name: 'AfriCoin',
    cowrieRate: 12_420,
    decimals: 4,
    format: (a) => _fmt(a, '◈', 4),
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    flag: '🇳🇬',
    name: 'Nigerian Naira',
    cowrieRate: 2.38,
    decimals: 2,
    format: (a) => _fmt(a, '₦', 2),
  },
  GHS: {
    code: 'GHS',
    symbol: '₵',
    flag: '🇬🇭',
    name: 'Ghanaian Cedi',
    cowrieRate: 5.56,
    decimals: 2,
    format: (a) => _fmt(a, '₵', 2),
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    flag: '🇰🇪',
    name: 'Kenyan Shilling',
    cowrieRate: 0.19,
    decimals: 2,
    format: (a) => _fmt(a, 'KSh', 2),
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    flag: '🇿🇦',
    name: 'South African Rand',
    cowrieRate: 0.50,
    decimals: 2,
    format: (a) => _fmt(a, 'R', 2),
  },
  XOF: {
    code: 'XOF',
    symbol: 'CFA',
    flag: '🌐',
    name: 'West African CFA Franc',
    cowrieRate: 1.38,
    decimals: 0,
    format: (a) => _fmt(a, 'CFA', 0),
  },
  USD: {
    code: 'USD',
    symbol: '$',
    flag: '🇺🇸',
    name: 'US Dollar',
    cowrieRate: 2_381,
    decimals: 2,
    format: (a) => _fmt(a, '$', 2),
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    flag: '🇬🇧',
    name: 'British Pound',
    cowrieRate: 3_095,
    decimals: 2,
    format: (a) => _fmt(a, '£', 2),
  },
}

// ─── Conversion helpers ───────────────────────────────────────────────────────

/** Convert a Cowrie amount to the target display currency. */
export function cowrieToLens(cowrieAmount: number, lens: LensCurrency): number {
  const cfg = LENS_CONFIGS[lens]
  return cowrieAmount / cfg.cowrieRate
}

/** Convert an amount in the given display currency back to Cowrie. */
export function lensToCowrie(amount: number, lens: LensCurrency): number {
  const cfg = LENS_CONFIGS[lens]
  return amount * cfg.cowrieRate
}

/**
 * Returns a formatted display string for a Cowrie amount rendered in the
 * chosen lens currency.  E.g. formatInLens(12400, 'NGN') → "₦5,210.08"
 */
export function formatInLens(cowrieAmount: number, lens: LensCurrency): string {
  const cfg = LENS_CONFIGS[lens]
  const converted = cowrieToLens(cowrieAmount, lens)
  return cfg.format(converted)
}

export const DEFAULT_LENS: LensCurrency = 'CWR'
