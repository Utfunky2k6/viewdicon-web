'use client'
import * as React from 'react'
import { ThemeMode, t } from './shared'

export default function NkisiShield({ mode }: { mode: ThemeMode }) {
  return (
    <div style={{ margin:'8px 12px 0', borderRadius:12, padding:'10px 12px', display:'flex', alignItems:'center', gap:10, background:t('card',mode), border:`1px solid ${t('border',mode)}` }}>
      <div className="pulse-dot" style={{ width:10, height:10, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 8px rgba(34,197,94,.6)', flexShrink:0 }}/>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:11, fontWeight:700, color:t('text',mode) }}>Nkisi Shield · GREEN</div>
        <div style={{ fontSize:10, color:t('sub',mode) }}>147 jobs · 0 disputes · Trust score 94%</div>
      </div>
      <div style={{ fontSize:14, fontWeight:800, color:'#22c55e' }}>94</div>
    </div>
  )
}
