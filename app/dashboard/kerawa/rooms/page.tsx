'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { kerawaApi } from '@/lib/api'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

const FIRE = { primary: '#ef4444', dark: '#dc2626', light: '#fca5a5', bg: '#0a0a0a', card: '#141414', border: '#1f1f1f' }
const ROOM_TYPES = [
  { key: 'ALL', label: 'All' },
  { key: 'PRIVATE_ROOM', label: 'Private', icon: '🔒' },
  { key: 'PAID_ROOM', label: 'Paid', icon: '💰' },
  { key: 'INVITE_ROOM', label: 'Invite', icon: '✉️' },
  { key: 'ANONYMOUS_VOICE', label: 'Voice', icon: '🎭' },
  { key: 'SPEED_DATING', label: 'Speed', icon: '⚡' },
]

export default function KerawaRoomsPage() {
  const r = useRouter()
  const [filter, setFilter] = useState('ALL')
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [myRoom, setMyRoom] = useState<any>(null)

  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('PRIVATE_ROOM')
  const [newMax, setNewMax] = useState(20)
  const [newPrice, setNewPrice] = useState('0')
  const [newMasked, setNewMasked] = useState(false)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const type = filter === 'ALL' ? undefined : filter
        const res = await kerawaApi.getRooms(type)
        setRooms(res?.rooms || res || [])
      } catch (e) { logApiFailure('kerawa/rooms/fetch', e); setRooms([]) }
      setLoading(false)
    })()
  }, [filter])

  const MOCK_ROOMS = [
    { id: 'r1', title: 'Night Owls Lounge', type: 'PRIVATE_ROOM', owner: 'GhostFlame_09', viewers: 8, maxViewers: 20, entryPrice: 0, masked: false, live: true },
    { id: 'r2', title: 'Premium Vibes Only', type: 'PAID_ROOM', owner: 'VelvetSoul', viewers: 3, maxViewers: 10, entryPrice: 100, masked: false, live: true },
    { id: 'r3', title: 'Anonymous Confessions', type: 'ANONYMOUS_VOICE', owner: 'ShadowX', viewers: 15, maxViewers: 50, entryPrice: 0, masked: true, live: true },
    { id: 'r4', title: 'Speed Dating: Lagos Edition', type: 'SPEED_DATING', owner: 'System', viewers: 12, maxViewers: 30, entryPrice: 50, masked: false, live: true },
    { id: 'r5', title: 'Chill & Chat', type: 'INVITE_ROOM', owner: 'NightOrchid', viewers: 4, maxViewers: 8, entryPrice: 0, masked: false, live: true },
  ]

  const displayed = (rooms.length ? rooms : (USE_MOCKS ? MOCK_ROOMS : [])).filter(rm => filter === 'ALL' || rm.type === filter)

  async function createRoom() {
    try {
      const res = await kerawaApi.createRoom({ title: newTitle, type: newType, maxViewers: newMax, entryPrice: +newPrice, masked: newMasked })
      setMyRoom(res?.room || res)
      setShowCreate(false)
      setNewTitle('')
    } catch (e) { logApiFailure('kerawa/rooms/create', e) }
  }

  async function joinRoom(roomId: string, entryPrice: number) {
    if (entryPrice > 0 && !confirm(`This room costs ${entryPrice} 💰 to enter. Proceed?`)) return
    try {
      await kerawaApi.joinRoom(roomId)
      alert('Connected to room!')
    } catch (e) { logApiFailure('kerawa/rooms/join', e) }
  }

  async function endRoom() {
    if (!myRoom) return
    try {
      await kerawaApi.endRoom(myRoom.id)
      setMyRoom(null)
    } catch (e) { logApiFailure('kerawa/rooms/end', e) }
  }

  return (
    <div style={{ minHeight: '100vh', background: FIRE.bg, color: '#fff', fontFamily: 'monospace', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span onClick={() => r.push('/dashboard/kerawa')} style={{ fontSize: 20, cursor: 'pointer' }}>←</span>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>🎥 Live Rooms</h1>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>{displayed.length} rooms</span>
        </div>
      </div>

      {/* My Active Room */}
      {myRoom && (
        <div style={{ margin: '0 16px 16px', padding: 14, background: `${FIRE.primary}22`, borderRadius: 12, border: `1px solid ${FIRE.primary}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>🔴 Your Room: {myRoom.title || 'Untitled'}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{myRoom.viewers || 0} viewers</div>
            </div>
            <button onClick={endRoom} style={{ padding: '8px 16px', borderRadius: 8, background: FIRE.dark, border: 'none', color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>End Room</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, padding: '0 16px', overflowX: 'auto', marginBottom: 16 }}>
        {ROOM_TYPES.map(rt => (
          <button key={rt.key} onClick={() => setFilter(rt.key)} style={{ padding: '8px 14px', borderRadius: 20, background: filter === rt.key ? FIRE.primary : FIRE.card, border: `1px solid ${filter === rt.key ? FIRE.primary : FIRE.border}`, color: '#fff', fontFamily: 'monospace', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{rt.icon ? `${rt.icon} ` : ''}{rt.label}</button>
        ))}
      </div>

      {/* Room Grid */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>Loading...</div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🎥</div>
            <div style={{ color: '#666', fontSize: 13 }}>No rooms in this category</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {displayed.map((rm: any) => (
              <div key={rm.id} onClick={() => joinRoom(rm.id, rm.entryPrice || 0)} style={{ background: FIRE.card, borderRadius: 12, border: `1px solid ${FIRE.border}`, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ height: 90, background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1515 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ fontSize: 32 }}>{rm.masked ? '🎭' : '🎥'}</span>
                  {rm.live && <div style={{ position: 'absolute', top: 8, left: 8, padding: '2px 8px', borderRadius: 4, background: FIRE.primary, fontSize: 9, fontWeight: 700 }}>🔴 LIVE</div>}
                  {rm.entryPrice > 0 && <div style={{ position: 'absolute', top: 8, right: 8, padding: '2px 8px', borderRadius: 4, background: '#f59e0b', fontSize: 9, fontWeight: 700, color: '#000' }}>{rm.entryPrice} 💰</div>}
                </div>
                <div style={{ padding: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rm.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888' }}>
                    <span>👤 {rm.owner}</span>
                    <span>{rm.viewers}/{rm.maxViewers}</span>
                  </div>
                  <div style={{ marginTop: 6, padding: '3px 8px', borderRadius: 4, background: '#1a1a1a', display: 'inline-block', fontSize: 9, color: FIRE.light }}>{rm.type.replace(/_/g, ' ')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: FIRE.card, borderRadius: '20px 20px 0 0', padding: '24px 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>🎥 Go Live</h3>
              <span onClick={() => setShowCreate(false)} style={{ fontSize: 20, cursor: 'pointer' }}>✕</span>
            </div>

            <label style={{ fontSize: 11, color: '#aaa' }}>Room Title</label>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Give your room a name..." style={{ width: '100%', padding: 12, background: '#1a1a1a', border: `1px solid ${FIRE.border}`, borderRadius: 8, color: '#fff', fontFamily: 'monospace', marginTop: 4, marginBottom: 12, boxSizing: 'border-box' }} />

            <label style={{ fontSize: 11, color: '#aaa' }}>Room Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 6, marginBottom: 12 }}>
              {ROOM_TYPES.slice(1).map(rt => (
                <div key={rt.key} onClick={() => setNewType(rt.key)} style={{ padding: '10px', borderRadius: 8, background: newType === rt.key ? FIRE.primary : '#1a1a1a', border: `1px solid ${newType === rt.key ? FIRE.primary : FIRE.border}`, textAlign: 'center', fontSize: 11, cursor: 'pointer' }}>{rt.icon} {rt.label}</div>
              ))}
            </div>

            <label style={{ fontSize: 11, color: '#aaa' }}>Max Viewers: {newMax}</label>
            <input type="range" min={2} max={100} value={newMax} onChange={e => setNewMax(+e.target.value)} style={{ width: '100%', accentColor: FIRE.primary, marginBottom: 12 }} />

            {newType === 'PAID_ROOM' && (<>
              <label style={{ fontSize: 11, color: '#aaa' }}>Entry Price (Cowries 💰)</label>
              <input value={newPrice} onChange={e => setNewPrice(e.target.value)} type="number" style={{ width: '100%', padding: 12, background: '#1a1a1a', border: `1px solid ${FIRE.border}`, borderRadius: 8, color: '#fff', fontFamily: 'monospace', marginTop: 4, marginBottom: 12, boxSizing: 'border-box' }} />
            </>)}

            <div onClick={() => setNewMasked(!newMasked)} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, cursor: 'pointer' }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${newMasked ? FIRE.primary : '#555'}`, background: newMasked ? FIRE.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>{newMasked ? '✓' : ''}</div>
              <span style={{ fontSize: 12, color: '#aaa' }}>🎭 Masked Mode (anonymous faces)</span>
            </div>

            <button onClick={createRoom} disabled={!newTitle} style={{ width: '100%', padding: 14, borderRadius: 10, background: newTitle ? FIRE.primary : '#333', border: 'none', color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>🔴 Start Room</button>
          </div>
        </div>
      )}

      {/* Go Live FAB */}
      {!myRoom && (
        <div onClick={() => setShowCreate(true)} style={{ position: 'fixed', bottom: 90, right: 20, width: 56, height: 56, borderRadius: '50%', background: FIRE.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, cursor: 'pointer', boxShadow: '0 4px 20px rgba(239,68,68,.4)', zIndex: 50 }}>🎥</div>
      )}
    </div>
  )
}
