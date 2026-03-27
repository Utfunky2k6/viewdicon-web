'use client'
import React, { useState } from 'react'

interface ToolProps {
  villageId?: string
  roleKey?: string
}

const bg = '#060d07'
const card = '#0f1e11'
const border = '#1e3a20'
const text = '#f0f7f0'
const muted = '#7da882'
const green = '#4caf7d'
const gold = '#c9a84c'
const red = '#e05a4e'
const blue = '#5b9bd5'

interface PayLink {
  id: string
  amount: number
  desc: string
  status: 'PAID' | 'PENDING' | 'EXPIRED'
  created: string
  expiry: string
}

const RECENT_LINKS: PayLink[] = [
  { id: 'PL-2026-001', amount: 15000, desc: 'Aso-Oke fabric order', status: 'PAID', created: '3h ago', expiry: '24h' },
  { id: 'PL-2026-002', amount: 8400, desc: 'Catering deposit — Ngozi event', status: 'PENDING', created: '1d ago', expiry: '72h' },
  { id: 'PL-2026-003', amount: 3200, desc: 'Pottery workshop fee', status: 'EXPIRED', created: '5d ago', expiry: '24h' },
]

const statusColor: Record<string, string> = {
  PAID: green,
  PENDING: gold,
  EXPIRED: red,
}

export default function PaymentLink({ villageId, roleKey }: ToolProps) {
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [expiry, setExpiry] = useState<'24h' | '72h' | '7d'>('72h')
  const [generated, setGenerated] = useState<{ link: string; id: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [links, setLinks] = useState<PayLink[]>(RECENT_LINKS)

  function generate() {
    if (!amount || !desc) return
    const id = 'PL-2026-' + Math.floor(Math.random() * 900 + 100)
    const link = `https://pay.viewdicon.com/${id}`
    setGenerated({ link, id })
    setLinks([{ id, amount: parseInt(amount), desc, status: 'PENDING', created: 'just now', expiry }, ...links])
  }

  function copy() {
    if (!generated) return
    navigator.clipboard?.writeText(generated.link).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      <div style={{ fontSize: 11, color: muted, letterSpacing: 1, marginBottom: 4 }}>PAYMENT LINKS</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Generate Link</div>

      {/* Form */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>Amount (₡)</div>
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            type="number"
            placeholder="e.g. 15000"
            style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 15, boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>Description</div>
          <input
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="e.g. Fabric order for Fatima"
            style={{ width: '100%', background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: text, fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: muted, marginBottom: 8 }}>Link Expiry</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['24h', '72h', '7d'] as const).map(e => (
              <button
                key={e}
                onClick={() => setExpiry(e)}
                style={{
                  flex: 1, padding: '8px 0', border: `1px solid ${expiry === e ? gold : border}`,
                  borderRadius: 8, background: expiry === e ? gold + '22' : bg,
                  color: expiry === e ? gold : muted, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                }}
              >{e}</button>
            ))}
          </div>
        </div>
        <button
          onClick={generate}
          style={{
            width: '100%', background: green, color: '#000', border: 'none',
            borderRadius: 10, padding: '13px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Generate Link
        </button>
      </div>

      {/* Generated card */}
      {generated && (
        <div style={{ background: '#0d2e18', border: `1px solid ${green}`, borderRadius: 14, padding: 18, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: green, fontWeight: 700 }}>● ACTIVE LINK</div>
            <div style={{ fontSize: 11, color: muted }}>{generated.id}</div>
          </div>
          {/* Blurred link with copy */}
          <div style={{ background: bg, borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ filter: 'blur(4px)', fontSize: 13, color: muted, userSelect: 'none' }}>
              https://pay.viewdicon.com/{generated.id}
            </span>
            <button
              onClick={copy}
              style={{ border: 'none', background: copied ? green + '33' : border, color: copied ? green : muted, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          {/* QR placeholder */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <div style={{
              width: 100, height: 100, border: `3px solid ${green}`, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            }}>
              <div style={{ width: 70, height: 70, border: `2px solid ${green}44`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: `1px solid ${green}44`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: muted }}>QR</div>
              </div>
            </div>
          </div>
          {/* Share buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[['📱 WhatsApp', '#25d366'], ['💬 Seso Chat', blue], ['🔗 Copy Link', muted]].map(([lbl, col]) => (
              <button
                key={lbl as string}
                onClick={lbl === '🔗 Copy Link' ? copy : undefined}
                style={{
                  flex: 1, padding: '8px 0', border: `1px solid ${col as string}44`,
                  borderRadius: 8, background: (col as string) + '11', color: col as string,
                  fontSize: 11, cursor: 'pointer',
                }}
              >{lbl as string}</button>
            ))}
          </div>
        </div>
      )}

      {/* Recent links */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 12 }}>Recent Links</div>
        {links.slice(0, 5).map(l => (
          <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{l.desc}</div>
              <div style={{ fontSize: 11, color: muted }}>{l.id} · {l.created}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700 }}>₡{l.amount.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: statusColor[l.status], fontWeight: 700 }}>{l.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
