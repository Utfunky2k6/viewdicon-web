'use client'
// ============================================================
// VillageSquare — Pinned community board at top of Village Drum
// 4 tabs: Notices · Market Board · Talking Drum · Wisdom
// Expandable/collapsible
// ============================================================
import * as React from 'react'

interface Notice {
  id: string; title: string; body: string; time: string; tier: number
}

interface MarketTile {
  id: string; name: string; price: number; emoji: string; seller: string
}

interface DrumTick {
  id: string; text: string; time: string; emoji: string
}

const NOTICES: Notice[] = [
  { id: 'n1', title: 'Village Council — Saturday 4pm WAT', body: 'All Crest II+ members invited. Agenda: trade routes, seed bank, youth mentorship.', time: '3h ago', tier: 2 },
  { id: 'n2', title: 'New runner route: Lagos → Ibadan', body: 'Commerce Village approved a new delivery route. Rates posted on the market board.', time: '6h ago', tier: 1 },
  { id: 'n3', title: 'Harvest Moon ceremony — next week', body: 'Spirituality Village invites all members. Bring kola nut offerings.', time: '1d ago', tier: 3 },
]

const MARKET_TILES: MarketTile[] = [
  { id: 'm1', name: 'Fresh Tomatoes 5kg',   price: 2400,  emoji: '🍅', seller: 'Chioma' },
  { id: 'm2', name: 'Handwoven Ankara',     price: 12000, emoji: '👗', seller: 'Adaeze' },
  { id: 'm3', name: 'Shea Butter 1L',       price: 3500,  emoji: '🫙', seller: 'Fatima' },
  { id: 'm4', name: 'Cassava Flour 5kg',    price: 1800,  emoji: '🌾', seller: 'Emeka' },
  { id: 'm5', name: 'Solar Lamp (20W)',     price: 8900,  emoji: '💡', seller: 'Kofi' },
]

const DRUM_TICKS: DrumTick[] = [
  { id: 't1', text: 'Mama Ngozi posted a Voice Story', time: '2m ago', emoji: '🎙' },
  { id: 't2', text: 'Trade sealed between Kwame and Fatima', time: '5m ago', emoji: '🤝' },
  { id: 't3', text: 'Elder Okonkwo shared a new Proverb Chain', time: '9m ago', emoji: '📿' },
  { id: 't4', text: 'Amina Okafor earned Crest IV', time: '12m ago', emoji: '⭐' },
  { id: 't5', text: 'Commerce Village: Night Market now open', time: '18m ago', emoji: '🏮' },
  { id: 't6', text: 'New runner Kwame Runs joined the village', time: '24m ago', emoji: '🚚' },
  { id: 't7', text: 'BloodCall resolved — Elder Adeyemi responded', time: '31m ago', emoji: '🩸' },
]

const WISDOM: Array<{ id: string; content: string; author: string; kilaCount: number }> = [
  { id: 'w1', content: '"Corn eaten together tastes sweeter."', author: 'Elder Okonkwo', kilaCount: 847 },
  { id: 'w2', content: '"The river that forgets its source will dry up."', author: 'Mama Ngozi', kilaCount: 612 },
  { id: 'w3', content: '"When spider webs unite, they can tie up a lion."', author: 'Kwame Asante', kilaCount: 489 },
]

const CSS = `
@keyframes vs-expand{from{height:0;opacity:0}to{height:300px;opacity:1}}
@keyframes vs-tick-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes vs-tab-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes vs-notice-in{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
`

type SquareTab = 'notices' | 'market' | 'drum' | 'wisdom'

const TAB_CONFIG: Array<{ id: SquareTab; label: string; emoji: string }> = [
  { id: 'notices', label: 'Notices', emoji: '📯' },
  { id: 'market',  label: 'Market Board', emoji: '🛒' },
  { id: 'drum',    label: 'Talking Drum', emoji: '🥁' },
  { id: 'wisdom',  label: 'Wisdom', emoji: '🏛' },
]

interface VillageSquareProps {
  villageName?: string
  memberCount?: number
  villageEmoji?: string
}

export function VillageSquare({
  villageName = 'Commerce Village',
  memberCount = 4820,
  villageEmoji = '🧺',
}: VillageSquareProps) {
  const [expanded, setExpanded] = React.useState(false)
  const [tab, setTab] = React.useState<SquareTab>('notices')
  const tickRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('vs-css')) {
      const s = document.createElement('style')
      s.id = 'vs-css'
      s.textContent = CSS
      document.head.appendChild(s)
    }
  }, [])

  return (
    <div style={{
      margin: '0 0 8px 0',
      background: 'rgba(10,15,11,.97)',
      border: '1px solid rgba(212,160,23,.2)',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: expanded ? '0 4px 24px rgba(212,160,23,.1)' : 'none',
      transition: 'box-shadow .3s',
    }}>
      {/* Collapsed header row */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          padding: '10px 14px', background: 'transparent', border: 'none',
          cursor: 'pointer', gap: 10,
        }}
      >
        <span style={{ fontSize: 20 }}>{villageEmoji}</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 800, fontFamily: "'Sora', sans-serif", color: '#d4a017' }}>
            {villageName}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: "'Inter', sans-serif" }}>
            {memberCount.toLocaleString()} members · Village Square
          </div>
        </div>
        <span style={{
          fontSize: 14, color: 'rgba(212,160,23,.6)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform .25s',
          display: 'inline-block',
        }}>
          ▾
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ animation: 'vs-expand .25s ease' }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex', gap: 0,
            borderTop: '1px solid rgba(212,160,23,.12)',
            borderBottom: '1px solid rgba(212,160,23,.12)',
            overflowX: 'auto',
          }}>
            {TAB_CONFIG.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: '8px 6px',
                background: tab === t.id ? 'rgba(212,160,23,.12)' : 'transparent',
                border: 'none', borderBottom: tab === t.id ? '2px solid #d4a017' : '2px solid transparent',
                cursor: 'pointer', fontSize: 10, fontWeight: 700,
                fontFamily: "'Sora', sans-serif",
                color: tab === t.id ? '#d4a017' : 'rgba(255,255,255,.4)',
                whiteSpace: 'nowrap', transition: 'all .15s',
              }}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* Tab content — fixed height */}
          <div style={{ height: 220, overflowY: 'auto', padding: '10px 14px' }}>

            {/* NOTICES */}
            {tab === 'notices' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'vs-tab-in .2s ease' }}>
                {NOTICES.map((n, i) => (
                  <div key={n.id} style={{
                    padding: '10px 12px', borderRadius: 10,
                    border: '1px solid rgba(212,160,23,.2)',
                    background: 'rgba(212,160,23,.05)',
                    animation: `vs-notice-in .25s ease ${i * 0.05}s both`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#d4a017', fontFamily: "'Sora', sans-serif" }}>
                      📯 {n.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontFamily: "'Inter', sans-serif", marginTop: 3 }}>
                      {n.body}
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 5 }}>
                      Crest {n.tier}+ · {n.time}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MARKET BOARD */}
            {tab === 'market' && (
              <div style={{ animation: 'vs-tab-in .2s ease' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {MARKET_TILES.map(tile => (
                    <div key={tile.id} style={{
                      padding: '10px', borderRadius: 10,
                      border: '1px solid rgba(224,123,0,.2)',
                      background: 'rgba(224,123,0,.06)', cursor: 'pointer',
                    }}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{tile.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.85)', fontFamily: "'Sora', sans-serif", lineHeight: 1.3 }}>
                        {tile.name}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#e07b00', marginTop: 3 }}>
                        ₡{tile.price.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>
                        {tile.seller}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TALKING DRUM */}
            {tab === 'drum' && (
              <div style={{ animation: 'vs-tab-in .2s ease' }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: '#1a7c3e',
                  fontFamily: "'Sora', sans-serif", marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a7c3e', display: 'inline-block', boxShadow: '0 0 6px #1a7c3e' }} />
                  LIVE village activity
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {DRUM_TICKS.map((tick, i) => (
                    <div key={tick.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 10px', borderRadius: 8,
                      background: i === 0 ? 'rgba(26,124,62,.08)' : 'transparent',
                      borderLeft: i === 0 ? '2px solid #1a7c3e' : '2px solid transparent',
                    }}>
                      <span style={{ fontSize: 14 }}>{tick.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', fontFamily: "'Inter', sans-serif" }}>
                          {tick.text}
                        </span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginLeft: 8 }}>
                          {tick.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WISDOM */}
            {tab === 'wisdom' && (
              <div style={{ animation: 'vs-tab-in .2s ease', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: "'Inter', sans-serif" }}>
                  🏛 All-time FEAST posts from this village
                </div>
                {WISDOM.map(w => (
                  <div key={w.id} style={{
                    padding: '10px 12px', borderRadius: 10,
                    border: '1px solid rgba(212,160,23,.25)',
                    background: 'rgba(212,160,23,.07)',
                  }}>
                    <div style={{
                      fontSize: 13, fontStyle: 'italic', color: '#d4a017',
                      fontFamily: "'Sora', sans-serif", lineHeight: 1.5, marginBottom: 5,
                    }}>
                      {w.content}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', fontFamily: "'Inter', sans-serif" }}>
                        — {w.author}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#d4a017' }}>
                        ⭐ {w.kilaCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default VillageSquare
