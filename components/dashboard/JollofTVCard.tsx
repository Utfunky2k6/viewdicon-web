'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'

const ACTION_ROUTES: Record<string, string> = {
  '▶ Watch': '/dashboard/jollof',
  '🏺 Spray': '/dashboard/cowrie-flow',
  '⭐ Kíla': '/dashboard/feed',
}

export default function JollofTVCard() {
  const router = useRouter()
  return (
    <div onClick={() => router.push('/dashboard/jollof')} style={{ margin:'8px 12px', borderRadius:14, overflow:'hidden', cursor:'pointer', position:'relative' }}>
      <div style={{ height:100, display:'flex', alignItems:'flex-end', padding:'10px 12px', position:'relative', background:'linear-gradient(135deg,#0a1f0f,#1a4a1f)' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.7),transparent 60%)' }}/>
        <div style={{ position:'absolute', top:8, left:10, background:'#ef4444', color:'#fff', borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:700, letterSpacing:'.04em', display:'flex', alignItems:'center', gap:4 }}>
          <div className="live-dot" style={{ width:5, height:5, borderRadius:'50%', background:'#fff' }}/>LIVE
        </div>
        <div style={{ position:'absolute', top:8, right:10, background:'rgba(0,0,0,.55)', color:'#fff', borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:700 }}>👁 4.2K watching</div>
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'flex-end', justifyContent:'space-between', width:'100%' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff', lineHeight:1.3 }}>Drums of the Ancestors — Music Night</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.7)', marginTop:1 }}>Kwame Asante · Arts Village · Ìlú Akéwì</div>
          </div>
          <div style={{ display:'flex', gap:5 }}>
            {['▶ Watch','🏺 Spray','⭐ Kíla'].map(lbl => (
              <span key={lbl} onClick={(e) => { e.stopPropagation(); router.push(ACTION_ROUTES[lbl] || '/dashboard/jollof') }} style={{ background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)', borderRadius:99, padding:'4px 9px', fontSize:10, fontWeight:700, color:'#fff', cursor:'pointer' }}>{lbl}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
