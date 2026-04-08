'use client'
import { useCallback, useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { LANGUAGE_MAP, type AfricanLanguage } from '@/constants/african-languages'
import { authApi } from '@/lib/api'

/**
 * Unified language hook — single source of truth for the user's language.
 *
 * Priority chain:
 *   1. authStore.user.languageCode  (backend-persisted, set during ceremony or settings)
 *   2. vd-settings.primaryLangCode  (localStorage fallback for guests)
 *   3. 'en'                         (hard default)
 *
 * All components that need the user's language should call useLanguage()
 * instead of maintaining their own state.
 */
export function useLanguage() {
  const user = useAuthStore(s => s.user)
  const setUser = useAuthStore(s => s.setUser)

  // Resolve language code from auth store → localStorage → 'en'
  const code: string = useMemo(() => {
    if (user?.languageCode) return user.languageCode
    try {
      const s = typeof window !== 'undefined' ? localStorage.getItem('vd-settings') : null
      if (s) {
        const d = JSON.parse(s)
        if (d.primaryLangCode) return d.primaryLangCode as string
      }
    } catch { /* noop */ }
    return 'en'
  }, [user?.languageCode])

  // Resolved language object (full metadata)
  const language: AfricanLanguage | undefined = useMemo(
    () => LANGUAGE_MAP.get(code),
    [code]
  )

  // Human-readable name
  const name = language?.name ?? 'English'
  const nativeName = language?.nativeName ?? 'English'
  const bcp47 = language?.bcp47 ?? 'en-US'
  const dir = language?.dir ?? 'ltr'

  /**
   * Update language — persists to backend + auth store + localStorage.
   * Safe to call from settings page or any component.
   */
  const setLanguage = useCallback(async (langCode: string) => {
    // Optimistic update to auth store
    if (user) {
      setUser({ ...user, languageCode: langCode } as Record<string, unknown>)
    }

    // Persist to localStorage (for guest/offline fallback)
    try {
      const raw = localStorage.getItem('vd-settings')
      const d = raw ? JSON.parse(raw) : {}
      d.primaryLangCode = langCode
      // Also store the old-format name for backward compat
      const lang = LANGUAGE_MAP.get(langCode)
      d.primaryLang = lang?.name ?? langCode
      localStorage.setItem('vd-settings', JSON.stringify(d))
    } catch { /* noop */ }

    // Persist to backend
    try {
      const updated = await authApi.updateMe({ languageCode: langCode })
      if (updated) setUser(updated)
    } catch { /* offline — optimistic update already applied */ }
  }, [user, setUser])

  return {
    /** ISO language code (e.g. 'yo', 'sw', 'en') */
    code,
    /** English name (e.g. 'Yoruba') */
    name,
    /** Native name (e.g. 'Èdè Yorùbá') */
    nativeName,
    /** BCP47 tag for speech synthesis (e.g. 'yo', 'sw') */
    bcp47,
    /** Writing direction */
    dir,
    /** Full language metadata from the vault (may be undefined for unknown codes) */
    language,
    /** Update language — persists everywhere */
    setLanguage,
  }
}
