/**
 * World Dial Codes — Africa First
 * 195 countries. African nations are listed first (54 nations),
 * then the rest of the world grouped by region.
 *
 * The `isAfricanDialCode()` helper is the single source of truth for
 * the Three Circles routing logic. African SIM = Circle 1, automatic.
 * Non-African SIM = show Three Circles selection screen.
 */

export interface DialCodeEntry {
  flag: string
  name: string
  dial: string
  region: 'africa' | 'americas' | 'europe' | 'asia' | 'oceania' | 'middle_east'
}

// ─── 54 AFRICAN NATIONS (Circle 1 automatic) ─────────────────
export const AFRICAN_DIAL_CODES: DialCodeEntry[] = [
  { flag:'🇳🇬', name:'Nigeria',              dial:'+234', region:'africa' },
  { flag:'🇬🇭', name:'Ghana',               dial:'+233', region:'africa' },
  { flag:'🇰🇪', name:'Kenya',               dial:'+254', region:'africa' },
  { flag:'🇿🇦', name:'South Africa',         dial:'+27',  region:'africa' },
  { flag:'🇪🇹', name:'Ethiopia',             dial:'+251', region:'africa' },
  { flag:'🇪🇬', name:'Egypt',               dial:'+20',  region:'africa' },
  { flag:'🇹🇿', name:'Tanzania',             dial:'+255', region:'africa' },
  { flag:'🇺🇬', name:'Uganda',              dial:'+256', region:'africa' },
  { flag:'🇸🇳', name:'Senegal',             dial:'+221', region:'africa' },
  { flag:'🇨🇲', name:'Cameroon',            dial:'+237', region:'africa' },
  { flag:'🇨🇮', name:"Côte d'Ivoire",       dial:'+225', region:'africa' },
  { flag:'🇲🇦', name:'Morocco',             dial:'+212', region:'africa' },
  { flag:'🇩🇿', name:'Algeria',             dial:'+213', region:'africa' },
  { flag:'🇹🇳', name:'Tunisia',             dial:'+216', region:'africa' },
  { flag:'🇷🇼', name:'Rwanda',              dial:'+250', region:'africa' },
  { flag:'🇲🇿', name:'Mozambique',          dial:'+258', region:'africa' },
  { flag:'🇲🇬', name:'Madagascar',          dial:'+261', region:'africa' },
  { flag:'🇿🇲', name:'Zambia',              dial:'+260', region:'africa' },
  { flag:'🇿🇼', name:'Zimbabwe',            dial:'+263', region:'africa' },
  { flag:'🇲🇱', name:'Mali',               dial:'+223', region:'africa' },
  { flag:'🇧🇫', name:'Burkina Faso',        dial:'+226', region:'africa' },
  { flag:'🇳🇪', name:'Niger',              dial:'+227', region:'africa' },
  { flag:'🇹🇩', name:'Chad',               dial:'+235', region:'africa' },
  { flag:'🇬🇳', name:'Guinea',             dial:'+224', region:'africa' },
  { flag:'🇧🇯', name:'Benin',              dial:'+229', region:'africa' },
  { flag:'🇹🇬', name:'Togo',               dial:'+228', region:'africa' },
  { flag:'🇸🇱', name:'Sierra Leone',        dial:'+232', region:'africa' },
  { flag:'🇱🇷', name:'Liberia',             dial:'+231', region:'africa' },
  { flag:'🇲🇷', name:'Mauritania',          dial:'+222', region:'africa' },
  { flag:'🇬🇲', name:'Gambia',             dial:'+220', region:'africa' },
  { flag:'🇬🇼', name:'Guinea-Bissau',       dial:'+245', region:'africa' },
  { flag:'🇨🇻', name:'Cabo Verde',          dial:'+238', region:'africa' },
  { flag:'🇨🇩', name:'DR Congo',            dial:'+243', region:'africa' },
  { flag:'🇨🇬', name:'Republic of Congo',   dial:'+242', region:'africa' },
  { flag:'🇬🇦', name:'Gabon',              dial:'+241', region:'africa' },
  { flag:'🇬🇶', name:'Equatorial Guinea',   dial:'+240', region:'africa' },
  { flag:'🇨🇫', name:'Central African Rep.',dial:'+236', region:'africa' },
  { flag:'🇸🇹', name:'São Tomé & Príncipe', dial:'+239', region:'africa' },
  { flag:'🇧🇼', name:'Botswana',            dial:'+267', region:'africa' },
  { flag:'🇳🇦', name:'Namibia',             dial:'+264', region:'africa' },
  { flag:'🇱🇸', name:'Lesotho',             dial:'+266', region:'africa' },
  { flag:'🇸🇿', name:'Eswatini',            dial:'+268', region:'africa' },
  { flag:'🇲🇼', name:'Malawi',              dial:'+265', region:'africa' },
  { flag:'🇲🇺', name:'Mauritius',           dial:'+230', region:'africa' },
  { flag:'🇰🇲', name:'Comoros',             dial:'+269', region:'africa' },
  { flag:'🇸🇨', name:'Seychelles',          dial:'+248', region:'africa' },
  { flag:'🇩🇯', name:'Djibouti',            dial:'+253', region:'africa' },
  { flag:'🇪🇷', name:'Eritrea',             dial:'+291', region:'africa' },
  { flag:'🇸🇴', name:'Somalia',             dial:'+252', region:'africa' },
  { flag:'🇧🇮', name:'Burundi',             dial:'+257', region:'africa' },
  { flag:'🇸🇸', name:'South Sudan',         dial:'+211', region:'africa' },
  { flag:'🇸🇩', name:'Sudan',              dial:'+249', region:'africa' },
  { flag:'🇱🇾', name:'Libya',              dial:'+218', region:'africa' },
  { flag:'🇦🇴', name:'Angola',             dial:'+244', region:'africa' },
]

// ─── AMERICAS (Black Diaspora + All Others) ───────────────────
export const AMERICAS_DIAL_CODES: DialCodeEntry[] = [
  { flag:'🇺🇸', name:'United States',       dial:'+1',    region:'americas' },
  { flag:'🇨🇦', name:'Canada',              dial:'+1-CA', region:'americas' },
  { flag:'🇧🇷', name:'Brazil',              dial:'+55',   region:'americas' },
  { flag:'🇯🇲', name:'Jamaica',             dial:'+1876', region:'americas' },
  { flag:'🇹🇹', name:'Trinidad & Tobago',   dial:'+1868', region:'americas' },
  { flag:'🇧🇧', name:'Barbados',            dial:'+1246', region:'americas' },
  { flag:'🇬🇾', name:'Guyana',              dial:'+592',  region:'americas' },
  { flag:'🇸🇷', name:'Suriname',            dial:'+597',  region:'americas' },
  { flag:'🇭🇹', name:'Haiti',               dial:'+509',  region:'americas' },
  { flag:'🇨🇺', name:'Cuba',               dial:'+53',   region:'americas' },
  { flag:'🇩🇴', name:'Dominican Republic',  dial:'+1809', region:'americas' },
  { flag:'🇵🇷', name:'Puerto Rico',         dial:'+1787', region:'americas' },
  { flag:'🇵🇦', name:'Panama',              dial:'+507',  region:'americas' },
  { flag:'🇨🇴', name:'Colombia',            dial:'+57',   region:'americas' },
  { flag:'🇻🇪', name:'Venezuela',           dial:'+58',   region:'americas' },
  { flag:'🇵🇪', name:'Peru',               dial:'+51',   region:'americas' },
  { flag:'🇦🇷', name:'Argentina',           dial:'+54',   region:'americas' },
  { flag:'🇨🇱', name:'Chile',              dial:'+56',   region:'americas' },
  { flag:'🇧🇴', name:'Bolivia',             dial:'+591',  region:'americas' },
  { flag:'🇪🇨', name:'Ecuador',             dial:'+593',  region:'americas' },
  { flag:'🇺🇾', name:'Uruguay',             dial:'+598',  region:'americas' },
  { flag:'🇵🇾', name:'Paraguay',            dial:'+595',  region:'americas' },
  { flag:'🇲🇽', name:'Mexico',              dial:'+52',   region:'americas' },
  { flag:'🇬🇹', name:'Guatemala',           dial:'+502',  region:'americas' },
  { flag:'🇨🇷', name:'Costa Rica',          dial:'+506',  region:'americas' },
  { flag:'🇭🇳', name:'Honduras',            dial:'+504',  region:'americas' },
  { flag:'🇸🇻', name:'El Salvador',         dial:'+503',  region:'americas' },
  { flag:'🇳🇮', name:'Nicaragua',           dial:'+505',  region:'americas' },
  { flag:'🇧🇿', name:'Belize',              dial:'+501',  region:'americas' },
]

// ─── EUROPE ───────────────────────────────────────────────────
export const EUROPE_DIAL_CODES: DialCodeEntry[] = [
  { flag:'🇬🇧', name:'United Kingdom',      dial:'+44',  region:'europe' },
  { flag:'🇫🇷', name:'France',              dial:'+33',  region:'europe' },
  { flag:'🇩🇪', name:'Germany',             dial:'+49',  region:'europe' },
  { flag:'🇮🇹', name:'Italy',               dial:'+39',  region:'europe' },
  { flag:'🇪🇸', name:'Spain',              dial:'+34',  region:'europe' },
  { flag:'🇵🇹', name:'Portugal',            dial:'+351', region:'europe' },
  { flag:'🇳🇱', name:'Netherlands',         dial:'+31',  region:'europe' },
  { flag:'🇧🇪', name:'Belgium',             dial:'+32',  region:'europe' },
  { flag:'🇨🇭', name:'Switzerland',         dial:'+41',  region:'europe' },
  { flag:'🇦🇹', name:'Austria',             dial:'+43',  region:'europe' },
  { flag:'🇸🇪', name:'Sweden',              dial:'+46',  region:'europe' },
  { flag:'🇳🇴', name:'Norway',              dial:'+47',  region:'europe' },
  { flag:'🇩🇰', name:'Denmark',             dial:'+45',  region:'europe' },
  { flag:'🇫🇮', name:'Finland',             dial:'+358', region:'europe' },
  { flag:'🇮🇪', name:'Ireland',             dial:'+353', region:'europe' },
  { flag:'🇵🇱', name:'Poland',              dial:'+48',  region:'europe' },
  { flag:'🇨🇿', name:'Czech Republic',      dial:'+420', region:'europe' },
  { flag:'🇸🇰', name:'Slovakia',            dial:'+421', region:'europe' },
  { flag:'🇭🇺', name:'Hungary',             dial:'+36',  region:'europe' },
  { flag:'🇷🇴', name:'Romania',             dial:'+40',  region:'europe' },
  { flag:'🇧🇬', name:'Bulgaria',            dial:'+359', region:'europe' },
  { flag:'🇬🇷', name:'Greece',              dial:'+30',  region:'europe' },
  { flag:'🇸🇮', name:'Slovenia',            dial:'+386', region:'europe' },
  { flag:'🇭🇷', name:'Croatia',             dial:'+385', region:'europe' },
  { flag:'🇷🇸', name:'Serbia',              dial:'+381', region:'europe' },
  { flag:'🇧🇦', name:'Bosnia & Herzegovina', dial:'+387', region:'europe' },
  { flag:'🇲🇰', name:'North Macedonia',     dial:'+389', region:'europe' },
  { flag:'🇦🇱', name:'Albania',             dial:'+355', region:'europe' },
  { flag:'🇲🇪', name:'Montenegro',          dial:'+382', region:'europe' },
  { flag:'🇺🇦', name:'Ukraine',             dial:'+380', region:'europe' },
  { flag:'🇧🇾', name:'Belarus',             dial:'+375', region:'europe' },
  { flag:'🇱🇹', name:'Lithuania',           dial:'+370', region:'europe' },
  { flag:'🇱🇻', name:'Latvia',              dial:'+371', region:'europe' },
  { flag:'🇪🇪', name:'Estonia',             dial:'+372', region:'europe' },
  { flag:'🇷🇺', name:'Russia',              dial:'+7',   region:'europe' },
]

// ─── MIDDLE EAST ──────────────────────────────────────────────
export const MIDDLE_EAST_DIAL_CODES: DialCodeEntry[] = [
  { flag:'🇦🇪', name:'UAE',                 dial:'+971', region:'middle_east' },
  { flag:'🇸🇦', name:'Saudi Arabia',        dial:'+966', region:'middle_east' },
  { flag:'🇶🇦', name:'Qatar',               dial:'+974', region:'middle_east' },
  { flag:'🇰🇼', name:'Kuwait',              dial:'+965', region:'middle_east' },
  { flag:'🇧🇭', name:'Bahrain',             dial:'+973', region:'middle_east' },
  { flag:'🇴🇲', name:'Oman',               dial:'+968', region:'middle_east' },
  { flag:'🇯🇴', name:'Jordan',              dial:'+962', region:'middle_east' },
  { flag:'🇱🇧', name:'Lebanon',             dial:'+961', region:'middle_east' },
  { flag:'🇮🇱', name:'Israel',              dial:'+972', region:'middle_east' },
  { flag:'🇮🇷', name:'Iran',               dial:'+98',  region:'middle_east' },
  { flag:'🇮🇶', name:'Iraq',               dial:'+964', region:'middle_east' },
  { flag:'🇾🇪', name:'Yemen',              dial:'+967', region:'middle_east' },
  { flag:'🇸🇾', name:'Syria',              dial:'+963', region:'middle_east' },
  { flag:'🇹🇷', name:'Turkey',             dial:'+90',  region:'middle_east' },
]

// ─── ASIA & PACIFIC ───────────────────────────────────────────
export const ASIA_DIAL_CODES: DialCodeEntry[] = [
  { flag:'🇮🇳', name:'India',               dial:'+91',  region:'asia' },
  { flag:'🇨🇳', name:'China',               dial:'+86',  region:'asia' },
  { flag:'🇯🇵', name:'Japan',               dial:'+81',  region:'asia' },
  { flag:'🇰🇷', name:'South Korea',         dial:'+82',  region:'asia' },
  { flag:'🇮🇩', name:'Indonesia',           dial:'+62',  region:'asia' },
  { flag:'🇵🇾', name:'Malaysia',            dial:'+60',  region:'asia' },
  { flag:'🇸🇬', name:'Singapore',           dial:'+65',  region:'asia' },
  { flag:'🇵🇭', name:'Philippines',         dial:'+63',  region:'asia' },
  { flag:'🇹🇭', name:'Thailand',            dial:'+66',  region:'asia' },
  { flag:'🇻🇳', name:'Vietnam',             dial:'+84',  region:'asia' },
  { flag:'🇧🇩', name:'Bangladesh',          dial:'+880', region:'asia' },
  { flag:'🇵🇰', name:'Pakistan',            dial:'+92',  region:'asia' },
  { flag:'🇱🇰', name:'Sri Lanka',           dial:'+94',  region:'asia' },
  { flag:'🇳🇵', name:'Nepal',              dial:'+977', region:'asia' },
  { flag:'🇲🇲', name:'Myanmar',             dial:'+95',  region:'asia' },
  { flag:'🇰🇭', name:'Cambodia',            dial:'+855', region:'asia' },
  { flag:'🇱🇦', name:'Laos',               dial:'+856', region:'asia' },
  { flag:'🇦🇺', name:'Australia',           dial:'+61',  region:'oceania' },
  { flag:'🇳🇿', name:'New Zealand',         dial:'+64',  region:'oceania' },
  { flag:'🇫🇯', name:'Fiji',               dial:'+679', region:'oceania' },
]

// ─── COMBINED: All non-African codes ─────────────────────────
export const WORLD_DIAL_CODES: DialCodeEntry[] = [
  ...AMERICAS_DIAL_CODES,
  ...EUROPE_DIAL_CODES,
  ...MIDDLE_EAST_DIAL_CODES,
  ...ASIA_DIAL_CODES,
]

// ─── LEGACY: kept for backward-compat ────────────────────────
export const DIASPORA_DIAL_CODES = WORLD_DIAL_CODES

// ─── HELPERS ─────────────────────────────────────────────────

const AFRICAN_DIALS = new Set(AFRICAN_DIAL_CODES.map(c => c.dial))

/**
 * Returns true if a dial code belongs to one of the 54 African nations.
 * This is THE SINGLE SOURCE OF TRUTH for the Circle 1 auto-route check.
 * If isAfricanDialCode() === true → skip Three Circles, assign Circle 1.
 */
export function isAfricanDialCode(dialCode: string): boolean {
  return AFRICAN_DIALS.has(dialCode)
}

export type UserCircle = 1 | 2 | 3

/**
 * Determines the initial circle from the dial code alone.
 * Returns 1 for Africans (auto-confirmed), null for everyone else
 * (they must go through Three Circles UI to confirm).
 */
export function getInitialCircle(dialCode: string): UserCircle | null {
  return isAfricanDialCode(dialCode) ? 1 : null
}
