import type { AfroID } from '@/types'

// AfroID format: CC-TTT-XXXX-XXXX  e.g. NG-YOR-2764-8937
const AFRO_ID_REGEX = /^([A-Z]{2})-([A-Z]{2,4})-(\d{4}-\d{4})$/

export function parseAfroId(raw: string): AfroID | null {
  const match = raw.trim().toUpperCase().match(AFRO_ID_REGEX)
  if (!match) return null
  return {
    raw:     match[0],
    country: match[1],
    tribe:   match[2],
    numeric: match[3],
    masked:  `${match[1]}-${match[2]}-••••-••••`,
  }
}

export function maskAfroId(afroId: AfroID | string): string {
  if (typeof afroId === 'string') {
    const parsed = parseAfroId(afroId)
    return parsed ? parsed.masked : '••-•••-••••-••••'
  }
  return afroId.masked
}

export function validateAfroIdFormat(raw: string): boolean {
  return AFRO_ID_REGEX.test(raw.trim().toUpperCase())
}

export function formatAfroIdDisplay(afroId: AfroID, revealed = false): string {
  return revealed ? afroId.raw : afroId.masked
}

export const COUNTRY_CODES: Record<string, string> = {
  NG: 'Nigeria',
  GH: 'Ghana',
  KE: 'Kenya',
  ZA: 'South Africa',
  ET: 'Ethiopia',
  EG: 'Egypt',
  TZ: 'Tanzania',
  UG: 'Uganda',
  RW: 'Rwanda',
  CM: 'Cameroon',
  CI: 'Côte d\'Ivoire',
  SN: 'Senegal',
  ML: 'Mali',
  ZW: 'Zimbabwe',
  ZM: 'Zambia',
  US: 'USA (Diaspora)',
  GB: 'UK (Diaspora)',
  FR: 'France (Diaspora)',
  CA: 'Canada (Diaspora)',
  BR: 'Brazil (Diaspora)',
}

export const TRIBE_CODES: Record<string, string[]> = {
  NG: ['YOR', 'IGB', 'HAU', 'EDO', 'IJW', 'TIV', 'EFI'],
  GH: ['AKN', 'EWE', 'GA', 'DGA', 'TWI'],
  KE: ['KIK', 'LUO', 'KAL', 'KMB', 'MER'],
  ZA: ['ZUL', 'XHO', 'SWA', 'NDL', 'PED'],
  ET: ['ORO', 'AMH', 'TIG', 'SOM'],
}
