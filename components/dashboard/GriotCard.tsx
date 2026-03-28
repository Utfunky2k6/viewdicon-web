'use client'
import * as React from 'react'
import { ThemeMode } from './shared'

const FALLBACK_MESSAGE = '"The village drum calls at first light. Open your ears to the market — opportunity is patient, but not forever."'
const FALLBACK_CHIPS = ['💬 Ask Griot', '🌾 View market', '🤝 Find circle']

export default function GriotCard({ mode, onAction }: { mode: ThemeMode, onAction?: (action: string) => void }) {
  const isDark = mode === 'dark'
  const [message, setMessage] = React.useState<string | null>(null)
  const [chips, setChips] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const now = React.useMemo(() => {
    const d = new Date()
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`
  }, [])

  React.useEffect(() => {
    let token: string | null = null
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('afk-auth') : null
      token = stored ? JSON.parse(stored)?.state?.accessToken ?? null : null
    } catch {}
    if (!token) { setMessage(FALLBACK_MESSAGE); setChips(FALLBACK_CHIPS); setLoading(false); return }

    fetch('/api/sorosoke/griot/daily-briefing', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const b = d?.data
        if (b?.message) {
          setMessage(`"${b.message}"`)
          setChips(Array.isArray(b.chips) ? b.chips.map((c: any) => c.label ?? c) : FALLBACK_CHIPS)
        } else {
          setMessage(FALLBACK_MESSAGE)
          setChips(FALLBACK_CHIPS)
        }
      })
      .catch(() => { setMessage(FALLBACK_MESSAGE); setChips(FALLBACK_CHIPS) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ margin:'8px 12px', borderRadius:14, padding:13, cursor:'pointer', position:'relative', overflow:'hidden', background: isDark ? 'linear-gradient(135deg,#0a2e14,#155c28)' : 'linear-gradient(135deg,#0f5028,#1a7c3e)' }}>
      <div style={{ position:'absolute', right:-8, bottom:-8, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,.06)' }}/>

      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, border:'1.5px solid rgba(255,255,255,.25)' }}>🦅</div>
        <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.7)', textTransform:'uppercase', letterSpacing:'.07em' }}>Griot · Your AI Elder</span>
        <span style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginLeft:'auto' }}>{now}</span>
      </div>

      <div style={{ fontSize:12, color:'#d1fae5', lineHeight:1.65, fontStyle:'italic', marginBottom:8, minHeight:48 }}>
        {loading ? (
          <span style={{ opacity:.45 }}>Griot is consulting the oracle…</span>
        ) : message}
      </div>

      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
        {(chips.length > 0 ? chips : FALLBACK_CHIPS).map(chip => (
          <span key={chip} onClick={() => onAction?.(chip)} style={{ background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)', borderRadius:99, padding:'4px 10px', fontSize:10, color:'#fff', fontWeight:600, cursor:'pointer' }}>
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}
