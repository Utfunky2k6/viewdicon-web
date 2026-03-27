'use client'
// ============================================================
// ThemeProvider — dark/light mode
// Dark is the default (African night-use context).
// OS preference respected. localStorage persists choice.
// ============================================================
import * as React from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

const ThemeCtx = React.createContext<ThemeContextValue>({
  theme:    'dark',
  toggle:   () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('dark')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Priority: 1) localStorage  2) OS preference  3) dark
    const stored = localStorage.getItem('afk-theme') as Theme | null
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored)
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setThemeState('light')
    }
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light')
      root.style.backgroundColor = '#fafafa'
    } else {
      root.removeAttribute('data-theme')
      root.style.backgroundColor = '#0d1117'
    }
    localStorage.setItem('afk-theme', theme)
  }, [theme, mounted])

  const toggle   = () => setThemeState((t) => t === 'dark' ? 'light' : 'dark')
  const setTheme = (t: Theme) => setThemeState(t)

  // Prevent flash of wrong theme — render children immediately
  // (server renders dark, client hydrates to correct theme)
  return (
    <ThemeCtx.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export function useTheme() {
  return React.useContext(ThemeCtx)
}

// ── ThemeToggle button — drop anywhere ─────────────────────────
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`p-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
        text-[var(--text-secondary)] hover:text-[var(--text-primary)]
        hover:border-[var(--border-strong)] transition-colors min-h-touch min-w-touch
        flex items-center justify-center ${className ?? ''}`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
