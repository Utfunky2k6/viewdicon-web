import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Dark/light controlled by [data-theme] via CSS variables — no Tailwind darkMode needed
  theme: {
    extend: {
      colors: {
        // ── Semantic surface tokens (CSS var — adapts to dark/light) ──
        bg: {
          default:  'var(--bg)',
          surface:  'var(--bg)',
          card:     'var(--bg-card)',
          elevated: 'var(--bg-raised)',
          overlay:  'var(--bg-subtle)',
        },
        border: {
          subtle:   'var(--border)',
          DEFAULT:  'var(--border)',
          strong:   'var(--border-strong)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
        },

        // ── Kente brand palette — same in both modes ──
        kente: {
          gold:    '#D7A85F',
          fire:    '#E85D04',
          forest:  '#2D6A4F',
          kola:    '#C1440E',
          sky:     '#00C2FF',
          earth:   '#8B4513',
        },

        // ── Pan-African identity ──
        green: {
          primary: '#1a7c3e',
          dark:    '#0f5028',
          light:   '#d1fae5',
        },

        // ── Calabash Light theme extras ──
        calabash: {
          ivory: '#F9F5EC',
          umber: '#4B2C1A',
          gold:  '#D7A85F',
          rust:  '#C1440E',
          sage:  '#7C9070',
        },

        // ── Nkisi Shield ──
        nkisi: {
          green: '#22C55E',
          amber: '#F59E0B',
          red:   '#EF4444',
        },

        // ── Spiritual ranks ──
        rank: {
          seed:   '#6B7280',
          rooted: '#22C55E',
          elder:  '#F59E0B',
          sage:   '#A855F7',
        },

        // ── 5 Orisha AI agent colours ──
        agent: {
          griot:    '#1a7c3e',
          elder:    '#d4a017',
          healer:   '#0d9488',
          guardian: '#b22222',
          oracle:   '#5b2d8a',
        },
      },

      fontFamily: {
        body:    ['Ubuntu', 'Noto Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Ubuntu', 'system-ui', 'sans-serif'],
        utility: ['DM Sans', 'Ubuntu', 'system-ui', 'sans-serif'],
        mono:    ['Courier New', 'monospace'],
      },

      spacing: {
        '4.5': '1.125rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
      },

      borderRadius: {
        calabash: '1.5rem 0.5rem 1.5rem 0.5rem',
      },

      // Minimum touch target
      minHeight: { touch: '44px' },
      minWidth:  { touch: '44px' },

      animation: {
        'fire-flicker': 'fire 2s ease-in-out infinite alternate',
        'drum-pulse':   'drum 0.8s ease-in-out',
        'fade-in':      'fadeIn 0.3s ease-out',
        'slide-up':     'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        'slide-down':   'slideDown 0.3s ease-out',
        'shimmer':      'shimmer 1.4s ease-in-out infinite',
      },

      keyframes: {
        fire: {
          '0%':   { opacity: '0.8', transform: 'scaleY(1)'    },
          '100%': { opacity: '1',   transform: 'scaleY(1.05)' },
        },
        drum: {
          '0%, 100%': { transform: 'scale(1)'    },
          '50%':      { transform: 'scale(1.12)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(24px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-100%)' },
          to:   { transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition:  '400px 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
