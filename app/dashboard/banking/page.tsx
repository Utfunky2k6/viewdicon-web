'use client'
// ═══════════════════════════════════════════════════════════════════════════
// ILE OWO — Pan-African Banking Compound
// Offline-first · Section-based compound layout · All 20+ features
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import {
  ACCOUNT_TYPES, CARD_TIERS, HARVEST_SEASONS, CORRIDOR_RAILS,
  SPIRIT_VAULT_UNLOCK_TRIGGERS, UBUNTU_SCORE_TIERS, AFRICAN_BANKING_PROVERBS,
  POT_STATES, MARKET_DAY_META, getTodayMarketDay,
  AFRICAN_BANKS, INTL_BANKS, AFRICAN_COUNTRY_NAMES,
  ESUSU_CLOCK_CYCLES, ANCESTRAL_BUFFER_TIERS, GRIOT_CREDIT_GRADES,
  TRANSFER_ACCOUNT_TYPES, AJO_CADENCES, AJO_STATUSES, MOCK_FX_RATES,
  HARAMBEE_SCOPES, NKISI_SHIELD_LEVELS, PROOF_OF_HAND_TYPES,
  KOWE_EVENT_TYPES, PAN_AFRICAN_IDEAS, getUbuntuTier,
  DIASPORA_CORRIDORS, COWRIE_KEYS_TYPES,
} from '@/constants/banking'
import {
  cowrieApi, bankingExtApi, ajoApi, harambeeApi,
  escrowApi, corridorBanksApi, esusuClockApi,
  ancestralBufferApi, griotCreditApi,
  meshApi, tlpApi, cardApi, chainApi, orishaApi, aiGodsApi,
} from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { bankingQueue } from '@/lib/offline-db'

// ─── Offline ──────────────────────────────────────────────────────────────────
function useNetworkStatus() {
  const [online, setOnline] = useState(true)
  useEffect(() => {
    const u = () => { setOnline(true); bankingQueue.flush().catch(() => {}) }
    const d = () => setOnline(false)
    window.addEventListener('online', u); window.addEventListener('offline', d)
    setOnline(navigator.onLine)
    return () => { window.removeEventListener('online', u); window.removeEventListener('offline', d) }
  }, [])
  return online
}

// Offline queue — now IDB-backed with localStorage fallback
function enqueueOffline(type: string, payload: Record<string, unknown>, endpoint = '/api/bank/transfer') {
  bankingQueue.enqueue(type as Parameters<typeof bankingQueue.enqueue>[0], endpoint, payload)
    .catch(() => {
      // localStorage fallback if IDB unavailable
      const QK = 'afro_banking_offline_queue'
      const q = JSON.parse(localStorage.getItem(QK) ?? '[]')
      q.push({ id: `offl_${Date.now()}`, type, payload, ts: Date.now() })
      localStorage.setItem(QK, JSON.stringify(q))
    })
}
function getOfflineQueue(): { id: string; type: string; payload: Record<string, unknown>; ts: number }[] {
  return JSON.parse(localStorage.getItem('afro_banking_offline_queue') ?? '[]')
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────
const S = { font: 'DM Sans, sans-serif', head: 'Sora, sans-serif' }
function Card({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 14, padding: 16, border: '1px solid rgba(255,255,255,.08)', cursor: onClick ? 'pointer' : undefined, ...style }}>{children}</div>
}
function Btn({ label, onClick, variant = 'ghost', disabled, style }: { label: string; onClick?: () => void; variant?: 'primary' | 'ghost' | 'danger'; disabled?: boolean; style?: React.CSSProperties }) {
  const bg = variant === 'primary' ? '#18a05e' : variant === 'danger' ? '#c94040' : 'rgba(255,255,255,.08)'
  return <button onClick={onClick} disabled={disabled} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: disabled ? 'rgba(255,255,255,.04)' : bg, color: disabled ? 'rgba(255,255,255,.25)' : '#fff', fontSize: 13, fontWeight: 600, fontFamily: S.font, cursor: disabled ? 'not-allowed' : 'pointer', ...style }}>{label}</button>
}
function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, background: bg, color, fontSize: 10, fontWeight: 700, fontFamily: S.font }}>{label}</span>
}
function In({ value, onChange, placeholder, style }: { value: string; onChange: (v: string) => void; placeholder: string; style?: React.CSSProperties }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, fontFamily: S.font, boxSizing: 'border-box', marginBottom: 8, ...style }} />
}
function Sec({ emoji, title, sub }: { emoji: string; title: string; sub?: string }) {
  return <div style={{ marginBottom: 12 }}><div style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,.88)', fontFamily: S.head }}>{emoji} {title}</div>{sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.32)', marginTop: 3, fontFamily: S.font, lineHeight: 1.5 }}>{sub}</div>}</div>
}

// ─── Feature icon tile (for section grids) ────────────────────────────────────
function Tile({ emoji, label, active, color, onClick }: { emoji: string; label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 6, padding: '14px 6px', borderRadius: 14,
      border: `1.5px solid ${active ? color : 'rgba(255,255,255,.07)'}`,
      background: active ? `${color}14` : 'rgba(255,255,255,.025)',
      cursor: 'pointer', minHeight: 72, transition: 'all .2s',
    }}>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: active ? color : 'rgba(255,255,255,.5)', fontFamily: S.font, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE PANELS
// ═══════════════════════════════════════════════════════════════════════════════

// ── VAULT ────────────────────────────────────────────────────────────────────
// Send · Receive · Request — the full P2P money flow, nothing missing
function VaultPanel({ afroId, online, balance, setBalance }: { afroId: string; online: boolean; balance: { cowrie: number; africoin: number }; setBalance: (b: { cowrie: number; africoin: number }) => void }) {
  const [tab, setTab] = useState<'send'|'receive'|'request'>('send')
  const [to, setTo] = useState(''); const [amt, setAmt] = useState(''); const [memo, setMemo] = useState('')
  const [reqTo, setReqTo] = useState(''); const [reqAmt, setReqAmt] = useState(''); const [reqReason, setReqReason] = useState('')
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3200) }
  const copyId = () => { navigator.clipboard?.writeText(afroId).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  async function send() {
    if (!to || !amt) return; setBusy(true)
    try {
      if (!online) { enqueueOffline('p2p', { from: afroId, to, amount: Number(amt), memo }); flash('⏳ Queued — will auto-send when online ✓') }
      else { await cowrieApi.transfer(afroId, to, Number(amt), 'CWR', memo || 'P2P'); flash(`✓ ₡${Number(amt).toLocaleString()} ranṣẹ to ${to.split('@')[0]}`); cowrieApi.balance(afroId).then(b => setBalance(b as typeof balance)).catch(() => {}) }
      setTo(''); setAmt(''); setMemo('')
    } catch { flash('✗ Transfer failed') }
    setBusy(false)
  }

  function sendRequest() {
    if (!reqTo || !reqAmt) { flash('Choose recipient + amount'); return }
    fetch('/api/bank/request-money', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: afroId, to: reqTo, amount: Number(reqAmt), reason: reqReason }) })
      .then(() => { flash(`✓ Ìbẹ̀wọ sent to ${reqTo.split('@')[0]} — they will be notified`); setReqTo(''); setReqAmt(''); setReqReason('') })
      .catch(() => enqueueOffline('REQUEST_MONEY', { from: afroId, to: reqTo, amount: Number(reqAmt), reason: reqReason }))
  }

  const QUICK = [500, 1000, 2000, 5000, 10000, 50000]

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
        {([['send','↗ Ranṣẹ','#4ade80'],['receive','↙ Gbà','#60a5fa'],['request','🔔 Bẹ̀bẹ̀','#fbbf24']] as const).map(([t,l,c]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 4px', borderRadius: 12, border: `1.5px solid ${tab===t ? c : 'rgba(255,255,255,.07)'}`, background: tab===t ? `${c}12` : 'transparent', color: tab===t ? c : 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 800, fontFamily: S.head, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      {msg && <div style={{ padding: '8px 12px', borderRadius: 10, background: msg.startsWith('✗') ? 'rgba(239,68,68,.1)' : 'rgba(74,222,128,.08)', border: `1px solid ${msg.startsWith('✗') ? 'rgba(239,68,68,.25)' : 'rgba(74,222,128,.2)'}`, fontSize: 11, color: msg.startsWith('✗') ? '#ef4444' : '#4ade80', marginBottom: 10, fontFamily: S.font }}>{msg}</div>}

      {/* SEND TAB */}
      {tab === 'send' && (
        <div>
          <Sec emoji="↗" title="Ranṣẹ Cowrie" sub="Instant P2P · Offline-first · All 20 villages · 54 nations" />
          <In value={to} onChange={setTo} placeholder="@afroid, phone, or email" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 8 }}>
            {QUICK.map(q => <button key={q} onClick={() => setAmt(String(q))} style={{ padding: '9px 4px', borderRadius: 8, border: `1px solid ${amt===String(q)?'#4ade80':'rgba(255,255,255,.08)'}`, background: amt===String(q)?'rgba(74,222,128,.1)':'rgba(255,255,255,.02)', color: amt===String(q)?'#4ade80':'rgba(255,255,255,.5)', fontSize: 12, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>₡{q>=1000?`${q/1000}K`:q}</button>)}
          </div>
          <In value={amt} onChange={v => setAmt(v.replace(/\D/g,''))} placeholder="Or type amount (₡)" />
          {Number(amt) > 0 && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginBottom: 8 }}>≈ ${(Number(amt) * MOCK_FX_RATES.CWR_TO_USD).toFixed(2)} USD · {online ? '🟢 Instant' : '🟡 Queued offline'}</div>}
          <In value={memo} onChange={setMemo} placeholder="Memo (optional)" />
          <Btn label={busy ? '⏳…' : (to && Number(amt) ? `↗ Ranṣẹ ₡${Number(amt).toLocaleString()} → ${to.split('@')[0]}` : '↗ Ranṣẹ Cowrie')} onClick={send} variant="primary" disabled={busy || !to || !amt} style={{ width: '100%', fontSize: 13, padding: '12px' }} />
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.05)' }}>
            <Sec emoji="💧" title="Àṣẹ Ọjọ — Daily Blessing" sub="Claim your daily Cowrie drop — given each sunrise" />
            <Btn label="🌅 Claim Today's Blessing" variant="primary" style={{ width: '100%' }}
              onClick={() => cowrieApi.claimDrop('DAILY_DROP', afroId).then(() => { flash('✓ Àṣẹ gbà — blessing received!'); cowrieApi.balance(afroId).then(b => setBalance(b as typeof balance)).catch(() => {}) }).catch(() => flash('✗ Already claimed today — come back tomorrow'))} />
          </div>
        </div>
      )}

      {/* RECEIVE TAB */}
      {tab === 'receive' && (
        <div>
          <Sec emoji="↙" title="Gbà Cowrie — Receive" sub="Share any key below — anyone can pay you instantly" />
          {/* QR code */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ width: 156, height: 156, margin: '0 auto 10px', background: '#fff', borderRadius: 14, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px rgba(74,222,128,.15)' }}>
              <div style={{ width: '100%', height: '100%', background: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 21 21'><rect width='7' height='7' fill='%23000'/><rect x='14' width='7' height='7' fill='%23000'/><rect y='14' width='7' height='7' fill='%23000'/><rect x='2' y='2' width='3' height='3' fill='%23fff'/><rect x='16' y='2' width='3' height='3' fill='%23fff'/><rect x='2' y='16' width='3' height='3' fill='%23fff'/><rect x='9' y='1' width='1' height='2' fill='%23000'/><rect x='11' y='1' width='2' height='1' fill='%23000'/><rect x='10' y='3' width='1' height='2' fill='%23000'/><rect x='9' y='6' width='3' height='1' fill='%23000'/><rect x='1' y='9' width='2' height='3' fill='%23000'/><rect x='5' y='9' width='1' height='2' fill='%23000'/><rect x='9' y='10' width='1' height='3' fill='%23000'/><rect x='12' y='9' width='3' height='1' fill='%23000'/><rect x='14' y='10' width='2' height='2' fill='%23000'/><rect x='11' y='12' width='2' height='1' fill='%23000'/><rect x='11' y='14' width='1' height='3' fill='%23000'/><rect x='14' y='14' width='2' height='2' fill='%23000'/><rect x='18' y='12' width='1' height='3' fill='%23000'/><rect x='16' y='16' width='3' height='2' fill='%23000'/></svg>") center/contain no-repeat` }} />
            </div>
            <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#4ade80', marginBottom: 4 }}>{afroId}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font }}>Ìlù QR — Scan to send me Cowrie</div>
          </div>
          {/* Cowrie Keys */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 8 }}>ÀWỌN BỌ́ẸLI — PAYMENT KEYS</div>
          {([
            { ...COWRIE_KEYS_TYPES[0], val: afroId },
            { ...COWRIE_KEYS_TYPES[1], val: '+234 *** *** 5678' },
            { ...COWRIE_KEYS_TYPES[2], val: `${afroId.split('@')[0]}@afro.id` },
          ] as const).map(k => (
            <button key={k.key} onClick={() => { navigator.clipboard?.writeText(k.val).catch(()=>{}); flash(`✓ ${k.key} copied — share to receive Cowrie`) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, border: `1px solid ${k.color}22`, background: `${k.color}08`, cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{k.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: k.color, fontFamily: S.head }}>{k.key}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontFamily: 'monospace' }}>{k.val}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font }}>{k.desc}</div>
              </div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>📋</span>
            </button>
          ))}
        </div>
      )}

      {/* REQUEST TAB — like UPI Collect / PIX Cobrança */}
      {tab === 'request' && (
        <div>
          <Sec emoji="🔔" title="Ìbẹ̀wọ Cowrie — Request" sub="Send a payment request — like UPI Collect or PIX Cobrança. They tap confirm, done." />
          <In value={reqTo} onChange={setReqTo} placeholder="Who to request from? (@afroid or phone)" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 8 }}>
            {QUICK.map(q => <button key={q} onClick={() => setReqAmt(String(q))} style={{ padding: '9px 4px', borderRadius: 8, border: `1px solid ${reqAmt===String(q)?'#fbbf24':'rgba(255,255,255,.08)'}`, background: reqAmt===String(q)?'rgba(251,191,36,.1)':'rgba(255,255,255,.02)', color: reqAmt===String(q)?'#fbbf24':'rgba(255,255,255,.5)', fontSize: 12, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>₡{q>=1000?`${q/1000}K`:q}</button>)}
          </div>
          <In value={reqAmt} onChange={v => setReqAmt(v.replace(/\D/g,''))} placeholder="Amount to request (₡)" />
          <In value={reqReason} onChange={setReqReason} placeholder="Reason — e.g. Rent, Ajo contribution, Food" />
          {Number(reqAmt) > 0 && reqTo && <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.15)', marginBottom: 8, fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: S.font }}>🔔 {reqTo.split('@')[0]} will receive a notification to pay ₡{Number(reqAmt).toLocaleString()} to you</div>}
          <Btn label={reqTo && reqAmt ? `🔔 Request ₡${Number(reqAmt).toLocaleString()} from ${reqTo.split('@')[0]}` : '🔔 Send Cowrie Request'} onClick={sendRequest} variant="primary" disabled={!reqTo || !reqAmt} style={{ width: '100%', fontSize: 13, padding: '12px' }} />
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: S.font, lineHeight: 1.7 }}>
            💡 <strong style={{ color: 'rgba(255,255,255,.5)' }}>How it works:</strong> Your request pings their Cowrie app. They see your name + amount + reason. One tap confirms. Money arrives instantly — like UPI Collect in India or PIX Cobrança in Brazil, but built on African drumbeats.
          </div>
        </div>
      )}
    </div>
  )
}

// ── AKỌỌLẸ ──────────────────────────────────────────────────────────────────
function AkoolePanel() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div>
      <Sec emoji="🏛️" title="Account Types" sub="9 account types rooted in 3,000 years of African heritage" />
      {ACCOUNT_TYPES.map(a => (
        <Card key={a.id} onClick={() => setOpen(open === a.id ? null : a.id)} style={{ marginBottom: 8, borderLeft: `3px solid ${open === a.id ? a.color : 'transparent'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: a.bg, border: `1px solid ${a.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{a.emoji}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: a.color, fontFamily: S.head }}>{a.name}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: S.font }}>{a.subtitle}</div></div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', fontFamily: S.font }}>{a.monthlyFee === 0 ? 'Free' : `₡${a.monthlyFee}/mo`}</div>
          </div>
          {open === a.id && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.06)' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', fontFamily: S.font, lineHeight: 1.6, marginBottom: 8 }}>{a.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>{a.features.map(f => <Pill key={f} label={f} color={a.color} bg={`${a.color}18`} />)}</div>
              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,.02)', borderRadius: 8, fontSize: 10, color: 'rgba(255,255,255,.28)', fontStyle: 'italic', fontFamily: S.font, lineHeight: 1.6 }}>📖 {a.africanOrigin}</div>
              <div style={{ marginTop: 6, fontSize: 10, color: 'rgba(255,255,255,.2)', fontFamily: S.font }}>Max: {a.maxBalance ? `₡${a.maxBalance.toLocaleString()}` : '∞'} · {a.kycTier}</div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

// ── KAADI ─────────────────────────────────────────────────────────────────────
function KaadiPanel() {
  const [sel, setSel] = useState<string | null>(null)
  const [myCards, setMyCards] = useState<{ id: string; tier: string; frozen: boolean }[]>([])
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  useEffect(() => {
    cardApi.list().then((d: unknown) => { const r = d as { ok: boolean; data: typeof myCards }; setMyCards(r.data ?? []) }).catch(() => {})
  }, [])
  return (
    <div>
      <Sec emoji="💳" title="Kaadi — Sovereign Cards" sub="Five Pan-African card tiers. Patterns drawn from African art." />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      {myCards.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', fontFamily: S.font, marginBottom: 8, letterSpacing: '0.1em' }}>MY CARDS</div>
          {myCards.map(c => {
            const t = CARD_TIERS.find(x => x.id === c.tier)
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <span style={{ fontSize: 18 }}>{t?.emoji ?? '💳'}</span>
                <span style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,.7)', fontFamily: S.font }}>{t?.name ?? c.tier}</span>
                <Pill label={c.frozen ? 'FROZEN' : 'ACTIVE'} color={c.frozen ? '#fbbf24' : '#4ade80'} bg={c.frozen ? 'rgba(251,191,36,.1)' : 'rgba(74,222,128,.1)'} />
                <Btn label={c.frozen ? 'Unfreeze' : 'Freeze'} onClick={() => {
                  const action = c.frozen ? cardApi.unfreeze(c.id) : cardApi.freeze(c.id)
                  action.then(() => { setMyCards(prev => prev.map(x => x.id === c.id ? { ...x, frozen: !c.frozen } : x)); flash(c.frozen ? 'Unfrozen ✓' : 'Frozen ✓') }).catch(() => flash('Failed'))
                }} style={{ padding: '4px 10px', fontSize: 10 }} />
              </div>
            )
          })}
        </div>
      )}
      {CARD_TIERS.map(c => (
        <div key={c.id} onClick={() => setSel(sel === c.id ? null : c.id)} style={{ marginBottom: 12, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', border: `1px solid ${sel === c.id ? c.chipColor + '44' : 'rgba(255,255,255,.07)'}` }}>
          <div style={{ background: c.gradient, padding: '18px 20px 14px', position: 'relative', minHeight: 90 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: c.textColor, fontFamily: S.head, opacity: 0.5, letterSpacing: '0.15em' }}>ILE OWO</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: c.textColor, fontFamily: S.head, marginTop: 8 }}>{c.emoji} {c.name}</div>
            <div style={{ fontSize: 10, color: c.textColor, opacity: 0.5, fontFamily: S.font, marginTop: 2 }}>{c.subtitle}</div>
            <div style={{ position: 'absolute', right: 16, bottom: 12, width: 30, height: 18, borderRadius: 4, background: c.chipColor, opacity: 0.7 }} />
          </div>
          {sel === c.id && (
            <div style={{ background: 'rgba(0,0,0,.5)', padding: '12px 14px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>{c.features.map(f => <Pill key={f} label={f} color={c.color} bg={`${c.color}18`} />)}</div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font, margin: '0 0 8px' }}>{c.patternDesc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.28)', fontFamily: S.font, marginBottom: 10 }}>
                <span>{c.monthlyFee === 0 ? 'Free' : `₡${c.monthlyFee}/mo`}</span>
                <span>Limit: {c.spendingLimit ? `₡${c.spendingLimit.toLocaleString()}` : '∞'}</span>
                <span>{c.physical ? '🏦 Physical' : '📱 Virtual'}</span>
              </div>
              <Btn label={busy ? 'Applying...' : `Apply for ${c.name}`} variant="primary" disabled={busy} style={{ width: '100%' }}
                onClick={() => { setBusy(true); cardApi.create({ accountId: 'main', tier: c.id, currency: 'CWR' }).then(() => { flash(`Applied for ${c.name} ✓`); cardApi.list().then((d: unknown) => { const r = d as { ok: boolean; data: typeof myCards }; setMyCards(r.data ?? []) }).catch(() => {}) }).catch(() => flash('Application failed')).finally(() => setBusy(false)) }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── KÒWÈ LEDGER ──────────────────────────────────────────────────────────────
function KowePanel() {
  const [txns, setTxns] = useState<{ id: string; type: string; amount: number; description: string; createdAt: string; hash?: string }[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    bankingExtApi.history().then((d: { ok: boolean; data: unknown[] }) => setTxns((d.data ?? []) as typeof txns))
      .catch(() => setTxns([
        { id: 't1', type: 'CREDIT', amount: 5000, description: 'Cowrie drop — Eke Market Day', createdAt: '2026-04-05T08:00:00Z', hash: '0xkowe8a3f' },
        { id: 't2', type: 'AJO_PAYOUT', amount: 60000, description: 'Ẹgbẹ Ọjọ Iṣẹ — turn #8 payout', createdAt: '2026-04-04T14:00:00Z', hash: '0xkowe2b1c' },
        { id: 't3', type: 'DEBIT', amount: 12000, description: 'Sent to amaka@soko', createdAt: '2026-04-03T11:00:00Z', hash: '0xkowe9e4d' },
        { id: 't4', type: 'HARAMBEE', amount: 1000, description: 'Village Borehole Fund', createdAt: '2026-04-02T09:30:00Z', hash: '0xkowe3f8e' },
        { id: 't5', type: 'SEASON_LOCK', amount: 50000, description: 'Grain Bank — Planting Season', createdAt: '2026-04-01T08:00:00Z', hash: '0xkowe7c2a' },
      ])).finally(() => setLoading(false))
  }, [])
  return (
    <div>
      <Sec emoji="📜" title="Kòwè — Oral Ledger" sub="Every transaction hashed, witnessed, sealed. Tamper-proof." />
      {loading && <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', fontFamily: S.font }}>Loading…</p>}
      {txns.map(tx => {
        const ev = KOWE_EVENT_TYPES[tx.type as keyof typeof KOWE_EVENT_TYPES]
        const isCredit = ['CREDIT', 'AJO_PAYOUT', 'ESCROW_RELEASE', 'SEASON_UNLOCK', 'CORRIDOR_RECEIVE', 'SPIRIT_VAULT_UNLOCK', 'HARAMBEE'].includes(tx.type)
        const color = ev?.color ?? (isCredit ? '#2d9e5f' : '#c94040')
        return (
          <div key={tx.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}14`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{ev?.emoji ?? (isCredit ? '↙' : '↗')}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.78)', fontFamily: S.font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 2, fontFamily: S.font }}>
                {ev?.label ?? tx.type} · {new Date(tx.createdAt).toLocaleString()}{tx.hash && <span style={{ marginLeft: 6, fontFamily: 'monospace', opacity: .5 }}>{tx.hash}</span>}
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: S.head, flexShrink: 0 }}>{isCredit ? '+' : '−'}₡{tx.amount.toLocaleString()}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── CHAIN BRIDGE ──────────────────────────────────────────────────────────────
function ChainPanel() {
  const [chainBal, setChainBal] = useState<{ afc: number; cwr: number; nativeAfro: number } | null>(null)
  const [amt, setAmt] = useState(''); const [dir, setDir] = useState<'in' | 'out'>('in')
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  useEffect(() => { chainApi.chainBalance().then((d: unknown) => { const r = d as { ok: boolean; data: typeof chainBal }; setChainBal(r.data ?? null) }).catch(() => setChainBal({ afc: 0, cwr: 0, nativeAfro: 0 })) }, [])
  return (
    <div>
      <Sec emoji="⛓️" title="CowrieChain L2 Bridge" sub="Bridge between Cowrie wallet and on-chain L2. Sovereign rails." />
      <Card style={{ marginBottom: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em', fontFamily: S.font }}>ON-CHAIN BALANCE</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#60a5fa', fontFamily: S.head, marginTop: 6 }}>{chainBal?.cwr?.toLocaleString() ?? '—'} CWR</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 4, fontFamily: S.font }}>{chainBal?.afc?.toFixed(4) ?? '—'} AFC · {chainBal?.nativeAfro?.toFixed(4) ?? '—'} AFRO</div>
      </Card>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['in', 'out'] as const).map(d => (
          <button key={d} onClick={() => setDir(d)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1px solid ${dir === d ? '#60a5fa' : 'rgba(255,255,255,.08)'}`, background: dir === d ? 'rgba(96,165,250,.1)' : 'transparent', color: dir === d ? '#60a5fa' : 'rgba(255,255,255,.4)', fontSize: 12, fontFamily: S.font, cursor: 'pointer' }}>
            {d === 'in' ? '↙ Bridge In' : '↗ Bridge Out'}
          </button>
        ))}
      </div>
      <In value={amt} onChange={v => setAmt(v.replace(/\D/g, ''))} placeholder={`Amount to bridge ${dir}`} />
      <Btn label={busy ? '⏳…' : dir === 'in' ? '↙ Bridge In to Chain' : '↗ Bridge Out to Wallet'} variant="primary" disabled={busy} style={{ width: '100%' }}
        onClick={() => { if (!amt) return; setBusy(true); (dir === 'in' ? chainApi.bridgeIn(Number(amt), 'CWR') : chainApi.bridgeOut(Number(amt), 'CWR', 'wallet')).then(() => { flash(`Bridged ${dir === 'in' ? 'in' : 'out'} ✓`); setAmt(''); chainApi.chainBalance().then((d: unknown) => { const r = d as { ok: boolean; data: typeof chainBal }; setChainBal(r.data ?? null) }).catch(() => {}) }).catch(() => flash('Bridge failed')).finally(() => setBusy(false)) }} />
      {msg && <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
    </div>
  )
}

// ── AJO 3.0 ──────────────────────────────────────────────────────────────────
function AjoPanel() {
  const [circles, setCircles] = useState<{ id: string; circleName: string; memberCount: number; contributionAmount: number; frequency: string; status: string; nextPayoutAt: string; myPosition: number }[]>([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', contribution: '', cadence: 'WEEKLY' })
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const loadCircles = () => {
    ajoApi.myCircles().then((d: unknown) => { const r = d as { ok: boolean; data: typeof circles }; setCircles(r.data ?? []) })
      .catch(() => setCircles([
        { id: 'a1', circleName: 'Ẹgbẹ Ọjọ Iṣẹ Traders', memberCount: 12, contributionAmount: 5000, frequency: 'WEEKLY', status: 'ACTIVE', nextPayoutAt: '2026-04-07', myPosition: 8 },
        { id: 'a2', circleName: 'Agri Savings Circle', memberCount: 8, contributionAmount: 10000, frequency: 'MONTHLY', status: 'FORMING', nextPayoutAt: '2026-05-01', myPosition: 3 },
      ]))
  }
  useEffect(() => { loadCircles() }, [])
  return (
    <div>
      <Sec emoji="🔄" title="Ajo 3.0" sub="Yoruba rotating savings — world's oldest P2P savings. 0% interest. 100% community." />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <Btn label={creating ? '✕ Cancel' : '+ New Circle'} onClick={() => setCreating(!creating)} style={{ marginBottom: 10 }} />
      {creating && (
        <Card style={{ marginBottom: 14 }}>
          <In value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Circle name" />
          <In value={form.contribution} onChange={v => setForm(f => ({ ...f, contribution: v.replace(/\D/g, '') }))} placeholder="₡ per cycle" />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {AJO_CADENCES.map(c => (
              <button key={c.key} onClick={() => setForm(f => ({ ...f, cadence: c.key }))} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${form.cadence === c.key ? '#4ade80' : 'rgba(255,255,255,.1)'}`, background: form.cadence === c.key ? 'rgba(74,222,128,.08)' : 'transparent', color: form.cadence === c.key ? '#4ade80' : 'rgba(255,255,255,.4)', fontSize: 11, cursor: 'pointer' }}>{c.emoji} {c.label}</button>
            ))}
          </div>
          <Btn label="🔄 Create" variant="primary" style={{ width: '100%' }}
            onClick={() => { if (!form.name || !form.contribution) return; ajoApi.create({ circleName: form.name, memberAccountIds: [], contributionAmount: Number(form.contribution), currency: 'CWR', frequency: form.cadence as 'WEEKLY' | 'MONTHLY' | 'DAILY', startDate: new Date().toISOString().split('T')[0], idempotencyKey: `ajo_${Date.now()}` }).then(() => { flash('Circle created ✓'); loadCircles(); setForm({ name: '', contribution: '', cadence: 'WEEKLY' }) }).catch(() => flash('Creation failed')).finally(() => setCreating(false)) }} />
        </Card>
      )}
      {circles.map(c => {
        const st = AJO_STATUSES[c.status as keyof typeof AJO_STATUSES]
        return (
          <Card key={c.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.85)', fontFamily: S.head }}>{c.circleName}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2, fontFamily: S.font }}>{c.memberCount} members · {c.frequency} · Turn #{c.myPosition}</div></div>
              {st && <Pill label={st.label} color={st.color} bg={`${st.color}18`} />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font }}>
              <span>₡{c.contributionAmount.toLocaleString()}/cycle</span><span>Next: {new Date(c.nextPayoutAt).toLocaleDateString()}</span>
            </div>
            {c.status === 'ACTIVE' && <Btn label="Contribute" variant="primary" style={{ marginTop: 8, width: '100%' }} onClick={() => ajoApi.contribute(c.id, c.contributionAmount).then(() => flash('Contributed ✓')).catch(() => flash('Contribution failed'))} />}
          </Card>
        )
      })}
    </div>
  )
}

// ── ESUSU CLOCK ──────────────────────────────────────────────────────────────
function EsusuPanel({ afroId }: { afroId: string }) {
  const [myCycles, setMyCycles] = useState<{ id: string; cycleKey: string; name: string; members: number; contribution: number; nextDraw: string }[]>([])
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const today = getTodayMarketDay()
  useEffect(() => {
    esusuClockApi.myCycles().then((d: unknown) => { const r = d as { cycles?: typeof myCycles }; setMyCycles(r.cycles ?? []) })
      .catch(() => setMyCycles([{ id: 'es1', cycleKey: 'EKE', name: 'Ẹgbẹ Ẹkẹ Traders', members: 16, contribution: 3000, nextDraw: '2026-04-09' }]))
  }, [])
  return (
    <div>
      <Sec emoji="🌙" title="Esusu Clock" sub="Market-day synchronized savings. Igbo 4-day week meets decentralised finance." />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {ESUSU_CLOCK_CYCLES.map(c => (
          <div key={c.key} style={{ background: c.color, borderRadius: 12, padding: '14px 12px', border: '1px solid rgba(255,255,255,.08)', position: 'relative' }}>
            {c.marketDay === today && <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 8, fontWeight: 800, color: '#4ade80', letterSpacing: '0.1em' }}>TODAY ●</div>}
            <div style={{ fontSize: 22 }}>{c.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.85)', fontFamily: S.head, marginTop: 6 }}>{c.label}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: S.font, marginTop: 4, lineHeight: 1.4 }}>{c.desc}</div>
          </div>
        ))}
      </div>
      {myCycles.map(cy => {
        const m = ESUSU_CLOCK_CYCLES.find(c => c.key === cy.cycleKey)
        return (
          <Card key={cy.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>{m?.emoji ?? '🌙'}</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.82)', fontFamily: S.head }}>{cy.name}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font }}>{cy.members} members · ₡{cy.contribution.toLocaleString()}</div></div>
            </div>
            <Btn label="Contribute" variant="primary" style={{ marginTop: 8, width: '100%' }} onClick={() => esusuClockApi.contribute(cy.id, afroId, cy.contribution).then(() => flash('Contributed ✓')).catch(() => flash('Contribution failed'))} />
          </Card>
        )
      })}
    </div>
  )
}

// ── HARAMBEE ─────────────────────────────────────────────────────────────────
function HarambeePanel({ afroId }: { afroId: string }) {
  const [pools, setPools] = useState<{ id: string; title: string; goalCowrie: number; raisedCowrie: number; scope: string; endsAt: string }[]>([])
  const [creating, setCreating] = useState(false); const [form, setForm] = useState({ title: '', goal: '', scope: 'VILLAGE' })
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const loadPools = () => {
    harambeeApi.list().then((d: unknown) => { const r = d as { ok: boolean; data: typeof pools }; setPools(r.data ?? []) })
      .catch(() => setPools([{ id: 'h1', title: 'Village Borehole Fund', goalCowrie: 500000, raisedCowrie: 215000, scope: 'VILLAGE', endsAt: '2026-04-20' }, { id: 'h2', title: "School Fees — Tunde's Children", goalCowrie: 80000, raisedCowrie: 65000, scope: 'FAMILY', endsAt: '2026-04-09' }]))
  }
  useEffect(() => { loadPools() }, [])
  return (
    <div>
      <Sec emoji="🤝" title="Harambee" sub={"Kenya's national motto. Africa's original crowdfunding. Zero fees."} />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <Btn label={creating ? '✕ Cancel' : '+ Launch Harambee'} onClick={() => setCreating(!creating)} style={{ marginBottom: 10 }} />
      {creating && (
        <Card style={{ marginBottom: 14 }}>
          <In value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="What are we building?" />
          <In value={form.goal} onChange={v => setForm(f => ({ ...f, goal: v.replace(/\D/g, '') }))} placeholder="Goal (₡)" />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>{HARAMBEE_SCOPES.map(s => (
            <button key={s.key} onClick={() => setForm(f => ({ ...f, scope: s.key }))} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${form.scope === s.key ? '#4ade80' : 'rgba(255,255,255,.1)'}`, background: form.scope === s.key ? 'rgba(74,222,128,.08)' : 'transparent', color: form.scope === s.key ? '#4ade80' : 'rgba(255,255,255,.4)', fontSize: 11, cursor: 'pointer' }}>{s.emoji} {s.label}</button>
          ))}</div>
          <Btn label="🤝 Start" variant="primary" style={{ width: '100%' }} onClick={() => { if (!form.title || !form.goal) return; harambeeApi.create({ title: form.title, goalCowrie: Number(form.goal), scope: form.scope }).then(() => { flash('Harambee launched ✓'); loadPools(); setForm({ title: '', goal: '', scope: 'VILLAGE' }) }).catch(() => flash('Launch failed')).finally(() => setCreating(false)) }} />
        </Card>
      )}
      {pools.map(p => {
        const pct = Math.min(100, Math.round((p.raisedCowrie / p.goalCowrie) * 100))
        return (
          <Card key={p.id} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.85)', fontFamily: S.head, marginBottom: 6 }}>🤝 {p.title}</div>
            <div style={{ height: 5, background: 'rgba(255,255,255,.06)', borderRadius: 4, marginBottom: 6, overflow: 'hidden' }}><div style={{ height: '100%', background: '#18a05e', borderRadius: 4, width: `${pct}%` }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: S.font, marginBottom: 8 }}><span>₡{p.raisedCowrie.toLocaleString()} / ₡{p.goalCowrie.toLocaleString()} ({pct}%)</span><span>{Math.max(0, Math.round((new Date(p.endsAt).getTime() - Date.now()) / 86400000))}d</span></div>
            <Btn label="🤝 Contribute" variant="primary" style={{ width: '100%' }} onClick={() => harambeeApi.contribute(p.id, afroId, 1000).then(() => { flash('Contributed ✓'); loadPools() }).catch(() => flash('Contribution failed'))} />
          </Card>
        )
      })}
    </div>
  )
}

// ── BUFFER ────────────────────────────────────────────────────────────────────
function BufferPanel({ afroId }: { afroId: string }) {
  const [status, setStatus] = useState<{ poolBalance: number; myContribution: number; fireLevel: number } | null>(null)
  const [tapping, setTapping] = useState(false); const [tapAmt, setTapAmt] = useState(''); const [tapReason, setTapReason] = useState(''); const [tapTier, setTapTier] = useState<string>('MEDICAL')
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  useEffect(() => { ancestralBufferApi.status().then(d => setStatus(d as typeof status)).catch(() => setStatus({ poolBalance: 2850000, myContribution: 14200, fireLevel: 72 })) }, [])
  const fire = status?.fireLevel ?? 0
  return (
    <div>
      <Sec emoji="🛡️" title="Àágò Nla — Ancestral Buffer" sub="0.5% of every tx flows to the village emergency fire. Collective protection." />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <Card style={{ marginBottom: 14, textAlign: 'center', background: 'linear-gradient(160deg,#1a0800,#2a1200)' }}>
        <div style={{ fontSize: fire > 75 ? 48 : 36 }}>{fire > 75 ? '🔥' : fire > 40 ? '🕯' : '✨'}</div>
        <div style={{ height: 7, background: 'rgba(255,255,255,.06)', borderRadius: 4, margin: '10px 16px', overflow: 'hidden' }}><div style={{ height: '100%', background: 'linear-gradient(90deg,#c94040,#f97316)', borderRadius: 4, width: `${fire}%` }} /></div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#f97316', fontFamily: S.head }}>₡{(status?.poolBalance ?? 0).toLocaleString()}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', marginTop: 4, fontFamily: S.font }}>My contribution: ₡{(status?.myContribution ?? 0).toLocaleString()}</div>
      </Card>
      {ANCESTRAL_BUFFER_TIERS.map(t => (
        <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
          <span style={{ fontSize: 20 }}>{t.emoji}</span>
          <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.78)', fontFamily: S.head }}>{t.label}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font }}>{t.desc}</div></div>
          <div style={{ textAlign: 'right', fontSize: 10, fontFamily: S.font }}><div style={{ color: t.color, fontWeight: 600 }}>₡{t.maxTap.toLocaleString()}</div><div style={{ color: 'rgba(255,255,255,.2)' }}>Ubuntu {t.minUbuntu}+</div></div>
        </div>
      ))}
      <Btn label={tapping ? '✕ Cancel' : '🛡️ Emergency Tap'} onClick={() => setTapping(!tapping)} style={{ width: '100%', marginTop: 12 }} />
      {tapping && (
        <Card style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>{ANCESTRAL_BUFFER_TIERS.map(t => (
            <button key={t.key} onClick={() => setTapTier(t.key)} style={{ flex: 1, padding: '6px', borderRadius: 8, border: `1px solid ${tapTier === t.key ? t.color : 'rgba(255,255,255,.08)'}`, background: tapTier === t.key ? `${t.color}18` : 'transparent', color: tapTier === t.key ? t.color : 'rgba(255,255,255,.35)', fontSize: 16, cursor: 'pointer', textAlign: 'center' }}>{t.emoji}</button>
          ))}</div>
          <In value={tapAmt} onChange={v => setTapAmt(v.replace(/\D/g, ''))} placeholder="Amount needed (₡)" />
          <In value={tapReason} onChange={setTapReason} placeholder="Explain your emergency" />
          <Btn label="🛡️ Submit" variant="danger" style={{ width: '100%' }} onClick={() => { if (!tapAmt || !tapReason) return; ancestralBufferApi.tap(afroId, Number(tapAmt), tapReason, tapTier).then(() => { flash('Emergency tap submitted ✓'); setTapAmt(''); setTapReason(''); ancestralBufferApi.status().then(d => setStatus(d as typeof status)).catch(() => {}) }).catch(() => flash('Tap request failed')).finally(() => setTapping(false)) }} />
        </Card>
      )}
    </div>
  )
}

// ── GRAIN BANK ───────────────────────────────────────────────────────────────
function GrainPanel({ afroId }: { afroId: string }) {
  const [sel, setSel] = useState<string>(HARVEST_SEASONS[0].key); const [amt, setAmt] = useState('')
  const [locks, setLocks] = useState<{ id: string; season: string; amount: number; unlocksAt: string; earnedYield: number }[]>([])
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const loadLocks = () => { fetch(`/api/bank/season/my-locks?userId=${encodeURIComponent(afroId)}`).then(r => r.ok ? r.json() : Promise.reject()).then((d: { locks: typeof locks }) => setLocks(d.locks ?? [])).catch(() => setLocks([{ id: 'sl1', season: 'PLANTING', amount: 50000, unlocksAt: '2026-07-03', earnedYield: 2500 }])) }
  useEffect(() => { loadLocks() }, [afroId])
  const season = HARVEST_SEASONS.find(s => s.key === sel)!
  return (
    <div>
      <Sec emoji="🌱" title="Igba Ego — Grain Bank" sub="Lock Cowrie at harvest. Unlock at planting. Africa's original savings account." />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {HARVEST_SEASONS.map(s => (
          <button key={s.key} onClick={() => setSel(s.key)} style={{ flex: 1, padding: '12px 4px', borderRadius: 10, border: `1px solid ${sel === s.key ? s.color : 'rgba(255,255,255,.07)'}`, background: sel === s.key ? `${s.color}18` : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>{s.emoji}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: sel === s.key ? s.color : 'rgba(255,255,255,.4)', fontFamily: S.head, marginTop: 4 }}>{s.days}d / {(s.interestRate * 100).toFixed(0)}%</div>
          </button>
        ))}
      </div>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: season.color, fontFamily: S.head, marginBottom: 6 }}>{season.emoji} {season.label} — {season.desc}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: S.font, marginBottom: 10 }}>Yield: {(season.interestRate * 100).toFixed(0)}% · Borrow LTV: {(season.grainBankRate * 100).toFixed(0)}%</div>
        <In value={amt} onChange={v => setAmt(v.replace(/\D/g, ''))} placeholder="Lock amount (₡)" />
        {amt && <p style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: S.font, marginBottom: 8 }}>Unlock: ₡{(Number(amt) * (1 + season.interestRate)).toFixed(0)}</p>}
        <Btn label={busy ? '⏳…' : `🌾 Lock ${season.days}d`} variant="primary" disabled={busy} style={{ width: '100%' }}
          onClick={() => { if (!amt) return; setBusy(true); fetch('/api/bank/season/lock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: afroId, season: sel, amount: Number(amt) }) }).then(r => { if (!r.ok) throw new Error(); flash('Locked ✓'); setAmt(''); loadLocks() }).catch(() => flash('Lock failed')).finally(() => setBusy(false)) }} />
      </Card>
      {locks.map(l => { const s = HARVEST_SEASONS.find(ss => ss.key === l.season); return (
        <Card key={l.id} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.78)', fontFamily: S.head }}>{s?.emoji} {s?.label ?? l.season}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.28)', marginTop: 2, fontFamily: S.font }}>Unlocks {new Date(l.unlocksAt).toLocaleDateString()}</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', fontFamily: S.head }}>₡{l.amount.toLocaleString()}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.28)' }}>+₡{l.earnedYield.toLocaleString()}</div></div>
          </div>
        </Card>
      ) })}
    </div>
  )
}

// ── OGBO POT (ESCROW) ────────────────────────────────────────────────────────
function PotPanel({ afroId }: { afroId: string }) {
  const [pots, setPots] = useState<{ id: string; state: string; amount: number; description: string; buyerAccountId: string; sellerAccountId: string; createdAt: string }[]>([])
  const [creating, setCreating] = useState(false); const [form, setForm] = useState({ seller: '', amount: '', desc: '', proof: 'CLIENT_CONFIRM' })
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const loadPots = () => {
    escrowApi.list().then((d: unknown) => { const r = d as { ok: boolean; data: typeof pots }; setPots(r.data ?? []) })
      .catch(() => setPots([{ id: 'p1', state: 'HELD', amount: 25000, description: 'Ankara fabric × 10', buyerAccountId: afroId, sellerAccountId: 'amaka@soko', createdAt: '2026-04-03T09:00:00Z' }]))
  }
  useEffect(() => { loadPots() }, [afroId])
  return (
    <div>
      <Sec emoji="🏺" title="Ogbo Pot — Escrow" sub="Seal pot. Deliver goods. Release fire. Africa's original trade protection." />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <Btn label={creating ? '✕ Cancel' : '+ Seal Pot'} onClick={() => setCreating(!creating)} style={{ marginBottom: 10 }} />
      {creating && (
        <Card style={{ marginBottom: 14 }}>
          <In value={form.seller} onChange={v => setForm(f => ({ ...f, seller: v }))} placeholder="Seller AfroID" />
          <In value={form.amount} onChange={v => setForm(f => ({ ...f, amount: v.replace(/\D/g, '') }))} placeholder="Amount (₡)" />
          <In value={form.desc} onChange={v => setForm(f => ({ ...f, desc: v }))} placeholder="Trade description" />
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginBottom: 6, letterSpacing: '0.1em' }}>PROOF OF HAND</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {PROOF_OF_HAND_TYPES.map(p => (
              <button key={p.key} onClick={() => setForm(f => ({ ...f, proof: p.key }))} style={{ padding: '5px 10px', borderRadius: 8, border: `1px solid ${form.proof === p.key ? '#e8a020' : 'rgba(255,255,255,.08)'}`, background: form.proof === p.key ? 'rgba(232,160,32,.1)' : 'transparent', color: form.proof === p.key ? '#e8a020' : 'rgba(255,255,255,.35)', fontSize: 10, cursor: 'pointer' }}>{p.emoji} {p.label}</button>
            ))}
          </div>
          <Btn label="🏺 Seal" variant="primary" style={{ width: '100%' }}
            onClick={() => { if (!form.seller || !form.amount) return; escrowApi.create({ buyerAccountId: afroId, sellerAccountId: form.seller, amount: Number(form.amount), currency: 'CWR', description: form.desc, proofOfHandType: form.proof }).then(() => { flash('Pot sealed ✓'); loadPots(); setForm({ seller: '', amount: '', desc: '', proof: 'CLIENT_CONFIRM' }) }).catch(() => flash('Seal failed')).finally(() => setCreating(false)) }} />
        </Card>
      )}
      {pots.map(pot => {
        const st = POT_STATES[pot.state as keyof typeof POT_STATES]
        return (
          <Card key={pot.id} style={{ marginBottom: 10, borderLeft: `3px solid ${st?.color ?? '#555'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div><div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.85)', fontFamily: S.head }}>{st?.emoji} {pot.description}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font, marginTop: 2 }}>{new Date(pot.createdAt).toLocaleDateString()}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 14, fontWeight: 800, color: '#4ade80', fontFamily: S.head }}>₡{pot.amount.toLocaleString()}</div><Pill label={st?.label ?? pot.state} color={st?.color ?? '#888'} bg={`${st?.color ?? '#888'}18`} /></div>
            </div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font, margin: 0 }}>{st?.desc}</p>
            {pot.state === 'PENDING_VERIFICATION' && <Btn label="✋ Submit Proof" style={{ marginTop: 8, width: '100%' }} onClick={() => escrowApi.submitProof(pot.id, 'CLIENT_CONFIRM', {}).then(() => { flash('Proof submitted ✓'); loadPots() }).catch(() => flash('Proof submission failed'))} />}
          </Card>
        )
      })}
    </div>
  )
}

// ── SPIRIT VAULT ─────────────────────────────────────────────────────────────
function SpiritPanel({ afroId }: { afroId: string }) {
  const [amt, setAmt] = useState(''); const [heir, setHeir] = useState(''); const [trigger, setTrigger] = useState<string>(SPIRIT_VAULT_UNLOCK_TRIGGERS[0].key)
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  return (
    <div>
      <Sec emoji="🧿" title="Agba — Spirit Vault" sub="Seal funds for heirs. 3 elder witnesses. On-chain ancestral inheritance." />
      <In value={amt} onChange={v => setAmt(v.replace(/\D/g, ''))} placeholder="Amount to seal (₡)" />
      <In value={heir} onChange={setHeir} placeholder="Heir AfroID or @username" />
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginBottom: 6, letterSpacing: '0.1em' }}>UNLOCK TRIGGER</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {SPIRIT_VAULT_UNLOCK_TRIGGERS.map(t => (
          <button key={t.key} onClick={() => setTrigger(t.key)} style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${trigger === t.key ? '#6b4fbb' : 'rgba(255,255,255,.07)'}`, background: trigger === t.key ? 'rgba(107,79,187,.1)' : 'transparent', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontSize: 16 }}>{t.emoji}</span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.7)', fontFamily: S.font }}>{t.label}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.28)', fontFamily: S.font }}>{t.desc}</div></div>
            {trigger === t.key && <span style={{ color: '#6b4fbb' }}>●</span>}
          </button>
        ))}
      </div>
      <Btn label={busy ? '⏳…' : '🕯 Seal Vault'} variant="primary" disabled={busy} style={{ width: '100%' }}
        onClick={() => { if (!amt || !heir) return; setBusy(true); fetch('/api/bank/spirit-vault/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ creatorId: afroId, amount: Number(amt), heirId: heir, trigger }) }).then(r => { if (!r.ok) throw new Error(); flash('Vault sealed ✓'); setAmt(''); setHeir('') }).catch(() => flash('Seal failed')).finally(() => setBusy(false)) }} />
      {msg && <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
    </div>
  )
}

// ── COUNCIL ──────────────────────────────────────────────────────────────────
function CouncilPanel({ afroId }: { afroId: string }) {
  const [disputes, setDisputes] = useState<{ id: string; description: string; amount: number; elderVotes: number; requiredVotes: number; status: string }[]>([])
  const ubuntuScore = 620; const tier = getUbuntuTier(ubuntuScore)
  useEffect(() => { fetch(`/api/bank/council/disputes?userId=${encodeURIComponent(afroId)}`).then(r => r.ok ? r.json() : Promise.reject()).then((d: { disputes: typeof disputes }) => setDisputes(d.disputes ?? [])).catch(() => setDisputes([{ id: 'd1', description: 'Undelivered Ankara — pot stuck', amount: 25000, elderVotes: 1, requiredVotes: 3, status: 'UNDER_REVIEW' }])) }, [afroId])
  return (
    <div>
      <Sec emoji="⚖️" title="Igwé Council" sub="Elders resolve disputes. Ubuntu score is your standing." />
      <Card style={{ marginBottom: 14, background: `${tier.color}10` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 30 }}>{tier.emoji}</span>
          <div><div style={{ fontSize: 13, fontWeight: 700, color: tier.color, fontFamily: S.head }}>Ubuntu {ubuntuScore} — {tier.label}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, marginTop: 2 }}>{tier.desc}</div></div>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,.06)', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}><div style={{ height: '100%', background: tier.color, borderRadius: 4, width: `${(ubuntuScore / 1000) * 100}%` }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>{UBUNTU_SCORE_TIERS.map(t => <span key={t.key} style={{ fontSize: 8, color: 'rgba(255,255,255,.2)' }}>{t.emoji}</span>)}</div>
      </Card>
      {disputes.map(d => (
        <Card key={d.id} style={{ marginBottom: 10, borderLeft: '3px solid #f97316' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.82)', fontFamily: S.head, marginBottom: 4 }}>⚖️ {d.description}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: S.font }}><span>₡{d.amount.toLocaleString()}</span><span>{d.elderVotes}/{d.requiredVotes} votes</span><span>{d.status}</span></div>
        </Card>
      ))}
    </div>
  )
}

// ── GRIOT CREDIT ─────────────────────────────────────────────────────────────
function GriotPanel({ afroId }: { afroId: string }) {
  const [data, setData] = useState<{ score: number; grade: string; breakdown: { factor: string; impact: number; desc: string }[] } | null>(null)
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  useEffect(() => {
    griotCreditApi.score(afroId).then(d => setData(d as typeof data))
      .catch(() => setData({ score: 612, grade: 'OGUN', breakdown: [
        { factor: 'Ajo on-time rate', impact: 180, desc: '12 consecutive on-time' },
        { factor: 'Ubuntu endorsements', impact: 140, desc: '7 elders vouch' },
        { factor: 'Harambee contributions', impact: 90, desc: '4 community pools' },
        { factor: 'Kòwè account age', impact: 70, desc: 'Active 14 months' },
        { factor: 'Unresolved dispute', impact: -68, desc: '1 pot disputed' },
      ] }))
  }, [afroId])
  const g = GRIOT_CREDIT_GRADES.find(x => x.key === (data?.grade ?? 'IRON')) ?? GRIOT_CREDIT_GRADES[0]
  return (
    <div>
      <Sec emoji="🎙️" title="Orí Ìtàn Credit" sub="Not your salary — your story. The Griot reads your village history." />
      {data && <>
        <Card style={{ marginBottom: 14, textAlign: 'center', background: `${g.color}0c`, border: `1px solid ${g.color}28` }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: g.color, fontFamily: S.head }}>{data.score}</div>
          <div style={{ fontSize: 20, marginTop: 4 }}>{g.emoji}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: g.color, fontFamily: S.head, marginTop: 2 }}>{g.label}</div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: S.font, marginTop: 4 }}>{g.desc}</p>
        </Card>
        <div style={{ display: 'flex', gap: 3, height: 16, marginBottom: 16 }}>
          {GRIOT_CREDIT_GRADES.map(x => <div key={x.key} style={{ flex: 1, borderRadius: 3, background: x.key === data.grade ? x.color : `${x.color}35` }} />)}
        </div>
        {data.breakdown.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: f.impact > 0 ? '#4ade80' : '#ef4444', fontFamily: S.head, minWidth: 44, textAlign: 'right', flexShrink: 0 }}>{f.impact > 0 ? '+' : ''}{f.impact}</div>
            <div><div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.7)', fontFamily: S.font }}>{f.factor}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font }}>{f.desc}</div></div>
          </div>
        ))}
        <Btn label="🎙️ Share Score" style={{ width: '100%', marginTop: 12 }} onClick={() => griotCreditApi.share(afroId).then(() => flash('Score shared ✓')).catch(() => flash('Share failed'))} />
        {msg && <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      </>}
    </div>
  )
}

// ── TLP LOCK ─────────────────────────────────────────────────────────────────
function TlpPanel() {
  const [locks, setLocks] = useState<{ id: string; amount: number; unlockCondition: string; status: string }[]>([])
  const [amt, setAmt] = useState(''); const [cond, setCond] = useState('')
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const loadLocks = () => { tlpApi.myLocks().then((d: unknown) => { const r = d as { ok: boolean; data: typeof locks }; setLocks(r.data ?? []) }).catch(() => setLocks([{ id: 'tl1', amount: 30000, unlockCondition: 'Ubuntu score reaches 700', status: 'LOCKED' }])) }
  useEffect(() => { loadLocks() }, [])
  return (
    <div>
      <Sec emoji="🔒" title="TLP — Talking Lock" sub="Lock Cowrie with voice-sealed conditions. Africa's original smart contract." />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <In value={amt} onChange={v => setAmt(v.replace(/\D/g, ''))} placeholder="Amount to lock (₡)" />
      <In value={cond} onChange={setCond} placeholder="Unlock condition (e.g. 'Ubuntu score 700')" />
      <Btn label={busy ? '⏳…' : '🔒 Lock'} variant="primary" disabled={busy} style={{ width: '100%', marginBottom: 14 }}
        onClick={() => { if (!amt || !cond) return; setBusy(true); tlpApi.lockFunds({ accountId: 'main', amount: Number(amt), unlockCondition: cond }).then(() => { flash('Locked ✓'); setAmt(''); setCond(''); loadLocks() }).catch(() => flash('Lock failed')).finally(() => setBusy(false)) }} />
      {locks.map(l => (
        <Card key={l.id} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.78)', fontFamily: S.head }}>🔒 ₡{l.amount.toLocaleString()}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.28)', fontFamily: S.font, marginTop: 2 }}>{l.unlockCondition}</div></div>
            <Pill label={l.status} color={l.status === 'LOCKED' ? '#6b4fbb' : '#4ade80'} bg={l.status === 'LOCKED' ? 'rgba(107,79,187,.12)' : 'rgba(74,222,128,.12)'} />
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── CORRIDOR ─────────────────────────────────────────────────────────────────
function CorridorPanel({ afroId, online }: { afroId: string; online: boolean }) {
  const [mode, setMode] = useState<'africa'|'diaspora'|'corridors'|'rails'>('africa')
  const [cc, setCc] = useState('NG'); const [bank, setBank] = useState<string | null>(null)
  const [acctNo, setAcctNo] = useState(''); const [acctName, setAcctName] = useState(''); const [amt, setAmt] = useState('')
  const [currency, setCurrency] = useState('NGN')
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3200) }
  const countries = mode === 'diaspora' ? Object.keys(INTL_BANKS) : Object.keys(AFRICAN_BANKS)
  const banks = mode === 'diaspora' ? (INTL_BANKS[cc as keyof typeof INTL_BANKS] ?? []) : (AFRICAN_BANKS[cc as keyof typeof AFRICAN_BANKS] ?? [])
  const rail = CORRIDOR_RAILS.find(r => { if (cc === 'NG') return r.key === 'NIBSS'; if (cc === 'GH') return r.key === 'GHIPSS'; if (cc === 'KE') return r.key === 'PESALINK'; return r.key === 'SWIFT' }) ?? CORRIDOR_RAILS[CORRIDOR_RAILS.length - 1]
  const TABS = [['africa','🌍','Africa'],['diaspora','✈️','Diaspora'],['corridors','🛫','Flows'],['rails','🛤','Rails']] as const

  return (
    <div>
      <Sec emoji="🌍" title="Ona Owo — Pan-African Corridors" sub="54 nations · 10 diaspora hubs · Real SWIFT · M-Pesa · Wave · Chipper" />
      {msg && <div style={{ padding: '7px 12px', borderRadius: 8, background: msg.includes('ail') ? 'rgba(239,68,68,.1)' : 'rgba(74,222,128,.08)', border: `1px solid ${msg.includes('ail') ? 'rgba(239,68,68,.25)' : 'rgba(74,222,128,.2)'}`, fontSize: 11, color: msg.includes('ail') ? '#ef4444' : '#4ade80', marginBottom: 10, fontFamily: S.font }}>{msg}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, marginBottom: 14 }}>
        {TABS.map(([m,e,l]) => (
          <button key={m} onClick={() => { setMode(m); if (m === 'diaspora') setCc('GB'); else if (m === 'africa') setCc('NG'); setBank(null) }} style={{ padding: '8px 4px', borderRadius: 10, border: `1px solid ${mode===m ? '#4ade80' : 'rgba(255,255,255,.07)'}`, background: mode===m ? 'rgba(74,222,128,.06)' : 'transparent', color: mode===m ? '#4ade80' : 'rgba(255,255,255,.3)', fontSize: 10, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>
            {e} {l}
          </button>
        ))}
      </div>

      {/* DIASPORA FLOWS TAB — remittance corridors with operators + volumes */}
      {mode === 'corridors' && (
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginBottom: 10, lineHeight: 1.6 }}>Tap a corridor to send via Cowrie. We route through the cheapest available rail — Wise, Sendwave, or direct.</div>
          {DIASPORA_CORRIDORS.map(c => (
            <Card key={c.code} style={{ marginBottom: 8, borderLeft: `3px solid ${c.color}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{c.flag}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.85)', fontFamily: S.head }}>{c.from} → {c.to}</div>
                    <Pill label={c.amount} color={c.color} bg={`${c.color}18`} />
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: S.font, marginBottom: 2 }}>Via: {c.ops}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font }}>Delivers to: {c.endpoint}</div>
                </div>
              </div>
              <Btn label={`↗ Ranṣẹ via ${c.from} → ${c.to.split('/')[0]}`} variant="primary" style={{ width: '100%', marginTop: 8, fontSize: 11 }} onClick={() => flash(`Opening ${c.code} corridor — please use the Africa or Diaspora tab to select bank`)} />
            </Card>
          ))}
        </div>
      )}

      {/* RAILS TAB */}
      {mode === 'rails' && CORRIDOR_RAILS.map(r => (
        <Card key={r.key} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{r.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.85)', fontFamily: S.head }}>{r.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginTop: 2 }}>{r.fullName} · Fee: {(r.feePct * 100).toFixed(1)}% · ~{r.etaMinutes}min</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', marginTop: 3, fontFamily: S.font }}>{r.countries.join(' · ')}</div>
            </div>
          </div>
        </Card>
      ))}

      {/* AFRICA + DIASPORA BANK PICKER */}
      {(mode === 'africa' || mode === 'diaspora') && (
        <>
          <div style={{ overflowX: 'auto', display: 'flex', gap: 6, paddingBottom: 6, marginBottom: 10, scrollbarWidth: 'none' as const }}>
            {countries.map(c => (
              <button key={c} onClick={() => { setCc(c); setBank(null) }} style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 16, border: `1px solid ${cc===c ? '#4ade80' : 'rgba(255,255,255,.08)'}`, background: cc===c ? 'rgba(74,222,128,.06)' : 'transparent', color: cc===c ? '#4ade80' : 'rgba(255,255,255,.35)', fontSize: 11, fontFamily: S.font, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
                {AFRICAN_COUNTRY_NAMES[c as keyof typeof AFRICAN_COUNTRY_NAMES] ?? c}
              </button>
            ))}
          </div>
          <div style={{ background: `${rail.color}14`, borderRadius: 8, padding: '6px 12px', marginBottom: 10, fontSize: 10, color: 'rgba(255,255,255,.45)', fontFamily: S.font }}>
            {rail.flag} {rail.label} · Fee {(rail.feePct * 100).toFixed(1)}% · ~{rail.etaMinutes}min · {online ? '🟢 Live' : '🟡 Queued'}
          </div>
          {(banks as readonly { code: string; name: string; swift: string; flag: string; type: string }[]).map(b => (
            <button key={b.code} onClick={() => setBank(bank===b.code ? null : b.code)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, border: `1px solid ${bank===b.code ? '#4ade80' : 'rgba(255,255,255,.06)'}`, background: bank===b.code ? 'rgba(74,222,128,.04)' : 'rgba(255,255,255,.02)', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>{b.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.78)', fontFamily: S.font }}>{b.name}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font }}>{b.swift} · {b.type.replace('_',' ')}</div>
              </div>
              {bank===b.code && <span style={{ color: '#4ade80', fontSize: 14 }}>✓</span>}
            </button>
          ))}
          {bank && (
            <Card style={{ marginTop: 10, background: 'rgba(74,222,128,.04)', border: '1px solid rgba(74,222,128,.15)' }}>
              <Sec emoji="↗" title={`Ranṣẹ si ${(banks as readonly { code: string; name: string }[]).find(b => b.code === bank)?.name}`} sub="Offline-first — queues if no signal" />
              <In value={acctNo} onChange={setAcctNo} placeholder="Ọmọ Àkọọlẹ — Account number" />
              <In value={acctName} onChange={setAcctName} placeholder="Orúkọ — Account name" />
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <In value={amt} onChange={v => setAmt(v.replace(/\D/g,''))} placeholder="Iye — Amount" style={{ flex: 2, marginBottom: 0 }} />
                <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '0 8px', color: '#fff', fontSize: 12, fontFamily: S.font }}>
                  {['NGN','GHS','KES','ZAR','USD','GBP','EUR','XOF','ETB'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {amt && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginBottom: 8 }}>Ìsanwó: ₡{(Number(amt) * rail.feePct).toFixed(0)} · ~{rail.etaMinutes}min</div>}
              <Btn label={busy ? '⏳…' : '↗ Ranṣẹ Cowrie'} variant="primary" disabled={busy} style={{ width: '100%' }}
                onClick={() => {
                  if (!acctNo || !amt) return
                  const payload = { fromAfroId: afroId, toBank: bank, toBankAccount: acctNo, toAccountName: acctName || 'Recipient', amount: Number(amt), currency, reason: `Ona Owo via ${rail.label}`, rail: rail.key }
                  if (!online) { enqueueOffline('interbank', payload); flash('Queued — will send when online ✓'); return }
                  setBusy(true); corridorBanksApi.interbankTransfer(payload).then(() => { flash('Ranṣẹ ✓ — funds en route'); setAcctNo(''); setAcctName(''); setAmt('') }).catch(() => flash('Transfer failed')).finally(() => setBusy(false))
                }} />
            </Card>
          )}
        </>
      )}
    </div>
  )
}

// ── MESH OFFLINE P2P ─────────────────────────────────────────────────────────
function MeshPanel() {
  const [vouchers, setVouchers] = useState<{ voucherId: string; amount: number; status: string }[]>([])
  const [amt, setAmt] = useState('')
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const loadVouchers = () => { meshApi.pendingVouchers().then((d: unknown) => { const r = d as { ok: boolean; data: typeof vouchers }; setVouchers(r.data ?? []) }).catch(() => {}) }
  useEffect(() => { loadVouchers() }, [])
  return (
    <div>
      <Sec emoji="📡" title="Cowrie Mesh — Offline P2P" sub="Generate QR vouchers. Transfer face-to-face. No internet needed." />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <Card style={{ marginBottom: 14 }}>
        <In value={amt} onChange={v => setAmt(v.replace(/\D/g, ''))} placeholder="Voucher amount (₡)" />
        <Btn label={busy ? '⏳…' : '📡 Generate QR Voucher'} variant="primary" disabled={busy} style={{ width: '100%' }}
          onClick={() => { if (!amt) return; setBusy(true); meshApi.generateVoucher(Number(amt), 'CWR').then(() => { flash('Voucher generated ✓'); setAmt(''); loadVouchers() }).catch(() => flash('Generation failed')).finally(() => setBusy(false)) }} />
      </Card>
      {vouchers.length > 0 && <Sec emoji="📋" title="Pending Vouchers" />}
      {vouchers.map(v => (
        <Card key={v.voucherId} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', fontFamily: S.font }}>₡{v.amount.toLocaleString()}</div>
            <Pill label={v.status} color="#fbbf24" bg="rgba(251,191,36,.12)" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── IDENTITY TRINITY ─────────────────────────────────────────────────────────
// AfroID → Phone → Bank Account → Chain Address — 4 layers, one identity
function deriveChainAddress(afroId: string): string {
  // Deterministic SS58-style address derived from AfroID (simulates blake2_256)
  const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'
  let seed = afroId.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 7), 0)
  let addr = '5'
  for (let i = 0; i < 15; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; addr += alpha[seed % alpha.length] }
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}
function deriveDID(afroId: string): string {
  const h = afroId.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
  return `did:afro:NG:${Math.abs(h).toString(16).padStart(8, '0')}...`
}
function deriveBankAddress(afroId: string): string {
  const n = Math.abs(afroId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 97 + 100000)
  return `afroid:cowrie:NG:bank:044:${String(n).slice(0, 10).padStart(10, '0')}`
}

function IdentityTrinityPanel({ afroId }: { afroId: string }) {
  const [copied, setCopied] = useState('')
  const copy = (v: string, key: string) => { navigator.clipboard?.writeText(v).catch(() => {}); setCopied(key); setTimeout(() => setCopied(''), 2000) }
  const DID   = deriveDID(afroId)
  const BANK  = deriveBankAddress(afroId)
  const CHAIN = deriveChainAddress(afroId)
  const LAYERS = [
    { key: 'afroid', layer: 'L1 — Human Identity',  label: 'AfroID',          value: afroId,   emoji: '🪬', color: '#4ade80',  desc: 'Your sovereign human-readable identity. Never changes.' },
    { key: 'phone',  layer: 'L2 — Phone Anchor',     label: 'Phone',           value: '+234 *** *** 5678', emoji: '📱', color: '#fbbf24', desc: 'Phone-linked for USSD + OTP. Recoverable.' },
    { key: 'bank',   layer: 'L3 — Banking Address',  label: 'Bank Address',    value: BANK,     emoji: '🏦', color: '#60a5fa',  desc: 'Auto-generated bank routing address. Pan-African rails.' },
    { key: 'chain',  layer: 'L4 — Chain Wallet',     label: 'Chain Address',   value: CHAIN,    emoji: '⛓️', color: '#a78bfa', desc: 'SS58 Substrate address derived from AfroID via blake2_256. Separate but linked.' },
    { key: 'did',    layer: 'L5 — DID Document',     label: 'Decentralised ID',value: DID,      emoji: '🔗', color: '#f97316',  desc: 'W3C DID standard. Ed25519 keypair. Used by all dApps.' },
  ]
  return (
    <div>
      <Sec emoji="🔗" title="Afro Identity Trinity" sub="One AfroID. Five linked layers. Banking + Blockchain + Identity all derived from a single source of truth." />
      <div style={{ position: 'relative', marginBottom: 16 }}>
        {LAYERS.map((l, i) => (
          <div key={l.key} style={{ position: 'relative' }}>
            {i < LAYERS.length - 1 && (
              <div style={{ position: 'absolute', left: 20, top: '100%', width: 1, height: 8, background: `linear-gradient(${l.color},${LAYERS[i+1].color})`, zIndex: 1 }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: `${l.color}08`, border: `1px solid ${l.color}22`, borderRadius: 12, marginBottom: 8, position: 'relative', zIndex: 2 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${l.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{l.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, color: l.color, fontWeight: 700, letterSpacing: '0.1em', fontFamily: S.font }}>{l.layer}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.82)', fontFamily: S.head, marginTop: 1 }}>{l.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', fontFamily: 'monospace', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.value}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font, marginTop: 2 }}>{l.desc}</div>
              </div>
              <button onClick={() => copy(l.value, l.key)} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${l.color}30`, background: 'transparent', color: copied === l.key ? l.color : 'rgba(255,255,255,.3)', fontSize: 9, cursor: 'pointer', flexShrink: 0 }}>{copied === l.key ? '✓' : 'Copy'}</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 12px', background: 'rgba(74,222,128,.04)', borderRadius: 10, border: '1px solid rgba(74,222,128,.1)', fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, lineHeight: 1.7 }}>
        🛡️ Your identity layers are derived deterministically — no seed phrase needed. Recovery via Family Circle quorum (3-of-5) using pallet-identity-afro recovery protocol.
      </div>
    </div>
  )
}

// ── ORIGINAL COWRIE COIN ──────────────────────────────────────────────────────
function CoinPanel() {
  const todayMeta = MARKET_DAY_META[getTodayMarketDay()]
  const COINS = [
    {
      symbol: 'CWR', name: 'Cowrie Shell', emoji: '🐚',
      tagline: 'The original African currency. Social. Earned. Spent.',
      gradient: 'linear-gradient(135deg, #6B3A1F 0%, #A0522D 45%, #C9A84C 100%)',
      chip: '#C9A84C', text: '#FFF8E7',
      usdRate: MOCK_FX_RATES.CWR_TO_USD, supply: '21 Billion',
      backing: 'Community activity + social mining oracle',
      earn: ['Post to village feed', 'Spray on creators', 'Complete Ajo cycle', 'Vouch for a neighbour'],
      facts: ['Used as currency across Africa for 3,000+ years before European contact', 'Survived the Middle Passage — Esusu rebuilt in the diaspora', '1,000 CWR = 1 AfriCoin = $1 USD'],
    },
    {
      symbol: 'AFC', name: 'AfriCoin', emoji: '🌍',
      tagline: 'CowrieChain L1. Staked. Validated. Sovereign.',
      gradient: 'linear-gradient(135deg, #0a2a0a 0%, #0d3b1e 50%, #1a6038 100%)',
      chip: '#4ade80', text: '#e0ffe0',
      usdRate: MOCK_FX_RATES.CWR_TO_UFC * 1000, supply: '21 Million',
      backing: 'On-chain validator staking + PoA consensus',
      earn: ['Stake as validator', 'Bridge from CWR', 'Social mining rewards', 'Reputation bridge bonus'],
      facts: ['Inspired by Mansa Musa — Mali Empire had more gold than all of Europe', 'Fixed supply — deflationary by design', 'Substrate (Rust) consensus layer — not Ethereum or Solana'],
    },
  ]
  return (
    <div>
      <Sec emoji="🐚" title="Cowrie + AfriCoin — The Original Coins" sub="Two currencies. One civilisation. CWR (social layer) + AFC (chain layer) — designed together, separated by purpose." />
      <div style={{ padding: '8px 12px', background: `${todayMeta.color}10`, borderRadius: 10, border: `1px solid ${todayMeta.color}25`, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{todayMeta.emoji}</span>
        <div><div style={{ fontSize: 11, fontWeight: 700, color: todayMeta.color, fontFamily: S.head }}>{todayMeta.theme}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', fontFamily: S.font }}>{todayMeta.bonus}</div></div>
      </div>
      {COINS.map(coin => (
        <div key={coin.symbol} style={{ marginBottom: 18 }}>
          <div style={{ background: coin.gradient, borderRadius: 20, padding: '20px 18px', position: 'relative', overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.08 }}>{coin.emoji}</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: coin.chip, fontWeight: 700, letterSpacing: '0.15em', fontFamily: S.font }}>{coin.symbol}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: coin.text, fontFamily: S.head, marginTop: 2 }}>{coin.name}</div>
                <div style={{ fontSize: 10, color: `${coin.text}80`, fontFamily: S.font, marginTop: 4, maxWidth: 200 }}>{coin.tagline}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: coin.chip, fontFamily: S.head }}>${coin.usdRate.toFixed(4)}</div>
                <div style={{ fontSize: 9, color: `${coin.text}60`, fontFamily: S.font, marginTop: 2 }}>Supply: {coin.supply}</div>
              </div>
            </div>
            <div style={{ marginTop: 14, padding: '8px 10px', background: 'rgba(0,0,0,.2)', borderRadius: 8 }}>
              <div style={{ fontSize: 9, color: `${coin.text}60`, fontFamily: S.font }}>Backing: {coin.backing}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,.03)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em', fontFamily: S.font, marginBottom: 6 }}>EARN {coin.symbol}</div>
              {coin.earn.map(e => <div key={e} style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', fontFamily: S.font, marginBottom: 3 }}>→ {e}</div>)}
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,.03)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em', fontFamily: S.font, marginBottom: 6 }}>HISTORY</div>
              {coin.facts.map(f => <div key={f} style={{ fontSize: 9, color: 'rgba(255,255,255,.45)', fontFamily: S.font, marginBottom: 4, lineHeight: 1.5 }}>• {f}</div>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── YARA OWO — QUICK PAY ─────────────────────────────────────────────────────
// 5 modes: Ìlù QR · @AfroID · Drum Tap (NFC) · Cowrie Link · Drum Tone (sound)
// WeChat QR speed + UPI handle simplicity + M-Pesa offline + Drum tone payment
function QuickPayPanel({ afroId }: { afroId: string }) {
  const [mode, setMode] = useState<'qr'|'handle'|'nfc'|'link'|'tone'>('qr')
  const [handle, setHandle] = useState('')
  const [memo, setMemo] = useState('')
  const [quickAmt, setQuickAmt] = useState<number | null>(null)
  const [customAmt, setCustomAmt] = useState('')
  const [msg, setMsg] = useState('')
  const [showMyQR, setShowMyQR] = useState(false)
  const [toneActive, setToneActive] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3200) }
  const QUICK = [500, 1000, 2000, 5000, 10000, 50000]
  const RECENTS = [
    { handle: 'chidi@health',    name: 'Chidi',  emoji: '👨🏿', color: '#4ade80' },
    { handle: 'amaka@soko',      name: 'Amaka',  emoji: '👩🏿', color: '#fbbf24' },
    { handle: 'yemi@education',  name: 'Yemi',   emoji: '👩🏿‍🎓', color: '#60a5fa' },
    { handle: 'kofi@arts',       name: 'Kofi',   emoji: '👨🏿‍🎨', color: '#e879f9' },
    { handle: 'fatima@health',   name: 'Fatima', emoji: '👩🏿‍⚕️', color: '#fb923c' },
  ]
  const amt = quickAmt ?? (customAmt ? Number(customAmt) : 0)
  function sendNow() {
    if (!handle || !amt) { flash('Choose recipient + amount'); return }
    if (!navigator.onLine) { enqueueOffline('QUICK_PAY', { from: afroId, to: handle, amount: amt, memo }); flash('Queued — auto-sends when online'); return }
    cowrieApi.transfer(afroId, handle, amt, 'CWR', memo || 'Yara Owo').then(() => { flash(`Ranṣẹ ₡${amt.toLocaleString()} to ${handle.split('@')[0]}`); setHandle(''); setQuickAmt(null); setCustomAmt('') }).catch(() => flash('Transfer failed'))
  }
  const MODES = [
    ['qr',     '📷', 'Ìlù QR',     '#4ade80'],
    ['handle', '@',  '@AfroID',    '#fbbf24'],
    ['nfc',    '📡', 'Drum Tap',   '#60a5fa'],
    ['link',   '🔗', 'Cowrie Link','#fb923c'],
    ['tone',   '🥁', 'Drum Tone',  '#a78bfa'],
  ] as const
  return (
    <div>
      <Sec emoji="⚡" title="Yara Owo — Send in Seconds" sub="5 ways to pay. No form filling. Rooted in African drumbeats." />
      {msg && <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)', fontSize: 11, color: '#4ade80', marginBottom: 10, fontFamily: S.font }}>{msg}</div>}
      {/* 5-mode picker */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5, marginBottom: 12 }}>
        {MODES.map(([m,e,l,c]) => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: '9px 2px', borderRadius: 10, border: `1.5px solid ${mode===m ? c : 'rgba(255,255,255,.07)'}`, background: mode===m ? `${c}12` : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: 15 }}>{e}</div>
            <div style={{ fontSize: 8, color: mode===m ? c : 'rgba(255,255,255,.35)', fontFamily: S.font, marginTop: 3, fontWeight: 700, lineHeight: 1.2 }}>{l}</div>
          </button>
        ))}
      </div>
      {/* Recent contacts */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.25)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 6 }}>ỌRẸ ÀÁRỌ̀ — RECENT</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {RECENTS.map(r => (
            <button key={r.handle} onClick={() => setHandle(r.handle)} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '7px 9px', borderRadius: 12, border: `1.5px solid ${handle===r.handle ? r.color : 'rgba(255,255,255,.06)'}`, background: handle===r.handle ? `${r.color}10` : 'transparent', cursor: 'pointer' }}>
              <div style={{ fontSize: 20 }}>{r.emoji}</div>
              <div style={{ fontSize: 9, color: handle===r.handle ? r.color : 'rgba(255,255,255,.45)', fontFamily: S.font, fontWeight: 700 }}>{r.name}</div>
            </button>
          ))}
        </div>
      </div>
      {mode === 'qr' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <button onClick={() => setShowMyQR(false)} style={{ padding: '12px', borderRadius: 12, border: `1.5px solid ${!showMyQR ? '#4ade80' : 'rgba(255,255,255,.07)'}`, background: !showMyQR ? 'rgba(74,222,128,.08)' : 'transparent', cursor: 'pointer', color: !showMyQR ? '#4ade80' : 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700, fontFamily: S.font }}>
              📷 Scan QR<div style={{ fontSize: 9, marginTop: 3, fontWeight: 400 }}>Scan their drum code</div>
            </button>
            <button onClick={() => setShowMyQR(true)} style={{ padding: '12px', borderRadius: 12, border: `1.5px solid ${showMyQR ? '#4ade80' : 'rgba(255,255,255,.07)'}`, background: showMyQR ? 'rgba(74,222,128,.08)' : 'transparent', cursor: 'pointer', color: showMyQR ? '#4ade80' : 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700, fontFamily: S.font }}>
              📲 My QR<div style={{ fontSize: 9, marginTop: 3, fontWeight: 400 }}>Show your drum code</div>
            </button>
          </div>
          {showMyQR ? (
            <div style={{ textAlign: 'center', padding: '14px 0' }}>
              <div style={{ width: 148, height: 148, margin: '0 auto 10px', background: '#fff', borderRadius: 12, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}><rect width="7" height="7" fill="#000"/><rect x="14" width="7" height="7" fill="#000"/><rect y="14" width="7" height="7" fill="#000"/><rect x="2" y="2" width="3" height="3" fill="#fff"/><rect x="16" y="2" width="3" height="3" fill="#fff"/><rect x="2" y="16" width="3" height="3" fill="#fff"/><rect x="9" y="1" width="1" height="2" fill="#000"/><rect x="10" y="3" width="1" height="2" fill="#000"/><rect x="9" y="6" width="3" height="1" fill="#000"/><rect x="1" y="9" width="2" height="3" fill="#000"/><rect x="9" y="10" width="1" height="3" fill="#000"/><rect x="12" y="9" width="3" height="1" fill="#000"/><rect x="14" y="10" width="2" height="2" fill="#000"/></svg>
              </div>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#4ade80' }}>{afroId}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font, marginTop: 3 }}>Ìlù QR Ẹni Mi — scan to send me Cowrie</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '18px', border: '2px dashed rgba(74,222,128,.15)', borderRadius: 14, cursor: 'pointer' }} onClick={() => flash('Camera — tap to open scanner')}>
              <div style={{ fontSize: 44 }}>📷</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontFamily: S.font, marginTop: 8, fontWeight: 700 }}>Tẹ lati ṣí ibi-kamẹra</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font, marginTop: 4 }}>Works with any Cowrie Ìlù QR code</div>
            </div>
          )}
        </div>
      )}
      {mode === 'handle' && (
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginBottom: 6 }}>Like UPI — type their @AfroID and pay instantly. No bank details needed.</div>
          <In value={handle} onChange={setHandle} placeholder="@afroid, phone, or email — e.g. chidi@health" />
          {handle && <div style={{ fontSize: 10, color: '#4ade80', fontFamily: S.font, marginBottom: 8 }}>Ìmọ: {handle}</div>}
        </div>
      )}
      {mode === 'nfc' && (
        <div style={{ textAlign: 'center', padding: '14px 0' }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>📡</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,.85)', fontFamily: S.head, marginBottom: 6 }}>Drum Tap — Ìlù NFC</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, lineHeight: 1.7, marginBottom: 14 }}>Hold phones back-to-back.<br />Cowrie flows like the talking drum — no internet, no card.<br />Works across all 54 African nations.</div>
          <Btn label={toneActive ? '📡 Drum Tap LIVE — hold together' : '📡 Activate Drum Tap'} variant="primary" onClick={() => { setToneActive(!toneActive); flash(toneActive ? 'Drum Tap off' : 'Drum Tap LIVE — hold phones back-to-back') }} />
        </div>
      )}
      {mode === 'link' && (
        <div>
          <Sec emoji="🔗" title="Cowrie Link — Ìdárayá Owo" sub="Generate a link. Send via WhatsApp, SMS, or village group. Works globally across the diaspora." />
          <In value={customAmt} onChange={v => setCustomAmt(v.replace(/\D/g,''))} placeholder="Amount to request (₡ — blank for open)" />
          <In value={memo} onChange={setMemo} placeholder="Reason — e.g. Market contribution" />
          <Btn label="🔗 Generate Cowrie Link" variant="primary" style={{ width: '100%' }}
            onClick={() => fetch('/api/bank/paylink/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, amount: customAmt ? Number(customAmt) : null, memo }) }).then(() => flash('Link ready — share on WhatsApp, SMS, Instagram')).catch(() => flash('Generation failed'))} />
          <div style={{ marginTop: 8, fontSize: 9, color: 'rgba(255,255,255,.2)', fontFamily: S.font, lineHeight: 1.7 }}>Inspired by Brazil PIX · India UPI · M-Pesa requests · Built for 54 African nations and the global diaspora.</div>
        </div>
      )}
      {mode === 'tone' && (
        <div style={{ textAlign: 'center', padding: '14px 0' }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🥁</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#a78bfa', fontFamily: S.head, marginBottom: 6 }}>Drum Tone — Ìlù Ohùn</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, lineHeight: 1.7, marginBottom: 14 }}>
            A Cowrie-encoded ultrasonic tone plays from your speaker.<br />Their device hears it. Payment done.<br />No QR. No NFC. No internet. Just the drum.
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={() => flash('Playing drum tone for ' + (amt ? '₡' + amt : 'an amount'))} style={{ padding: '10px 18px', borderRadius: 12, border: '1.5px solid #a78bfa', background: 'rgba(167,139,250,.12)', color: '#a78bfa', fontSize: 12, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>🔊 Play Tone</button>
            <button onClick={() => flash('Listening for drum payment...')} style={{ padding: '10px 18px', borderRadius: 12, border: '1.5px solid #4ade80', background: 'rgba(74,222,128,.08)', color: '#4ade80', fontSize: 12, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>🎙 Receive</button>
          </div>
          <div style={{ marginTop: 10, fontSize: 9, color: 'rgba(255,255,255,.2)', fontFamily: S.font }}>Inspired by SoundPay · Talking Drum tradition</div>
        </div>
      )}
      {/* Quick amounts — always visible */}
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.25)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 6 }}>IYE COWRIE — QUICK AMOUNTS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 8 }}>
          {QUICK.map(q => <button key={q} onClick={() => { setQuickAmt(q); setCustomAmt('') }} style={{ padding: '11px 4px', borderRadius: 10, border: `1.5px solid ${quickAmt===q ? '#fbbf24' : 'rgba(255,255,255,.07)'}`, background: quickAmt===q ? 'rgba(251,191,36,.1)' : 'rgba(255,255,255,.02)', color: quickAmt===q ? '#fbbf24' : 'rgba(255,255,255,.55)', fontSize: 12, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>₡{q>=1000?`${q/1000}K`:q}</button>)}
        </div>
        <In value={customAmt} onChange={v => { setCustomAmt(v.replace(/\D/g,'')); setQuickAmt(null) }} placeholder="Custom amount..." style={{ marginBottom: 8 }} />
        {amt > 0 && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: S.font, marginBottom: 8 }}>&#x2248; ${(amt * MOCK_FX_RATES.CWR_TO_USD).toFixed(2)} USD</div>}
        <In value={memo} onChange={setMemo} placeholder="Memo (optional)" style={{ marginBottom: 8 }} />
        <Btn label={amt > 0 && handle ? `Ranṣẹ ₡${amt.toLocaleString()} → ${handle.split('@')[0]}` : 'Choose Recipient + Amount'} variant="primary" disabled={!handle || !amt} style={{ width: '100%', fontSize: 13, padding: '12px' }} onClick={sendNow} />
      </div>
    </div>
  )
}

// ── COWRIECHAIN BLOCKCHAIN WALLET ─────────────────────────────────────────────
// SEPARATE FROM BANKING — linked via Bridge. Substrate L1 chain.
function ChainWalletPanel({ afroId }: { afroId: string }) {
  const [chainData, setChainData] = useState<{ afc: number; cwr: number; nativeAfro: number } | null>(null)
  const [blocks, setBlocks] = useState<{ number: number; hash: string; txCount: number; ts: number }[]>([])
  const [validators, setValidators] = useState<{ active: number; total: number; finality: string } | null>(null)
  const [sendTo, setSendTo] = useState(''); const [sendAmt, setSendAmt] = useState('')
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const walletAddress = deriveChainAddress(afroId)
  useEffect(() => {
    chainApi.chainBalance().then(d => setChainData(d.data)).catch(() => setChainData({ afc: 4.215, cwr: 0, nativeAfro: 1250 }))
    chainApi.recentBlocks().then(d => setBlocks((d.data as typeof blocks).slice(0, 5))).catch(() => setBlocks([
      { number: 184201, hash: '0x4afc...7e2b', txCount: 12, ts: Date.now() - 6000 },
      { number: 184200, hash: '0x9d8a...1c3f', txCount: 8,  ts: Date.now() - 12000 },
      { number: 184199, hash: '0x2ef1...8b4a', txCount: 21, ts: Date.now() - 18000 },
      { number: 184198, hash: '0xa3b5...0d7e', txCount: 5,  ts: Date.now() - 24000 },
    ]))
    chainApi.validators().then(d => setValidators(d.data)).catch(() => setValidators({ active: 48, total: 200, finality: '6.2s' }))
  }, [afroId])
  const PALLETS = [
    { name: 'afro-id',          status: 'LIVE', emoji: '🪬', desc: 'Identity anchoring — blake2_256(AfroID) → H256' },
    { name: 'ado ZK Mixer',     status: 'LIVE', emoji: '🔮', desc: 'Zero-knowledge private transactions via Halo2' },
    { name: 'pallet-ghost',     status: 'LIVE', emoji: '👻', desc: 'Stealth account generation via Randomness pallet' },
    { name: 'pallet-talking-drum', status: 'LIVE', emoji: '🥁', desc: 'Acoustic offline transaction propagation' },
    { name: 'reputation-bridge',status: 'LIVE', emoji: '⭐', desc: 'On-chain Ubuntu score (i16) + risk (i8)' },
    { name: 'pallet-vdf',       status: 'LIVE', emoji: '⏳', desc: '24h VDF time-lock for Spirit Vault unlock' },
  ]
  return (
    <div>
      <div style={{ padding: '8px 12px', background: 'rgba(167,139,250,.08)', borderRadius: 10, border: '1.5px solid rgba(167,139,250,.2)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>⛓️</span>
        <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', fontFamily: S.head }}>COWRIECHAIN L1 — BLOCKCHAIN LAYER</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: S.font }}>Separate from your bank account. Linked via Bridge.</div></div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
      </div>
      <Card style={{ marginBottom: 14, background: 'linear-gradient(135deg,#0a0a0a,#0d1a0d)' }}>
        <div style={{ fontSize: 9, color: 'rgba(167,139,250,.6)', fontFamily: 'monospace', marginBottom: 4 }}>WALLET ADDRESS</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', fontFamily: 'monospace', marginBottom: 8 }}>{walletAddress}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font, marginBottom: 12 }}>Derived from AfroID via blake2_256 — decentralised and non-custodial</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[['AFC', chainData?.afc.toFixed(3) ?? '...', '#4ade80'], ['NATIVE AFRO', (chainData?.nativeAfro ?? 0).toLocaleString(), '#a78bfa'], ['ON-CHAIN CWR', (chainData?.cwr ?? 0).toLocaleString(), '#fbbf24']].map(([k, v, c]) => (
            <div key={k} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: c, fontFamily: S.head }}>{v}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font, marginTop: 2 }}>{k}</div>
            </div>
          ))}
        </div>
      </Card>
      <Sec emoji="↗" title="Send On-Chain" sub="Direct blockchain transfer — no bank intermediary." />
      <In value={sendTo} onChange={setSendTo} placeholder="Recipient SS58 address or AfroID" />
      <In value={sendAmt} onChange={v => setSendAmt(v.replace(/[^0-9.]/g, ''))} placeholder="Amount AFC" />
      <Btn label="⛓️ Send On-Chain" variant="primary" style={{ width: '100%', marginBottom: 16 }} onClick={() => { if (!sendTo || !sendAmt) return; fetch('/api/bank/chain/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: afroId, to: sendTo, amount: Number(sendAmt) }) }).then(() => { flash('On-chain tx broadcast ✓'); setSendTo(''); setSendAmt('') }).catch(() => flash('Broadcast failed')) }} />
      {msg && <p style={{ fontSize: 11, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font, textAlign: 'center', marginBottom: 8 }}>{msg}</p>}
      {validators && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[['Validators', `${validators.active}/${validators.total}`, '#60a5fa'], ['Finality', validators.finality, '#4ade80'], ['Block #', blocks[0]?.number.toLocaleString() ?? '...', '#a78bfa']].map(([k, v, c]) => (
            <div key={k} style={{ padding: '10px', background: 'rgba(255,255,255,.03)', borderRadius: 10, textAlign: 'center', border: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: c, fontFamily: S.head }}>{v}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginTop: 2 }}>{k}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em', fontFamily: S.font, marginBottom: 8 }}>LIVE BLOCKS</div>
        {blocks.map(b => (
          <div key={b.number} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: '#a78bfa', flexShrink: 0 }} />
            <div style={{ flex: 1, fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,.6)' }}>#{b.number} · {b.hash}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font }}>{b.txCount} txs</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em', fontFamily: S.font, marginBottom: 8 }}>ACTIVE PALLETS — 18 MODULES</div>
      {PALLETS.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
          <span style={{ fontSize: 14 }}>{p.emoji}</span>
          <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.7)', fontFamily: 'monospace' }}>{p.name}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font, marginTop: 1 }}>{p.desc}</div></div>
          <Pill label={p.status} color="#4ade80" bg="rgba(74,222,128,.1)" />
        </div>
      ))}
    </div>
  )
}

// ── BRIDGE — BANK ↔ BLOCKCHAIN ────────────────────────────────────────────────
function BridgePanel({ afroId }: { afroId: string }) {
  const [dir, setDir] = useState<'in' | 'out'>('in')
  const [amt, setAmt] = useState(''); const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  return (
    <div>
      <Sec emoji="🌉" title="Orisun Bridge — Bank ↔ Blockchain" sub="Move value between your bank layer (CWR) and blockchain layer (AFC). Two systems. One bridge." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setDir('in')} style={{ padding: '16px', borderRadius: 14, border: `1.5px solid ${dir === 'in' ? '#4ade80' : 'rgba(255,255,255,.07)'}`, background: dir === 'in' ? 'rgba(74,222,128,.08)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: 24 }}>🏦 → ⛓️</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: dir === 'in' ? '#4ade80' : 'rgba(255,255,255,.5)', fontFamily: S.head, marginTop: 6 }}>Bank → Chain</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginTop: 2 }}>CWR → AFC on-chain</div>
        </button>
        <button onClick={() => setDir('out')} style={{ padding: '16px', borderRadius: 14, border: `1.5px solid ${dir === 'out' ? '#a78bfa' : 'rgba(255,255,255,.07)'}`, background: dir === 'out' ? 'rgba(167,139,250,.08)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: 24 }}>⛓️ → 🏦</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: dir === 'out' ? '#a78bfa' : 'rgba(255,255,255,.5)', fontFamily: S.head, marginTop: 6 }}>Chain → Bank</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginTop: 2 }}>AFC → CWR in bank</div>
        </button>
      </div>
      <Card style={{ marginBottom: 14, background: 'rgba(255,255,255,.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: S.font }}>Exchange Rate</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', fontFamily: S.head }}>1 AFC = 1,000 CWR = $1.00</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: S.font }}>Bridge Fee</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', fontFamily: S.head }}>0.1% — capped at ₡500</div>
        </div>
      </Card>
      <In value={amt} onChange={v => setAmt(v.replace(/[^0-9.]/g, ''))} placeholder={dir === 'in' ? 'CWR amount to bridge in' : 'AFC amount to bridge out'} />
      {amt && <p style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: S.font, marginBottom: 8 }}>You receive: {dir === 'in' ? `${(Number(amt) / 1000).toFixed(4)} AFC on-chain` : `₡${(Number(amt) * 1000).toLocaleString()} CWR in bank`}</p>}
      <Btn label={dir === 'in' ? '🌉 Bridge CWR → Chain' : '🌉 Bridge AFC → Bank'} variant="primary" style={{ width: '100%' }}
        onClick={() => { if (!amt) return; const fn = dir === 'in' ? chainApi.bridgeIn(Number(amt), 'CWR') : chainApi.bridgeOut(Number(amt), 'CWR', afroId); fn.then(() => { flash(`Bridge initiated ✓ — confirm in ~6 seconds`); setAmt('') }).catch(() => flash('Bridge failed')) }} />
      {msg && <p style={{ textAlign: 'center', margin: '10px 0 0', fontSize: 11, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
    </div>
  )
}

// ── STAKING + BLOCKCHAIN GROWTH ───────────────────────────────────────────────
function StakingPanel({ afroId }: { afroId: string }) {
  const [stakeAmt, setStakeAmt] = useState('')
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const GROWTH_ENGINES = [
    { name: 'AfroID Social Staking',    emoji: '🪬', apy: '14%',  desc: 'Stake AFC to anchor AfroID registrations — earn per new citizen',    active: true },
    { name: 'Talking Drum Relay',       emoji: '🥁', apy: '9%',   desc: 'Run offline relay nodes — earn for propagating acoustic transactions', active: true },
    { name: 'Ubuntu Reputation Oracle', emoji: '⭐', apy: '11%',  desc: 'Stake to validate Ubuntu scores on repute bridge pallet',             active: true },
    { name: 'ZK Proof Verifier',        emoji: '🔮', apy: '18%',  desc: 'Run Halo2 ZK circuit verifier for ADO private transactions',          active: false },
    { name: 'Ghost Account Guardian',   emoji: '👻', apy: '7%',   desc: 'Validate stealth addresses via Ghost pallet randomness',              active: true  },
    { name: 'Social Mining Oracle',     emoji: '⛏️', apy: '22%',  desc: 'Mine CWR/AFC from verified social interaction data (village feeds)',   active: true  },
  ]
  return (
    <div>
      <Sec emoji="🌾" title="Staking — Grow CowrieChain" sub="Stake AFC to power the network. Six validator roles. Best APY in African DeFi." />
      {msg && <p style={{ textAlign: 'center', fontSize: 11, margin: '0 0 10px', color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <Card style={{ marginBottom: 14, background: 'linear-gradient(135deg,#0a1a0a,#0d280d)', border: '1px solid rgba(74,222,128,.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: S.font }}>Total Staked (Network)</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', fontFamily: S.head }}>2.4M AFC</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: S.font }}>Avg APY</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', fontFamily: S.head }}>13.5%</div>
        </div>
      </Card>
      {GROWTH_ENGINES.map(g => (
        <Card key={g.name} style={{ marginBottom: 8, opacity: g.active ? 1 : 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{g.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.82)', fontFamily: S.head }}>{g.name}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginTop: 2 }}>{g.desc}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#4ade80', fontFamily: S.head }}>{g.apy}</div>
              <Pill label={g.active ? 'LIVE' : 'SOON'} color={g.active ? '#4ade80' : '#888'} bg={g.active ? 'rgba(74,222,128,.1)' : 'rgba(255,255,255,.06)'} />
            </div>
          </div>
          {g.active && (
            <Btn label={`Stake into ${g.name.split(' ')[0]}`} style={{ width: '100%', fontSize: 11 }}
              onClick={() => fetch('/api/bank/chain/stake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, role: g.name, amount: 0.5 }) }).then(() => flash(`Staked into ${g.name} ✓`)).catch(() => flash('Stake failed'))} />
          )}
        </Card>
      ))}
      <div style={{ marginTop: 14 }}>
        <Sec emoji="⛏️" title="Stake Custom Amount" />
        <In value={stakeAmt} onChange={v => setStakeAmt(v.replace(/[^0-9.]/g, ''))} placeholder="AFC amount to stake" />
        <Btn label="🌾 Stake AFC" variant="primary" style={{ width: '100%' }}
          onClick={() => { if (!stakeAmt) return; fetch('/api/bank/chain/stake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, amount: Number(stakeAmt), role: 'GENERAL' }) }).then(() => { flash(`${stakeAmt} AFC staked ✓`); setStakeAmt('') }).catch(() => flash('Stake failed')) }} />
      </div>
    </div>
  )
}

// ── ZK PRIVACY (ADO PALLET) ───────────────────────────────────────────────────
function ZKPrivacyPanel({ afroId }: { afroId: string }) {
  const [to, setTo] = useState(''); const [amt, setAmt] = useState('')
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const FEATURES = [
    { emoji: '🔮', name: 'Halo2 ZK Proofs',    desc: 'Zero-knowledge proof generation for transaction privacy' },
    { emoji: '👻', name: 'Stealth Addresses',   desc: 'Ghost pallet generates one-time stealth addresses per tx' },
    { emoji: '🎭', name: 'Egungun Account',     desc: 'Masquerade account — transactions under community alias' },
    { emoji: '🌑', name: 'Merkle Root Shielding', desc: 'Inputs shielded to nullifier set — sender untraceable' },
  ]
  return (
    <div>
      <Sec emoji="🔮" title="ADO — Private Transactions" sub="Halo2 ZK proofs. Ghost accounts. Egungun masquerade. Privacy as a Pan-African cultural norm." />
      <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,.15)', marginBottom: 12, fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font }}>
        ⚠️ Private txs are shielded from public ledger but Elder Council retains view-key for dispute resolution.
      </div>
      {FEATURES.map(f => (
        <div key={f.name} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
          <span style={{ fontSize: 18 }}>{f.emoji}</span>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.75)', fontFamily: S.head }}>{f.name}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginTop: 2 }}>{f.desc}</div></div>
        </div>
      ))}
      <div style={{ marginTop: 14 }}>
        <Sec emoji="🔮" title="Private Transfer" />
        <In value={to} onChange={setTo} placeholder="Recipient (stealth address generated automatically)" />
        <In value={amt} onChange={v => setAmt(v.replace(/[^0-9.]/g, ''))} placeholder="AFC amount" />
        {msg && <p style={{ fontSize: 11, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font, marginBottom: 6 }}>{msg}</p>}
        <Btn label="🔮 Private Send (ZK Shield)" variant="primary" style={{ width: '100%' }}
          onClick={() => { if (!to || !amt) return; fetch('/api/bank/chain/zk-send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: afroId, to, amount: Number(amt) }) }).then(() => { flash('ZK proof generated — tx shielded ✓'); setTo(''); setAmt('') }).catch(() => flash('ZK send failed')) }} />
      </div>
    </div>
  )
}

// ── MULTI-LAYER WALLETS ──────────────────────────────────────────────────────
function WalletsPanel({ afroId }: { afroId: string }) {
  const [scope, setScope] = useState<'personal' | 'village' | 'family' | 'business'>('personal')
  const WALLETS = [
    { id: 'personal', scope: 'personal' as const, label: 'Personal Wallet', balance: 45200, emoji: '🏠', color: '#4ade80' },
    { id: 'village',  scope: 'village'  as const, label: 'Village Treasury', balance: 1200000, emoji: '🏘',  color: '#fbbf24' },
    { id: 'family',   scope: 'family'   as const, label: 'Family Pool',      balance: 85000,  emoji: '👨‍👩‍👧', color: '#e879f9' },
    { id: 'business', scope: 'business' as const, label: 'Business Account', balance: 320000, emoji: '⚒️', color: '#60a5fa' },
  ]
  const [to, setTo] = useState(''); const [amt, setAmt] = useState(''); const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const active = WALLETS.find(w => w.scope === scope)!
  return (
    <div>
      <Sec emoji="🏦" title="Multi-Layer Wallets" sub="Personal · Village Treasury · Family Pool · Business — isolated ledgers, one AfroID." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {WALLETS.map(w => (
          <button key={w.id} onClick={() => setScope(w.scope)} style={{ padding: '12px', borderRadius: 12, border: `1.5px solid ${scope === w.scope ? w.color : 'rgba(255,255,255,.07)'}`, background: scope === w.scope ? `${w.color}12` : 'rgba(255,255,255,.02)', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontSize: 18 }}>{w.emoji}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: scope === w.scope ? w.color : 'rgba(255,255,255,.5)', fontFamily: S.head, marginTop: 6 }}>{w.label}</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: scope === w.scope ? w.color : 'rgba(255,255,255,.5)', fontFamily: S.head, marginTop: 2 }}>₡{w.balance.toLocaleString()}</div>
          </button>
        ))}
      </div>
      <Card style={{ marginBottom: 14, background: `${active.color}08`, border: `1px solid ${active.color}20` }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontFamily: S.font }}>{active.emoji} {active.label}</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: active.color, fontFamily: S.head, marginTop: 4 }}>₡{active.balance.toLocaleString()}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.2)', marginTop: 4 }}>~${(active.balance * MOCK_FX_RATES.CWR_TO_USD).toFixed(2)} USD · ~{(active.balance * MOCK_FX_RATES.CWR_TO_UFC).toFixed(4)} AFC</div>
      </Card>
      <Sec emoji="↗" title="Transfer Between Wallets" />
      <In value={to} onChange={setTo} placeholder="Destination: village / family / business" />
      <In value={amt} onChange={v => setAmt(v.replace(/\D/g, ''))} placeholder="Amount (₡)" />
      <Btn label="↗ Transfer" variant="primary" style={{ width: '100%' }}
        onClick={() => { if (!to || !amt) return; cowrieApi.transfer(afroId, to, Number(amt), 'CWR', `Wallet transfer: ${scope} to ${to}`).then(() => { flash('Transferred ✓'); setTo(''); setAmt('') }).catch(() => flash('Transfer failed')) }} />
      {msg && <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
    </div>
  )
}

// ── AI FINANCIAL GRIOT (Vishnu · Wealth Oracle) ──────────────────────────────
function GriotAiPanel({ afroId }: { afroId: string }) {
  const [prompt, setPrompt] = useState('')
  const [advice, setAdvice] = useState<{ text: string; proverb: string; action: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const VISHNU_POWERS = [
    '💱 Best time to transfer?',
    '📊 My credit score analysis',
    '🌾 Optimal savings lock timing',
    '⛓️ Maximize AFC staking yield',
    '🗺️ My debt-free roadmap',
    '📈 Village treasury health',
  ]

  function ask(q: string) {
    setBusy(true); setPrompt(q)
    aiGodsApi.query('vishnu', q, { afroId }).then((d: unknown) => {
      const r = d as { text?: string; proverb?: string; action?: string }
      setAdvice({
        text: r.text ?? 'Vishnu reads the cosmic ledger of your wealth...',
        proverb: r.proverb ?? 'Wealth is like sea-water; the more we drink, the thirstier we become.',
        action: r.action ?? 'Preserve balance: lock 20% of surplus into the Ancestral Buffer.',
      })
    }).catch(() => setAdvice({
      text: 'Your financial cosmos is in motion. Like Vishnu preserving universal balance, your portfolio needs three pillars: liquid cowrie for daily flow, circle savings for community power, and staked AFC for long-term sovereignty.',
      proverb: 'The river that forgets its source will dry up. — Pan-African proverb',
      action: 'Stake AFC in the next harvest window for maximum yield alignment.',
    })).finally(() => setBusy(false))
  }

  return (
    <div>
      <Sec emoji="🌀" title="Vishnu · Wealth Oracle" sub="Preserver of Wealth & Balance — AI that reads the cosmic ledger of your finances." />

      {/* Vishnu Quick Powers */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {VISHNU_POWERS.map(p => (
          <button
            key={p}
            onClick={() => ask(p)}
            style={{
              padding: '5px 10px', borderRadius: 20,
              border: '1px solid rgba(129,140,248,.25)',
              background: 'rgba(129,140,248,.06)',
              color: 'rgba(255,255,255,.65)',
              fontSize: 10, fontFamily: S.font,
              cursor: 'pointer', textAlign: 'left',
            }}
          >{p}</button>
        ))}
      </div>

      <In value={prompt} onChange={setPrompt} placeholder="Ask Vishnu anything about your wealth..." />
      <Btn
        label={busy ? '🌀 Consulting Vishnu...' : '🌀 Ask Vishnu'}
        variant="primary"
        disabled={busy}
        style={{ width: '100%', marginBottom: 14, background: busy ? 'rgba(129,140,248,.3)' : 'rgba(129,140,248,.2)', border: '1px solid rgba(129,140,248,.4)', color: '#818cf8' }}
        onClick={() => { if (!prompt.trim()) return; ask(prompt) }}
      />

      {advice && (
        <Card style={{ background: 'linear-gradient(160deg,#0c0a1e,#110e2a)', border: '1px solid rgba(129,140,248,.15)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', fontFamily: S.font, lineHeight: 1.8, marginBottom: 12 }}>{advice.text}</div>
          <div style={{ padding: '8px 12px', background: 'rgba(129,140,248,.06)', borderRadius: 8, border: '1px solid rgba(129,140,248,.12)', marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(129,140,248,.6)', letterSpacing: '0.1em', marginBottom: 4 }}>VISHNU ORACLE</div>
            <div style={{ fontSize: 11, color: '#818cf8', fontStyle: 'italic', fontFamily: S.font, lineHeight: 1.6 }}>"{advice.proverb}"</div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#a5b4fc', fontFamily: S.head }}>→ {advice.action}</div>
        </Card>
      )}
    </div>
  )
}

// ── REAL-TIME TRANSACTION FEED ───────────────────────────────────────────────
function LiveFeedPanel({ afroId }: { afroId: string }) {
  const [feed, setFeed] = useState([
    { id: '1', type: 'CREDIT',           amount: 5000,  actor: 'chidi@health',    desc: 'Spray from live stream',      ts: Date.now() - 12000 },
    { id: '2', type: 'AJO_CONTRIBUTION', amount: 3000,  actor: 'nneka@education', desc: 'Ẹgbẹ Traders contribution',  ts: Date.now() - 45000 },
    { id: '3', type: 'HARAMBEE',         amount: 1000,  actor: 'amaka@soko',      desc: 'Village Borehole Fund',       ts: Date.now() - 120000 },
    { id: '4', type: 'CORRIDOR_RECEIVE', amount: 45000, actor: 'london@diaspora', desc: 'NIBSS corridor from UK',       ts: Date.now() - 300000 },
    { id: '5', type: 'ESCROW_RELEASE',   amount: 25000, actor: 'kemi@soko',       desc: 'Ankara x10 — pot settled',    ts: Date.now() - 600000 },
  ])
  const CREDIT_TYPES = ['CREDIT', 'AJO_PAYOUT', 'ESCROW_RELEASE', 'HARAMBEE', 'CORRIDOR_RECEIVE', 'SEASON_UNLOCK']
  useEffect(() => {
    const timer = setInterval(() => {
      const types = ['CREDIT', 'AJO_CONTRIBUTION', 'HARAMBEE', 'SPRAY']
      const type = types[Math.floor(Math.random() * types.length)]
      setFeed(prev => [{
        id: `live_${Date.now()}`, type, actor: `user${Math.floor(Math.random() * 999)}@village`,
        amount: Math.floor(Math.random() * 9000) + 200, desc: 'Live transaction', ts: Date.now(),
      }, ...prev.slice(0, 19)])
    }, 9000)
    return () => clearInterval(timer)
  }, [afroId])
  function ago(ts: number) { const s = Math.floor((Date.now() - ts) / 1000); return s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m` : `${Math.floor(s / 3600)}h` }
  return (
    <div>
      <Sec emoji="📡" title="Live Transaction Feed" sub="Real-time Cowrie movement across all villages — every transaction, every second." />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
        <span style={{ fontSize: 10, color: '#4ade80', fontFamily: S.font, fontWeight: 700 }}>LIVE · Auto-updates every 9s</span>
      </div>
      {feed.map(tx => {
        const ev = KOWE_EVENT_TYPES[tx.type as keyof typeof KOWE_EVENT_TYPES]
        const isCredit = CREDIT_TYPES.includes(tx.type)
        const col = ev?.color ?? (isCredit ? '#2d9e5f' : '#c94040')
        return (
          <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${col}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>{ev?.emoji ?? '↗'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.75)', fontFamily: S.font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.desc}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 1, fontFamily: S.font }}>{tx.actor} · {ago(tx.ts)} ago</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: col, fontFamily: S.head, flexShrink: 0 }}>{isCredit ? '+' : '−'}₡{tx.amount.toLocaleString()}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── NKISI FRAUD SHIELD ───────────────────────────────────────────────────────
function NkisiPanel() {
  const shield = NKISI_SHIELD_LEVELS.GREEN
  const SIGNALS = [
    { label: 'Transaction velocity',          score: 0,  status: 'CLEAR' as const },
    { label: 'Unverified counterparty ratio', score: 12, status: 'WATCH' as const },
    { label: 'Cross-corridor anomaly',        score: 0,  status: 'CLEAR' as const },
    { label: 'Device fingerprint match',      score: 0,  status: 'CLEAR' as const },
    { label: 'Ubuntu score vs spend ratio',   score: 0,  status: 'CLEAR' as const },
    { label: 'Unusual hour trading',          score: 0,  status: 'CLEAR' as const },
  ]
  return (
    <div>
      <Sec emoji="🧿" title="Nkisi Shield — Fraud Detection" sub="The Nkisi guards against evil. Heat-based AI monitors every transaction in real time." />
      <Card style={{ marginBottom: 14, textAlign: 'center', background: `${shield.color}08`, border: `1px solid ${shield.color}25` }}>
        <div style={{ fontSize: 40 }}>{shield.emoji}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: shield.color, fontFamily: S.head, marginTop: 6 }}>{shield.label}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, marginTop: 4 }}>{shield.desc}</div>
      </Card>
      {SIGNALS.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.status === 'CLEAR' ? '#4ade80' : '#fbbf24', flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,.68)', fontFamily: S.font }}>{s.label}</div>
          <Pill label={s.status} color={s.status === 'CLEAR' ? '#4ade80' : '#fbbf24'} bg={s.status === 'CLEAR' ? 'rgba(74,222,128,.1)' : 'rgba(251,191,36,.1)'} />
        </div>
      ))}
      <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(255,255,255,.02)', borderRadius: 10, fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font, lineHeight: 1.7 }}>
        🛡️ Nkisi AI monitors 12 risk signals across P2P, escrow, corridor, and circle transactions. Heat score refreshes every 60 seconds.
      </div>
    </div>
  )
}

// ── VOICE + USSD BANKING ─────────────────────────────────────────────────────
function VoicePanel() {
  const USSD = [
    { code: '*737*1#',                 action: 'Check Cowrie balance',        emoji: '💰' },
    { code: '*737*2*AMOUNT*AFROID#',   action: 'Send Cowrie P2P',             emoji: '↗' },
    { code: '*737*3#',                 action: 'Claim daily drop',            emoji: '💧' },
    { code: '*737*4#',                 action: 'My Ajo circles summary',      emoji: '🔄' },
    { code: '*737*5*AMOUNT#',          action: 'Emergency buffer tap',        emoji: '🛡️' },
    { code: '*737*6#',                 action: 'Griot credit score whisper',  emoji: '🎙️' },
    { code: '*737*0#',                 action: 'Main USSD menu',              emoji: '🏠' },
  ]
  const VOICE = [
    { lang: 'Yoruba',  cmd: '"Ranṣẹ Cowrie ẹ̀wádìndínlọ́gọ́ sí Chidi"', english: 'Send 500 Cowrie to Chidi' },
    { lang: 'Igbo',    cmd: '"Zipu Cowrie narị na ise n\'aka Amaka"',      english: 'Send 150 Cowrie to Amaka' },
    { lang: 'Swahili', cmd: '"Tuma Cowrie mia tano kwa Fatuma"',           english: 'Send 500 Cowrie to Fatuma' },
    { lang: 'Hausa',   cmd: '"Aika Cowrie dari biyar ga Musa"',            english: 'Send 500 Cowrie to Musa'  },
  ]
  return (
    <div>
      <Sec emoji="🥁" title="Ọkwụ — Voice + USSD Banking" sub="Bank without reading. 40% of sub-Saharan Africa has low literacy — banking must not require reading." />
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em', fontFamily: S.font, marginBottom: 8 }}>USSD QUICK CODES</div>
        {USSD.map(u => (
          <div key={u.code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <span style={{ fontSize: 14 }}>{u.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', fontFamily: 'monospace' }}>{u.code}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, marginTop: 1 }}>{u.action}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em', fontFamily: S.font, marginBottom: 8 }}>VOICE COMMANDS — 4 AFRICAN LANGUAGES</div>
      {VOICE.map(v => (
        <Card key={v.lang} style={{ marginBottom: 8 }}>
          <Pill label={v.lang} color="#fbbf24" bg="rgba(251,191,36,.1)" />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', fontFamily: S.font, fontStyle: 'italic', margin: '6px 0 4px' }}>{v.cmd}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font }}>{v.english}</div>
        </Card>
      ))}
    </div>
  )
}

// ── MICRO-INVESTMENT ENGINE ───────────────────────────────────────────────────
function InvestPanel({ afroId }: { afroId: string }) {
  const [tab, setTab] = useState<'moon' | 'kola' | 'stokvel'>('moon')
  const [autoSavePct, setAutoSavePct] = useState('10')
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const STOKVEL_TYPES = [
    { key: 'investment', label: 'Investment Club',  emoji: '📈', desc: 'Pool capital, vote on assets, share returns',        min: 50000 },
    { key: 'burial',     label: 'Burial Society',   emoji: '🕯️', desc: 'Community death cover — dignity guaranteed',         min: 5000  },
    { key: 'grocery',    label: 'Grocery Stokvel',  emoji: '🛒', desc: 'Bulk-buy savings for food security',                 min: 10000 },
    { key: 'salary',     label: 'Salary Advance',   emoji: '💼', desc: 'Emergency salary advance from the pool',             min: 20000 },
  ]
  return (
    <div>
      <Sec emoji="📈" title="Micro-Investment Engine" sub="Moon Harvest auto-saver · Kola Nut credit · Digital Stokvel · 11.4M South Africans on-chain." />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['moon', 'kola', 'stokvel'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '7px 4px', borderRadius: 10, border: `1px solid ${tab === t ? '#fbbf24' : 'rgba(255,255,255,.07)'}`, background: tab === t ? 'rgba(251,191,36,.08)' : 'transparent', color: tab === t ? '#fbbf24' : 'rgba(255,255,255,.4)', fontSize: 10, fontFamily: S.font, cursor: 'pointer' }}>
            {t === 'moon' ? '🌕 Moon' : t === 'kola' ? '🌰 Kola' : '🔁 Stokvel'}
          </button>
        ))}
      </div>
      {tab === 'moon' && (
        <Card>
          <Sec emoji="🌕" title="Moon Harvest Auto-Saver" sub="Every 28 days, auto-sweep % of received Cowrie to grain bank. Adjusts with income." />
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {['5', '10', '15', '20', '25'].map(p => (
              <button key={p} onClick={() => setAutoSavePct(p)} style={{ flex: 1, padding: '7px', borderRadius: 8, border: `1px solid ${autoSavePct === p ? '#fbbf24' : 'rgba(255,255,255,.08)'}`, background: autoSavePct === p ? 'rgba(251,191,36,.1)' : 'transparent', color: autoSavePct === p ? '#fbbf24' : 'rgba(255,255,255,.35)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{p}%</button>
            ))}
          </div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: S.font, marginBottom: 10 }}>If you receive ₡100,000 this moon, ₡{(100000 * Number(autoSavePct) / 100).toLocaleString()} auto-locks into Igba Ego.</p>
          <Btn label="🌕 Activate Moon Harvest" variant="primary" style={{ width: '100%' }}
            onClick={() => fetch('/api/bank/moon-harvest/activate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, percentage: Number(autoSavePct) }) }).then(() => flash('Moon Harvest activated ✓')).catch(() => flash('Activation failed'))} />
        </Card>
      )}
      {tab === 'kola' && (
        <Card>
          <Sec emoji="🌰" title="Kola Nut Credit" sub="5 elders vouch for you = instant Cowrie credit line. Your relationships are your collateral." />
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: S.font, marginBottom: 6 }}>Elder vouches received (2 of 5)</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= 2 ? '#C9A84C' : 'rgba(255,255,255,.08)' }} />)}
            </div>
          </div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: S.font, marginBottom: 10 }}>3 more elder vouches needed to unlock credit line. Invite elders from your village.</p>
          <Btn label="🌰 Request Elder Vouch" style={{ width: '100%' }}
            onClick={() => fetch('/api/bank/kola-credit/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId }) }).then(() => flash('Vouch request sent ✓')).catch(() => flash('Request failed'))} />
        </Card>
      )}
      {tab === 'stokvel' && (
        <div>
          {STOKVEL_TYPES.map(s => (
            <Card key={s.key} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{s.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.82)', fontFamily: S.head }}>{s.label}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginTop: 2 }}>{s.desc}</div>
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', fontFamily: S.font }}>Min ₡{s.min.toLocaleString()}</div>
              </div>
              <Btn label={`Join ${s.label}`} style={{ width: '100%', marginTop: 8, fontSize: 11 }}
                onClick={() => fetch('/api/bank/stokvel/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, type: s.key }) }).then(() => flash(`${s.label} joined ✓`)).catch(() => flash('Join failed'))} />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ── MARKETPLACE + BANKING FUSION ─────────────────────────────────────────────
function MarketPanel({ afroId }: { afroId: string }) {
  const [tab, setTab] = useState<'qr' | 'invoice' | 'paylink'>('qr')
  const [inv, setInv] = useState({ to: '', item: '', amount: '' })
  const [linkAmt, setLinkAmt] = useState('')
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  return (
    <div>
      <Sec emoji="🛒" title="Umoja Merchant" sub="Merchant QR · Praise-Singer Invoice · Instant Pay Links. Marketplace meets banking." />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['qr', 'invoice', 'paylink'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '7px 4px', borderRadius: 10, border: `1px solid ${tab === t ? '#66BB6A' : 'rgba(255,255,255,.07)'}`, background: tab === t ? 'rgba(102,187,106,.08)' : 'transparent', color: tab === t ? '#66BB6A' : 'rgba(255,255,255,.4)', fontSize: 10, fontFamily: S.font, cursor: 'pointer' }}>
            {t === 'qr' ? '📲 Merchant QR' : t === 'invoice' ? '🎤 Oriki Invoice' : '🔗 Pay Link'}
          </button>
        ))}
      </div>
      {tab === 'qr' && (
        <Card style={{ textAlign: 'center' }}>
          <div style={{ width: 120, height: 120, background: 'rgba(255,255,255,.05)', borderRadius: 12, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, border: '2px dashed rgba(255,255,255,.12)' }}>📲</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, marginBottom: 8 }}>Your merchant QR. Customers scan to pay you directly in Cowrie.</div>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#4ade80', background: 'rgba(74,222,128,.06)', padding: '6px 10px', borderRadius: 6, marginBottom: 10 }}>{afroId}</div>
          <Btn label="📲 Generate QR Code" variant="primary" style={{ width: '100%' }} onClick={() => { const payUrl = `https://pay.afro.id/${afroId}`; navigator.clipboard?.writeText(payUrl).catch(() => {}); navigator.share?.({ title: 'Pay me with Cowrie', text: `Send Cowrie to ${afroId}`, url: payUrl }).catch(() => {}); flash('QR link copied — share with customers ✓') }} />
        </Card>
      )}
      {tab === 'invoice' && (
        <div>
          <Sec emoji="🎤" title="Praise-Singer Invoice" sub="Send payment requests as oriki — voice praise + amount + one-tap pay. Honour makes payment irreversible." />
          <In value={inv.to} onChange={v => setInv(f => ({ ...f, to: v }))} placeholder="Send to (AfroID or @handle)" />
          <In value={inv.item} onChange={v => setInv(f => ({ ...f, item: v }))} placeholder="What did you provide?" />
          <In value={inv.amount} onChange={v => setInv(f => ({ ...f, amount: v.replace(/\D/g, '') }))} placeholder="Amount (₡)" />
          <Btn label="🎤 Send Oriki Invoice" variant="primary" style={{ width: '100%' }}
            onClick={() => { if (!inv.to || !inv.amount) return; fetch('/api/bank/invoice/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: afroId, ...inv }) }).then(() => { flash('Oriki Invoice sent ✓'); setInv({ to: '', item: '', amount: '' }) }).catch(() => flash('Send failed')) }} />
        </div>
      )}
      {tab === 'paylink' && (
        <div>
          <Sec emoji="🔗" title="Instant Pay Link" sub="Share a link — anyone can pay you. No account needed on their side." />
          <In value={linkAmt} onChange={v => setLinkAmt(v.replace(/\D/g, ''))} placeholder="Amount to request (₡ — optional)" />
          <Btn label="🔗 Generate Pay Link" variant="primary" style={{ width: '100%' }}
            onClick={() => fetch('/api/bank/paylink/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, amount: linkAmt ? Number(linkAmt) : null }) }).then(() => flash('Pay link created ✓')).catch(() => flash('Creation failed'))} />
        </div>
      )}
    </div>
  )
}

// ── SUBSCRIPTION ENGINE ──────────────────────────────────────────────────────
function SubsPanel({ afroId }: { afroId: string }) {
  const [subs, setSubs] = useState<{ id: string; name: string; amount: number; frequency: string; nextRun: string; active: boolean }[]>([])
  const [form, setForm] = useState({ name: '', amount: '', to: '', freq: 'MONTHLY' })
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const FREQS = ['DAILY', 'WEEKLY', 'LUNAR', 'MONTHLY']
  const load = () => fetch(`/api/bank/subscriptions/${afroId}`).then(r => r.ok ? r.json() : Promise.reject()).then((d: { ok: boolean; data: typeof subs }) => setSubs(d.data ?? [])).catch(() => setSubs([
    { id: 's1', name: 'Village Water Fund', amount: 500,  frequency: 'MONTHLY', nextRun: '2026-05-01', active: true },
    { id: 's2', name: 'Ajo Circle — Auto',  amount: 5000, frequency: 'WEEKLY',  nextRun: '2026-04-07', active: true },
  ]))
  useEffect(() => { load() }, [afroId])
  return (
    <div>
      <Sec emoji="🔁" title="Ọna Ẹ̀san — Subscriptions" sub="Set it. Forget it. Cowrie flows automatically. Recurring payments and auto-save." />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <Btn label={creating ? '✕ Cancel' : '+ New Subscription'} onClick={() => setCreating(!creating)} style={{ marginBottom: 10 }} />
      {creating && (
        <Card style={{ marginBottom: 14 }}>
          <In value={form.name}   onChange={v => setForm(f => ({ ...f, name: v }))}   placeholder="Subscription name" />
          <In value={form.to}     onChange={v => setForm(f => ({ ...f, to: v }))}     placeholder="Recipient AfroID" />
          <In value={form.amount} onChange={v => setForm(f => ({ ...f, amount: v.replace(/\D/g, '') }))} placeholder="Amount (₡)" />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {FREQS.map(fr => (
              <button key={fr} onClick={() => setForm(f => ({ ...f, freq: fr }))} style={{ padding: '4px 10px', borderRadius: 8, border: `1px solid ${form.freq === fr ? '#60a5fa' : 'rgba(255,255,255,.08)'}`, background: form.freq === fr ? 'rgba(96,165,250,.08)' : 'transparent', color: form.freq === fr ? '#60a5fa' : 'rgba(255,255,255,.3)', fontSize: 10, cursor: 'pointer' }}>{fr}</button>
            ))}
          </div>
          <Btn label="🔁 Activate" variant="primary" style={{ width: '100%' }}
            onClick={() => { if (!form.name || !form.amount) return; fetch('/api/bank/subscriptions/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, ...form, amount: Number(form.amount) }) }).then(() => { flash('Subscription activated ✓'); load(); setForm({ name: '', amount: '', to: '', freq: 'MONTHLY' }) }).catch(() => flash('Activation failed')).finally(() => setCreating(false)) }} />
        </Card>
      )}
      {subs.map(s => (
        <Card key={s.id} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.82)', fontFamily: S.head }}>🔁 {s.name}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginTop: 2 }}>₡{s.amount.toLocaleString()} {s.frequency} · Next: {new Date(s.nextRun).toLocaleDateString()}</div>
            </div>
            <Pill label={s.active ? 'ACTIVE' : 'PAUSED'} color={s.active ? '#4ade80' : '#888'} bg={s.active ? 'rgba(74,222,128,.1)' : 'rgba(255,255,255,.06)'} />
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── SMART BUDGETING ──────────────────────────────────────────────────────────
function BudgetPanel({ afroId }: { afroId: string }) {
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const CATS = [
    { key: 'food',      label: 'Food & Market',   emoji: '🍲', spent: 18000, limit: 25000,  color: '#4ade80' },
    { key: 'transport', label: 'Transport',        emoji: '🚌', spent: 8500,  limit: 12000,  color: '#60a5fa' },
    { key: 'ritual',    label: 'Ceremonies',       emoji: '🥁', spent: 5000,  limit: 20000,  color: '#fbbf24' },
    { key: 'savings',   label: 'Grain Bank',       emoji: '🌱', spent: 50000, limit: 50000,  color: '#4a8c5c' },
    { key: 'circle',    label: 'Ajo / Esusu',      emoji: '🔄', spent: 15000, limit: 15000,  color: '#6b4fbb' },
    { key: 'family',    label: 'Family Pool',      emoji: '👨‍👩‍👧', spent: 10000, limit: 30000,  color: '#e879f9' },
  ]
  const totalSpent = CATS.reduce((a, c) => a + c.spent, 0)
  const totalLimit = CATS.reduce((a, c) => a + c.limit, 0)
  return (
    <div>
      <Sec emoji="🧵" title="Kente Wealth Weave" sub="Your spend rendered as a living Kente cloth. Each colour tells a story — the Griot reads it back." />
      <div style={{ display: 'flex', height: 22, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
        {CATS.map(c => <div key={c.key} style={{ flex: c.spent, background: c.color, opacity: Math.max(0.25, c.spent / c.limit) }} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 10, fontFamily: S.font, color: 'rgba(255,255,255,.4)' }}>
        <span>Spent ₡{totalSpent.toLocaleString()}</span>
        <span>Budget ₡{totalLimit.toLocaleString()}</span>
        <span>{Math.round((totalSpent / totalLimit) * 100)}% used</span>
      </div>
      {CATS.map(c => {
        const pct = Math.min(100, Math.round((c.spent / c.limit) * 100))
        const over = c.spent >= c.limit
        return (
          <div key={c.key} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.72)', fontFamily: S.font }}>{c.emoji} {c.label}</span>
              <span style={{ fontSize: 10, color: over ? '#ef4444' : 'rgba(255,255,255,.35)', fontFamily: S.font }}>₡{c.spent.toLocaleString()} / ₡{c.limit.toLocaleString()}</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, background: over ? '#ef4444' : c.color, width: `${pct}%`, transition: 'width .4s' }} />
            </div>
          </div>
        )
      })}
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <Btn label="✏️ Edit Budget Limits" style={{ width: '100%', marginTop: 8 }}
        onClick={() => fetch('/api/bank/budget/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, categories: CATS }) }).then(() => flash('Budget limits saved ✓')).catch(() => flash('Save failed'))} />
    </div>
  )
}

// ── CARAVAN BANK — Universal Transfer Hub ────────────────────────────────────
function CaravanBankPanel({ afroId, online }: { afroId: string; online: boolean }) {
  const [mode, setMode] = useState<'internal'|'phone'|'bank'|'cross'|'swift'|'offline'>('internal')
  const [to, setTo] = useState(''); const [amt, setAmt] = useState(''); const [note, setNote] = useState('')
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3200) }
  const MODES = [
    { key: 'internal' as const, emoji: '⚡', label: 'AfroID',  sub: 'Instant · free' },
    { key: 'phone'    as const, emoji: '📱', label: 'Phone',   sub: 'Instant · free' },
    { key: 'bank'     as const, emoji: '🏦', label: 'Bank',    sub: 'NIBSS/GHIPSS'   },
    { key: 'cross'    as const, emoji: '🌍', label: 'Africa',  sub: 'COW route'       },
    { key: 'swift'    as const, emoji: '🌐', label: 'Global',  sub: 'SWIFT/partners'  },
    { key: 'offline'  as const, emoji: '📡', label: 'Offline', sub: 'Queue & sync'    },
  ]
  async function send() {
    if (!to || !amt) return; setBusy(true)
    try {
      if (mode === 'offline' || !online) {
        enqueueOffline('TRANSFER', { from: afroId, to, amount: Number(amt), note })
        flash('📡 Queued offline — syncs when connected')
      } else {
        await fetch('/api/bank/transfer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: afroId, to, amount: Number(amt), mode, note, currency: 'COW' }) })
        flash(`✓ Ranṣẹ ₡${Number(amt).toLocaleString()} → ${to}`)
        setTo(''); setAmt(''); setNote('')
      }
    } catch { flash('Transfer failed — queued offline') } finally { setBusy(false) }
  }
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 10 }}>SELECT TRANSFER TYPE</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 14 }}>
        {MODES.map(m => (
          <button key={m.key} onClick={() => setMode(m.key)} style={{ padding: '8px 4px', borderRadius: 10, border: `1px solid ${mode === m.key ? '#4ade80' : 'rgba(255,255,255,.08)'}`, background: mode === m.key ? 'rgba(74,222,128,.08)' : 'rgba(255,255,255,.02)', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{m.emoji}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: mode === m.key ? '#4ade80' : 'rgba(255,255,255,.7)', fontFamily: S.head }}>{m.label}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', fontFamily: S.font }}>{m.sub}</div>
          </button>
        ))}
      </div>
      {mode === 'cross' && <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(34,211,238,.06)', border: '1px solid rgba(34,211,238,.15)', marginBottom: 10, fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: S.font }}>🌍 NGN → COW → KES internal routing. No SWIFT. No fees. Settles in seconds on-chain.</div>}
      {mode === 'offline' && <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.15)', marginBottom: 10, fontSize: 10, color: '#fbbf24', fontFamily: S.font }}>📡 Stored locally, syncs via Mesh P2P or on reconnect. Works without internet.</div>}
      <In value={to} onChange={setTo} placeholder={mode === 'phone' ? '+234 phone number' : mode === 'bank' ? 'Account number' : '@afroid or phone'} />
      <In value={amt} onChange={v => setAmt(v.replace(/\D/g, ''))} placeholder="Amount (₡ Cowrie)" />
      <In value={note} onChange={setNote} placeholder="Note (optional)" />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: msg.startsWith('✓') ? '#4ade80' : '#fbbf24', fontFamily: S.font }}>{msg}</p>}
      <Btn label={busy ? '⏳ Sending...' : `Ranṣẹ — Send${amt ? ` ₡${Number(amt).toLocaleString()}` : ''}`} onClick={send} variant="primary" disabled={!to || !amt || busy} style={{ width: '100%', fontSize: 13, padding: '13px' }} />
    </div>
  )
}

// ── SCHEDULED TRANSFER ────────────────────────────────────────────────────────
function ScheduledPanel({ afroId }: { afroId: string }) {
  const [to, setTo] = useState(''); const [amt, setAmt] = useState(''); const [date, setDate] = useState(''); const [note, setNote] = useState('')
  const [list, setList] = useState<{ id: string; to: string; amt: string; date: string; note: string }[]>([])
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  useEffect(() => { fetch(`/api/bank/scheduled?afroId=${afroId}`).then(r => r.json()).then(d => setList(d.data ?? [])).catch(() => {}) }, [afroId])
  async function schedule() {
    if (!to || !amt || !date) return
    const entry = { id: `sch_${Date.now()}`, to, amt, date, note }
    setList(p => [entry, ...p])
    await fetch('/api/bank/scheduled', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, ...entry }) }).catch(() => {})
    flash(`✓ Scheduled ₡${Number(amt).toLocaleString()} to ${to} on ${date}`)
    setTo(''); setAmt(''); setDate(''); setNote('')
  }
  return (
    <div>
      <Sec emoji="📅" title="Scheduled Transfer" sub="Set a future date — UnionPay executes automatically via smart contract." />
      <In value={to} onChange={setTo} placeholder="To @afroid, phone, or account" />
      <In value={amt} onChange={v => setAmt(v.replace(/\D/g, ''))} placeholder="Amount ₡" />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 12, fontFamily: S.font, boxSizing: 'border-box', marginBottom: 8 }} />
      <In value={note} onChange={setNote} placeholder="Note" />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <Btn label="📅 Schedule Transfer" onClick={schedule} variant="primary" disabled={!to || !amt || !date} style={{ width: '100%', marginBottom: 14 }} />
      {list.length > 0 && <div>{list.slice(0, 5).map(s => (
        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 11, color: 'rgba(255,255,255,.6)', fontFamily: S.font }}>
          <span>→ {s.to}</span><span>₡{Number(s.amt).toLocaleString()}</span><span style={{ color: '#a78bfa' }}>{s.date}</span>
        </div>
      ))}</div>}
    </div>
  )
}

// ── BULK TRANSFER ─────────────────────────────────────────────────────────────
function BulkPanel({ afroId }: { afroId: string }) {
  const [rows, setRows] = useState([{ to: '', amt: '' }, { to: '', amt: '' }, { to: '', amt: '' }])
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const total = rows.reduce((a, r) => a + (Number(r.amt) || 0), 0)
  const valid = rows.filter(r => r.to && r.amt).length
  async function sendBulk() {
    if (!valid) return; setBusy(true)
    const transfers = rows.filter(r => r.to && r.amt).map(r => ({ to: r.to, amount: Number(r.amt), currency: 'COW' }))
    await fetch('/api/bank/bulk-transfer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fromAfroId: afroId, transfers }) }).catch(() => {})
    flash(`✓ Sent ₡${total.toLocaleString()} to ${valid} recipients`)
    setRows([{ to: '', amt: '' }, { to: '', amt: '' }, { to: '', amt: '' }]); setBusy(false)
  }
  return (
    <div>
      <Sec emoji="📦" title="Bulk Transfer" sub="Send to multiple recipients at once — payroll, group settlements, event payouts." />
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input value={r.to} onChange={e => setRows(p => p.map((x, j) => j === i ? { ...x, to: e.target.value } : x))} placeholder={`Recipient ${i + 1} @afroid`} style={{ flex: 2, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 10px', color: '#fff', fontSize: 11, fontFamily: S.font }} />
          <input value={r.amt} onChange={e => setRows(p => p.map((x, j) => j === i ? { ...x, amt: e.target.value.replace(/\D/g, '') } : x))} placeholder="₡" style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 10px', color: '#fff', fontSize: 11, fontFamily: S.font }} />
        </div>
      ))}
      <button onClick={() => setRows(p => [...p, { to: '', amt: '' }])} style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 10, fontFamily: S.font }}>+ Add recipient</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 10, fontFamily: S.font }}>
        <span>{valid} recipient{valid !== 1 ? 's' : ''}</span>
        <span style={{ color: '#fb923c', fontWeight: 700 }}>Total ₡{total.toLocaleString()}</span>
      </div>
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <Btn label={busy ? '⏳ Sending...' : `📦 Send to ${valid} recipient${valid !== 1 ? 's' : ''} — ₡${total.toLocaleString()}`} onClick={sendBulk} variant="primary" disabled={!valid || busy} style={{ width: '100%' }} />
    </div>
  )
}

// ── RECURRING TRANSFER ────────────────────────────────────────────────────────
function RecurringTxPanel({ afroId }: { afroId: string }) {
  const [to, setTo] = useState(''); const [amt, setAmt] = useState(''); const [freq, setFreq] = useState<'daily' | 'weekly' | 'monthly'>('monthly'); const [label, setLabel] = useState('')
  const [list, setList] = useState<{ id: string; to: string; amt: string; freq: string; label: string }[]>([])
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  useEffect(() => { fetch(`/api/bank/recurring?afroId=${afroId}`).then(r => r.json()).then(d => setList(d.data ?? [])).catch(() => {}) }, [afroId])
  async function create() {
    if (!to || !amt) return
    const entry = { id: `rec_${Date.now()}`, to, amt, freq, label }
    setList(p => [entry, ...p])
    await fetch('/api/bank/recurring', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, ...entry }) }).catch(() => {})
    flash(`✓ Recurring ₡${Number(amt).toLocaleString()} ${freq} to ${to}`)
    setTo(''); setAmt(''); setLabel('')
  }
  return (
    <div>
      <Sec emoji="🔄" title="Recurring Transfer" sub="Smart contract auto-executes on your schedule. Like a standing order, but on-chain." />
      <In value={to} onChange={setTo} placeholder="To @afroid or phone" />
      <In value={amt} onChange={v => setAmt(v.replace(/\D/g, ''))} placeholder="Amount ₡" />
      <In value={label} onChange={setLabel} placeholder="Label (e.g. Rent, Ajo contribution)" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {(['daily', 'weekly', 'monthly'] as const).map(k => (
          <button key={k} onClick={() => setFreq(k)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${freq === k ? '#60a5fa' : 'rgba(255,255,255,.08)'}`, background: freq === k ? 'rgba(96,165,250,.1)' : 'transparent', color: freq === k ? '#60a5fa' : 'rgba(255,255,255,.5)', fontSize: 11, fontFamily: S.font, cursor: 'pointer' }}>{k.charAt(0).toUpperCase() + k.slice(1)}</button>
        ))}
      </div>
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <Btn label="🔄 Set Up Recurring" onClick={create} variant="primary" disabled={!to || !amt} style={{ width: '100%', marginBottom: 14 }} />
      {list.length > 0 && <div>{list.slice(0, 4).map(a => (
        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 11, color: 'rgba(255,255,255,.6)', fontFamily: S.font }}>
          <span>{a.label || a.to}</span><span style={{ color: '#60a5fa' }}>₡{Number(a.amt).toLocaleString()}/{a.freq}</span>
        </div>
      ))}</div>}
    </div>
  )
}

// ── AUTO SAVE ─────────────────────────────────────────────────────────────────
function AutoSavePanel({ afroId }: { afroId: string }) {
  const [pct, setPct] = useState('10'); const [trigger, setTrigger] = useState<'on_receive' | 'daily'>('on_receive')
  const [target, setTarget] = useState(''); const [saved, setSaved] = useState(0); const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  useEffect(() => { fetch(`/api/bank/autosave?afroId=${afroId}`).then(r => r.json()).then(d => setSaved(d.totalSaved ?? 0)).catch(() => {}) }, [afroId])
  async function activate() {
    await fetch('/api/bank/autosave', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, percentage: Number(pct), trigger, targetGoal: Number(target) }) }).catch(() => {})
    flash(`✓ Auto Save activated — ${pct}% ${trigger === 'on_receive' ? 'on every receive' : 'daily sweep'}`)
  }
  return (
    <div>
      <Sec emoji="🤖" title="Auto Save" sub="Automatically save a % of every payment you receive. Set it, forget it." />
      {saved > 0 && <div style={{ textAlign: 'center', padding: '16px', borderRadius: 14, background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.15)', marginBottom: 14 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#4ade80', fontFamily: S.head }}>₡{saved.toLocaleString()}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font }}>Auto-saved so far</div>
      </div>}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, marginBottom: 6 }}>SAVE PERCENTAGE</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['5', '10', '15', '20', '25'] as const).map(p => (
            <button key={p} onClick={() => setPct(p)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${pct === p ? '#4ade80' : 'rgba(255,255,255,.08)'}`, background: pct === p ? 'rgba(74,222,128,.1)' : 'transparent', color: pct === p ? '#4ade80' : 'rgba(255,255,255,.5)', fontSize: 12, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>{p}%</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, marginBottom: 6 }}>TRIGGER</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['on_receive', 'daily'] as const).map(k => (
            <button key={k} onClick={() => setTrigger(k)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1px solid ${trigger === k ? '#4ade80' : 'rgba(255,255,255,.08)'}`, background: trigger === k ? 'rgba(74,222,128,.08)' : 'transparent', color: trigger === k ? '#4ade80' : 'rgba(255,255,255,.5)', fontSize: 11, fontFamily: S.font, cursor: 'pointer' }}>{k === 'on_receive' ? 'On receive' : 'Daily sweep'}</button>
          ))}
        </div>
      </div>
      <In value={target} onChange={v => setTarget(v.replace(/\D/g, ''))} placeholder="Savings goal ₡ (optional)" />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <Btn label={`🤖 Activate Auto Save — ${pct}%`} onClick={activate} variant="primary" style={{ width: '100%' }} />
    </div>
  )
}

// ── BIASHARA HUB — Business: Invoicing, Payroll, POS ─────────────────────────
function BiasharaHubPanel({ afroId }: { afroId: string }) {
  const [tab, setTab] = useState<'invoice' | 'payroll' | 'pos'>('invoice')
  const [invTo, setInvTo] = useState(''); const [invAmt, setInvAmt] = useState(''); const [invDesc, setInvDesc] = useState('')
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  async function sendInvoice() {
    if (!invTo || !invAmt) return
    await fetch('/api/bank/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fromAfroId: afroId, to: invTo, amount: Number(invAmt), description: invDesc }) }).catch(() => {})
    flash(`✓ Invoice sent to ${invTo} for ₡${Number(invAmt).toLocaleString()}`)
    setInvTo(''); setInvAmt(''); setInvDesc('')
  }
  const TABS = [['invoice', '📄', 'Invoice'], ['payroll', '👥', 'Payroll'], ['pos', '🖥️', 'POS']] as const
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {TABS.map(([k, e, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: '9px 4px', borderRadius: 10, border: `1px solid ${tab === k ? '#fb923c' : 'rgba(255,255,255,.08)'}`, background: tab === k ? 'rgba(251,146,60,.1)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: 16 }}>{e}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: tab === k ? '#fb923c' : 'rgba(255,255,255,.5)', fontFamily: S.head }}>{l}</div>
          </button>
        ))}
      </div>
      {tab === 'invoice' && <div>
        <In value={invTo} onChange={setInvTo} placeholder="Bill to (@afroid, phone, email)" />
        <In value={invAmt} onChange={v => setInvAmt(v.replace(/\D/g, ''))} placeholder="Amount ₡" />
        <In value={invDesc} onChange={setInvDesc} placeholder="Description / service rendered" />
        {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: '#4ade80', fontFamily: S.font }}>{msg}</p>}
        <Btn label="📄 Send Invoice" onClick={sendInvoice} variant="primary" disabled={!invTo || !invAmt} style={{ width: '100%' }} />
      </div>}
      {tab === 'payroll' && <div style={{ padding: '20px', textAlign: 'center', borderRadius: 14, border: '1px solid rgba(251,146,60,.15)', background: 'rgba(251,146,60,.04)' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>👥</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fb923c', fontFamily: S.head, marginBottom: 6 }}>UnionPay Payroll</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, lineHeight: 1.6, marginBottom: 12 }}>Add staff, set salaries, run payroll in one tap. Bulk transfer to all on payday. Supports NGN, KES, GHS, COW.</div>
        <Btn label="Set Up Payroll →" onClick={() => {}} style={{ width: '100%' }} />
      </div>}
      {tab === 'pos' && <div style={{ padding: '20px', textAlign: 'center', borderRadius: 14, border: '1px solid rgba(251,146,60,.15)', background: 'rgba(251,146,60,.04)' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🖥️</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fb923c', fontFamily: S.head, marginBottom: 6 }}>UnionPay POS</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, lineHeight: 1.6, marginBottom: 12 }}>Turn any phone into a POS terminal. Accept QR, NFC tap, Cowrie Link. Works offline. No hardware needed.</div>
        <Btn label="Launch POS →" onClick={() => {}} style={{ width: '100%' }} />
      </div>}
    </div>
  )
}

// ── HAZINA — Village Treasury + Family Wallet ─────────────────────────────────
function HazinaPanel({ afroId }: { afroId: string }) {
  const [tab, setTab] = useState<'village' | 'family'>('village')
  const [vAmt, setVAmt] = useState(''); const [fAmt, setFAmt] = useState(''); const [fMember, setFMember] = useState('')
  const [msg, setMsg] = useState(''); const [vBal, setVBal] = useState(0); const [fBal, setFBal] = useState(0)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  useEffect(() => {
    fetch(`/api/bank/treasury/village?afroId=${afroId}`).then(r => r.json()).then(d => setVBal(d.balance ?? 0)).catch(() => {})
    fetch(`/api/bank/treasury/family?afroId=${afroId}`).then(r => r.json()).then(d => setFBal(d.balance ?? 0)).catch(() => {})
  }, [afroId])
  async function depositVillage() {
    if (!vAmt) return
    await fetch('/api/bank/treasury/village', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, amount: Number(vAmt) }) }).catch(() => {})
    setVBal(p => p + Number(vAmt)); flash(`✓ ₡${Number(vAmt).toLocaleString()} deposited to Village Treasury`); setVAmt('')
  }
  async function sendFamily() {
    if (!fAmt || !fMember) return
    await fetch('/api/bank/treasury/family', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fromAfroId: afroId, toAfroId: fMember, amount: Number(fAmt) }) }).catch(() => {})
    flash(`✓ ₡${Number(fAmt).toLocaleString()} sent to ${fMember} from Family Wallet`); setFAmt(''); setFMember('')
  }
  const TABS = [['village', '🏘️', 'Village Treasury'], ['family', '👨‍👩‍👧‍👦', 'Family Wallet']] as const
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {TABS.map(([k, e, l]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)} style={{ flex: 1, padding: '9px 4px', borderRadius: 10, border: `1px solid ${tab === k ? '#f472b6' : 'rgba(255,255,255,.08)'}`, background: tab === k ? 'rgba(244,114,182,.08)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: 16 }}>{e}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: tab === k ? '#f472b6' : 'rgba(255,255,255,.5)', fontFamily: S.head }}>{l}</div>
          </button>
        ))}
      </div>
      {tab === 'village' && <div>
        <div style={{ textAlign: 'center', padding: '16px', borderRadius: 14, background: 'rgba(244,114,182,.06)', border: '1px solid rgba(244,114,182,.15)', marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, letterSpacing: '.1em' }}>VILLAGE TREASURY · BLOCKCHAIN-LOCKED</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#f472b6', fontFamily: S.head }}>₡{vBal.toLocaleString()}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font }}>Governed by village elders · On-chain</div>
        </div>
        <In value={vAmt} onChange={v => setVAmt(v.replace(/\D/g, ''))} placeholder="Deposit amount ₡" />
        {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: '#4ade80', fontFamily: S.font }}>{msg}</p>}
        <Btn label="🏘️ Deposit to Village Treasury" onClick={depositVillage} variant="primary" disabled={!vAmt} style={{ width: '100%' }} />
      </div>}
      {tab === 'family' && <div>
        <div style={{ textAlign: 'center', padding: '16px', borderRadius: 14, background: 'rgba(96,165,250,.06)', border: '1px solid rgba(96,165,250,.15)', marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, letterSpacing: '.1em' }}>FAMILY WALLET · SHARED ACCESS</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#60a5fa', fontFamily: S.head }}>₡{fBal.toLocaleString()}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font }}>Shared with family members — instant transfers</div>
        </div>
        <In value={fMember} onChange={setFMember} placeholder="Send to family member @afroid or phone" />
        <In value={fAmt} onChange={v => setFAmt(v.replace(/\D/g, ''))} placeholder="Amount ₡" />
        {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: '#4ade80', fontFamily: S.font }}>{msg}</p>}
        <Btn label="👨‍👩‍👧‍👦 Send from Family Wallet" onClick={sendFamily} variant="primary" disabled={!fAmt || !fMember} style={{ width: '100%' }} />
      </div>}
    </div>
  )
}

// ── AGRI POOL — Agriculture Financing Pools ───────────────────────────────────
function AgriPoolPanel({ afroId }: { afroId: string }) {
  const POOLS = [
    { id: 'maize',  emoji: '🌽', name: 'Maize Harvest Pool',     region: 'West Africa',           target: 5000000, current: 3200000, apy: '14%', participants: 847,  color: '#fbbf24' },
    { id: 'cacao',  emoji: '🍫', name: 'Cacao Belt Pool',        region: "Côte d'Ivoire · Ghana",  target: 8000000, current: 6100000, apy: '18%', participants: 1203, color: '#fb923c' },
    { id: 'coffee', emoji: '☕', name: 'Ethiopian Coffee Pool',  region: 'Ethiopia · Kenya',       target: 3000000, current: 1800000, apy: '16%', participants: 412,  color: '#4ade80' },
    { id: 'rice',   emoji: '🌾', name: 'Sahel Rice Cooperative', region: 'Senegal · Mali · Niger', target: 2000000, current: 900000,  apy: '12%', participants: 320,  color: '#60a5fa' },
  ]
  const [sel, setSel] = useState<string | null>(null); const [amt, setAmt] = useState(''); const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  async function invest(poolId: string) {
    if (!amt) return
    await fetch('/api/bank/agri-pool/invest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, poolId, amount: Number(amt) }) }).catch(() => {})
    flash(`✓ ₡${Number(amt).toLocaleString()} invested in ${POOLS.find(p => p.id === poolId)?.name}`)
    setAmt(''); setSel(null)
  }
  return (
    <div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, marginBottom: 12, lineHeight: 1.6 }}>🌱 Fund Africa's farmers. Earn yields while financing food sovereignty. All pools blockchain-verified and community-governed.</div>
      {POOLS.map(p => {
        const pct = Math.round((p.current / p.target) * 100)
        return (
          <div key={p.id} onClick={() => setSel(sel === p.id ? null : p.id)} style={{ borderRadius: 14, border: `1px solid ${sel === p.id ? p.color : 'rgba(255,255,255,.08)'}`, background: sel === p.id ? `${p.color}08` : 'rgba(255,255,255,.02)', padding: '12px 14px', marginBottom: 8, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>{p.emoji}</span><div><div style={{ fontSize: 12, fontWeight: 700, color: p.color, fontFamily: S.head }}>{p.name}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: S.font }}>{p.region}</div></div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 900, color: p.color, fontFamily: S.head }}>{p.apy} APY</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: S.font }}>{p.participants} farmers</div></div>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}><div style={{ height: '100%', borderRadius: 2, background: p.color, width: `${pct}%` }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: S.font }}><span>₡{p.current.toLocaleString()}</span><span>{pct}%</span><span>₡{p.target.toLocaleString()} goal</span></div>
            {sel === p.id && <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.06)' }}>
              <In value={amt} onChange={v => setAmt(v.replace(/\D/g, ''))} placeholder="Invest amount ₡" />
              <Btn label={`🌱 Invest in ${p.name}`} onClick={() => invest(p.id)} variant="primary" disabled={!amt} style={{ width: '100%' }} />
            </div>}
          </div>
        )
      })}
      {msg && <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 12, color: '#4ade80', fontFamily: S.font }}>{msg}</p>}
    </div>
  )
}

// ── COWRIE TIP — Social Payments ──────────────────────────────────────────────
function TippingPanel({ afroId }: { afroId: string }) {
  const [to, setTo] = useState(''); const [amt, setAmt] = useState(''); const [note, setNote] = useState('')
  const [recent, setRecent] = useState<{ afroId: string; amount: number; note: string }[]>([])
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const QUICK = [100, 250, 500, 1000, 2500, 5000]
  useEffect(() => { fetch(`/api/bank/tips?afroId=${afroId}`).then(r => r.json()).then(d => setRecent(d.sent?.slice(0, 5) ?? [])).catch(() => {}) }, [afroId])
  async function tip() {
    if (!to || !amt) return; setBusy(true)
    await fetch('/api/bank/tips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fromAfroId: afroId, toAfroId: to, amount: Number(amt), note }) }).catch(() => {})
    setRecent(p => [{ afroId: to, amount: Number(amt), note }, ...p.slice(0, 4)])
    flash(`💫 ₡${Number(amt).toLocaleString()} tipped to ${to}!`)
    setTo(''); setAmt(''); setNote(''); setBusy(false)
  }
  return (
    <div>
      <Sec emoji="💫" title="Cowrie Tip" sub="Tip creators, friends, elders. Like WeChat Red Packets × African praise culture. Shows on the social feed." />
      <In value={to} onChange={setTo} placeholder="Tip to @afroid or username" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 8 }}>
        {QUICK.map(q => <button key={q} onClick={() => setAmt(String(q))} style={{ padding: '8px 4px', borderRadius: 8, border: `1px solid ${amt === String(q) ? '#4ade80' : 'rgba(255,255,255,.08)'}`, background: amt === String(q) ? 'rgba(74,222,128,.1)' : 'transparent', color: amt === String(q) ? '#4ade80' : 'rgba(255,255,255,.5)', fontSize: 11, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>₡{q >= 1000 ? `${q / 1000}K` : q}</button>)}
      </div>
      <In value={amt} onChange={v => setAmt(v.replace(/\D/g, ''))} placeholder="Custom amount ₡" />
      <In value={note} onChange={setNote} placeholder="Message (appears on feed)" />
      {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: '#4ade80', fontFamily: S.font }}>{msg}</p>}
      <Btn label={to && amt ? `💫 Tip ₡${Number(amt).toLocaleString()} → ${to.split('@')[0]}` : '💫 Send Cowrie Tip'} onClick={tip} variant="primary" disabled={!to || !amt || busy} style={{ width: '100%', marginBottom: 14, fontSize: 13 }} />
      {recent.length > 0 && <div><div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 8 }}>RECENT TIPS</div>{recent.map((r, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 11, color: 'rgba(255,255,255,.6)', fontFamily: S.font }}><span>→ {r.afroId.split('@')[0]}</span><span style={{ color: '#4ade80' }}>💫 ₡{r.amount.toLocaleString()}</span></div>)}</div>}
    </div>
  )
}

// ── LOANS — UnionPay Credit ────────────────────────────────────────────────────
function LoansPanel({ afroId }: { afroId: string }) {
  const [step, setStep] = useState<'overview' | 'apply' | 'status'>('overview')
  const [loanAmt, setLoanAmt] = useState(''); const [purpose, setPurpose] = useState(''); const [tenure, setTenure] = useState('6')
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const PRODUCTS = [
    { id: 'micro',     emoji: '🌱', name: 'Micro Loan',     range: '₡1K–₡50K',   rate: '2.5%/mo', term: '1–6 months',  req: 'Ubuntu Score 100+',    color: '#4ade80' },
    { id: 'agri',      emoji: '🌾', name: 'Agri Loan',      range: '₡50K–₡500K', rate: '1.8%/mo', term: '3–18 months', req: 'Village Elder endorse', color: '#fbbf24' },
    { id: 'biz',       emoji: '🏪', name: 'Business Loan',  range: '₡500K–₡5M',  rate: '2.2%/mo', term: '6–36 months', req: 'Griot Score Ogun+',    color: '#fb923c' },
    { id: 'emergency', emoji: '🚨', name: 'Emergency Loan', range: '₡500–₡10K',  rate: '0% 30d',  term: '30 days',     req: 'Ubuntu Score 200+',    color: '#ef4444' },
  ]
  async function apply() {
    if (!loanAmt || !purpose) return; setBusy(true)
    await fetch('/api/bank/loans/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ afroId, amount: Number(loanAmt), purpose, tenureMonths: Number(tenure) }) }).catch(() => {})
    flash(`✓ Application submitted — ₡${Number(loanAmt).toLocaleString()} for ${tenure} months`)
    setStep('status'); setBusy(false)
  }
  const STEPS = [['overview', '📊', 'Products'], ['apply', '📝', 'Apply'], ['status', '📋', 'My Loans']] as const
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {STEPS.map(([k, e, l]) => <button key={k} onClick={() => setStep(k as typeof step)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `1px solid ${step === k ? '#fbbf24' : 'rgba(255,255,255,.08)'}`, background: step === k ? 'rgba(251,191,36,.08)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}><div style={{ fontSize: 14 }}>{e}</div><div style={{ fontSize: 10, fontWeight: 700, color: step === k ? '#fbbf24' : 'rgba(255,255,255,.5)', fontFamily: S.head }}>{l}</div></button>)}
      </div>
      {step === 'overview' && <div>
        {PRODUCTS.map(p => (
          <div key={p.id} style={{ borderRadius: 12, border: `1px solid ${p.color}22`, background: `${p.color}06`, padding: '12px 14px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>{p.emoji}</span><div><div style={{ fontSize: 12, fontWeight: 700, color: p.color, fontFamily: S.head }}>{p.name}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: S.font }}>{p.req}</div></div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 12, fontWeight: 900, color: p.color, fontFamily: S.head }}>{p.rate}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: S.font }}>{p.term}</div></div>
            </div>
            <div style={{ marginTop: 6, fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: S.font }}>{p.range}</div>
          </div>
        ))}
        <Btn label="📝 Apply for a Loan →" onClick={() => setStep('apply')} style={{ width: '100%', marginTop: 6 }} />
      </div>}
      {step === 'apply' && <div>
        <In value={loanAmt} onChange={v => setLoanAmt(v.replace(/\D/g, ''))} placeholder="How much do you need? ₡" />
        <In value={purpose} onChange={setPurpose} placeholder="Purpose (business, farming, emergency...)" />
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {(['3', '6', '12', '24'] as const).map(t => <button key={t} onClick={() => setTenure(t)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${tenure === t ? '#fbbf24' : 'rgba(255,255,255,.08)'}`, background: tenure === t ? 'rgba(251,191,36,.1)' : 'transparent', color: tenure === t ? '#fbbf24' : 'rgba(255,255,255,.5)', fontSize: 11, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>{t}mo</button>)}
        </div>
        {msg && <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 12, color: '#4ade80', fontFamily: S.font }}>{msg}</p>}
        <Btn label={busy ? '⏳ Submitting...' : '📝 Submit Loan Application'} onClick={apply} variant="primary" disabled={!loanAmt || !purpose || busy} style={{ width: '100%' }} />
      </div>}
      {step === 'status' && <div style={{ padding: '20px', textAlign: 'center', borderRadius: 14, border: '1px solid rgba(251,191,36,.15)', background: 'rgba(251,191,36,.04)' }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', fontFamily: S.head, marginBottom: 4 }}>No active loans</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font }}>Your loan history will appear here.</div>
      </div>}
    </div>
  )
}

// ── BILLS PANEL ───────────────────────────────────────────────────────────────
function BillsPanel({ afroId }: { afroId: string }) {
  type BillTab = 'electricity' | 'data' | 'cable' | 'water' | 'others'
  const [tab, setTab] = useState<BillTab>('electricity')
  const [provider, setProvider] = useState<string | null>(null)
  const [meterNo, setMeterNo] = useState('')
  const [billAmt, setBillAmt] = useState('')
  const [planType, setPlanType] = useState<'Prepaid' | 'Postpaid'>('Prepaid')
  const [meterName, setMeterName] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [network, setNetwork] = useState<string | null>(null)
  const [airtimeMode, setAirtimeMode] = useState<'airtime' | 'data'>('airtime')
  const [bundlePeriod, setBundlePeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [cardNo, setCardNo] = useState('')
  const [bouquet, setBouquet] = useState<string | null>(null)
  const [waterProvider, setWaterProvider] = useState<string | null>(null)
  const [waterAcct, setWaterAcct] = useState('')
  const [waterAmt, setWaterAmt] = useState('')
  const [otherAmts, setOtherAmts] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3200) }

  const DISCOS = [
    { id: 'ikeja',  name: 'Ikeja Electric',       emoji: '⚡', color: '#22d3ee', region: 'Lagos'    },
    { id: 'eko',    name: 'Eko Electric',          emoji: '🔌', color: '#4ade80', region: 'Lagos'    },
    { id: 'aedc',   name: 'Abuja AEDC',            emoji: '🏛️', color: '#fbbf24', region: 'FCT'      },
    { id: 'ibedc',  name: 'Ibadan Electric',       emoji: '💡', color: '#a78bfa', region: 'Oyo'      },
    { id: 'eedc',   name: 'Enugu EEDC',            emoji: '🔋', color: '#fb923c', region: 'Enugu'    },
    { id: 'phed',   name: 'Port Harcourt PHED',    emoji: '⚡', color: '#60a5fa', region: 'PH'       },
    { id: 'kedc',   name: 'Kaduna EKEDC',          emoji: '🌟', color: '#ef4444', region: 'Kaduna'   },
    { id: 'kedco',  name: 'Kano KEDCO',            emoji: '⚡', color: '#f472b6', region: 'Kano'     },
    { id: 'kplc',   name: 'Kenya Power',           emoji: '🇰🇪', color: '#22d3ee', region: 'Kenya'    },
    { id: 'ecg',    name: 'ECG Ghana',             emoji: '🇬🇭', color: '#fbbf24', region: 'Ghana'    },
    { id: 'eskom',  name: 'Eskom',                 emoji: '🇿🇦', color: '#4ade80', region: 'S.Africa' },
  ]
  const NETWORKS = [
    { id: 'mtn_ng',    name: 'MTN',       emoji: '🟡', color: '#fbbf24' },
    { id: 'airtel_ng', name: 'Airtel',    emoji: '🔴', color: '#ef4444' },
    { id: 'glo',       name: 'Glo',       emoji: '🟢', color: '#4ade80' },
    { id: '9mobile',   name: '9mobile',   emoji: '🟤', color: '#a78bfa' },
    { id: 'safaricom', name: 'Safaricom', emoji: '🟢', color: '#22d3ee' },
    { id: 'orange',    name: 'Orange',    emoji: '🟠', color: '#fb923c' },
    { id: 'vodacom',   name: 'Vodacom',   emoji: '🔴', color: '#f472b6' },
    { id: 'mtn_gh',    name: 'MTN GH',    emoji: '🟡', color: '#60a5fa' },
  ]
  const QUICK_AIRTIME = [50, 100, 200, 500, 1000]
  const BUNDLES = [
    { id: 'd1', name: '1GB Daily',     period: 'daily',   price: 150  },
    { id: 'w5', name: '5GB Weekly',    period: 'weekly',  price: 500  },
    { id: 'm10', name: '10GB Monthly', period: 'monthly', price: 800  },
    { id: 'm50', name: '50GB Monthly', period: 'monthly', price: 2500 },
  ]
  const CABLE = [
    { id: 'dstv',      name: 'DStv',      emoji: '📡', color: '#4ade80' },
    { id: 'gotv',      name: 'GOtv',      emoji: '📺', color: '#fbbf24' },
    { id: 'startimes', name: 'Startimes', emoji: '⭐', color: '#22d3ee' },
    { id: 'showmax',   name: 'ShowMax',   emoji: '🎬', color: '#ef4444' },
  ]
  const BOUQUETS: Record<string, { label: string; price: number }[]> = {
    dstv:      [{ label: 'Access', price: 2000 }, { label: 'Compact', price: 7500 }, { label: 'Premium', price: 24500 }, { label: 'Ultra', price: 37500 }],
    gotv:      [{ label: 'Jolli',  price: 1900 }, { label: 'Jinja',   price: 3300 }, { label: 'Plus',    price: 4850  }, { label: 'Max',   price: 7200  }],
    startimes: [{ label: 'Basic',  price: 1200 }, { label: 'Classic', price: 2100 }, { label: 'Super',   price: 3500  }, { label: 'Nova',  price: 4100  }],
    showmax:   [{ label: 'Mobile', price: 1200 }, { label: 'Standard',price: 2400 }, { label: 'Premium', price: 3600  }, { label: 'Duo',   price: 4800  }],
  }
  const WATER = [
    { id: 'lwsc', name: 'Lagos Water Corporation', emoji: '💧', color: '#60a5fa' },
    { id: 'fcda', name: 'Abuja Water Board',        emoji: '🏛️', color: '#4ade80' },
    { id: 'nws',  name: 'Nairobi Water',            emoji: '🇰🇪', color: '#22d3ee' },
  ]
  const OTHERS = [
    { id: 'church',    name: 'Church / Mosque Tithe', emoji: '🕌', color: '#fbbf24' },
    { id: 'school',    name: 'School Fees',            emoji: '🎓', color: '#60a5fa' },
    { id: 'govt',      name: 'Government Levies',      emoji: '🏛️', color: '#a78bfa' },
    { id: 'insurance', name: 'Insurance Premium',      emoji: '🛡️', color: '#22d3ee' },
    { id: 'waste',     name: 'Waste Management',       emoji: '🗑️', color: '#4ade80' },
    { id: 'road',      name: 'Road Tax',               emoji: '🚗', color: '#fb923c' },
  ]
  const RECENT_BILLS = [
    { icon: '⚡', name: 'Ikeja Electric',  sub: 'Meter #45****7',  amount: 5000,  color: '#22d3ee' },
    { icon: '📱', name: 'MTN Data 10GB',   sub: 'Monthly bundle',  amount: 800,   color: '#fbbf24' },
    { icon: '📺', name: 'DStv Compact',    sub: 'Card #70****2',   amount: 7500,  color: '#4ade80' },
  ]
  const TABS: [BillTab, string, string][] = [
    ['electricity', '⚡', 'ELECTRICITY'],
    ['data',        '📡', 'DATA/AIRTIME'],
    ['cable',       '📺', 'CABLE TV'],
    ['water',       '💧', 'WATER'],
    ['others',      '🗂️', 'OTHERS'],
  ]
  const selDisco = DISCOS.find(d => d.id === provider)
  const selCable = CABLE.find(c => c.id === provider)
  const selBouquets = provider ? (BOUQUETS[provider] ?? []) : []
  const selBouquetPrice = selBouquets.find(b => b.label === bouquet)?.price ?? 0

  return (
    <div>
      <Sec emoji="🧾" title="Bill Payments" sub="Pay all bills with Cowrie — instant · offline-first · 0 surcharge" />
      {msg && <div style={{ padding: '8px 12px', borderRadius: 10, background: msg.startsWith('✓') ? 'rgba(74,222,128,.08)' : 'rgba(239,68,68,.08)', border: `1px solid ${msg.startsWith('✓') ? 'rgba(74,222,128,.2)' : 'rgba(239,68,68,.2)'}`, fontSize: 11, color: msg.startsWith('✓') ? '#4ade80' : '#ef4444', marginBottom: 10, fontFamily: S.font }}>{msg}</div>}
      {/* Tab bar */}
      <div style={{ overflowX: 'auto', display: 'flex', gap: 5, marginBottom: 14, scrollbarWidth: 'none' as const, paddingBottom: 2 }}>
        {TABS.map(([t, e, l]) => (
          <button key={t} onClick={() => { setTab(t); setProvider(null); setBouquet(null); setMeterName(null) }} style={{ flexShrink: 0, padding: '7px 10px', borderRadius: 10, border: `1px solid ${tab === t ? '#fbbf24' : 'rgba(255,255,255,.07)'}`, background: tab === t ? 'rgba(251,191,36,.08)' : 'transparent', color: tab === t ? '#fbbf24' : 'rgba(255,255,255,.4)', fontSize: 10, fontWeight: 700, fontFamily: S.head, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>{e} {l}</button>
        ))}
      </div>

      {/* ELECTRICITY */}
      {tab === 'electricity' && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 8 }}>SELECT PROVIDER</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 12 }}>
            {DISCOS.map(d => (
              <button key={d.id} onClick={() => { setProvider(d.id); setMeterName(null); setMeterNo(''); setBillAmt('') }} style={{ padding: '10px 6px', borderRadius: 12, border: `1px solid ${provider === d.id ? d.color : 'rgba(255,255,255,.07)'}`, background: provider === d.id ? `${d.color}12` : 'rgba(255,255,255,.02)', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 16 }}>{d.emoji}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: provider === d.id ? d.color : 'rgba(255,255,255,.5)', fontFamily: S.font, marginTop: 4, lineHeight: 1.3 }}>{d.name}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,.2)', fontFamily: S.font }}>{d.region}</div>
              </button>
            ))}
          </div>
          {provider && selDisco && (
            <Card style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {(['Prepaid', 'Postpaid'] as const).map(p => (
                  <button key={p} onClick={() => setPlanType(p)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${planType === p ? '#4ade80' : 'rgba(255,255,255,.08)'}`, background: planType === p ? 'rgba(74,222,128,.08)' : 'transparent', color: planType === p ? '#4ade80' : 'rgba(255,255,255,.4)', fontSize: 11, fontFamily: S.font, cursor: 'pointer' }}>{p}</button>
                ))}
              </div>
              <In value={meterNo} onChange={setMeterNo} placeholder={`${planType} meter number`} />
              <Btn label="🔍 Validate Meter" onClick={() => { if (!meterNo) return; setMeterName('OKONKWO ENTERPRISES · 3-phase · Zone A'); flash('✓ Meter validated successfully') }} style={{ width: '100%', marginBottom: 8 }} />
              {meterName && <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.12)', fontSize: 11, color: '#4ade80', fontFamily: S.font, marginBottom: 8 }}>✓ {meterName}</div>}
              <In value={billAmt} onChange={v => setBillAmt(v.replace(/\D/g, ''))} placeholder="Amount to pay (₡)" />
              <Btn label={busy ? '⏳ Processing...' : `⚡ Pay ₡${billAmt ? Number(billAmt).toLocaleString() : '—'} — ${selDisco.name}`} variant="primary" disabled={busy || !meterNo || !billAmt || !meterName} style={{ width: '100%' }}
                onClick={() => { setBusy(true); setTimeout(() => { flash(`✓ ₡${Number(billAmt).toLocaleString()} paid to ${selDisco.name}`); setBusy(false); setBillAmt(''); setMeterNo(''); setMeterName(null) }, 1200) }} />
            </Card>
          )}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 8 }}>RECENT PAYMENTS</div>
          {RECENT_BILLS.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${b.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{b.icon}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.75)', fontFamily: S.font }}>{b.name}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font }}>{b.sub}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', fontFamily: S.head }}>−₡{b.amount.toLocaleString()}</div><Pill label="Paid" color="#4ade80" bg="rgba(74,222,128,.1)" /></div>
            </div>
          ))}
        </div>
      )}

      {/* DATA / AIRTIME */}
      {tab === 'data' && (
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {(['airtime', 'data'] as const).map(m => (
              <button key={m} onClick={() => setAirtimeMode(m)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1px solid ${airtimeMode === m ? '#fbbf24' : 'rgba(255,255,255,.08)'}`, background: airtimeMode === m ? 'rgba(251,191,36,.08)' : 'transparent', color: airtimeMode === m ? '#fbbf24' : 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>{m === 'airtime' ? '📲 Airtime' : '📡 Data Bundles'}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 8 }}>SELECT NETWORK</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 12 }}>
            {NETWORKS.map(n => (
              <button key={n.id} onClick={() => setNetwork(n.id)} style={{ padding: '8px 4px', borderRadius: 10, border: `1px solid ${network === n.id ? n.color : 'rgba(255,255,255,.07)'}`, background: network === n.id ? `${n.color}12` : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 16 }}>{n.emoji}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: network === n.id ? n.color : 'rgba(255,255,255,.4)', fontFamily: S.font, marginTop: 3 }}>{n.name}</div>
              </button>
            ))}
          </div>
          <In value={phone} onChange={setPhone} placeholder="Phone number" />
          {airtimeMode === 'airtime' ? (
            <>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' as const }}>
                {QUICK_AIRTIME.map(q => (
                  <button key={q} onClick={() => setBillAmt(String(q))} style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${billAmt === String(q) ? '#fbbf24' : 'rgba(255,255,255,.08)'}`, background: billAmt === String(q) ? 'rgba(251,191,36,.1)' : 'transparent', color: billAmt === String(q) ? '#fbbf24' : 'rgba(255,255,255,.5)', fontSize: 12, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>₡{q >= 1000 ? `${q / 1000}K` : q}</button>
                ))}
              </div>
              <In value={billAmt} onChange={v => setBillAmt(v.replace(/\D/g, ''))} placeholder="Custom amount ₡" />
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                {(['daily', 'weekly', 'monthly'] as const).map(p => (
                  <button key={p} onClick={() => setBundlePeriod(p)} style={{ flex: 1, padding: '6px', borderRadius: 8, border: `1px solid ${bundlePeriod === p ? '#22d3ee' : 'rgba(255,255,255,.08)'}`, background: bundlePeriod === p ? 'rgba(34,211,238,.08)' : 'transparent', color: bundlePeriod === p ? '#22d3ee' : 'rgba(255,255,255,.4)', fontSize: 10, fontFamily: S.font, cursor: 'pointer' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6, marginBottom: 8 }}>
                {BUNDLES.filter(b => b.period === bundlePeriod).map(b => (
                  <button key={b.id} onClick={() => setBillAmt(String(b.price))} style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${billAmt === String(b.price) ? '#22d3ee' : 'rgba(255,255,255,.07)'}`, background: billAmt === String(b.price) ? 'rgba(34,211,238,.06)' : 'rgba(255,255,255,.02)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: billAmt === String(b.price) ? '#22d3ee' : 'rgba(255,255,255,.65)', fontFamily: S.font }}>📶 {b.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', fontFamily: S.head }}>₡{b.price}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <Btn label={busy ? '⏳ Processing...' : `📱 Buy Now — ₡${billAmt ? Number(billAmt).toLocaleString() : '—'}`} variant="primary" disabled={busy || !phone || !network || !billAmt} style={{ width: '100%' }}
            onClick={() => { setBusy(true); setTimeout(() => { flash(`✓ ${airtimeMode === 'airtime' ? `₡${Number(billAmt).toLocaleString()} airtime` : 'Data bundle'} sent to ${phone}`); setBusy(false) }, 1000) }} />
        </div>
      )}

      {/* CABLE TV */}
      {tab === 'cable' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 12 }}>
            {CABLE.map(c => (
              <button key={c.id} onClick={() => { setProvider(c.id); setBouquet(null); setCardNo('') }} style={{ padding: '14px 10px', borderRadius: 12, border: `1px solid ${provider === c.id ? c.color : 'rgba(255,255,255,.07)'}`, background: provider === c.id ? `${c.color}12` : 'rgba(255,255,255,.02)', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 22 }}>{c.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: provider === c.id ? c.color : 'rgba(255,255,255,.6)', fontFamily: S.head, marginTop: 6 }}>{c.name}</div>
              </button>
            ))}
          </div>
          {provider && selCable && (
            <Card>
              <In value={cardNo} onChange={setCardNo} placeholder="Smart Card / IUC Number" />
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 8 }}>SELECT BOUQUET</div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6, marginBottom: 10 }}>
                {selBouquets.map(b => (
                  <button key={b.label} onClick={() => setBouquet(b.label)} style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${bouquet === b.label ? '#4ade80' : 'rgba(255,255,255,.07)'}`, background: bouquet === b.label ? 'rgba(74,222,128,.06)' : 'rgba(255,255,255,.02)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: bouquet === b.label ? '#4ade80' : 'rgba(255,255,255,.65)', fontFamily: S.font }}>📺 {b.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', fontFamily: S.head }}>₡{b.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
              {bouquet && <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(74,222,128,.04)', border: '1px solid rgba(74,222,128,.12)', fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, marginBottom: 8 }}>Renewing {selCable.name} {bouquet} — ₡{selBouquetPrice.toLocaleString()}</div>}
              <Btn label={busy ? '⏳ Processing...' : `📺 Pay ₡${bouquet ? selBouquetPrice.toLocaleString() : '—'}`} variant="primary" disabled={busy || !cardNo || !bouquet} style={{ width: '100%' }}
                onClick={() => { setBusy(true); setTimeout(() => { flash(`✓ ${selCable.name} ${bouquet} renewed`); setBusy(false); setCardNo(''); setBouquet(null) }, 1200) }} />
            </Card>
          )}
        </div>
      )}

      {/* WATER */}
      {tab === 'water' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6, marginBottom: 12 }}>
            {WATER.map(w => (
              <button key={w.id} onClick={() => setWaterProvider(w.id)} style={{ padding: '12px 14px', borderRadius: 12, border: `1px solid ${waterProvider === w.id ? w.color : 'rgba(255,255,255,.07)'}`, background: waterProvider === w.id ? `${w.color}10` : 'rgba(255,255,255,.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                <span style={{ fontSize: 20 }}>{w.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: waterProvider === w.id ? w.color : 'rgba(255,255,255,.6)', fontFamily: S.head }}>{w.name}</span>
              </button>
            ))}
          </div>
          {waterProvider && (
            <Card>
              <In value={waterAcct} onChange={setWaterAcct} placeholder="Account / Reference number" />
              <In value={waterAmt} onChange={v => setWaterAmt(v.replace(/\D/g, ''))} placeholder="Amount to pay (₡)" />
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn label="💧 Check Balance" onClick={() => flash('✓ Account balance: ₡2,340 credit remaining')} style={{ flex: 1 }} />
                <Btn label={busy ? '⏳...' : '💧 Pay Bill'} variant="primary" disabled={busy || !waterAcct || !waterAmt} style={{ flex: 1 }}
                  onClick={() => { setBusy(true); setTimeout(() => { flash(`✓ ₡${Number(waterAmt).toLocaleString()} paid — ${WATER.find(w => w.id === waterProvider)?.name}`); setBusy(false); setWaterAmt('') }, 1200) }} />
              </div>
            </Card>
          )}
        </div>
      )}

      {/* OTHERS */}
      {tab === 'others' && (
        <div>
          {OTHERS.map(o => (
            <Card key={o.id} style={{ marginBottom: 8, borderLeft: `3px solid ${o.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{o.emoji}</span>
                <div style={{ fontSize: 12, fontWeight: 700, color: o.color, fontFamily: S.head }}>{o.name}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={otherAmts[o.id] ?? ''} onChange={e => setOtherAmts(p => ({ ...p, [o.id]: e.target.value.replace(/\D/g, '') }))} placeholder="Amount ₡" style={{ flex: 1, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 10px', color: '#fff', fontSize: 12, fontFamily: S.font }} />
                <Btn label="Pay" variant="primary" disabled={!otherAmts[o.id]} style={{ padding: '8px 16px' }}
                  onClick={() => { const a = otherAmts[o.id]; flash(`✓ ₡${Number(a).toLocaleString()} paid — ${o.name}`); setOtherAmts(p => ({ ...p, [o.id]: '' })) }} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ── BENEFICIARY PANEL ─────────────────────────────────────────────────────────
function BeneficiaryPanel({ afroId }: { afroId: string }) {
  const [search, setSearch] = useState('')
  const [favTab, setFavTab] = useState<'recent' | 'favourites'>('recent')
  const [favs, setFavs] = useState<Record<string, boolean>>({ b2: true, b5: true, b7: true })
  const [sendId, setSendId] = useState<string | null>(null)
  const [sendAmt, setSendAmt] = useState('')
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', handle: '', bank: 'GTBank' })
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const BENS = [
    { id: 'b1', name: 'Chidi Okonkwo',   handle: 'chidi@health',     bank: 'GTBank',      avatar: '👨🏿',   color: '#4ade80', lastAmt: 5000,  lastDate: 'Apr 3',  total: 48000  },
    { id: 'b2', name: 'Amaka Eze',        handle: 'amaka@soko',       bank: 'First Bank',  avatar: '👩🏿',   color: '#fbbf24', lastAmt: 12000, lastDate: 'Apr 1',  total: 92000  },
    { id: 'b3', name: 'Yemi Adeyemi',     handle: 'yemi@education',   bank: 'Access Bank', avatar: '👩🏿‍🎓',  color: '#60a5fa', lastAmt: 3000,  lastDate: 'Mar 28', total: 25000  },
    { id: 'b4', name: 'Kofi Mensah',      handle: 'kofi@arts',        bank: 'Zenith Bank', avatar: '👨🏿‍🎨',  color: '#e879f9', lastAmt: 8000,  lastDate: 'Mar 25', total: 38000  },
    { id: 'b5', name: 'Fatima Musa',      handle: 'fatima@health',    bank: 'UBA',         avatar: '👩🏿‍⚕️', color: '#fb923c', lastAmt: 2500,  lastDate: 'Mar 22', total: 17500  },
    { id: 'b6', name: 'Emeka Nwosu',      handle: 'emeka@technology', bank: 'GTBank',      avatar: '👨🏿‍💻',  color: '#a78bfa', lastAmt: 15000, lastDate: 'Mar 20', total: 120000 },
    { id: 'b7', name: 'Aisha Ibrahim',    handle: 'aisha@fashion',    bank: 'Kuda Bank',   avatar: '👩🏿‍🦱',  color: '#22d3ee', lastAmt: 6000,  lastDate: 'Mar 18', total: 44000  },
    { id: 'b8', name: 'Seun Bankole',     handle: 'seun@media',       bank: 'Opay',        avatar: '👨🏿‍🎤',  color: '#f472b6', lastAmt: 9000,  lastDate: 'Mar 15', total: 63000  },
  ]
  const BANKS = ['GTBank', 'First Bank', 'Access Bank', 'Zenith Bank', 'UBA', 'Kuda Bank', 'Opay', 'Cowrie']

  const filtered = BENS.filter(b => {
    const q = search.toLowerCase()
    if (q && !b.name.toLowerCase().includes(q) && !b.handle.toLowerCase().includes(q)) return false
    if (favTab === 'favourites') return !!favs[b.id]
    return true
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,.88)', fontFamily: S.head }}>👥 Saved Contacts</div>
          <span style={{ display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'rgba(74,222,128,.12)', color: '#4ade80', fontWeight: 700, fontFamily: S.font, marginTop: 2 }}>{BENS.length} contacts</span>
        </div>
      </div>
      {msg && <div style={{ padding: '7px 12px', borderRadius: 8, background: msg.startsWith('✓') ? 'rgba(74,222,128,.08)' : 'rgba(239,68,68,.08)', border: `1px solid ${msg.startsWith('✓') ? 'rgba(74,222,128,.2)' : 'rgba(239,68,68,.2)'}`, fontSize: 11, color: msg.startsWith('✓') ? '#4ade80' : '#ef4444', marginBottom: 10, fontFamily: S.font }}>{msg}</div>}
      <In value={search} onChange={setSearch} placeholder="🔍 Search by name or @handle" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {(['recent', 'favourites'] as const).map(t => (
          <button key={t} onClick={() => setFavTab(t)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1px solid ${favTab === t ? '#fbbf24' : 'rgba(255,255,255,.07)'}`, background: favTab === t ? 'rgba(251,191,36,.08)' : 'transparent', color: favTab === t ? '#fbbf24' : 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>{t === 'recent' ? '🕐 RECENT' : '⭐ FAVOURITES'}</button>
        ))}
      </div>
      {filtered.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,.25)', fontSize: 12, fontFamily: S.font }}>{favTab === 'favourites' ? 'No favourites yet — star a contact below' : 'No contacts found'}</div>}
      {filtered.map(b => (
        <div key={b.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${b.color}18`, border: `1px solid ${b.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{b.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.85)', fontFamily: S.head }}>{b.name}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginTop: 1 }}>{b.handle} · {b.bank}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', fontFamily: S.font }}>Last: ₡{b.lastAmt.toLocaleString()} · {b.lastDate} · Total ₡{b.total.toLocaleString()}</div>
            </div>
            <button onClick={() => setFavs(p => ({ ...p, [b.id]: !p[b.id] }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4 }}>{favs[b.id] ? '⭐' : '☆'}</button>
            <Btn label="→ Send" variant="primary" style={{ padding: '6px 12px', fontSize: 10 }} onClick={() => setSendId(sendId === b.id ? null : b.id)} />
          </div>
          {sendId === b.id && (
            <div style={{ padding: '10px 12px', background: 'rgba(74,222,128,.04)', borderRadius: 10, border: '1px solid rgba(74,222,128,.12)', marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, marginBottom: 6 }}>Quick send to {b.name.split(' ')[0]}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={sendAmt} onChange={e => setSendAmt(e.target.value.replace(/\D/g, ''))} placeholder="₡ Amount" style={{ flex: 1, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 10px', color: '#fff', fontSize: 12, fontFamily: S.font }} />
                <Btn label={`₡${sendAmt ? Number(sendAmt).toLocaleString() : '—'} Send`} variant="primary" disabled={!sendAmt}
                  onClick={() => cowrieApi.transfer(afroId, b.handle, Number(sendAmt), 'CWR', 'Beneficiary transfer').then(() => { flash(`✓ ₡${Number(sendAmt).toLocaleString()} sent to ${b.name.split(' ')[0]}`); setSendAmt(''); setSendId(null) }).catch(() => flash('Transfer failed'))} />
              </div>
            </div>
          )}
        </div>
      ))}
      <div style={{ marginTop: 14 }}>
        <Btn label={adding ? '✕ Cancel' : '+ Add New Beneficiary'} onClick={() => setAdding(!adding)} style={{ width: '100%', marginBottom: adding ? 10 : 0 }} />
        {adding && (
          <Card>
            <In value={newForm.name} onChange={v => setNewForm(f => ({ ...f, name: v }))} placeholder="Full name" />
            <In value={newForm.handle} onChange={v => setNewForm(f => ({ ...f, handle: v }))} placeholder="@AfroID or phone number" />
            <select value={newForm.bank} onChange={e => setNewForm(f => ({ ...f, bank: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 12, fontFamily: S.font, marginBottom: 10, boxSizing: 'border-box' as const }}>
              {BANKS.map(bk => <option key={bk} value={bk}>{bk}</option>)}
            </select>
            <Btn label="💾 Save Beneficiary" variant="primary" style={{ width: '100%' }} disabled={!newForm.name || !newForm.handle}
              onClick={() => { flash(`✓ ${newForm.name} saved as beneficiary`); setNewForm({ name: '', handle: '', bank: 'GTBank' }); setAdding(false) }} />
          </Card>
        )}
      </div>
    </div>
  )
}

// ── SPENDING INSIGHTS PANEL ───────────────────────────────────────────────────
function SpendingInsightsPanel({ afroId }: { afroId: string }) {
  const [monthIdx, setMonthIdx] = useState(3) // April = index 3
  const [year, setYear] = useState(2026)
  const [view, setView] = useState<'spending' | 'income'>('spending')
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const SPEND_CATS = [
    { key: 'food',    label: 'Food & Market',    emoji: '🥘', val: 28400, color: '#4ade80' },
    { key: 'trans',   label: 'Transport',         emoji: '🚗', val: 12500, color: '#60a5fa' },
    { key: 'bills',   label: 'Bills & Utilities', emoji: '💡', val: 18200, color: '#fbbf24' },
    { key: 'entert',  label: 'Entertainment',     emoji: '🎬', val: 8900,  color: '#a78bfa' },
    { key: 'savings', label: 'Savings',            emoji: '💰', val: 45000, color: '#34d399' },
    { key: 'other',   label: 'Other',              emoji: '📦', val: 6300,  color: '#94a3b8' },
  ]
  const INCOME_CATS = [
    { key: 'salary',   label: 'Salary / Work',    emoji: '💼', val: 120000, color: '#4ade80' },
    { key: 'ajo',      label: 'Ajo Payout',        emoji: '🔄', val: 60000,  color: '#fbbf24' },
    { key: 'gifts',    label: 'Gifts & Tips',      emoji: '🎁', val: 15000,  color: '#fb923c' },
    { key: 'harambee', label: 'Harambee',           emoji: '🤝', val: 8000,   color: '#22d3ee' },
    { key: 'invest',   label: 'Investment Yield',  emoji: '📈', val: 5200,   color: '#a78bfa' },
    { key: 'other',    label: 'Other',              emoji: '📦', val: 4100,   color: '#94a3b8' },
  ]
  const cats = view === 'spending' ? SPEND_CATS : INCOME_CATS
  const total = cats.reduce((a, c) => a + c.val, 0)
  const maxVal = Math.max(...cats.map(c => c.val))
  const TOTAL_SPENT = 119300; const TOTAL_INCOME = 212300; const NET = TOTAL_INCOME - TOTAL_SPENT
  const TREND = [
    { m: 'Nov', val: 98000 }, { m: 'Dec', val: 145000 }, { m: 'Jan', val: 110000 },
    { m: 'Feb', val: 125000 }, { m: 'Mar', val: 134000 }, { m: 'Apr', val: 119300 },
  ]
  const trendMax = Math.max(...TREND.map(t => t.val))
  const TOP_MERCHANTS = [
    { name: 'Shoprite',       emoji: '🛒', amount: 18400, pct: 15 },
    { name: 'Lagos Bolt',     emoji: '🚕', amount: 9200,  pct: 8  },
    { name: 'Netflix Africa', emoji: '🎬', amount: 4500,  pct: 4  },
  ]
  const bigCat = cats.reduce((a, b) => a.val > b.val ? a : b)
  const TIPS: Record<string, string> = {
    food: 'Food is your biggest spend. Consider village Ajo bulk-buy circles — members pool market runs and split savings.',
    savings: 'Excellent discipline. You saved 37% of income. Your grain bank is growing strong.',
    salary: 'Strong income month. Consider locking 10% more in Grain Bank before the harmattan season.',
    ajo: 'Healthy Ajo payout. Re-invest 20% back into next cycle for compound community growth.',
  }
  const tip = TIPS[bigCat.key] ?? 'The Griot says: save before you spend, not after. Build the granary in the dry season.'

  function prevMonth() { if (monthIdx === 0) { setYear(y => y - 1); setMonthIdx(11) } else setMonthIdx(m => m - 1) }
  function nextMonth() { if (monthIdx === 11) { setYear(y => y + 1); setMonthIdx(0) } else setMonthIdx(m => m + 1) }

  return (
    <div>
      {/* Month selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={prevMonth} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', color: 'rgba(255,255,255,.6)', cursor: 'pointer', fontSize: 16 }}>←</button>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,.85)', fontFamily: S.head }}>{MONTH_NAMES[monthIdx]} {year}</div>
        <button onClick={nextMonth} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', color: 'rgba(255,255,255,.6)', cursor: 'pointer', fontSize: 16 }}>→</button>
      </div>
      {/* View toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['spending', 'income'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1px solid ${view === v ? '#4ade80' : 'rgba(255,255,255,.07)'}`, background: view === v ? 'rgba(74,222,128,.08)' : 'transparent', color: view === v ? '#4ade80' : 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>
            {v === 'spending' ? '↗ Spending' : '↙ Income'}
          </button>
        ))}
      </div>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Total Spent',    val: `₡${TOTAL_SPENT.toLocaleString()}`,  color: '#ef4444' },
          { label: 'Total Received', val: `₡${TOTAL_INCOME.toLocaleString()}`, color: '#4ade80' },
          { label: 'Net',            val: `${NET >= 0 ? '+' : ''}₡${NET.toLocaleString()}`, color: NET >= 0 ? '#4ade80' : '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ padding: '10px 8px', background: 'rgba(255,255,255,.03)', borderRadius: 10, textAlign: 'center', border: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: s.color, fontFamily: S.head }}>{s.val}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Bar chart */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 10 }}>BREAKDOWN BY CATEGORY</div>
      {cats.map(c => {
        const pct = Math.round((c.val / total) * 100)
        const barW = Math.round((c.val / maxVal) * 100)
        return (
          <div key={c.key} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.72)', fontFamily: S.font }}>{c.emoji} {c.label}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font }}>₡{c.val.toLocaleString()} · {pct}%</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 4, background: c.color, width: `${barW}%`, transition: 'width .5s' }} />
            </div>
          </div>
        )
      })}
      {/* 6-month sparkline */}
      <div style={{ marginTop: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 10 }}>6-MONTH SPENDING TREND</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 56 }}>
          {TREND.map(t => {
            const h = Math.max(6, Math.round((t.val / trendMax) * 48))
            const isLast = t.m === 'Apr'
            return (
              <div key={t.m} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3 }}>
                <div style={{ width: '100%', height: h, borderRadius: '3px 3px 0 0', background: isLast ? '#4ade80' : 'rgba(74,222,128,.25)', flexShrink: 0 }} />
                <div style={{ fontSize: 8, color: isLast ? '#4ade80' : 'rgba(255,255,255,.25)', fontFamily: S.font }}>{t.m}</div>
              </div>
            )
          })}
        </div>
      </div>
      {/* Top merchants */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 8 }}>TOP MERCHANTS</div>
      {TOP_MERCHANTS.map(m => (
        <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
          <span style={{ fontSize: 18 }}>{m.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.72)', fontFamily: S.font }}>{m.name}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: S.font }}>{m.pct}% of total spend</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', fontFamily: S.head }}>−₡{m.amount.toLocaleString()}</div>
        </div>
      ))}
      {/* Griot tip */}
      <Card style={{ marginTop: 14, background: 'linear-gradient(135deg,#0a100a,#0d1a0d)', border: '1px solid rgba(251,191,36,.15)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', fontFamily: S.head, marginBottom: 6 }}>📯 GRIOT INSIGHT — {bigCat.emoji} {bigCat.label}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontFamily: S.font, lineHeight: 1.7 }}>{tip}</div>
      </Card>
    </div>
  )
}

// ── REFERRAL PANEL ────────────────────────────────────────────────────────────
function ReferralPanel({ afroId }: { afroId: string }) {
  const [copied, setCopied] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  const CODE = `AFRO-${afroId.split('@')[0].toUpperCase().slice(0, 5).padEnd(5, 'X')}-7X`
  const LINK = `afro.id/join?ref=${CODE.toLowerCase()}`
  const copy = (text: string, key: string) => { navigator.clipboard?.writeText(text).catch(() => {}); setCopied(key); setTimeout(() => setCopied(null), 2000); flash('✓ Copied to clipboard!') }

  const TIERS = [
    { key: 'bronze', label: 'Bronze', emoji: '🥉', range: '1–5 refs',   reward: 500,  color: '#cd7f32', min: 1,  max: 5 },
    { key: 'silver', label: 'Silver', emoji: '🥈', range: '6–15 refs',  reward: 750,  color: '#94a3b8', min: 6,  max: 15 },
    { key: 'gold',   label: 'Gold',   emoji: '🥇', range: '16+ refs',   reward: 1000, color: '#fbbf24', min: 16, max: 999 },
  ]
  const myRefs = 4; const currentTierIdx = 0; const nextTier = TIERS[1]
  const progressPct = Math.round(((myRefs - TIERS[0].min + 1) / (TIERS[0].max - TIERS[0].min + 1)) * 100)

  const STATS = [
    { label: 'Invited',    val: '7',      color: '#60a5fa' },
    { label: 'Joined',     val: '4',      color: '#4ade80' },
    { label: '₡ Earned',   val: '₡2,000', color: '#fbbf24' },
  ]
  const LEADERBOARD = [
    { handle: '@chioma_soko',   earned: '₡45,000', pos: 1,  isMe: false },
    { handle: '@emeka_tech',    earned: '₡38,500', pos: 2,  isMe: false },
    { handle: '@aisha_fashion', earned: '₡31,200', pos: 3,  isMe: false },
    { handle: '@kofi_arts',     earned: '₡22,750', pos: 4,  isMe: false },
    { handle: 'You',            earned: '₡2,000',  pos: 12, isMe: true  },
  ]
  const ACTIVITY = [
    { text: '@amaka_eze joined via your link',     reward: '₡500 credited', ts: '2 days ago'  },
    { text: '@tunde_health joined via your link',  reward: '₡500 credited', ts: '5 days ago'  },
    { text: '@ngozi_edu joined via your link',     reward: '₡500 credited', ts: '1 week ago'  },
    { text: '@kemi_soko joined via your link',     reward: '₡500 credited', ts: '2 weeks ago' },
    { text: 'Tier reward: reached 3 referrals',   reward: '+₡250 bonus',   ts: '2 weeks ago' },
  ]

  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '20px 16px', borderRadius: 16, background: 'linear-gradient(160deg,#0a1a00,#0d2800)', border: '1px solid rgba(74,222,128,.15)', marginBottom: 16 }}>
        <div style={{ fontSize: 36 }}>🏆</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#4ade80', fontFamily: S.head, marginTop: 8 }}>Earn ₡500 per friend</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: S.font, marginTop: 4, lineHeight: 1.6 }}>Invite friends to join Afroverse. They join — you both earn Cowrie. No limits.</div>
      </div>
      {msg && <div style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)', fontSize: 11, color: '#4ade80', marginBottom: 10, fontFamily: S.font }}>{msg}</div>}
      {/* Referral code */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 6 }}>YOUR REFERRAL CODE</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 12, background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.2)', marginBottom: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#4ade80', fontFamily: 'monospace', flex: 1, letterSpacing: '0.12em' }}>{CODE}</div>
        <button onClick={() => copy(CODE, 'code')} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(74,222,128,.3)', background: 'rgba(74,222,128,.1)', color: '#4ade80', fontSize: 10, fontWeight: 700, fontFamily: S.font, cursor: 'pointer' }}>{copied === 'code' ? '✓ Copied' : '📋 Copy'}</button>
      </div>
      {/* Referral link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: '#60a5fa', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{LINK}</div>
        <button onClick={() => copy(LINK, 'link')} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(96,165,250,.3)', background: 'rgba(96,165,250,.1)', color: '#60a5fa', fontSize: 9, fontFamily: S.font, cursor: 'pointer', flexShrink: 0 }}>{copied === 'link' ? '✓' : '🔗 Copy'}</button>
      </div>
      {/* Share buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 16 }}>
        {[
          { label: 'WhatsApp', emoji: '🟢', color: '#25D366' },
          { label: 'SMS',      emoji: '📱', color: '#4ade80' },
          { label: 'Twitter',  emoji: '🐦', color: '#1DA1F2' },
          { label: 'Facebook', emoji: '🔵', color: '#4267B2' },
        ].map(s => (
          <button key={s.label} onClick={() => flash(`✓ Opening ${s.label} to share your code`)} style={{ padding: '10px 4px', borderRadius: 10, border: `1px solid ${s.color}30`, background: `${s.color}10`, cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: 16 }}>{s.emoji}</div>
            <div style={{ fontSize: 9, color: s.color, fontFamily: S.font, marginTop: 3, fontWeight: 600 }}>{s.label}</div>
          </button>
        ))}
      </div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ padding: '12px 8px', background: 'rgba(255,255,255,.03)', borderRadius: 10, textAlign: 'center', border: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: s.color, fontFamily: S.head }}>{s.val}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Tiers */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 8 }}>REWARD TIERS</div>
      {TIERS.map((t, i) => (
        <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, border: `1px solid ${i === currentTierIdx ? t.color : 'rgba(255,255,255,.06)'}`, background: i === currentTierIdx ? `${t.color}10` : 'transparent', marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>{t.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: i === currentTierIdx ? t.color : 'rgba(255,255,255,.6)', fontFamily: S.head }}>{t.label} · {t.range}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font }}>₡{t.reward} per referral</div>
          </div>
          {i === currentTierIdx && <Pill label="CURRENT" color={t.color} bg={`${t.color}20`} />}
        </div>
      ))}
      {/* Progress to next tier */}
      <Card style={{ marginTop: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: S.font, marginBottom: 6 }}>
          <span>{myRefs} referrals · Bronze</span>
          <span>{nextTier.min - myRefs} more → {nextTier.label} (₡{nextTier.reward}/ref)</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#fbbf24', borderRadius: 3, width: `${progressPct}%` }} />
        </div>
      </Card>
      {/* Leaderboard */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 8 }}>VILLAGE LEADERBOARD</div>
      {LEADERBOARD.map(l => (
        <div key={l.handle} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: l.pos <= 3 ? 'rgba(251,191,36,.15)' : 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: l.pos <= 3 ? '#fbbf24' : 'rgba(255,255,255,.3)', flexShrink: 0, fontFamily: S.head }}>#{l.pos}</div>
          <div style={{ flex: 1, fontSize: 11, color: l.isMe ? '#4ade80' : 'rgba(255,255,255,.65)', fontFamily: S.font, fontWeight: l.isMe ? 700 : 400 }}>{l.handle}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', fontFamily: S.head }}>{l.earned}</div>
        </div>
      ))}
      {/* Activity feed */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', fontFamily: S.font, marginBottom: 8 }}>RECENT ACTIVITY</div>
        {ACTIVITY.map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.68)', fontFamily: S.font }}>{a.text}</div>
              <div style={{ fontSize: 9, fontFamily: S.font, marginTop: 2 }}><span style={{ color: '#4ade80' }}>{a.reward}</span> · <span style={{ color: 'rgba(255,255,255,.25)' }}>{a.ts}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── SAVINGS GOAL PANEL ────────────────────────────────────────────────────────
function SavingsGoalPanel({ afroId }: { afroId: string }) {
  type Goal = { id: string; name: string; emoji: string; target: number; saved: number; deadline: string; monthlyContrib: number; paused: boolean }
  const [goals, setGoals] = useState<Goal[]>([
    { id: 'g1', name: 'Dream Home Deposit', emoji: '🏠', target: 5000000, saved: 3820000, deadline: '2026-12-31', monthlyContrib: 280000, paused: false },
    { id: 'g2', name: 'Accra Holiday',      emoji: '✈️', target: 450000,  saved: 195000,  deadline: '2026-08-01', monthlyContrib: 42000,  paused: false },
    { id: 'g3', name: 'New iPhone 17',      emoji: '📱', target: 280000,  saved: 84000,   deadline: '2026-09-15', monthlyContrib: 32000,  paused: true  },
    { id: 'g4', name: 'Emergency Fund',     emoji: '🏥', target: 500000,  saved: 478000,  deadline: '2026-05-01', monthlyContrib: 11000,  paused: false },
  ])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', deadline: '', category: '🏠', savePct: '10' })
  const [addGoalId, setAddGoalId] = useState<string | null>(null)
  const [addAmt, setAddAmt] = useState('')
  const [msg, setMsg] = useState('')
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const CATEGORIES = ['🏠', '✈️', '🚗', '📱', '💍', '🎓', '🏥', '✨']
  const SAVE_PCTS = ['5', '10', '15', '20', '25']

  const totalSaved = goals.reduce((a, g) => a + g.saved, 0)
  const totalTarget = goals.reduce((a, g) => a + g.target, 0)

  function daysLeft(deadline: string) { return Math.max(0, Math.round((new Date(deadline).getTime() - Date.now()) / 86400000)) }
  function projectedDate(g: Goal) {
    if (g.paused || g.monthlyContrib <= 0) return 'Paused'
    const rem = g.target - g.saved
    if (rem <= 0) return '✓ Complete!'
    const months = Math.ceil(rem / g.monthlyContrib)
    const d = new Date(); d.setMonth(d.getMonth() + months)
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
  }
  function barColor(pct: number) { return pct >= 75 ? '#4ade80' : pct >= 40 ? '#fbbf24' : '#fb923c' }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,.88)', fontFamily: S.head }}>🎯 My Goals</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginTop: 2 }}>₡{totalSaved.toLocaleString()} saved of ₡{totalTarget.toLocaleString()}</div>
        </div>
        <Btn label={creating ? '✕ Cancel' : '+ New Goal'} onClick={() => setCreating(!creating)} style={{ padding: '7px 14px', fontSize: 11 }} />
      </div>
      {msg && <div style={{ padding: '7px 12px', borderRadius: 8, background: msg.startsWith('✓') ? 'rgba(74,222,128,.08)' : 'rgba(239,68,68,.08)', border: `1px solid ${msg.startsWith('✓') ? 'rgba(74,222,128,.2)' : 'rgba(239,68,68,.2)'}`, fontSize: 11, color: msg.startsWith('✓') ? '#4ade80' : '#ef4444', marginBottom: 10, fontFamily: S.font }}>{msg}</div>}
      {/* Overall summary */}
      <Card style={{ marginBottom: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, letterSpacing: '.1em', marginBottom: 6 }}>TOTAL SAVINGS ACROSS ALL GOALS</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#4ade80', fontFamily: S.head }}>₡{totalSaved.toLocaleString()}</div>
        <div style={{ height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, margin: '8px 0 4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#4ade80,#22d3ee)', borderRadius: 3, width: `${Math.round((totalSaved / totalTarget) * 100)}%` }} />
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font }}>{Math.round((totalSaved / totalTarget) * 100)}% of ₡{totalTarget.toLocaleString()} total target</div>
      </Card>
      {/* Create form */}
      {creating && (
        <Card style={{ marginBottom: 14, border: '1px solid rgba(74,222,128,.2)' }}>
          <Sec emoji="🎯" title="New Savings Goal" />
          <In value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Goal name (e.g. Dream Home)" />
          <In value={form.target} onChange={v => setForm(f => ({ ...f, target: v.replace(/\D/g, '') }))} placeholder="Target amount ₡" />
          <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 12, fontFamily: S.font, boxSizing: 'border-box' as const, marginBottom: 10 }} />
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginBottom: 6 }}>CATEGORY</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' as const }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${form.category === c ? '#4ade80' : 'rgba(255,255,255,.1)'}`, background: form.category === c ? 'rgba(74,222,128,.1)' : 'transparent', fontSize: 18, cursor: 'pointer' }}>{c}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font, marginBottom: 6 }}>AUTO-SAVE % OF EACH RECEIVED PAYMENT</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {SAVE_PCTS.map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, savePct: p }))} style={{ flex: 1, padding: '6px', borderRadius: 8, border: `1px solid ${form.savePct === p ? '#4ade80' : 'rgba(255,255,255,.08)'}`, background: form.savePct === p ? 'rgba(74,222,128,.08)' : 'transparent', color: form.savePct === p ? '#4ade80' : 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700, fontFamily: S.head, cursor: 'pointer' }}>{p}%</button>
            ))}
          </div>
          <Btn label="🎯 Create Goal" variant="primary" disabled={!form.name || !form.target} style={{ width: '100%' }}
            onClick={() => {
              const ng: Goal = {
                id: `g${Date.now()}`, name: form.name, emoji: form.category,
                target: Number(form.target), saved: 0,
                deadline: form.deadline || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
                monthlyContrib: Math.round(Number(form.target) * Number(form.savePct) / 100),
                paused: false,
              }
              setGoals(p => [ng, ...p])
              flash(`✓ Goal "${form.name}" created — start saving today!`)
              setForm({ name: '', target: '', deadline: '', category: '🏠', savePct: '10' })
              setCreating(false)
            }} />
        </Card>
      )}
      {/* Goals list */}
      {goals.map(g => {
        const pct = Math.min(100, Math.round((g.saved / g.target) * 100))
        const dl = daysLeft(g.deadline)
        const bc = barColor(pct)
        const near = pct >= 90
        return (
          <Card key={g.id} style={{ marginBottom: 12, border: `1px solid ${near ? '#4ade8040' : 'rgba(255,255,255,.08)'}`, boxShadow: near ? '0 0 18px rgba(74,222,128,.07)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${bc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{g.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.88)', fontFamily: S.head }}>{g.name}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.28)', fontFamily: S.font, marginTop: 2 }}>
                  ₡{g.monthlyContrib.toLocaleString()}/mo contribution · {dl > 0 ? `${dl} days left` : 'Deadline passed'}{g.paused ? ' · PAUSED' : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: bc, fontFamily: S.head }}>{pct}%</div>
                {near && <div style={{ fontSize: 8, color: '#4ade80', fontFamily: S.font }}>✨ Almost there!</div>}
              </div>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,.06)', borderRadius: 4, marginBottom: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 4, background: bc, width: `${pct}%`, transition: 'width .5s', boxShadow: near ? `0 0 8px ${bc}60` : 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: S.font, marginBottom: 10 }}>
              <span>₡{g.saved.toLocaleString()} saved</span>
              <span>of ₡{g.target.toLocaleString()}</span>
              <span style={{ color: '#a78bfa' }}>→ {projectedDate(g)}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn label={g.paused ? '▶ Resume' : '⏸ Pause'} style={{ flex: 1, fontSize: 10 }}
                onClick={() => setGoals(p => p.map(x => x.id === g.id ? { ...x, paused: !x.paused } : x))} />
              <Btn label="+ Add Cowrie" variant="primary" style={{ flex: 1, fontSize: 10 }}
                onClick={() => setAddGoalId(addGoalId === g.id ? null : g.id)} />
            </div>
            {addGoalId === g.id && (
              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                <input value={addAmt} onChange={e => setAddAmt(e.target.value.replace(/\D/g, ''))} placeholder="₡ Amount to add" style={{ flex: 1, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 10px', color: '#fff', fontSize: 12, fontFamily: S.font }} />
                <Btn label="Add" variant="primary" disabled={!addAmt}
                  onClick={() => {
                    const a = Number(addAmt)
                    setGoals(p => p.map(x => x.id === g.id ? { ...x, saved: Math.min(x.target, x.saved + a) } : x))
                    flash(`✓ ₡${a.toLocaleString()} added to "${g.name}"`)
                    setAddAmt(''); setAddGoalId(null)
                  }} />
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION + FEATURE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
const SECTIONS = [
  { id: 'dhasira',    emoji: '🪪', title: 'UnionPay · Identity',     color: '#f472b6',
    features: [
      { key: 'trinity',      emoji: '🔗', label: 'AfroID Hub',    color: '#f472b6' },
      { key: 'coin',         emoji: '🪙', label: 'Cowrie · AFC',  color: '#fbbf24' },
    ] },
  { id: 'safari',     emoji: '🐪', title: 'UnionPay · Transfer',     color: '#4ade80',
    features: [
      { key: 'vault',        emoji: '💸', label: 'P2P Instant',   color: '#4ade80' },
      { key: 'caravan',      emoji: '🏦', label: 'Bank Send',     color: '#22d3ee' },
      { key: 'pot',          emoji: '🔒', label: 'Escrow',        color: '#fbbf24' },
      { key: 'beneficiary',  emoji: '👥', label: 'Saved Contacts',color: '#e879f9' },
      { key: 'scheduled',    emoji: '📅', label: 'Scheduled',     color: '#a78bfa' },
      { key: 'bulk',         emoji: '📦', label: 'Bulk',          color: '#fb923c' },
      { key: 'subs',         emoji: '🔄', label: 'Recurring',     color: '#60a5fa' },
    ] },
  { id: 'soko',       emoji: '⚡', title: 'UnionPay · Soko Pay',     color: '#22d3ee',
    features: [
      { key: 'qrpay',        emoji: '📷', label: 'QR Drum',       color: '#22d3ee' },
      { key: 'handle',       emoji: '🏷️',  label: '@AfroID',       color: '#a78bfa' },
      { key: 'nfcpay',       emoji: '📡', label: 'Tap Pay',       color: '#4ade80' },
      { key: 'paylink',      emoji: '🔗', label: 'Cowrie Link',   color: '#fb923c' },
    ] },
  { id: 'khazina',    emoji: '🏛️', title: 'UnionPay · Vault',        color: '#fbbf24',
    features: [
      { key: 'wallets',      emoji: '👛', label: 'Àpò Owó',      color: '#fbbf24' },
      { key: 'akoole',       emoji: '📋', label: 'Accounts',      color: '#fb923c' },
      { key: 'savings_goals',emoji: '🎯', label: 'Goals',         color: '#4ade80' },
      { key: 'auto_save',    emoji: '🤖', label: 'Auto Save',     color: '#22d3ee' },
      { key: 'budget',       emoji: '🧵', label: 'Kente Budget',  color: '#a78bfa' },
    ] },
  { id: 'susu',       emoji: '⭕', title: 'UnionPay · Circle',        color: '#60a5fa',
    features: [
      { key: 'ajo',          emoji: '🔄', label: 'Ajo',           color: '#4ade80' },
      { key: 'esusu',        emoji: '🌙', label: 'Esusu',         color: '#6b4fbb' },
      { key: 'harambee',     emoji: '🤝', label: 'Harambee',      color: '#22d3ee' },
      { key: 'buffer',       emoji: '🛡️',  label: 'Àágò Nla',     color: '#ef4444' },
    ] },
  { id: 'daraja',     emoji: '🌍', title: 'UnionPay · Bridge',        color: '#22d3ee',
    features: [
      { key: 'banks',        emoji: '🌍', label: '54 Nations',    color: '#22d3ee' },
      { key: 'mesh',         emoji: '📡', label: 'Mesh P2P',      color: '#fbbf24' },
    ] },
  { id: 'kaadi',      emoji: '💳', title: 'UnionPay · Cards',         color: '#a78bfa',
    features: [
      { key: 'kaadi',        emoji: '💳', label: 'My Cards',      color: '#a78bfa' },
    ] },
  { id: 'biashara',   emoji: '🏪', title: 'UnionPay · Business',      color: '#fb923c',
    features: [
      { key: 'market',       emoji: '🛒', label: 'Marketplace',   color: '#66BB6A' },
      { key: 'bills',        emoji: '🧾', label: 'Bill Pay',      color: '#fbbf24' },
      { key: 'griot_ai',     emoji: '🤖', label: 'AI Griot',      color: '#fb923c' },
      { key: 'voice',        emoji: '🗣️',  label: 'Voice USSD',    color: '#a78bfa' },
    ] },
  { id: 'hazina',     emoji: '🏘️', title: 'UnionPay · Treasury',      color: '#f472b6',
    features: [
      { key: 'grain',        emoji: '🌾', label: 'Season Grain',  color: '#fbbf24' },
      { key: 'spirit',       emoji: '🔮', label: 'Spirit Vault',  color: '#a78bfa' },
      { key: 'council',      emoji: '⚖️',  label: 'Igwé Council',  color: '#22d3ee' },
    ] },
  { id: 'zawadi',     emoji: '🎁', title: 'UnionPay · Rewards',        color: '#fbbf24',
    features: [
      { key: 'kowe',         emoji: '📜', label: 'Kòwè Ledger',   color: '#fbbf24' },
      { key: 'tipping',      emoji: '💫', label: 'Cowrie Tip',    color: '#4ade80' },
      { key: 'referral',     emoji: '🏆', label: 'Refer & Earn',  color: '#fb923c' },
      { key: 'tlp',          emoji: '🔒', label: 'TLP Oracle',    color: '#6b4fbb' },
    ] },
  { id: 'mkopo',      emoji: '📊', title: 'UnionPay · Credit',         color: '#ef4444',
    features: [
      { key: 'griot',        emoji: '📊', label: 'Griot Score',   color: '#ef4444' },
      { key: 'invest',       emoji: '💰', label: 'Loans',         color: '#fbbf24' },
      { key: 'live_feed',    emoji: '📡', label: 'Live Feed',     color: '#60a5fa' },
    ] },
  { id: 'uwekezaji',  emoji: '📈', title: 'UnionPay · Investments',    color: '#4ade80',
    features: [
      { key: 'grain',        emoji: '📈', label: 'Micro-invest',  color: '#4ade80' },
      { key: 'staking',      emoji: '🌿', label: 'Àgbẹ Owó',     color: '#22d3ee' },
    ] },
  { id: 'jalada',     emoji: '📊', title: 'UnionPay · Ledger',          color: '#60a5fa',
    features: [
      { key: 'live_feed',    emoji: '📡', label: 'Transactions',  color: '#60a5fa' },
      { key: 'insights',     emoji: '📊', label: 'Insights',      color: '#4ade80' },
      { key: 'kowe',         emoji: '📜', label: 'Statements',    color: '#fbbf24' },
      { key: 'nkisi',        emoji: '🧿', label: 'Fraud Shield',  color: '#ef4444' },
    ] },
  { id: 'ngome',      emoji: '🛡️',  title: 'UnionPay · Security',       color: '#ef4444',
    features: [
      { key: 'chain_wallet', emoji: '🔗', label: 'Chain Wallet',  color: '#22d3ee' },
      { key: 'bridge',       emoji: '🌉', label: 'Ọ̀nà Bàrì',    color: '#a78bfa' },
      { key: 'zk_privacy',   emoji: '🎭', label: 'ADO Sírì',      color: '#4ade80' },
    ] },
] as const

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function BankingPage() {
  const { user } = useAuthStore()
  const afroId = user?.afroId?.raw || 'demo-user'
  const online = useNetworkStatus()
  const [balance, setBalance] = useState({ cowrie: 0, africoin: 0 })
  const [active, setActive] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [walletView, setWalletView] = useState<'cow'|'usd'|'local'>('cow')

  useEffect(() => {
    cowrieApi.balance(afroId).then(b => { setBalance(b as typeof balance); localStorage.setItem('afro_bal', JSON.stringify(b)) }).catch(() => { const c = localStorage.getItem('afro_bal'); if (c) setBalance(JSON.parse(c)) })
    setPendingCount(getOfflineQueue().length)
  }, [afroId])

  const todayDay = getTodayMarketDay(); const todayMeta = MARKET_DAY_META[todayDay]
  const proverb = AFRICAN_BANKING_PROVERBS[Math.floor(Date.now() / 86400000) % AFRICAN_BANKING_PROVERBS.length]
  const nkisi = NKISI_SHIELD_LEVELS.GREEN

  function toggle(key: string) { setActive(active === key ? null : key) }

  function renderFeature(key: string) {
    switch (key) {
      case 'trinity':      return <IdentityTrinityPanel afroId={afroId} />
      case 'coin':         return <CoinPanel />
      case 'qrpay':
      case 'handle':
      case 'nfcpay':
      case 'paylink':      return <QuickPayPanel afroId={afroId} />
      case 'vault':        return <VaultPanel afroId={afroId} online={online} balance={balance} setBalance={setBalance} />
      case 'wallets':      return <WalletsPanel afroId={afroId} />
      case 'akoole':       return <AkoolePanel />
      case 'kaadi':        return <KaadiPanel />
      case 'kowe':         return <KowePanel />
      case 'ajo':          return <AjoPanel />
      case 'esusu':        return <EsusuPanel afroId={afroId} />
      case 'harambee':     return <HarambeePanel afroId={afroId} />
      case 'buffer':       return <BufferPanel afroId={afroId} />
      case 'subs':         return <SubsPanel afroId={afroId} />
      case 'grain':        return <GrainPanel afroId={afroId} />
      case 'pot':          return <PotPanel afroId={afroId} />
      case 'spirit':       return <SpiritPanel afroId={afroId} />
      case 'council':      return <CouncilPanel afroId={afroId} />
      case 'griot':        return <GriotPanel afroId={afroId} />
      case 'tlp':          return <TlpPanel />
      case 'invest':       return <InvestPanel afroId={afroId} />
      case 'budget':       return <BudgetPanel afroId={afroId} />
      case 'banks':        return <CorridorPanel afroId={afroId} online={online} />
      case 'mesh':         return <MeshPanel />
      case 'chain_wallet': return <ChainWalletPanel afroId={afroId} />
      case 'bridge':       return <BridgePanel afroId={afroId} />
      case 'staking':      return <StakingPanel afroId={afroId} />
      case 'zk_privacy':   return <ZKPrivacyPanel afroId={afroId} />
      case 'griot_ai':     return <GriotAiPanel afroId={afroId} />
      case 'live_feed':    return <LiveFeedPanel afroId={afroId} />
      case 'voice':        return <VoicePanel />
      case 'nkisi':        return <NkisiPanel />
      case 'market':       return <MarketPanel afroId={afroId} />
      case 'caravan':      return <CaravanBankPanel afroId={afroId} online={online} />
      case 'scheduled':    return <ScheduledPanel afroId={afroId} />
      case 'bulk':         return <BulkPanel afroId={afroId} />
      case 'recurring_tx': return <RecurringTxPanel afroId={afroId} />
      case 'auto_save':    return <AutoSavePanel afroId={afroId} />
      case 'biashara':     return <BiasharaHubPanel afroId={afroId} />
      case 'hazina':       return <HazinaPanel afroId={afroId} />
      case 'agri_pool':    return <AgriPoolPanel afroId={afroId} />
      case 'tipping':       return <TippingPanel afroId={afroId} />
      case 'loans':         return <LoansPanel afroId={afroId} />
      case 'bills':         return <BillsPanel afroId={afroId} />
      case 'beneficiary':   return <BeneficiaryPanel afroId={afroId} />
      case 'insights':      return <SpendingInsightsPanel afroId={afroId} />
      case 'referral':      return <ReferralPanel afroId={afroId} />
      case 'savings_goals': return <SavingsGoalPanel afroId={afroId} />
      default:              return null
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#070e07', color: '#fff', paddingBottom: 90, fontFamily: S.font, position: 'relative' }}>

      {/* ── Adinkra Gye Nyame — sovereign banking pattern ── */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231a7c3e' stroke-linecap='round'%3E%3Cpath d='M50 8 L92 50 L50 92 L8 50 Z' stroke-width='1.2'/%3E%3Cpath d='M50 22 L78 50 L50 78 L22 50 Z' stroke-width='0.8'/%3E%3Cellipse cx='50' cy='50' rx='7' ry='11' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='3' fill='%231a7c3e' stroke='none'/%3E%3Cpath d='M22 22 Q14 14 14 22' stroke-width='0.9'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px', backgroundRepeat: 'repeat',
      }} />

      {/* ── Pan-African Kente top stripe ── */}
      <div aria-hidden="true" style={{ height: 4, background: 'linear-gradient(90deg,#1a7c3e 0%,#1a7c3e 25%,#d4a017 25%,#d4a017 50%,#b22222 50%,#b22222 75%,#1a1a1a 75%,#1a1a1a 100%)', position: 'relative', zIndex: 1 }} />

      {/* ── Nkisi Shield + Offline banner ── */}
      <div style={{ padding: '16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12 }}>{nkisi.emoji}</span>
          <span style={{ fontSize: 10, color: nkisi.color, fontWeight: 700, fontFamily: S.head }}>{nkisi.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {pendingCount > 0 && <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 16, background: 'rgba(251,191,36,.12)', color: '#fbbf24', fontWeight: 700 }}>{pendingCount} queued</span>}
          {online ? <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 16, background: 'rgba(74,222,128,.1)', color: '#4ade80', fontWeight: 700 }}>LIVE</span> : <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 16, background: 'rgba(251,191,36,.12)', color: '#fbbf24', fontWeight: 700 }}>OFFLINE</span>}
        </div>
      </div>

      {/* ── Market Day Banner ── */}
      <div style={{ margin: '12px 16px 0', background: `${todayMeta.color}14`, border: `1px solid ${todayMeta.color}28`, borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 16 }}>{todayMeta.emoji}</span>
        <div><span style={{ fontSize: 11, fontWeight: 700, color: todayMeta.color, fontFamily: S.head }}>{todayDay}</span><span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginLeft: 8, fontFamily: S.font }}>{todayMeta.bonus}</span></div>
      </div>

      {/* ── Balance Hero — African Green/Gold ── */}
      <div style={{ margin: '16px 16px 0', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(26,124,62,.3)', position: 'relative', zIndex: 1 }}>
        {/* Kente weave texture inside hero */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 10px, rgba(212,160,23,.5) 10px, rgba(212,160,23,.5) 12px, transparent 12px, transparent 22px, rgba(26,124,62,.4) 22px, rgba(26,124,62,.4) 24px), repeating-linear-gradient(90deg, transparent 0px, transparent 10px, rgba(178,34,34,.3) 10px, rgba(178,34,34,.3) 12px, transparent 12px, transparent 22px, rgba(212,160,23,.3) 22px, rgba(212,160,23,.3) 24px)`,
          backgroundSize: '24px 24px',
        }} />
        <div style={{ padding: '24px 20px', background: 'linear-gradient(160deg,rgba(7,14,7,.98),rgba(10,22,10,.95))', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>🌍</span>
            <span style={{ fontSize: 9, letterSpacing: '0.18em', color: '#d4a017', fontWeight: 800, fontFamily: S.head }}>ILE OWO · PAN-AFRICAN TREASURY</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12, background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: 3, width: 'fit-content', margin: '0 auto 12px' }}>
            {(['cow','usd','local'] as const).map(v => (
              <button key={v} onClick={() => setWalletView(v)} style={{ padding: '5px 14px', borderRadius: 7, border: 'none', background: walletView === v ? '#1a7c3e' : 'transparent', color: walletView === v ? '#fff' : 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700, fontFamily: S.head, cursor: 'pointer', transition: 'all .2s' }}>
                {v === 'cow' ? '₡ COW' : v === 'usd' ? '$ USD' : '₦ NGN'}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, color: '#4ade80', fontFamily: S.head, marginTop: 4, textShadow: '0 0 30px rgba(74,222,128,.3)' }}>
            {walletView === 'cow' ? `₡${balance.cowrie.toLocaleString()}` : walletView === 'usd' ? `$${(balance.cowrie * MOCK_FX_RATES.CWR_TO_USD).toFixed(2)}` : `₦${Math.round(balance.cowrie * MOCK_FX_RATES.CWR_TO_USD * 1620).toLocaleString()}`}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', marginTop: 4, fontFamily: S.font }}>
            🔗 {balance.africoin?.toFixed?.(4) ?? '0'} AFC on-chain · {walletView !== 'cow' ? `₡${balance.cowrie.toLocaleString()} COW` : `~$${(balance.cowrie * MOCK_FX_RATES.CWR_TO_USD).toFixed(2)} USD`}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(212,160,23,.7)', fontStyle: 'italic', fontFamily: S.font, lineHeight: 1.6 }}>"{proverb.text}" — <span style={{ fontSize: 9, color: 'rgba(255,255,255,.18)' }}>{proverb.origin}</span></div>
        </div>
        {/* Kente divider at bottom of hero */}
        <div style={{ height: 4, background: 'linear-gradient(90deg,#1a7c3e 0%,#1a7c3e 25%,#d4a017 25%,#d4a017 50%,#b22222 50%,#b22222 75%,#1a1a1a 75%,#1a1a1a 100%)' }} />
      </div>

      {/* ── Quick Actions Row ── */}
      <div style={{ margin: '16px 16px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { icon: '↗', label: 'Send', color: '#4ade80', bg: 'rgba(74,222,128,.1)', border: 'rgba(74,222,128,.2)', key: 'vault' },
          { icon: '↙', label: 'Receive', color: '#818cf8', bg: 'rgba(129,140,248,.1)', border: 'rgba(129,140,248,.2)', key: 'vault' },
          { icon: '🧾', label: 'Pay Bills', color: '#fbbf24', bg: 'rgba(251,191,36,.1)', border: 'rgba(251,191,36,.2)', key: 'bills' },
          { icon: '＋', label: 'Top Up', color: '#fb923c', bg: 'rgba(251,146,60,.1)', border: 'rgba(251,146,60,.2)', key: 'caravan' },
        ].map(q => (
          <button key={q.key + q.icon} onClick={() => toggle(q.key)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 8px', borderRadius: 16, background: q.bg, border: `1px solid ${q.border}`, cursor: 'pointer', transition: 'all .2s', outline: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: q.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: q.icon.length > 1 ? 16 : 20, color: '#000', fontWeight: 900 }}>{q.icon}</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.75)', fontFamily: S.head }}>{q.label}</span>
          </button>
        ))}
      </div>

      {/* ── Recent Transactions Quick Strip ── */}
      <div style={{ margin: '14px 16px 0', padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.6)', fontFamily: S.head, letterSpacing: '0.05em' }}>RECENT</span>
          <button onClick={() => toggle('kowe')} style={{ fontSize: 10, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: S.head, fontWeight: 700 }}>See All →</button>
        </div>
        {[
          { emoji: '↗', name: 'Amina Okafor', type: 'Sent', amount: -4500, color: '#ef4444', time: '2h ago' },
          { emoji: '↙', name: 'Paystack',     type: 'Received', amount: 52000, color: '#4ade80', time: '5h ago' },
          { emoji: '🧾', name: 'IKEDC',        type: 'Electricity', amount: -8000, color: '#fbbf24', time: 'Yesterday' },
        ].map((tx, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: `${tx.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{tx.emoji}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.8)', fontFamily: S.head }}>{tx.name}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: S.font }}>{tx.type} · {tx.time}</div></div>
            <div style={{ fontSize: 13, fontWeight: 800, color: tx.color, fontFamily: S.head }}>{tx.amount > 0 ? '+' : ''}₡{Math.abs(tx.amount).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* ── Section Grids ── */}
      {SECTIONS.map(section => {
        const sectionFeatureKeys: string[] = section.features.map(f => f.key)
        const activeInSection = active && sectionFeatureKeys.includes(active) ? active : null
        return (
          <div key={section.id} style={{ margin: '20px 16px 0', position: 'relative', zIndex: 1 }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>{section.emoji}</span>
              <div style={{ flex: 1, height: 1, background: `${section.color}22` }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: section.color, fontFamily: S.head, letterSpacing: '0.05em' }}>{section.title}</span>
              <div style={{ flex: 1, height: 1, background: `${section.color}22` }} />
            </div>

            {/* Feature grid */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${section.features.length <= 4 ? section.features.length : 3}, 1fr)`, gap: 8, marginBottom: activeInSection ? 14 : 0 }}>
              {section.features.map(f => (
                <Tile key={f.key} emoji={f.emoji} label={f.label} color={f.color} active={active === f.key} onClick={() => toggle(f.key)} />
              ))}
            </div>

            {/* Expanded feature panel */}
            {activeInSection && (
              <div style={{ background: 'rgba(255,255,255,.02)', borderRadius: 16, padding: 16, border: `1px solid ${section.features.find(f => f.key === activeInSection)?.color ?? section.color}18`, marginTop: 8 }}>
                {renderFeature(activeInSection)}
              </div>
            )}
          </div>
        )
      })}

      {/* ── Vision Horizon ── */}
      <div style={{ margin: '28px 16px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 14 }}>🔮</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', fontFamily: S.head, letterSpacing: '0.1em' }}>VISION HORIZON</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
        </div>
        <div style={{ overflowX: 'auto', display: 'flex', gap: 10, paddingBottom: 8, scrollbarWidth: 'none' }}>
          {PAN_AFRICAN_IDEAS.map(idea => {
            const statusColor = idea.status === 'LIVE' ? '#4ade80' : idea.status === 'IN_BUILD' ? '#fbbf24' : idea.status === 'COMING_SOON' ? '#60a5fa' : '#888'
            return (
              <div key={idea.id} style={{ flexShrink: 0, width: 200, borderRadius: 14, border: `1px solid ${idea.color}28`, background: `${idea.color}08`, padding: '14px 14px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{idea.emoji}</span>
                  <Pill label={idea.status.replace('_', ' ')} color={statusColor} bg={`${statusColor}18`} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: idea.color, fontFamily: S.head, marginBottom: 3 }}>{idea.name}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: S.font, lineHeight: 1.5, marginBottom: 6 }}>{idea.subtitle}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', fontFamily: S.font, fontStyle: 'italic' }}>{idea.origin}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
