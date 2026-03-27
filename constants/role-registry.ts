// ═══════════════════════════════════════════════════════════════════
// ROLE REGISTRY — 600 roles across 20 villages
// The backbone of the Viewdicon platform. Every user has a role.
// Their role determines tools, chat, Cowrie flow, crest, and standing.
// ═══════════════════════════════════════════════════════════════════

export interface RoleDefinition {
  key: string
  name: string
  desc: string
  tools: string[]
  moneyFlow: string
  crestPath: string
  businessSessionType: 'goods' | 'service' | 'delivery' | 'professional' | 'community' | 'creative'
}

export interface VillageRoleSet {
  villageSlug: string
  villageName: string
  roles: RoleDefinition[]
}

// ── Village role imports ───────────────────────────────────────────
import { COMMERCE_ROLES } from './roles/commerce'
import { AGRICULTURE_ROLES } from './roles/agriculture'
import { HEALTH_ROLES } from './roles/health'
import { TECHNOLOGY_ROLES } from './roles/technology'
import { EDUCATION_ROLES } from './roles/education'
import { JUSTICE_ROLES } from './roles/justice'
import { FINANCE_ROLES } from './roles/finance'
import { BUILDERS_ROLES } from './roles/builders'
import { ARTS_ROLES } from './roles/arts'
import { MEDIA_ROLES } from './roles/media'
import { SECURITY_ROLES } from './roles/security'
import { SPIRITUALITY_ROLES } from './roles/spirituality'
import { FASHION_ROLES } from './roles/fashion'
import { FAMILY_ROLES } from './roles/family'
import { TRANSPORT_ROLES } from './roles/transport'
import { ENERGY_ROLES } from './roles/energy'
import { HOSPITALITY_ROLES } from './roles/hospitality'
import { GOVERNMENT_ROLES } from './roles/government'
import { SPORTS_ROLES } from './roles/sports'
import { HOLDINGS_ROLES } from './roles/holdings'

// ── Master registry ────────────────────────────────────────────────
export const ROLE_REGISTRY: Record<string, RoleDefinition[]> = {
  commerce: COMMERCE_ROLES,
  agriculture: AGRICULTURE_ROLES,
  health: HEALTH_ROLES,
  technology: TECHNOLOGY_ROLES,
  education: EDUCATION_ROLES,
  justice: JUSTICE_ROLES,
  finance: FINANCE_ROLES,
  builders: BUILDERS_ROLES,
  arts: ARTS_ROLES,
  media: MEDIA_ROLES,
  security: SECURITY_ROLES,
  spirituality: SPIRITUALITY_ROLES,
  fashion: FASHION_ROLES,
  family: FAMILY_ROLES,
  transport: TRANSPORT_ROLES,
  energy: ENERGY_ROLES,
  hospitality: HOSPITALITY_ROLES,
  government: GOVERNMENT_ROLES,
  sports: SPORTS_ROLES,
  holdings: HOLDINGS_ROLES,
}

// ── Helpers ────────────────────────────────────────────────────────

/** Get a role by key from any village */
export function getRoleByKey(key: string): RoleDefinition | undefined {
  for (const roles of Object.values(ROLE_REGISTRY)) {
    const found = roles.find(r => r.key === key)
    if (found) return found
  }
  return undefined
}

/** Get all roles for a village slug */
export function getRolesForVillage(slug: string): RoleDefinition[] {
  return ROLE_REGISTRY[slug] ?? []
}

/** Get the village a role belongs to */
export function getVillageForRole(key: string): string | undefined {
  for (const [slug, roles] of Object.entries(ROLE_REGISTRY)) {
    if (roles.some(r => r.key === key)) return slug
  }
  return undefined
}

/** Get all unique tool keys used across all roles */
export function getAllToolKeys(): string[] {
  const keys = new Set<string>()
  for (const roles of Object.values(ROLE_REGISTRY)) {
    for (const role of roles) {
      for (const tool of role.tools) keys.add(tool)
    }
  }
  return Array.from(keys).sort()
}

/** Total roles in the system */
export const TOTAL_ROLES = Object.values(ROLE_REGISTRY).reduce((sum, roles) => sum + roles.length, 0)
