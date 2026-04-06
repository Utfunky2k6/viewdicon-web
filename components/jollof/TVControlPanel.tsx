'use client'
// ═══════════════════════════════════════════════════════════════════
// JOLLOF TV CONTROL PANEL — Platform Menu (slide-out drawer)
// Pan-African naming — represents the entire continent
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { VOCAB } from '@/constants/vocabulary'

const CSS_ID = 'tv-control-panel-css'
const CSS = `
@keyframes tvPanelSlideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
@keyframes tvPanelFadeIn{from{opacity:0}to{opacity:1}}
.tv-panel-backdrop{animation:tvPanelFadeIn .22s ease both}
.tv-panel-drawer{animation:tvPanelSlideIn .28s cubic-bezier(.32,.72,0,1) both}
.tv-panel-row:hover{background:rgba(255,255,255,.06) !important}
.tv-panel-row:active{background:rgba(255,255,255,.1) !important}
`

type PanelRow = {
  icon: string
  iconBg: string
  title: string
  subtitle: string
  path: string
  comingSoon?: boolean
  accent?: string
}

// ── SECTION 1: LISTEN & WATCH — Content Discovery
const SECTION_CONTENT: PanelRow[] = [
  { icon: '🏛',  iconBg: '#0d1a1a', title: VOCAB.palaver,      subtitle: VOCAB.palaverSub,      path: '/dashboard/jollof/rooms' },
  { icon: '🎙',  iconBg: '#0d1a12', title: VOCAB.podcast,      subtitle: VOCAB.podcastSub,      path: '/dashboard/jollof/podcasts' },
  { icon: '📻',  iconBg: '#1a0d00', title: VOCAB.radio,        subtitle: VOCAB.radioSub,        path: '/dashboard/jollof/radio' },
  { icon: '🎭',  iconBg: '#1a001a', title: VOCAB.realityTV,    subtitle: VOCAB.realitySub,      path: '/dashboard/jollof/reality' },
]

// ── SECTION 2: CREATE & MANAGE — Creator Tools
const SECTION_CREATE: PanelRow[] = [
  { icon: '📅',  iconBg: '#0d1a0d', title: VOCAB.tvGuide,       subtitle: VOCAB.tvGuideSub,      path: '/dashboard/jollof/guide' },
  { icon: '🎙',  iconBg: '#0d1a0d', title: VOCAB.creatorStudio, subtitle: VOCAB.studioSub,       path: '/dashboard/jollof/studio' },
  { icon: '📢',  iconBg: '#1a1400', title: VOCAB.adMarket,      subtitle: VOCAB.adMarketSub,     path: '/dashboard/jollof/ads', accent: '#fbbf24' },
  { icon: '📅',  iconBg: '#0d1a0d', title: VOCAB.tvSchedule,    subtitle: VOCAB.scheduleSub,     path: '/dashboard/jollof/guide' },
]

// ── SECTION 3: LIVE — Interactive Features
const SECTION_LIVE: PanelRow[] = [
  { icon: '📞',  iconBg: '#1a0800', title: VOCAB.callIn,        subtitle: VOCAB.callInSub,       path: '/dashboard/jollof/callin', accent: '#f97316' },
  { icon: '🌍',  iconBg: '#001a0d', title: VOCAB.globalCast,    subtitle: VOCAB.globalCastSub,   path: '/dashboard/jollof/studio', accent: '#4ade80' },
  { icon: '👥',  iconBg: '#0d001a', title: VOCAB.watchTogether,  subtitle: VOCAB.watchTogetherSub, path: '/dashboard/jollof/rooms' },
  { icon: '🎬',  iconBg: '#1a001a', title: VOCAB.castFar,       subtitle: VOCAB.castFarSub,      path: '', comingSoon: true, accent: '#c084fc' },
]

function PanelRowItem({ row, isActive, onNavigate }: { row: PanelRow; isActive: boolean; onNavigate: (path: string, comingSoon?: boolean) => void }) {
  const accent = row.accent ?? '#4ade80'
  return (
    <button
      className="tv-panel-row"
      onClick={() => onNavigate(row.path, row.comingSoon)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', height: 56, padding: '0 16px',
        background: isActive ? `${accent}10` : 'transparent',
        border: 'none',
        borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
        cursor: 'pointer', textAlign: 'left', borderRadius: 0,
        transition: 'background .15s',
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: row.iconBg, border: '1px solid rgba(255,255,255,.09)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 19, flexShrink: 0,
      }}>
        {row.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700,
          color: isActive ? accent : 'rgba(255,255,255,.88)',
          fontFamily: 'Sora, sans-serif', lineHeight: 1.2,
        }}>
          {row.title}
        </div>
        <div style={{
          fontSize: 10, color: 'rgba(255,255,255,.35)',
          fontFamily: 'DM Sans, sans-serif', marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {row.subtitle}
          {row.comingSoon && (
            <span style={{ marginLeft: 6, padding: '1px 5px', borderRadius: 4, background: 'rgba(255,180,0,.15)', color: '#fbbf24', fontSize: 9, fontWeight: 700 }}>
              {VOCAB.comingSoon}
            </span>
          )}
        </div>
      </div>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,.2)', flexShrink: 0 }}>›</span>
    </button>
  )
}

function SectionLabel({ label, subtitle, accent }: { label: string; subtitle?: string; accent?: string }) {
  return (
    <div style={{ padding: '14px 16px 4px' }}>
      <div style={{
        fontSize: 9, fontWeight: 800, letterSpacing: '0.13em',
        color: accent ?? 'rgba(255,255,255,.28)',
        fontFamily: 'Sora, sans-serif', textTransform: 'uppercase',
      }}>
        {label}
      </div>
      {subtitle && <div style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>{subtitle}</div>}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '6px 0' }} />
}

export default function TVControlPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function handleNavigate(path: string, comingSoon?: boolean) {
    if (comingSoon) {
      const t = document.createElement('div')
      t.textContent = `${VOCAB.comingSoon} — arriving soon!`
      t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:rgba(255,255,255,.85);padding:10px 20px;border-radius:20px;font-size:13px;font-family:DM Sans,sans-serif;border:1px solid rgba(255,255,255,.15);z-index:9999;pointer-events:none;'
      document.body.appendChild(t)
      setTimeout(() => t.remove(), 2800)
      onClose()
      return
    }
    if (path) { router.push(path); onClose() }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="tv-panel-backdrop" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.68)', zIndex: 400 }} />
      <div className="tv-panel-drawer" style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 290,
        background: '#0d1008', borderLeft: '1px solid rgba(255,255,255,.1)',
        zIndex: 401, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,.08)', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: 'rgba(255,255,255,.88)', fontFamily: 'Sora, sans-serif' }}>Jollof TV</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>Africa's Broadcast Network</div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
            color: 'rgba(255,255,255,.6)', fontSize: 17, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif',
          }}>×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <SectionLabel label="LISTEN & WATCH" subtitle="Content Discovery" />
          {SECTION_CONTENT.map(row => (
            <PanelRowItem key={row.title} row={row} isActive={!!pathname && !!row.path && pathname.startsWith(row.path)} onNavigate={handleNavigate} />
          ))}

          <Divider />

          <SectionLabel label="CREATE & MANAGE" subtitle="Creator Tools" accent="rgba(251,191,36,.6)" />
          {SECTION_CREATE.map(row => (
            <PanelRowItem key={row.title} row={row} isActive={!!pathname && !!row.path && pathname.startsWith(row.path)} onNavigate={handleNavigate} />
          ))}

          <Divider />

          <SectionLabel label="LIVE FEATURES" subtitle="Interactive Broadcasting" accent="rgba(249,115,22,.7)" />
          {SECTION_LIVE.map(row => (
            <PanelRowItem key={row.title} row={row} isActive={!!pathname && !!row.path && pathname === row.path} onNavigate={handleNavigate} />
          ))}

          <div style={{ height: 36 }} />
        </div>
      </div>
    </>
  )
}
