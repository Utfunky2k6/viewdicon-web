// ============================================================
// Village Store — tracks active village, brand color,
// masquerade skin context (Ise/Egbe/Idile), and active role.
// Persisted to localStorage via Zustand persist middleware.
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MasqueradeSkin = 'ise' | 'egbe' | 'idile'

const VILLAGE_COLOR_MAP: Record<string, string> = {
  commerce:     '#e07b00',
  agriculture:  '#1a7c3e',
  health:       '#0369a1',
  education:    '#4f46e5',
  arts:         '#7c3aed',
  builders:     '#b45309',
  energy:       '#b91c1c',
  transport:    '#0891b2',
  technology:   '#0f766e',
  finance:      '#065f46',
  media:        '#6b21a8',
  justice:      '#1e3a5f',
  government:   '#1e3a5f',
  security:     '#1a1a2e',
  spirituality: '#4c1d95',
  fashion:      '#be185d',
  family:       '#064e3b',
  hospitality:  '#7c2d12',
  sports:       '#1d4ed8',
  holdings:     '#d4a017',
}

interface VillageStore {
  activeVillageId:    string | null
  activeVillageColor: string
  activeSkin:         MasqueradeSkin
  activeRoleKey:      string | null
  setActiveVillage:   (id: string | null, archetype?: string) => void
  setSkin:            (skin: MasqueradeSkin) => void
  setActiveRole:      (key: string | null) => void
}

export const useVillageStore = create<VillageStore>()(
  persist(
    (set) => ({
      activeVillageId:    null,
      activeVillageColor: '#1a7c3e',
      activeSkin:         'ise',
      activeRoleKey:      null,
      setActiveVillage: (id, archetype) => set({
        activeVillageId:    id,
        activeVillageColor: id ? (VILLAGE_COLOR_MAP[id] ?? '#1a7c3e') : '#1a7c3e',
        activeRoleKey:      null,
      }),
      setSkin: (skin) => set({ activeSkin: skin }),
      setActiveRole: (key) => set({ activeRoleKey: key }),
    }),
    {
      name: 'afk-village',
    }
  )
)
