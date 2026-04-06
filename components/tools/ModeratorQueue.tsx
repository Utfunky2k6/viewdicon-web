'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

type FlagReason = 'SPAM' | 'HATE' | 'MISINFORMATION' | 'INAPPROPRIATE' | 'HARASSMENT'
type ContentStatus = 'PENDING' | 'APPROVED' | 'REMOVED' | 'WARNED' | 'SUSPENDED'

interface ContentItem {
  id: string; preview: string; author: string; type: string; reason: FlagReason; reports: number; village: string; status: ContentStatus
}

const REASON_COLOR: Record<FlagReason, string> = { SPAM: amber, HATE: red, MISINFORMATION: '#e07b39', INAPPROPRIATE: '#9b59b6', HARASSMENT: red }

const INIT_QUEUE: ContentItem[] = [
  { id: 'mod1', preview: 'Free money! Click here to claim your ₡50,000 reward from Oba of Lagos! Limited time...', author: '@suspicious_promo', type: 'POST', reason: 'SPAM', reports: 12, village: 'Commerce Village', status: 'PENDING' },
  { id: 'mod2', preview: 'People from [ethnic group] should not be allowed in this village. They are all...', author: '@anon_7734', type: 'POST', reason: 'HATE', reports: 28, village: 'Community Board', status: 'PENDING' },
  { id: 'mod3', preview: 'URGENT: Viewdicon is storing your Cowrie wallet without consent. They are...', author: '@whistleblower99', type: 'POST', reason: 'MISINFORMATION', reports: 7, village: 'Technology Village', status: 'PENDING' },
  { id: 'mod4', preview: 'Anyone who buys from Mama Ngozi is a thief. She is the biggest fraudster in...', author: '@bitter_ex_client', type: 'COMMENT', reason: 'HARASSMENT', reports: 5, village: 'Market Village', status: 'PENDING' },
  { id: 'mod5', preview: '[Voice Story] — Content flagged for explicit language. Auto-detected by...', author: '@dj_explicit', type: 'VOICE_STORY', reason: 'INAPPROPRIATE', reports: 3, village: 'Arts Village', status: 'PENDING' },
  { id: 'mod6', preview: 'Buy cheap data now! 10GB for ₡500 only! Message @data_promo on Seso Chat to activate...', author: '@data_promo', type: 'POST', reason: 'SPAM', reports: 8, village: 'Technology Village', status: 'PENDING' },
]

const HISTORY = [
  { action: 'REMOVED', item: 'Crypto scam post', author: '@crypto_spammer', time: '11:32' },
  { action: 'WARNED', item: 'Aggressive trade dispute', author: '@angry_trader', time: '10:45' },
  { action: 'APPROVED', item: 'Market price announcement', author: '@market_iyaloja', time: '09:20' },
  { action: 'SUSPENDED', item: 'Repeat hate speech violator', author: '@repeat_offender', time: '08:55' },
]

const actionColor: Record<string, string> = { REMOVED: red, WARNED: amber, APPROVED: green, SUSPENDED: red }

export default function ModeratorQueue({ villageId, roleKey }: ToolProps) {
  const [queue, setQueue] = useState<ContentItem[]>(INIT_QUEUE)
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const pending = queue.filter(q => q.status === 'PENDING').length
  const decided = queue.filter(q => q.status !== 'PENDING')

  const takeAction = (id: string, action: ContentStatus) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: action } : q))
    const messages: Record<string, string> = { APPROVED: '✓ Content approved', REMOVED: '✕ Content removed', WARNED: '⚠ User warned', SUSPENDED: '🚫 User suspended' }
    flash(messages[action] || 'Action taken')
  }

  const bulkApprove = () => {
    const lowSeverity = queue.filter(q => q.status === 'PENDING' && q.reports <= 5 && q.reason === 'SPAM').map(q => q.id)
    setQueue(prev => prev.map(q => lowSeverity.includes(q.id) ? { ...q, status: 'APPROVED' } : q))
    flash(`${lowSeverity.length} low-severity items approved`)
  }

  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '5px 10px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 11 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Moderator Queue</div>
          <div style={{ color: muted, fontSize: 12 }}>Village Admin — Content Safety Board</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: pending > 5 ? amber : green }}>{pending}</div>
          <div style={{ fontSize: 10, color: muted }}>pending</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Accuracy Rate', value: '94%', color: green },
          { label: 'Avg Response', value: '4.2 min', color: gold },
          { label: 'Resolved Today', value: decided.length, color: blue },
        ].map(s => (
          <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bulk action */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={bulkApprove} style={{ ...btn(green), flex: 1, padding: '8px 0', fontSize: 12 }}>✅ Approve All Low-Risk</button>
      </div>

      {/* Queue */}
      {queue.filter(q => q.status === 'PENDING').map(item => (
        <div key={item.id} style={{ background: card, border: `2px solid ${item.reports > 10 ? red + '44' : border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 11, color: muted, marginBottom: 2 }}>
                <span style={{ fontFamily: 'monospace' }}>{item.author}</span> · {item.type} · {item.village}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.4, color: text }}>
                {item.preview.length > 100 ? item.preview.slice(0, 100) + '...' : item.preview}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: REASON_COLOR[item.reason], background: REASON_COLOR[item.reason] + '22', padding: '2px 7px', borderRadius: 8 }}>{item.reason}</span>
            <span style={{ fontSize: 10, color: item.reports > 10 ? red : amber }}>⚑ {item.reports} reports</span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => takeAction(item.id, 'APPROVED')} style={{ ...btn(green), fontSize: 11 }}>✅ Approve</button>
            <button onClick={() => takeAction(item.id, 'REMOVED')} style={{ ...btn(red), fontSize: 11 }}>❌ Remove</button>
            <button onClick={() => takeAction(item.id, 'WARNED')} style={{ ...btn(amber), fontSize: 11 }}>🔇 Warn User</button>
            <button onClick={() => takeAction(item.id, 'SUSPENDED')} style={{ background: 'none', border: `1px solid ${red}`, borderRadius: 8, padding: '5px 10px', color: red, fontWeight: 700, cursor: 'pointer', fontSize: 11 }}>🚫 Suspend</button>
          </div>
        </div>
      ))}

      {pending === 0 && (
        <div style={{ textAlign: 'center', padding: 24, color: green, fontSize: 15, fontWeight: 700 }}>✓ Queue clear — all items reviewed</div>
      )}

      {/* History */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden', marginTop: 8 }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, fontWeight: 700, fontSize: 13 }}>Today's Decisions</div>
        {[...decided.map(q => ({ action: q.status, item: q.preview.slice(0, 40) + '...', author: q.author, time: 'recent' })), ...HISTORY].slice(0, 6).map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: `1px solid ${border}` }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: actionColor[h.action] || muted, background: (actionColor[h.action] || muted) + '22', padding: '2px 6px', borderRadius: 6, minWidth: 68, textAlign: 'center' }}>{h.action}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12 }}>{h.item}</div>
              <div style={{ fontSize: 10, color: muted }}>{h.author}</div>
            </div>
            <span style={{ fontSize: 10, color: muted }}>{h.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
