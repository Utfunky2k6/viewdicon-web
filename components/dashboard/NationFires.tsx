'use client'
import { useRouter } from 'next/navigation'
import { ThemeMode, SectionLabel } from './shared'
import * as React from 'react'

export default function NationFires({ mode }: { mode: ThemeMode }) {
  const router = useRouter()
  const [fires, setFires] = React.useState<any[]>([])

  React.useEffect(() => {
    fetch('/api/v1/feed/nation/top?limit=6').then(res => res.ok ? res.json() : []).then(data => {
      if (Array.isArray(data)) setFires(data)
    }).catch(console.error)
  }, [])

  return (
    <>
      <SectionLabel label="🔥 Nation's Fires" more="See all" onMore={() => router.push('/dashboard/feed')} mode={mode} />
      <div style={{ display:'flex', gap:8, padding:'0 12px', overflowX:'auto', scrollbarWidth: 'none' }}>
        {fires.length === 0 && <div style={{ padding:10, fontSize:11, color:'rgba(255,255,255,0.5)' }}>No fires burning yet...</div>}
        {fires.map((f, i) => {
          const pct = Math.min(100, Math.max(0, (f.heatScore || 0) / 100))
          let label = f.stage || 'EMBER'
          let bg = 'linear-gradient(135deg,#1e3a5f,#3b82f6)' // Ember default

          if (label === 'BOIL') bg = 'linear-gradient(135deg,#7c2d12,#ea580c)'
          if (label === 'SIMMER') bg = 'linear-gradient(135deg,#713f12,#d97706)'
          if (label === 'FEAST' || label === 'SHARE_OUT') bg = 'linear-gradient(135deg,#7f1d1d,#b22222)'

          return (
            <div key={f.id || i} onClick={() => router.push('/dashboard/feed')} style={{ minWidth:108, borderRadius:12, padding:'11px 10px', flexShrink:0, cursor:'pointer', background:bg, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <span style={{ fontSize:22, marginBottom:5, display:'block' }}>{f.author?.villageEmoji || '🥁'}</span>
              <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.65)', marginBottom:2 }}>{f.author?.villageName || 'Unknown Village'}</div>
              <div style={{ fontSize:11, fontWeight:700, color:'#fff', lineHeight:1.3, marginBottom:5 }}>{f.content?.substring(0, 40) || 'Untitled'}</div>
              <div style={{ fontSize:11, fontWeight:800, color:'#fff' }}>{label} · {Math.round(f.heatScore || 0)}°</div>
              <div style={{ height:3, background:'rgba(255,255,255,.2)', borderRadius:99, overflow:'hidden', marginTop:4 }}>
                <div style={{ height:'100%', width:`${pct}%`, borderRadius:99, background:'rgba(255,255,255,.8)' }}/>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
