'use client'
import * as React from 'react'
import { ThemeMode, t } from './shared'

export default function CowrieWallet({ mode, onAction }: { mode: ThemeMode, onAction?: (action: string) => void }) {
  const isDark = mode === 'dark'
  const [balHidden, setBalHidden] = React.useState(false)

  return (
    <div style={{ margin:'0 12px', borderRadius:14, padding:'12px 14px', background:t('card',mode), border:`1px solid ${t('border',mode)}` }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:t('sub',mode) }}>Total Balance</span>
        <span onClick={() => setBalHidden(h => !h)} style={{ fontSize:13, cursor:'pointer', color:t('sub',mode) }}>👁</span>
      </div>
      <div style={{ fontSize:24, fontWeight:800, color:t('text',mode), lineHeight:1, marginBottom:4 }}>
        {balHidden ? '₡ ••••' : '₡ 4,200'}
      </div>
      <div style={{ fontSize:10, color:t('sub',mode), marginBottom:10 }}>Nigeria · cNGN linked · Updated 2 min ago</div>
      <div style={{ display:'flex', gap:6 }}>
        {[
          { lbl: '↑ Send', bg: '#1a7c3e', col: '#fff', action: 'send' },
          { lbl: '↓ Receive', bg: isDark ? '#1a2d1b' : '#e8f5ee', col: isDark ? '#4ade80' : '#1a7c3e', action: 'receive' },
          { lbl: '⇄ Exchange', bg: isDark ? '#2a1800' : '#fef3c7', col: isDark ? '#fbbf24' : '#92400e', action: 'exchange' },
          { lbl: '⭕ Ajo', bg: isDark ? '#1e1030' : '#ede9fe', col: isDark ? '#a78bfa' : '#5b21b6', action: 'ajo' }
        ].map(btn => (
          <button 
            key={btn.lbl} 
            onClick={() => onAction?.(btn.action)} 
            style={{ flex:1, padding:'9px 0', borderRadius:10, border:'none', fontSize:11, fontWeight:700, cursor:'pointer', background:btn.bg, color:btn.col }}
          >
            {btn.lbl}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8, padding:'8px 10px', borderRadius:8, background: isDark ? 'rgba(212,160,23,.08)' : '#fef9e7', border: isDark ? '1px solid rgba(212,160,23,.2)' : '1px solid #fde68a' }}>
        <div className="pulse-dot" style={{ width:8, height:8, borderRadius:'50%', background:'#d4a017', flexShrink:0 }}/>
        <div style={{ fontSize:11, flex:1, color: isDark ? '#fbbf24' : '#78350f', lineHeight:1.4 }}>
          <strong>₡ 1,800 in escrow</strong> — Trade session · Fatima D. · Builders Village
        </div>
        <span style={{ fontSize:11, fontWeight:700, color:'#1a7c3e', cursor:'pointer' }}>View →</span>
      </div>
    </div>
  )
}
