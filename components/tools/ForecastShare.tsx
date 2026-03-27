'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

interface DayForecast { day: string; emoji: string; high: number; low: number; rain: number; wind: number }
interface CropPrice { crop: string; emoji: string; direction: 'UP' | 'DOWN' | 'FLAT'; pct: number; reason: string }

const FORECAST: DayForecast[] = [
  { day: 'Thu', emoji: '🌤', high: 32, low: 24, rain: 10, wind: 12 },
  { day: 'Fri', emoji: '⛅', high: 30, low: 23, rain: 25, wind: 14 },
  { day: 'Sat', emoji: '🌧', high: 27, low: 21, rain: 75, wind: 18 },
  { day: 'Sun', emoji: '🌦', high: 28, low: 22, rain: 45, wind: 16 },
  { day: 'Mon', emoji: '🌤', high: 31, low: 23, rain: 15, wind: 11 },
  { day: 'Tue', emoji: '☀️', high: 34, low: 25, rain: 5, wind: 9 },
  { day: 'Wed', emoji: '☀️', high: 35, low: 26, rain: 5, wind: 8 },
]

const CROP_PRICES: CropPrice[] = [
  { crop: 'Maize', emoji: '🌽', direction: 'UP', pct: 8.4, reason: 'Dry spell reduces supply' },
  { crop: 'Yam', emoji: '🥔', direction: 'DOWN', pct: 3.2, reason: 'Harvest season incoming' },
  { crop: 'Tomato', emoji: '🍅', direction: 'UP', pct: 12.1, reason: 'Rain damage in Kaduna' },
  { crop: 'Cassava', emoji: '🌿', direction: 'FLAT', pct: 0.8, reason: 'Stable supply chain' },
]

const CROP_CYCLE = ['Early-season prep', 'Planting window', 'Growing season', 'Mid-season care', 'Pre-harvest', 'Harvest now', 'Post-harvest']
const CURRENT_WEEK_POS = 4

export default function ForecastShare({ villageId, roleKey }: ToolProps) {
  const [shared, setShared] = useState(false)
  const [alertRain, setAlertRain] = useState(30)
  const [alertTemp, setAlertTemp] = useState(38)
  const [alertActive, setAlertActive] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const shareToFeed = () => { setShared(true); flash('Forecast shared as Village Notice! 🌍') }
  const setAlert = () => { setAlertActive(true); flash(`Alert set: Rain > ${alertRain}mm or Temp > ${alertTemp}°C`) }

  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 })
  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '5px 8px', color: text, fontSize: 13, outline: 'none', width: 60 }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Weather & Crop Forecast</div>
          <div style={{ color: muted, fontSize: 12 }}>Kaduna Agricultural Zone · Updated 14:00</div>
        </div>
        <div style={{ fontSize: 22 }}>🌍</div>
      </div>

      {/* 7-day forecast */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>7-Day Forecast</div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {FORECAST.map((d, i) => (
            <div key={d.day} style={{ minWidth: 60, background: i === 0 ? '#1e3a20' : '#0a1a0c', border: `1px solid ${i === 0 ? green : border}`, borderRadius: 10, padding: '8px 6px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: i === 0 ? green : muted, fontWeight: i === 0 ? 700 : 400 }}>{d.day}</div>
              <div style={{ fontSize: 20, margin: '4px 0' }}>{d.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{d.high}°</div>
              <div style={{ fontSize: 10, color: muted }}>{d.low}°</div>
              <div style={{ fontSize: 10, color: blue, marginTop: 2 }}>💧{d.rain}%</div>
              <div style={{ fontSize: 9, color: muted }}>💨{d.wind}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Crop cycle */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Crop Calendar — Current Week</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {CROP_CYCLE.map((stage, i) => (
            <div key={stage} style={{ flex: 1, minWidth: 70, padding: '6px 4px', borderRadius: 8, background: i === CURRENT_WEEK_POS ? gold + '22' : '#0a1a0c', border: `2px solid ${i === CURRENT_WEEK_POS ? gold : border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: i === CURRENT_WEEK_POS ? gold : muted, fontWeight: i === CURRENT_WEEK_POS ? 700 : 400, lineHeight: 1.3 }}>{stage}</div>
              {i === CURRENT_WEEK_POS && <div style={{ fontSize: 9, color: gold }}>← Now</div>}
            </div>
          ))}
        </div>
      </div>

      {/* AI Price Forecast */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>AI Price Forecast</div>
        <div style={{ fontSize: 11, color: muted, marginBottom: 10 }}>Expected price movement — next 2 weeks</div>
        {CROP_PRICES.map(c => (
          <div key={c.crop} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${border}` }}>
            <span style={{ fontSize: 18 }}>{c.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{c.crop}</div>
              <div style={{ fontSize: 10, color: muted }}>{c.reason}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16, color: c.direction === 'UP' ? red : c.direction === 'DOWN' ? green : muted }}>
                {c.direction === 'UP' ? '↑' : c.direction === 'DOWN' ? '↓' : '→'}
              </span>
              <span style={{ fontWeight: 700, color: c.direction === 'UP' ? red : c.direction === 'DOWN' ? green : muted, fontSize: 14 }}>
                {c.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Alert setter */}
      <div style={{ background: card, border: `1px solid ${alertActive ? green : border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Set Weather Alert</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: muted }}>Notify if rain &gt;</span>
          <input type="number" value={alertRain} onChange={e => setAlertRain(Number(e.target.value))} style={inp} />
          <span style={{ fontSize: 12, color: muted }}>mm/day or temp &gt;</span>
          <input type="number" value={alertTemp} onChange={e => setAlertTemp(Number(e.target.value))} style={inp} />
          <span style={{ fontSize: 12, color: muted }}>°C</span>
        </div>
        {alertActive
          ? <div style={{ fontSize: 12, color: green }}>✓ Alert active — you will be notified via Seso</div>
          : <button onClick={setAlert} style={btn(amber)}>Set Alert</button>
        }
      </div>

      {/* Share to feed */}
      {!shared ? (
        <button onClick={shareToFeed} style={{ ...btn(green), width: '100%', fontSize: 14 }}>🌍 Share Forecast to Village Feed</button>
      ) : (
        <div style={{ background: green + '22', border: `1px solid ${green}`, borderRadius: 10, padding: 12, textAlign: 'center', color: green, fontWeight: 700 }}>
          ✓ Forecast shared as Village Notice
        </div>
      )}
    </div>
  )
}
