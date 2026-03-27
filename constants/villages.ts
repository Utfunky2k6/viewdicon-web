import rawCanonicalVillages from '../shared/canonical-villages.json'

interface CanonicalRoleSource {
  key: string
  name: string
  desc: string
}

interface CanonicalVillageSource {
  id: string
  name: string
  yoruba: string
  emoji: string
  color: string
  guardian: string
  category: string
  tagline: string
  isHolding?: boolean
  roles: CanonicalRoleSource[]
}

export interface VillageRole extends CanonicalRoleSource {
  emoji: string
}

export interface CanonicalVillage extends CanonicalVillageSource {
  yorubaName: string
  yorubaTranslation: string
  bgColor: string
  gradientFrom: string
  gradientTo: string
  region: string
  roles: VillageRole[]
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('')}`
}

function tint(hex: string, ratio: number) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    r + (255 - r) * ratio,
    g + (255 - g) * ratio,
    b + (255 - b) * ratio,
  )
}

function shade(hex: string, ratio: number) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r * (1 - ratio), g * (1 - ratio), b * (1 - ratio))
}

function buildYorubaTranslation(name: string) {
  if (name.endsWith('Village')) {
    return name.replace(/\s+Village$/, '')
  }

  return name
}

function roleEmojiForVillage(village: CanonicalVillageSource, role: CanonicalRoleSource) {
  const overrides: Record<string, string> = {
    cybersecurity: '🔒',
    ai_engineer: '🤖',
    software_engineer: '💻',
    journalist: '📰',
    medical_doctor: '🩺',
    nurse_midwife: '🤱',
    footballer: '⚽',
    fashion_designer: '👗',
    chef_cook: '🍽',
    lawyer: '⚖️',
    elected_official: '🏛',
    police: '🛡',
    traditional_priest: '🙏',
    family_counselor: '🏠',
    crop_farmer: '🌾',
    market_vendor: '🧺',
    solar_installer: '☀️',
    road_driver: '🚛',
  }

  return overrides[role.key] ?? village.emoji
}

const canonicalSource = rawCanonicalVillages as CanonicalVillageSource[]

export const RAW_CANONICAL_VILLAGES = canonicalSource

export const CANONICAL_VILLAGES: CanonicalVillage[] = canonicalSource.map((village) => ({
  ...village,
  yorubaName: village.yoruba,
  yorubaTranslation: buildYorubaTranslation(village.name),
  bgColor: tint(village.color, 0.9),
  gradientFrom: shade(village.color, 0.18),
  gradientTo: tint(village.color, 0.2),
  region: 'Pan-Africa',
  roles: village.roles.map((role) => ({
    ...role,
    emoji: roleEmojiForVillage(village, role),
  })),
}))

export const VILLAGE_MAP = Object.fromEntries(
  CANONICAL_VILLAGES.map((village) => [village.id, village]),
) as Record<string, CanonicalVillage>

export const VILLAGE_ROLES_MAP = Object.fromEntries(
  CANONICAL_VILLAGES.map((village) => [village.id, village.roles]),
) as Record<string, VillageRole[]>

export const DEFAULT_ROLES = VILLAGE_MAP.commerce?.roles ?? CANONICAL_VILLAGES[0]?.roles ?? []
