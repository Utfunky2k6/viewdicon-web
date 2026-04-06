'use client'
import * as React from 'react'

interface AllyCoronationSceneProps {
  allyName?: string
  onDone: () => void
  theme: any
}

export function AllyCoronationScene({ allyName, onDone, theme }: AllyCoronationSceneProps) {
  const [revealed, setRevealed] = React.useState(false)
  const [allyId] = React.useState(() => `ALY-${Date.now().toString(36).toUpperCase().slice(-4)}-${new Date().getFullYear()}`)

  React.useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 600)
    return () => clearTimeout(t)
  }, [])

  const allyColor = '#3b82f6'

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'linear-gradient(180deg,#060b07 0%,#081525 100%)',
      padding: '30px 20px 20px', overflowY: 'auto'
    }}>
      <div style={{
        width: 90, height: 90, borderRadius: '50%', background: `linear-gradient(135deg,#1e40af,${allyColor})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44,
        marginBottom: 20, boxShadow: `0 0 40px ${allyColor}55`,
        opacity: revealed ? 1 : 0, transform: revealed ? 'scale(1)' : 'scale(.4)',
        transition: 'all .8s cubic-bezier(0.34,1.56,.64,1)'
      }}>
        🤝
      </div>
      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900, color: '#f0f7f0', textAlign: 'center', marginBottom: 4 }}>
        {allyName ? `Welcome, ${allyName}` : 'Welcome, Friend of the Motherland'}
      </div>
      <div style={{ fontSize: 13, color: '#93c5fd', textAlign: 'center', lineHeight: 1.65, marginBottom: 18, maxWidth: 300 }}>
        You are a cultural ally and bridge-builder. Your Ally ID is permanent.
      </div>
      <div style={{ width: '100%', background: 'rgba(30,64,175,.12)', border: '1.5px solid rgba(59,130,246,.3)', borderRadius: 18, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(147,197,253,.5)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 4 }}>Ally Identification</div>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 19, fontWeight: 800, color: '#93c5fd', letterSpacing: '.1em' }}>{allyId}</div>
        <div style={{ fontSize: 10, color: 'rgba(147,197,253,.45)', marginTop: 3 }}>Circle 3 — No Village · No Role</div>
      </div>
      <div style={{ width: '100%', marginBottom: 18 }}>
        {[
          { e: '📺', t: 'Jollof TV — Public channels' },
          { e: '🛒', t: 'Cowrie Marketplace — Buyer only' },
          { e: '🤝', t: 'Cultural Exchange Portal' },
          { e: '🏠', t: 'Sponsor an African Village' }
        ].map(item => (
          <div key={item.e} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.1)', marginBottom: 7 }}>
            <span style={{ fontSize: 20 }}>{item.e}</span>
            <span style={{ fontSize: 13, color: '#f0f7f0' }}>{item.t}</span>
            <span style={{ marginLeft: 'auto', color: '#4ade80', fontWeight: 700 }}>✓</span>
          </div>
        ))}
        <div style={{ fontSize: 10, color: 'rgba(147,197,253,.45)', textAlign: 'center', lineHeight: 1.6, marginTop: 8 }}>
          After 30 days, earn 5 endorsements from African citizens to apply for village membership.
        </div>
      </div>

      {/* Village Application CTA */}
      <div style={{ width: '100%', background: 'rgba(26,124,62,.08)', border: '1.5px solid rgba(26,124,62,.25)', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#4ade80', marginBottom: 6 }}>Want Village Access?</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, marginBottom: 10 }}>
          After 30 days as an Ally, you can apply for full village membership. You will need to pass an African Knowledge Quiz and provide endorsements from existing citizens.
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontStyle: 'italic' }}>Visit Villages → Apply after your 30-day period.</div>
      </div>

      <button onClick={onDone} style={{
        width: '100%', padding: 15, borderRadius: 16,
        background: 'linear-gradient(135deg,#1e40af,#3b82f6)',
        color: '#fff', fontWeight: 800, fontSize: 15, border: 'none',
        cursor: 'pointer', boxShadow: '0 6px 24px rgba(59,130,246,.3)'
      }}>Enter as Ally</button>
    </div>
  )
}
