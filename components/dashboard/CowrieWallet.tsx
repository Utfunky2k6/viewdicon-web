'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ThemeMode, t } from './shared'
import { useAuthStore } from '@/stores/authStore'

export default function CowrieWallet({ mode, onAction }: { mode: ThemeMode, onAction?: (action: string) => void }) {
  const router = useRouter()
  const isDark = mode === 'dark'
  const user = useAuthStore(s => s.user)
  const [balHidden, setBalHidden] = React.useState(false)
  const [balance, setBalance] = React.useState<{ cowrie: number; afcoin: number } | null>(null)
  const [isOffline, setIsOffline] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchBalance = async () => {
      const afroId = user?.afroId?.raw
      if (!afroId) { setIsOffline(true); setLoading(false); return }
      try {
        const res = await fetch(`/api/cowrie/wallet/${afroId}`)
        if (res.status === 503) {
          setIsOffline(true)
          return
        }
        const data = await res.json()
        if (data?.error?.code === 'STABILIZED_OFFLINE_MODE') {
          setIsOffline(true)
        } else {
          setBalance({ cowrie: data?.cowrie_balance ?? data?.cowrie ?? 0, afcoin: data?.africoin_balance ?? data?.afcoin ?? 0 })
        }
      } catch (err) {
        console.warn('[CowrieWallet] Sync failed:', err)
        setIsOffline(true)
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [user?.afroId?.raw])

  if (isOffline) {
    return (
      <div style={{ margin:'0 12px', borderRadius:14, padding:'12px 14px', background:t('card',mode), border:`1px solid ${t('border',mode)}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <span style={{ fontSize:16 }}>📡</span>
          <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:t('sub',mode) }}>Resonance Delayed</span>
        </div>
        <div style={{ fontSize:18, fontWeight:800, color:t('sub',mode), lineHeight:1.2, marginBottom:10 }}>
          The money core is tuning...
        </div>
        <div style={{ fontSize:10, color:t('sub',mode), background:'rgba(251,191,36,.05)', padding:'8px 10px', borderRadius:8, border:'1px solid rgba(251,191,36,.1)' }}>
          Your cowries are safe in the ancestral ledger. Access will restore shortly.
        </div>
      </div>
    )
  }

  return (
    <div style={{ margin:'0 12px', borderRadius:14, padding:'12px 14px', background:t('card',mode), border:`1px solid ${t('border',mode)}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
        <span style={{ fontSize:12 }}>🔵</span>
        <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', color:'#818cf8' }}>UnionPay</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:t('sub',mode) }}>Total Balance</span>
        <span onClick={() => setBalHidden(h => !h)} style={{ fontSize:13, cursor:'pointer', color:t('sub',mode) }}>{balHidden ? '👁️‍🗨️' : '👁️'}</span>
      </div>
      <div style={{ fontSize:28, fontWeight:800, color:t('text',mode), lineHeight:1, marginBottom:4 }}>
        {loading ? (
          <span style={{ opacity:0.3 }}>₡ ...</span>
        ) : (
          balHidden ? '₡ ••••••' : `₡ ${balance?.cowrie?.toLocaleString() ?? '0'}`
        )}
      </div>
      <div style={{ fontSize:10, color:t('sub',mode), marginBottom:10 }}>
        {loading ? 'Synchronizing with ledger...' : 'Identity Verified · cNGN Link Active'}
      </div>
      <div style={{ display:'flex', gap:6 }}>
        {[
          { lbl: '🫙 Pour', bg: '#1a7c3e', col: '#fff', action: 'send' },
          { lbl: '🪘 Call', bg: isDark ? '#1a2d1b' : '#e8f5ee', col: isDark ? '#4ade80' : '#1a7c3e', action: 'receive' },
          { lbl: '🔄 Weave', bg: isDark ? '#2a1800' : '#fef3c7', col: isDark ? '#fbbf24' : '#92400e', action: 'exchange' },
          { lbl: '🔥 Ajo', bg: isDark ? '#1e1030' : '#ede9fe', col: isDark ? '#a78bfa' : '#5b21b6', action: 'ajo' }
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
          <strong>₡ {balance?.afcoin ? balance.afcoin / 100 : 0} in AF-Coin</strong> — Stability Reserve Active
        </div>
        <span onClick={() => router.push('/dashboard/banking')} style={{ fontSize:11, fontWeight:700, color:'#1a7c3e', cursor:'pointer' }}>View →</span>
      </div>
    </div>
  )
}
