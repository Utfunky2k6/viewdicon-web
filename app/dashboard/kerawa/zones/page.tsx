'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { kerawaApi } from '@/lib/api'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

const FIRE = { primary: '#ef4444', dark: '#dc2626', light: '#fca5a5', bg: '#0a0a0a', card: '#141414', border: '#1f1f1f' }
const ZONE_TYPES = [
  { key: 'ALL', label: 'All', icon: '🌍' },
  { key: 'NIGHTLIFE', label: 'Nightlife', icon: '🌙' },
  { key: 'CAMPUS', label: 'Campus', icon: '🎓' },
  { key: 'BEACH', label: 'Beach', icon: '🏖️' },
  { key: 'MARKET', label: 'Market', icon: '🛍️' },
  { key: 'EVENT', label: 'Event', icon: '🎉' },
  { key: 'LOUNGE', label: 'Lounge', icon: '🍸' },
  { key: 'RESIDENTIAL', label: 'Residential', icon: '🏘️' },
]

const HEAT_EMOJIS = ['', '🔥', '🔥🔥', '🔥🔥🔥', '🔥🔥🔥🔥', '🔥🔥🔥🔥🔥']

export default function KerawaZonesPage() {
  const r = useRouter()
  const [filter, setFilter] = useState('ALL')
  const [zones, setZones] = useState<any[]>([])
  const [activeZone, setActiveZone] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const [z, az] = await Promise.all([kerawaApi.getZones(), kerawaApi.getActiveZone()])
        setZones(z?.zones || z || [])
        setActiveZone(az?.zone || az || null)
      } catch (e) { logApiFailure('kerawa/zones/fetch', e); setZones([]); setActiveZone(null) }
      setLoading(false)
    })()
  }, [])

  const MOCK_ZONES = [
    { id: 'z1', name: 'Freedom Park Lagos', type: 'NIGHTLIFE', activeUsers: 47, heat: 5, distance: '0.8 km', activeHours: '8PM - 4AM' },
    { id: 'z2', name: 'University of Lagos', type: 'CAMPUS', activeUsers: 89, heat: 4, distance: '2.1 km', activeHours: '6AM - 10PM' },
    { id: 'z3', name: 'Elegushi Beach', type: 'BEACH', activeUsers: 23, heat: 3, distance: '5.3 km', activeHours: '10AM - 8PM' },
    { id: 'z4', name: 'Lekki Market', type: 'MARKET', activeUsers: 56, heat: 4, distance: '3.7 km', activeHours: '7AM - 6PM' },
    { id: 'z5', name: 'Afro Festival Grounds', type: 'EVENT', activeUsers: 150, heat: 5, distance: '1.2 km', activeHours: '12PM - 2AM' },
    { id: 'z6', name: 'Shiro Lounge', type: 'LOUNGE', activeUsers: 18, heat: 2, distance: '4.5 km', activeHours: '5PM - 1AM' },
    { id: 'z7', name: 'Victoria Island', type: 'RESIDENTIAL', activeUsers: 34, heat: 3, distance: '6.0 km', activeHours: '24/7' },
  ]

  const MOCK_SAFE = [
    { name: 'Shell Petrol Station (24h)', distance: '200m' },
    { name: 'Chicken Republic VI', distance: '350m' },
    { name: 'GTBank Branch Lekki', distance: '500m' },
  ]

  const allZones = zones.length ? zones : (USE_MOCKS ? MOCK_ZONES : [])
  const displayed = allZones.filter(z => filter === 'ALL' || z.type === filter)

  async function handleCheckin(zoneId: string) {
    setCheckingIn(true)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject))
      await kerawaApi.checkin(zoneId, pos.coords.latitude, pos.coords.longitude)
      setActiveZone(allZones.find(z => z.id === zoneId))
    } catch { alert('Could not get location. Enable GPS.') }
    setCheckingIn(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: FIRE.bg, color: '#fff', fontFamily: 'monospace', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span onClick={() => r.push('/dashboard/kerawa')} style={{ fontSize: 20, cursor: 'pointer' }}>←</span>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>📍 Zones</h1>
        </div>
        {activeZone && (
          <div style={{ marginTop: 8, padding: '8px 12px', background: `${FIRE.primary}22`, borderRadius: 8, border: `1px solid ${FIRE.primary}`, fontSize: 12 }}>
            ✅ Checked in: <strong>{activeZone.name}</strong>
          </div>
        )}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, padding: '0 16px', overflowX: 'auto', marginBottom: 16 }}>
        {ZONE_TYPES.map(zt => (
          <button key={zt.key} onClick={() => setFilter(zt.key)} style={{ padding: '8px 12px', borderRadius: 20, background: filter === zt.key ? FIRE.primary : FIRE.card, border: `1px solid ${filter === zt.key ? FIRE.primary : FIRE.border}`, color: '#fff', fontFamily: 'monospace', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{zt.icon} {zt.label}</button>
        ))}
      </div>

      {/* Zone List */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>Loading zones...</div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>📍</div>
            <div style={{ color: '#666', fontSize: 13 }}>No active zones near you</div>
          </div>
        ) : (
          displayed.map((z: any) => {
            const isActive = activeZone?.id === z.id
            return (
              <div key={z.id} style={{ background: isActive ? `${FIRE.primary}11` : FIRE.card, borderRadius: 12, border: `1px solid ${isActive ? FIRE.primary : FIRE.border}`, padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{z.name}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, background: '#1a1a1a', fontSize: 10, color: FIRE.light }}>{ZONE_TYPES.find(t => t.key === z.type)?.icon} {z.type}</span>
                      <span style={{ fontSize: 10, color: '#888' }}>📏 {z.distance}</span>
                      <span style={{ fontSize: 10, color: '#888' }}>🕐 {z.activeHours}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12 }}>{HEAT_EMOJIS[z.heat] || '🔥'}</div>
                    <div style={{ fontSize: 11, color: FIRE.light, fontWeight: 700 }}>{z.activeUsers} 👥</div>
                  </div>
                </div>
                {!isActive && (
                  <button onClick={() => handleCheckin(z.id)} disabled={checkingIn} style={{ marginTop: 10, width: '100%', padding: '10px', borderRadius: 8, background: FIRE.primary, border: 'none', color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{checkingIn ? 'Getting GPS...' : '📍 Check In'}</button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Heat Map */}
      <div style={{ padding: '24px 16px 0' }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px' }}>🗺️ Zone Heat Map</h3>
        {allZones.sort((a, b) => (b.heat || 0) - (a.heat || 0)).slice(0, 5).map((z: any) => (
          <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 12, width: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#aaa' }}>{z.name}</span>
            <div style={{ flex: 1, height: 14, background: '#1a1a1a', borderRadius: 7, overflow: 'hidden' }}>
              <div style={{ width: `${(z.heat || 1) * 20}%`, height: '100%', background: `linear-gradient(90deg, ${FIRE.dark}, ${FIRE.primary})`, borderRadius: 7 }} />
            </div>
            <span style={{ fontSize: 10, color: '#888', width: 30, textAlign: 'right' }}>{z.activeUsers}</span>
          </div>
        ))}
      </div>

      {/* Safe Spots */}
      <div style={{ padding: '24px 16px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px' }}>☮️ Safe Spots Nearby</h3>
        {USE_MOCKS && MOCK_SAFE.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: FIRE.card, borderRadius: 8, border: `1px solid ${FIRE.border}`, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>🏪</span>
            <span style={{ flex: 1, fontSize: 12 }}>{s.name}</span>
            <span style={{ fontSize: 11, color: '#4ade80' }}>{s.distance}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
