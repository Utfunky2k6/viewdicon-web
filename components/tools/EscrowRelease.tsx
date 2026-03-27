'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

type EscrowStatus = 'LOCKED' | 'CONDITIONS_MET' | 'DISPUTED' | 'RELEASED'

interface Condition { label: string; met: boolean }
interface EscrowItem {
  id: string; seller: string; buyer: string; amount: number; item: string; status: EscrowStatus; conditions: Condition[]
}

const INIT_ESCROWS: EscrowItem[] = [
  {
    id: 'ESC-001', seller: 'Adaora Obi', buyer: 'Kelechi Nwosu', amount: 125000, item: 'Handloom Weaving Machine',
    status: 'LOCKED',
    conditions: [
      { label: 'Delivery confirmed by buyer', met: true },
      { label: 'Quality inspection passed', met: false },
      { label: 'Payment cleared in system', met: true },
    ]
  },
  {
    id: 'ESC-002', seller: 'Yusuf Garba', buyer: 'Amina Sule', amount: 48500, item: 'Kano Leather Sandals (50 pairs)',
    status: 'CONDITIONS_MET',
    conditions: [
      { label: 'Delivery confirmed by buyer', met: true },
      { label: 'Quality inspection passed', met: true },
      { label: 'Payment cleared in system', met: true },
    ]
  },
  {
    id: 'ESC-003', seller: 'Nnamdi Chukwu', buyer: 'Grace Ekwueme', amount: 310000, item: 'Agricultural Land Lease (6mo)',
    status: 'DISPUTED',
    conditions: [
      { label: 'Document signing complete', met: true },
      { label: 'Physical handover done', met: false },
      { label: 'Third-party verification', met: false },
    ]
  },
]

type Released = { id: string; seller: string; buyer: string; amount: number; item: string; releasedAt: string }

export default function EscrowRelease({ villageId, roleKey }: ToolProps) {
  const [escrows, setEscrows] = useState<EscrowItem[]>(INIT_ESCROWS)
  const [released, setReleased] = useState<Released[]>([])
  const [releasing, setReleasing] = useState<string | null>(null)
  const [showDispute, setShowDispute] = useState<string | null>(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeEvidence, setDisputeEvidence] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const toggleCondition = (escrowId: string, idx: number) => {
    setEscrows(prev => prev.map(e => {
      if (e.id !== escrowId) return e
      const newCond = e.conditions.map((c, i) => i === idx ? { ...c, met: !c.met } : c)
      const allMet = newCond.every(c => c.met)
      return { ...e, conditions: newCond, status: allMet ? 'CONDITIONS_MET' : 'LOCKED' }
    }))
  }

  const releaseFunds = (id: string) => {
    setReleasing(id)
    setTimeout(() => {
      const e = escrows.find(x => x.id === id)!
      setReleased(r => [...r, { id: e.id, seller: e.seller, buyer: e.buyer, amount: e.amount, item: e.item, releasedAt: new Date().toLocaleTimeString() }])
      setEscrows(prev => prev.filter(x => x.id !== id))
      setReleasing(null)
      flash(`₡${e.amount.toLocaleString()} released to ${e.seller}!`)
    }, 2000)
  }

  const raiseDispute = (id: string) => {
    setEscrows(prev => prev.map(e => e.id === id ? { ...e, status: 'DISPUTED' } : e))
    setShowDispute(null); setDisputeReason(''); setDisputeEvidence('')
    flash('Dispute raised — mediator notified')
  }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 16px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 })

  const statusColor: Record<EscrowStatus, string> = { LOCKED: amber, CONDITIONS_MET: green, DISPUTED: red, RELEASED: muted }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Escrow Release</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 16 }}>Active escrow contracts — Ogbo Ụtụ Engine</div>

      {/* Active escrows */}
      {escrows.map(e => {
        const allMet = e.conditions.every(c => c.met)
        const isReleasing = releasing === e.id
        return (
          <div key={e.id} style={{ background: card, border: `2px solid ${e.status === 'DISPUTED' ? red : e.status === 'CONDITIONS_MET' ? green : border}`, borderRadius: 14, marginBottom: 14, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: muted, fontFamily: 'monospace' }}>{e.id}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[e.status], background: statusColor[e.status] + '22', padding: '2px 8px', borderRadius: 10 }}>{e.status.replace('_', ' ')}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{e.item}</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                <div><span style={{ color: muted, fontSize: 11 }}>Seller: </span><span style={{ fontSize: 13 }}>{e.seller}</span></div>
                <div><span style={{ color: muted, fontSize: 11 }}>Buyer: </span><span style={{ fontSize: 13 }}>{e.buyer}</span></div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: gold, marginTop: 4 }}>₡{e.amount.toLocaleString()}</div>
            </div>

            {/* Conditions */}
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${border}` }}>
              <div style={{ fontSize: 12, color: muted, fontWeight: 700, marginBottom: 8 }}>CONDITIONS</div>
              {e.conditions.map((cond, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <button onClick={() => e.status !== 'DISPUTED' && toggleCondition(e.id, idx)}
                    style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${cond.met ? green : border}`, background: cond.met ? green : 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cond.met && <span style={{ color: '#000', fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </button>
                  <span style={{ fontSize: 13, color: cond.met ? text : muted, textDecoration: cond.met ? 'none' : 'none' }}>{cond.label}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
              {e.status === 'CONDITIONS_MET' && (
                <button onClick={() => releaseFunds(e.id)} disabled={isReleasing}
                  style={{ flex: 1, background: isReleasing ? '#1a3a20' : green, border: `2px solid ${green}`, borderRadius: 8, padding: '10px 0', color: isReleasing ? green : '#000', fontWeight: 700, cursor: 'pointer', fontSize: 14, boxShadow: isReleasing ? 'none' : `0 0 16px ${green}66`, transition: 'all 0.3s' }}>
                  {isReleasing ? '₡ Releasing...' : '🔓 Release Funds'}
                </button>
              )}
              {e.status === 'LOCKED' && (
                <button onClick={() => !allMet && flash('Meet all conditions first')} style={{ flex: 1, background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 8, padding: '8px 0', color: muted, fontSize: 13, cursor: 'default' }}>
                  {allMet ? '✓ All conditions met' : `${e.conditions.filter(c => c.met).length}/${e.conditions.length} conditions met`}
                </button>
              )}
              {e.status !== 'DISPUTED' && (
                <button onClick={() => setShowDispute(showDispute === e.id ? null : e.id)}
                  style={{ background: 'none', border: `1px solid ${red}`, borderRadius: 8, padding: '8px 14px', color: red, fontSize: 12, cursor: 'pointer' }}>⚑ Dispute</button>
              )}
              {e.status === 'DISPUTED' && (
                <div style={{ fontSize: 12, color: red, padding: '8px 0' }}>⚠ Under mediation — Ọba council notified</div>
              )}
            </div>

            {showDispute === e.id && (
              <div style={{ padding: '0 14px 14px' }}>
                <textarea placeholder="Reason for dispute..." value={disputeReason} onChange={ev => setDisputeReason(ev.target.value)} style={{ ...inp, minHeight: 60, resize: 'none', marginBottom: 8 }} />
                <input placeholder="Evidence description" value={disputeEvidence} onChange={ev => setDisputeEvidence(ev.target.value)} style={{ ...inp, marginBottom: 8 }} />
                <button onClick={() => raiseDispute(e.id)} style={btn(red)}>Raise Dispute</button>
              </div>
            )}
          </div>
        )
      })}

      {/* Released history */}
      {released.length > 0 && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${border}`, fontWeight: 700, fontSize: 13, color: muted }}>RELEASED HISTORY</div>
          {released.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.item}</div>
                <div style={{ fontSize: 11, color: muted }}>{r.seller} ← {r.buyer} · {r.releasedAt}</div>
              </div>
              <div style={{ color: green, fontWeight: 700 }}>₡{r.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
