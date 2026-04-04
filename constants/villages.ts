import rawCanonicalVillages from '../shared/canonical-villages.json'
import { ROLE_REGISTRY } from './role-registry'

interface CanonicalRoleSource {
  key: string
  name: string
  desc: string
}

interface CanonicalVillageSource {
  id: string
  ancientName: string
  name: string
  yoruba: string
  emoji: string
  color: string
  nation?: string
  nationFull?: string
  language?: string
  era?: string
  meaning?: string
  history?: string
  guardian: string
  guardianDesc?: string
  guardianOrigin?: string
  origin?: string
  category: string
  tagline: string
  isHolding?: boolean
  roles: CanonicalRoleSource[]
}

export interface VillageRole extends CanonicalRoleSource {
  id: string
  emoji: string
  sector: string
}

export interface CanonicalVillage extends CanonicalVillageSource {
  ancientName: string
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
    // Commerce
    market_vendor: '🧺', import_export: '📦', mobile_money: '📱', wholesale: '🏭',
    ecommerce: '🛒', forex: '💱', second_hand: '♻️', auctioneer: '🔨',
    // Agriculture
    crop_farmer: '🌾', livestock: '🐄', fisher: '🐟', agro_processor: '⚙️',
    irrigation: '💧', seed_guardian: '🌱', rain_watcher: '🌦️', farm_logistics: '🚜',
    // Health
    doctor: '🩺', nurse: '🤱', traditional_healer: '🌿', community_health: '❤️',
    pharmacist: '💊', mental_health: '🧠', lab_scientist: '🔬', public_health: '🏥',
    // Education
    classroom_teacher: '📚', lecturer: '🎓', tutor: '✏️', school_admin: '🏫',
    vocational_trainer: '🛠️', language_keeper: '🗣️', edtech_developer: '💻', cultural_historian: '📜',
    // Arts
    musician: '🎵', visual_artist: '🎨', author: '✍️', filmmaker: '🎬',
    performer: '💃', master_artisan: '🏺', fashion_designer_arts: '👗', cultural_educator: '🎭',
    // Builders
    architect: '📐', civil_engineer: '🏗️', mason: '🧱', electrician: '⚡',
    plumber: '🔧', carpenter: '🪚', surveyor: '🗺️', heavy_machinery: '🚧',
    // Energy
    solar_installer: '☀️', electrical_engineer: '🔌', petroleum_engineer: '🛢️', renewable_consultant: '🌬️',
    utility_worker: '⚡', biomass_practitioner: '🌿', nuclear_specialist: '⚛️', minigrid_operator: '🔋',
    // Transport
    road_driver: '🚛', logistics_coordinator: '📋', vehicle_mechanic: '🔧', aviation_professional: '✈️',
    marine_crew: '⚓', railway_crew: '🚆', boda_boda: '🏍️', fleet_manager_role: '🚗',
    // Technology
    developer: '💻', data_scientist: '📊', cybersecurity: '🔒', network_engineer: '🌐',
    mobile_dev: '📱', cloud_engineer: '☁️', ux_designer: '🎨', tech_support: '🛠️',
    // Media
    journalist: '📰', broadcaster: '📡', photographer: '📸', social_creator: '📲',
    pr_practitioner: '📣', podcast_host: '🎙️', video_editor: '🎞️', ad_creative: '🎯',
    // Finance
    bank_officer: '🏦', financial_analyst: '📈', microfinance: '🤝', fintech_entrepreneur: '💰',
    accountant: '🧮', insurance_agent: '🛡️', crypto_defi: '🪙', ajo_keeper: '💫',
    // Justice
    lawyer: '⚖️', mediator: '🕊️', magistrate: '🏛️', paralegal: '📋',
    human_rights: '✊', notary: '📝', justice_elder: '👴', prison_reform: '🔓',
    // Government
    civil_servant: '🏛', elected_official: '🏛', diplomat: '🌍', urban_planner: '🏙️',
    tax_collector: '💰', registrar: '📋', policy_analyst: '📊', elections_officer: '🗳️',
    // Security
    police_officer: '🚔', cybersecurity_gov: '🔒', fire_rescue: '🔥', private_security: '🛡️',
    border_guard: '🛃', forensic_expert: '🔍', community_watch: '👁️', emergency_management: '🚨',
    // Spirituality
    imam: '🕌', minister: '✝️', traditional_priest: '🙏', spiritual_counselor: '🌟',
    spiritual_healer: '🌿', meditation_guide: '🧘', charity_worker: '🤲', funeral_director: '🌹',
    // Sports
    footballer: '⚽', track_athlete: '🏃', coach: '🏆', referee: '🦺',
    gym_owner: '💪', sports_scout: '👁️', esports: '🎮', sports_journalist: '📰',
    // Fashion
    fashion_designer: '👗', tailor: '🧵', model: '💃', hair_stylist: '💇',
    fabric_merchant: '🧶', beauty_practitioner: '💄', shoe_maker: '👟', jewellery_designer: '💍',
    // Family
    family_elder: '👴', marriage_coordinator: '💒', child_welfare: '👶', genealogist: '🌳',
    family_mediator: '🕊️', adoption_officer: '👨‍👩‍👧', homemaker: '🏠', youth_mentor: '🌟',
    // Hospitality
    hotel_manager: '🏨', chef: '👨‍🍳', tour_guide: '🗺️', events_coordinator: '🎊',
    bartender: '🍹', travel_agent: '✈️', resort_manager: '🏖️', camp_host: '⛺',
    // Holdings
    explorer: '🧭', career_changer: '🔄', new_graduate: '🎓', entrepreneur_formation: '💡',
    volunteer: '🤝', multi_skilled: '🛠️', navigator: '🗺️', returning_citizen: '🔓',
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
    id: role.key,
    emoji: roleEmojiForVillage(village, role),
    sector: village.category,
  })),
}))

export const VILLAGE_MAP = Object.fromEntries(
  CANONICAL_VILLAGES.map((village) => [village.id, village]),
) as Record<string, CanonicalVillage>

// ── VILLAGE_ROLES_MAP derives from ROLE_REGISTRY (canonical 8 roles per village) ──
// This ensures ceremony, profile, and village pages all use identical role data.
export const VILLAGE_ROLES_MAP: Record<string, VillageRole[]> = (() => {
  const result: Record<string, VillageRole[]> = {}
  for (const [villageId, roles] of Object.entries(ROLE_REGISTRY)) {
    const village = VILLAGE_MAP[villageId]
    result[villageId] = roles.map(role => ({
      key: role.key,
      name: role.name,
      desc: role.desc,
      id: role.key,
      emoji: roleEmojiForVillage(
        { emoji: village?.emoji ?? '🌍', id: villageId } as unknown as CanonicalVillageSource,
        role,
      ),
      sector: village?.category ?? 'economy',
    }))
  }
  return result
})()

export const DEFAULT_ROLES = VILLAGE_MAP.commerce?.roles ?? CANONICAL_VILLAGES[0]?.roles ?? []
