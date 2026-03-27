export type { VillageRole } from './village-roles-part1'
import { VILLAGE_ROLES_PART1 } from './village-roles-part1'
import { VILLAGE_ROLES_PART2 } from './village-roles-part2'

export const VILLAGE_ROLES = { ...VILLAGE_ROLES_PART1, ...VILLAGE_ROLES_PART2 }

export type VillageRoleMap = typeof VILLAGE_ROLES
