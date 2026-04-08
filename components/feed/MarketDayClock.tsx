'use client'
// ══════════════════════════════════════════════════════════
// MARKET DAY CLOCK — Africa-first 4-day rotating market cycle
// Eke (🟢) → Orie (🔵) → Afo (🟣) → Nkwo (🟡)
// Based on Igbo 4-day week mapped to African trading rhythms
// ══════════════════════════════════════════════════════════
import * as React from 'react'
import { sorosokeApi } from '@/lib/api'

interface MarketDay {
  name: string
  akan: string
  meaning: string
  heatBoost: number
  isMarketDay: boolean
  emoji: string
  tradingVillages: string[]
  bannerText: string
  color: string
  dayIndex: number
  nextMarketIn: number
}

const FALLBACK: MarketDay = {
  name: 'Eke', akan: 'Akwasidae', meaning: 'The great marketplace',
  heatBoost: 20, isMarketDay: true, emoji: '🟢',
  tradingVillages: ['commerce', 'agriculture', 'finance'],
  bannerText: 'Eke Market is OPEN — Commerce, Agriculture, Finance are heating up!',
  color: '#1a7c3e', dayIndex: 0, nextMarketIn: 0,
}

const DAY_DOTS = [
  { name: 'Eke',  emoji: '🟢', color: '#1a7c3e' },
  { name: 'Orie', emoji: '🔵', color: '#0369a1' },
  { name: 'Afo',  emoji: '🟣', color: '#7c3aed' },
  { name: 'Nkwo', emoji: '🟡', color: '#d4a017' },
]

interface Props {
  collapsed?: boolean
}

export function MarketDayClock({ collapsed = false }: Props) {
  const [day, setDay] = React.useState<MarketDay>(FALLBACK)
  const [open, setOpen] = React.useState(false)
  const [leaderboard, setLeaderboard] = React.useState<any[]>([])

  React.useEffect(() => {
    sorosokeApi.marketDay()
      .then((r: any) => { if (r?.data) setDay(r.data) })
      .catch(() => {})
  }, [])

  const handleExpand = () => {
    setOpen(v => !v)
    if (!open && leaderboard.length === 0) {
      sorosokeApi.marketDayLeaderboard()
        .then((r: any) => { if (r?.data?.posts) setLeaderboard(r.data.posts) })
        .catch(() => {})
    }
  }

  if (collapsed) return null

  return (
    <div style={{ margin: '6px 12px 4px', borderRadius: 16, overflow: 'hidden', border: `1px solid ${day.color}30` }}>
      {/* Banner row */}
      <div
        onClick={handleExpand}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
          background: `linear-gradient(135deg, ${day.color}18, ${day.color}06)`,
          cursor: 'pointer',
        }}
      >
        {/* 4-day cycle dots */}
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          {DAY_DOTS.map((d, i) => (
            <div key={d.name} style={{
              width: day.dayIndex === i ? 10 : 7,
              height: day.dayIndex === i ? 10 : 7,
              borderRadius: '50%',
              background: day.dayIndex === i ? d.color : 'rgba(255,255,255,.15)',
              transition: 'all .2s',
              boxShadow: day.dayIndex === i ? `0 0 6px ${d.color}80` : 'none',
            }} />
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 12, fontWeight: 900, color: day.color }}>
              {day.emoji} {day.name} Day
            </span>
            {day.isMarketDay && (
              <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 99, background: `${day.color}20`, color: day.color }}>
                MARKET OPEN
              </span>
            )}
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 6, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', marginLeft: 'auto' }}>
              +{day.heatBoost} 🔥
            </span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 1, fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {day.meaning}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</div>
      </div>

      {/* Expanded panel */}
      {open && (
        <div style={{ background: `${day.color}08`, borderTop: `1px solid ${day.color}20`, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', lineHeight: 1.6, marginBottom: 10 }}>
            {day.bannerText}
          </div>

          {/* Trading villages */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {day.tradingVillages.map(v => (
              <span key={v} style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: `${day.color}18`, border: `1px solid ${day.color}30`, color: day.color, textTransform: 'capitalize' }}>
                🏘 {v}
              </span>
            ))}
          </div>

          {/* Market Day cycle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            {DAY_DOTS.map((d, i) => (
              <div key={d.name} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 14 }}>{d.emoji}</div>
                <div style={{ fontSize: 8, fontWeight: 700, color: day.dayIndex === i ? d.color : 'rgba(255,255,255,.25)', marginTop: 2 }}>{d.name}</div>
                {day.dayIndex === i && <div style={{ width: 4, height: 4, borderRadius: '50%', background: d.color, margin: '2px auto 0', boxShadow: `0 0 4px ${d.color}` }} />}
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
                🏆 Today's Top Posts
              </div>
              {leaderboard.slice(0, 3).map((p: any, i: number) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: day.color, width: 16 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#f0f5ee', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.authorName}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.body?.slice(0, 60) ?? ''}…</div>
                  </div>
                  <span style={{ fontSize: 9, color: day.color, fontWeight: 800, flexShrink: 0 }}>🔥 {Math.round(p.heatScore)}</span>
                </div>
              ))}
            </>
          )}

          {day.nextMarketIn > 0 && (
            <div style={{ marginTop: 8, fontSize: 9, color: 'rgba(255,255,255,.3)', textAlign: 'center' }}>
              Next Eke market in {day.nextMarketIn}h
            </div>
          )}
        </div>
      )}
    </div>
  )
}
