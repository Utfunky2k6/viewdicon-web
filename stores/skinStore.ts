'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActiveSkin } from '@/types'

// ── Skin color palettes ──────────────────────────────────────
export interface SkinColors {
  primary: string   // brand color
  bg: string        // header/nav background
  border: string    // phone border accent
  nav: string       // bottom nav background
  glow: string      // pill glow + flash overlay
  mid: string       // mid-tone accent
  muted: string     // secondary text in-skin
  light: string     // light accent for light mode
}

const SKIN_COLOR_MAP: Record<ActiveSkin, SkinColors> = {
  WORK: {
    primary: '#1a7c3e', bg: '#0d1f12', border: '#1a3d25', nav: '#0a1f0f',
    glow: 'rgba(26,124,62,.25)', mid: '#0f5028', muted: '#7da882', light: '#e8f5ee',
  },
  SOCIAL: {
    primary: '#d97706', bg: '#1a0f00', border: '#4a2800', nav: '#1c0e00',
    glow: 'rgba(217,119,6,.25)', mid: '#92400e', muted: '#fbbf24', light: '#fffbeb',
  },
  CLAN: {
    primary: '#7c3aed', bg: '#12062a', border: '#2e1265', nav: '#130626',
    glow: 'rgba(124,58,237,.25)', mid: '#4c1d95', muted: '#a78bfa', light: '#f5f3ff',
  },
}

export const SKIN_META: Record<ActiveSkin, {
  label: string; yoruba: string; emoji: string; color: string
  tagline: string; badge: string; icon: string
}> = {
  WORK:   { label: 'Ise',   yoruba: 'Ise',   emoji: '⚒',  color: '#1a7c3e', tagline: 'Work · Village', badge: '⚒ ISE · WORK MODE',   icon: '⚒'  },
  SOCIAL: { label: 'Egbe',  yoruba: 'Egbe',  emoji: '🎭', color: '#d97706', tagline: 'Social · Public', badge: '🎭 EGBE · SOCIAL MODE', icon: '🎭' },
  CLAN:   { label: 'Idile', yoruba: 'Idile', emoji: '🏛', color: '#7c3aed', tagline: 'Clan · Private', badge: '🏛 IDILE · CLAN MODE',  icon: '🏛' },
}

// ── Store interface ──────────────────────────────────────────
interface SkinState {
  activeSkin: ActiveSkin
  skinColors: SkinColors
  requiresPin: boolean
  pinConfirmed: boolean
  pinToken: string | null

  setSkin: (skin: ActiveSkin) => void
  requestSkin: (skin: ActiveSkin) => void
  confirmSkin: (pinToken?: string) => void
  cancelPinGate: () => void
  cycleSkin: () => void
}

const CYCLE: ActiveSkin[] = ['WORK', 'SOCIAL', 'CLAN']

function applySkinVars(colors: SkinColors) {
  if (typeof document === 'undefined') return
  const root = document.documentElement.style
  root.setProperty('--skin-primary', colors.primary)
  root.setProperty('--skin-bg', colors.bg)
  root.setProperty('--skin-border', colors.border)
  root.setProperty('--skin-nav', colors.nav)
  root.setProperty('--skin-glow', colors.glow)
  root.setProperty('--skin-mid', colors.mid)
  root.setProperty('--skin-muted', colors.muted)
}

export const useSkinStore = create<SkinState>()(
  persist(
    (set, get) => ({
      activeSkin: 'WORK',
      skinColors: SKIN_COLOR_MAP.WORK,
      requiresPin: false,
      pinConfirmed: false,
      pinToken: null,

      setSkin: (skin) => {
        const colors = SKIN_COLOR_MAP[skin]
        applySkinVars(colors)
        set({ activeSkin: skin, skinColors: colors, requiresPin: false, pinConfirmed: skin === 'CLAN' })
      },

      requestSkin: (skin) => {
        if (skin === 'CLAN') {
          set({ requiresPin: true })
        } else {
          const colors = SKIN_COLOR_MAP[skin]
          applySkinVars(colors)
          set({ activeSkin: skin, skinColors: colors, requiresPin: false, pinConfirmed: false, pinToken: null })
        }
      },

      confirmSkin: (pinToken) => {
        const colors = SKIN_COLOR_MAP.CLAN
        applySkinVars(colors)
        set({ activeSkin: 'CLAN', skinColors: colors, requiresPin: false, pinConfirmed: true, pinToken: pinToken ?? null })
      },

      cancelPinGate: () => {
        set({ requiresPin: false })
      },

      cycleSkin: () => {
        const current = get().activeSkin
        const idx = CYCLE.indexOf(current)
        const next = CYCLE[(idx + 1) % CYCLE.length]
        get().requestSkin(next)
      },
    }),
    {
      name: 'afk-skin',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const colors = SKIN_COLOR_MAP[state.activeSkin as ActiveSkin] ?? SKIN_COLOR_MAP.WORK
          state.skinColors = colors
          applySkinVars(colors)
        }
      },
    }
  )
)
