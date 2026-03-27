'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemePreference = 'light' | 'dark' | 'system'

interface ThemeState {
  preference: ThemePreference
  setPreference: (p: ThemePreference) => void
  isDark: () => boolean
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: 'dark' as ThemePreference,
      setPreference: (preference) => set({ preference }),
      isDark: () => {
        const p = get().preference
        if (p === 'system') {
          return typeof window !== 'undefined'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
            : true
        }
        return p === 'dark'
      },
    }),
    { name: 'afk-theme' }
  )
)
