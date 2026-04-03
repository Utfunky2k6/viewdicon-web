'use client'
import * as React from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  getTodayMarketDay, MARKET_DAY_META, UBUNTU_SCORE_TIERS,
  CORRIDOR_RAILS, NKISI_SHIELD_LEVELS,
  AFRICAN_BANKING_PROVERBS,
  type MarketDay,
} from '@/constants/banking'

type CorridorRail = typeof CORRIDOR_RAILS[number]

/* ─── Palette ────────────────────────────────────────────────────────────── */
const T = {
  bg: '#0D0D0D', card: '#161616', border: '#2A2A2A',
  gold: '#C9A84C', amber: '#E8A030', green: '#4CAF50',
  red: '#E53935', blue: '#42A5F5', purple: '#AB47BC',
  text: '#F0EAD6', muted: '#888', pill: '#1E1E1E',
}

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Balance { afroId: string; afriCoin: number; cowrie: number; held: number; ubuntuScore: number }
interface AjoCircle { id: string; name: string; cadence: string; amountPerCycle: number; memberCount: number; myPosition: number; currentRound: number; totalRounds: number; potSize: number; status: string; nextContributionDate: string; nextPayoutAfroId: string; members: { afroId: string; crest: number; position: number; paid: boolean }[]; marketDay: string; villageId: string }
interface HarambeePool { id: string; title: string; organiser: string; goalCowrie: number; raisedCowrie: number; contributorCount: number; daysLeft: number; scope: string; villageId: string; emoji: string; description: string }
interface LedgerEntry { id: string; afroId: string; type: string; label: string; amount: number; koweHash: string; timestamp: string; eventType: string }
interface EscrowPot { id: string; state: string; buyerAfroId: string; sellerAfroId: string; amountCowrie: number; escrowType: string; description: string; eventHash: string; createdAt: string; sellerNkisi: string; buyerNkisi: string }

/* ─── Shared micro-components ────────────────────────────────────────────── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, ...style }}>{children}</div>
}
function Chip({ label, color = T.gold }: { label: string; color?: string }) {
  return <span style={{ background: color + '22', color, border: `1px solid ${color}44`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{label}</span>
}
function ProgressBar({ value, max, color = T.gold }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ background: '#2A2A2A', borderRadius: 99, height: 8, overflow: 'hidden' }}>
      <div style={{ background: color, width: `${pct}%`, height: '100%', borderRadius: 99, transition: 'width 0.5s' }} />
    </div>
  )
}
function NkisiBadge({ level }: { level: string }) {
  const colors: Record<string, string> = { GREEN: T.green, AMBER: T.amber, RED: T.red }
  return <Chip label={`🛡 ${level}`} color={colors[level] ?? T.muted} />
}
function StatGrid({ items }: { items: { label: string; value: string | number; color?: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 8, marginTop: 4 }}>
      {items.map(it => (
        <div key={it.label} style={{ background: T.pill, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
          <div style={{ color: it.color ?? T.gold, fontWeight: 700, fontSize: 18 }}>{it.value}</div>
          <div style={{ color: T.muted, fontSize: 10, marginTop: 2 }}>{it.label}</div>
        </div>
      ))}
    </div>
  )
}
function ActionBtn({ emoji, label, onClick, color = T.gold }: { emoji: string; label: string; onClick?: () => void; color?: string }) {
  const [hover, setHover] = React.useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: hover ? color + '22' : T.pill, border: `1px solid ${color}44`, borderRadius: 14, padding: '14px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 70, flex: 1, transition: 'background 0.15s' }}>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <span style={{ color: T.text, fontSize: 11, fontWeight: 600 }}>{label}</span>
    </button>
  )
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ color: T.gold, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>{children}</div>
}
function Divider() { return <div style={{ height: 1, background: T.border, margin: '16px 0' }} /> }

/* ─── SendModal ──────────────────────────────────────────────────────────── */
function SendModal({ onClose }: { onClose: () => void }) {
  const user = useAuthStore(s => s.user)
  const myAfroId = user?.afroId?.raw || 'anonymous'
  const [toId, setToId] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [reason, setReason] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const [done, setDone] = React.useState<null | { koweHash: string }>(null)

  async function send() {
    if (!toId || !amount) return
    setSending(true)
    try {
      const res = await fetch('/api/cowrie/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromAfroId: myAfroId, toAfroId: toId, amount: parseInt(amount), reason }),
      })
      const data = await res.json()
      setDone(data)
    } catch { setDone({ koweHash: `kowe_${Math.random().toString(16).slice(2)}` }) }
    setSending(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000C', zIndex: 999, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: T.card, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, margin: '0 auto', padding: 28 }}>
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40 }}>✅</div>
            <div style={{ color: T.gold, fontWeight: 700, fontSize: 18, margin: '12px 0' }}>Transfer Sealed</div>
            <div style={{ color: T.muted, fontSize: 12 }}>Kòwè: {done.koweHash}</div>
            <div style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>Ask the Griot for your receipt.</div>
            <button onClick={onClose} style={{ marginTop: 20, background: T.gold, color: '#000', border: 'none', borderRadius: 12, padding: '12px 32px', fontWeight: 700, cursor: 'pointer', width: '100%' }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ color: T.gold, fontWeight: 700, fontSize: 16 }}>💸 Send Cowrie</span>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            {(['Recipient AfroID', 'Amount (CWR)', 'Reason (optional)'] as const).map((ph, i) => (
              <input key={ph} placeholder={ph} type={i === 1 ? 'number' : 'text'}
                value={i === 0 ? toId : i === 1 ? amount : reason}
                onChange={e => { if (i === 0) setToId(e.target.value); else if (i === 1) setAmount(e.target.value); else setReason(e.target.value) }}
                style={{ width: '100%', background: T.pill, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 16px', color: T.text, marginBottom: 12, fontSize: 14, boxSizing: 'border-box' }} />
            ))}
            <button onClick={send} disabled={sending || !toId || !amount}
              style={{ background: sending ? T.muted : T.gold, color: '#000', border: 'none', borderRadius: 12, padding: '14px 0', fontWeight: 700, cursor: 'pointer', width: '100%', fontSize: 15 }}>
              {sending ? 'Sending…' : '🌊 Send Cowrie'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── VaultTab ────────────────────────────────────────────────────────────── */
function VaultTab({ showSend }: { showSend: () => void }) {
  const user = useAuthStore(s => s.user)
  const myAfroId = user?.afroId?.raw || 'anonymous'
  const [bal, setBal] = React.useState<Balance | null>(null)
  const [ledger, setLedger] = React.useState<LedgerEntry[]>([])
  const [offline, setOffline] = React.useState(false)
  const marketDay = getTodayMarketDay()
  const meta = MARKET_DAY_META[marketDay]
  const tier = UBUNTU_SCORE_TIERS.find(t => (bal?.ubuntuScore ?? 0) >= t.min && (bal?.ubuntuScore ?? 0) <= t.max) ?? UBUNTU_SCORE_TIERS[0]
  const proverb = React.useMemo(() => {
    const p = AFRICAN_BANKING_PROVERBS[Math.floor(Math.random() * AFRICAN_BANKING_PROVERBS.length)]
    return `${p.text} — ${p.origin}`
  }, [])

  React.useEffect(() => {
    fetch(`/api/cowrie/balance?afroId=${myAfroId}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(setBal)
      .catch(() => setOffline(true))
    fetch(`/api/cowrie/ledger?afroId=${myAfroId}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => setLedger(d.entries ?? []))
      .catch(() => {})
  }, [])

  const score = bal?.ubuntuScore ?? 620

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {offline && (
        <div style={{ background: 'rgba(212,160,23,.1)', border: '1px solid rgba(212,160,23,.3)', color: '#d4a017', borderRadius: 12, padding: '12px 16px', fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
          Banking services are currently offline. Balances shown may not be current.
        </div>
      )}
      {/* Market Day banner */}
      <div style={{ background: `linear-gradient(135deg, ${meta.color}22, ${T.card})`, border: `1px solid ${meta.color}44`, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 28 }}>{meta.emoji}</span>
        <div>
          <div style={{ color: meta.color, fontWeight: 700, fontSize: 14 }}>{marketDay} Day · {meta.bonus}</div>
          <div style={{ color: T.muted, fontSize: 12 }}>{meta.description}</div>
        </div>
      </div>

      {/* Balance hero */}
      <Card style={{ background: 'linear-gradient(135deg, #1A1500, #0D0D0D)', borderColor: T.gold + '44' }}>
        <div style={{ color: T.muted, fontSize: 11, marginBottom: 4 }}>COWRIE BALANCE</div>
        <div style={{ color: T.gold, fontSize: 38, fontWeight: 900, letterSpacing: -1 }}>
          🫙 {(bal?.cowrie ?? 12_400).toLocaleString()} <span style={{ fontSize: 16 }}>CWR</span>
        </div>
        <div style={{ color: T.muted, fontSize: 12, marginTop: 6 }}>
          🪙 {(bal?.afriCoin ?? 0.0085).toFixed(4)} AFC  ·  🔒 {(bal?.held ?? 3000).toLocaleString()} held in escrow
        </div>
        <Divider />
        {/* Ubuntu Score */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>Ubuntu Score</span>
          <span style={{ color: tier.color, fontSize: 13, fontWeight: 700 }}>{score} · {tier.label}</span>
        </div>
        <ProgressBar value={score} max={1000} color={tier.color} />
        <div style={{ color: T.muted, fontSize: 10, marginTop: 6 }}>{tier.desc}</div>
      </Card>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <ActionBtn emoji="💸" label="Send" onClick={showSend} />
        <ActionBtn emoji="📥" label="Receive" color={T.blue} />
        <ActionBtn emoji="🛒" label="Buy CWR" color={T.green} />
        <ActionBtn emoji="🌧" label="Spray" color={T.purple} />
      </div>

      {/* FX strip */}
      <Card>
        <SectionTitle>Exchange Rates</SectionTitle>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { pair: 'CWR/NGN', rate: '₦0.42' }, { pair: 'CWR/GHS', rate: '₵0.18' },
            { pair: 'CWR/KES', rate: 'KSh 5.2' }, { pair: 'AFC/NGN', rate: '₦1,420' },
          ].map(f => (
            <div key={f.pair} style={{ background: T.pill, borderRadius: 12, padding: '10px 16px', whiteSpace: 'nowrap' }}>
              <div style={{ color: T.gold, fontSize: 12, fontWeight: 700 }}>{f.pair}</div>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 800 }}>{f.rate}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Kòwè receipts */}
      <Card>
        <SectionTitle>Recent Kòwè Receipts</SectionTitle>
        {ledger.slice(0, 5).map(e => (
          <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
            <div>
              <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{e.label}</div>
              <div style={{ color: T.muted, fontSize: 10 }}>{e.koweHash?.slice(0, 20)}…</div>
            </div>
            <span style={{ color: e.amount > 0 ? T.green : T.red, fontWeight: 700, fontSize: 14 }}>
              {e.amount > 0 ? '+' : ''}{e.amount.toLocaleString()}
            </span>
          </div>
        ))}
        {!ledger.length && <div style={{ color: T.muted, fontSize: 12, textAlign: 'center', padding: 20 }}>No transactions yet.</div>}
      </Card>

      {/* Proverb */}
      <div style={{ color: T.muted, fontSize: 12, fontStyle: 'italic', textAlign: 'center', padding: '8px 16px' }}>
        "{proverb}"
      </div>
    </div>
  )
}

/* ─── AjoTab ─────────────────────────────────────────────────────────────── */
function AjoTab() {
  const user = useAuthStore(s => s.user)
  const myAfroId = user?.afroId?.raw || 'anonymous'
  const [circles, setCircles] = React.useState<AjoCircle[]>([])
  const [showCreate, setShowCreate] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', amount: '', cadence: 'MONTHLY' })
  const [offline, setOffline] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/ajo?type=circles')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => setCircles(d.circles ?? []))
      .catch(() => setOffline(true))
  }, [])

  async function createCircle() {
    const res = await fetch('/api/ajo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, organiserAfroId: myAfroId }),
    })
    const data = await res.json()
    if (data.ok) setShowCreate(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {offline && (
        <div style={{ background: 'rgba(212,160,23,.1)', border: '1px solid rgba(212,160,23,.3)', color: '#d4a017', borderRadius: 12, padding: '12px 16px', fontSize: 12, fontWeight: 600 }}>
          Ajo Circle service is temporarily unavailable. Please try again shortly.
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: T.gold, fontWeight: 800, fontSize: 20 }}>🔄 Ajo 3.0</div>
          <div style={{ color: T.muted, fontSize: 12 }}>Rotating savings — your community is your bank</div>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{ background: T.gold, color: '#000', border: 'none', borderRadius: 12, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          + New Circle
        </button>
      </div>

      {showCreate && (
        <Card style={{ borderColor: T.gold + '44' }}>
          <SectionTitle>Draw the Circle</SectionTitle>
          <input placeholder="Circle name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            style={{ width: '100%', background: T.pill, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', color: T.text, marginBottom: 10, boxSizing: 'border-box' }} />
          <input placeholder="Amount per cycle (CWR)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
            style={{ width: '100%', background: T.pill, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', color: T.text, marginBottom: 10, boxSizing: 'border-box' }} />
          <select value={form.cadence} onChange={e => setForm({ ...form, cadence: e.target.value })}
            style={{ width: '100%', background: T.pill, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', color: T.text, marginBottom: 14, boxSizing: 'border-box' }}>
            <option value="WEEKLY">Weekly</option>
            <option value="FORTNIGHTLY">Fortnightly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="MARKET_DAY">Market Day (Igbo 4-day cycle)</option>
          </select>
          <button onClick={createCircle} style={{ background: T.gold, color: '#000', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, cursor: 'pointer', width: '100%' }}>
            🔥 Seal the Circle
          </button>
        </Card>
      )}

      {circles.map(c => (
        <Card key={c.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{c.name}</div>
              <div style={{ color: T.muted, fontSize: 11 }}>{c.cadence} · {c.memberCount} members · Market Day: {c.marketDay}</div>
            </div>
            <Chip label={c.status} color={c.status === 'ACTIVE' ? T.green : T.amber} />
          </div>

          <StatGrid items={[
            { label: 'Pot Size', value: `${c.potSize.toLocaleString()} CWR`, color: T.gold },
            { label: 'My Position', value: `#${c.myPosition}`, color: T.blue },
            { label: 'Round', value: `${c.currentRound}/${c.totalRounds}` },
          ]} />

          <div style={{ marginTop: 14 }}>
            <div style={{ color: T.muted, fontSize: 11, marginBottom: 6 }}>ROTATION PROGRESS</div>
            <ProgressBar value={c.currentRound} max={c.totalRounds} color={T.gold} />
            <div style={{ color: T.muted, fontSize: 10, marginTop: 4 }}>
              Next payout → {c.nextPayoutAfroId}  ·  Next contribution: {new Date(c.nextContributionDate).toLocaleDateString()}
            </div>
          </div>

          {c.members.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ color: T.muted, fontSize: 11, marginBottom: 8 }}>MEMBERS</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {c.members.map(m => (
                  <div key={m.afroId} style={{ background: m.paid ? T.green + '22' : T.red + '22', border: `1px solid ${m.paid ? T.green : T.red}44`, borderRadius: 10, padding: '6px 12px', fontSize: 11 }}>
                    <span style={{ color: T.text }}>{m.afroId}</span>
                    <span style={{ color: T.muted }}> #{m.position}</span>
                    {m.paid && <span style={{ color: T.green }}> ✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}

      {!circles.length && (
        <div style={{ textAlign: 'center', color: T.muted, fontSize: 13, padding: 40 }}>
          No circles yet. Draw the first one.
        </div>
      )}
    </div>
  )
}

/* ─── HarambeeTab ─────────────────────────────────────────────────────────── */
function HarambeeTab() {
  const [pools, setPools] = React.useState<HarambeePool[]>([])
  const [contributing, setContributing] = React.useState<string | null>(null)
  const [amount, setAmount] = React.useState('')

  React.useEffect(() => {
    fetch('/api/ajo?type=pools').then(r => r.json()).then(d => setPools(d.pools ?? [])).catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ color: T.gold, fontWeight: 800, fontSize: 20 }}>🤝 Harambee</div>
        <div style={{ color: T.muted, fontSize: 12 }}>Community fundraising — "Let us pull together" (Swahili)</div>
      </div>

      {pools.map(p => (
        <Card key={p.id}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>{p.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{p.title}</div>
              <div style={{ color: T.muted, fontSize: 11 }}>by {p.organiser} · {p.contributorCount} contributors · {p.daysLeft}d left</div>
            </div>
            <Chip label={p.scope} color={T.blue} />
          </div>

          <div style={{ color: T.muted, fontSize: 12, marginBottom: 12 }}>{p.description}</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: T.text, fontWeight: 600 }}>{p.raisedCowrie.toLocaleString()} CWR raised</span>
            <span style={{ color: T.muted, fontSize: 12 }}>Goal: {p.goalCowrie.toLocaleString()}</span>
          </div>
          <ProgressBar value={p.raisedCowrie} max={p.goalCowrie} color={T.green} />

          {contributing === p.id ? (
            <div style={{ marginTop: 14 }}>
              <input placeholder="Amount (CWR)" type="number" value={amount} onChange={e => setAmount(e.target.value)}
                style={{ width: '100%', background: T.pill, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', color: T.text, marginBottom: 10, boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setContributing(null)} style={{ background: T.pill, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 0', cursor: 'pointer', flex: 1 }}>Cancel</button>
                <button style={{ background: T.green, color: '#000', border: 'none', borderRadius: 10, padding: '10px 0', fontWeight: 700, cursor: 'pointer', flex: 2 }}>🤝 Contribute</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setContributing(p.id)} style={{ marginTop: 14, background: T.green + '22', color: T.green, border: `1px solid ${T.green}44`, borderRadius: 12, padding: '10px 0', fontWeight: 700, cursor: 'pointer', width: '100%' }}>
              🤝 Contribute to Pool
            </button>
          )}
        </Card>
      ))}

      {!pools.length && (
        <div style={{ textAlign: 'center', color: T.muted, fontSize: 13, padding: 40 }}>
          No active pools. Create the first Harambee.
        </div>
      )}

      <button style={{ background: T.pill, border: `1px dashed ${T.border}`, borderRadius: 16, padding: '16px 0', color: T.muted, fontWeight: 600, cursor: 'pointer' }}>
        + Create New Harambee Pool
      </button>
    </div>
  )
}

/* ─── SeasonVaultTab ─────────────────────────────────────────────────────── */
function SeasonVaultTab() {
  const [selected, setSelected] = React.useState<string | null>(null)
  const [lockAmount, setLockAmount] = React.useState('')

  const vaults = [
    { id: 'spring', name: 'Planting Season', daysLocked: 90, interestPct: 5, emoji: '🌱', desc: 'Lock for 3 moons. Harvest with interest.' },
    { id: 'rainy', name: 'Rainy Harvest', daysLocked: 180, interestPct: 10, emoji: '🌧', desc: 'Lock for 6 moons. Long rain brings great harvest.' },
    { id: 'dry', name: 'Dry Season Vault', daysLocked: 365, interestPct: 18, emoji: '☀️', desc: 'Lock for a full year. The patient farmer eats best.' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ color: T.gold, fontWeight: 800, fontSize: 20 }}>🌾 Season Vault</div>
        <div style={{ color: T.muted, fontSize: 12 }}>Grain Bank — time-lock savings, borrow against harvest</div>
      </div>

      {vaults.map(v => (
        <Card key={v.id} style={{ borderColor: selected === v.id ? T.gold + '88' : T.border }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 36 }}>{v.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{v.name}</div>
              <div style={{ color: T.muted, fontSize: 12 }}>{v.desc}</div>
            </div>
          </div>
          <StatGrid items={[
            { label: 'Lock Period', value: `${v.daysLocked}d`, color: T.blue },
            { label: 'Interest', value: `+${v.interestPct}%`, color: T.green },
            { label: 'Borrow Up To', value: '60%', color: T.amber },
          ]} />
          {selected === v.id ? (
            <div style={{ marginTop: 14 }}>
              <input placeholder="Amount to lock (CWR)" type="number" value={lockAmount} onChange={e => setLockAmount(e.target.value)}
                style={{ width: '100%', background: T.pill, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', color: T.text, marginBottom: 10, boxSizing: 'border-box' }} />
              {lockAmount && (
                <div style={{ color: T.muted, fontSize: 11, marginBottom: 10 }}>
                  At Harvest: <span style={{ color: T.gold }}>{Math.floor(parseInt(lockAmount || '0') * (1 + v.interestPct / 100)).toLocaleString()} CWR</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSelected(null)} style={{ background: T.pill, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 0', cursor: 'pointer', flex: 1 }}>Cancel</button>
                <button style={{ background: T.gold, color: '#000', border: 'none', borderRadius: 10, padding: '10px 0', fontWeight: 700, cursor: 'pointer', flex: 2 }}>🌾 Lock in Vault</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setSelected(v.id)} style={{ marginTop: 14, background: T.pill, color: T.text, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 0', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
              Open This Vault
            </button>
          )}
        </Card>
      ))}
    </div>
  )
}

/* ─── PotTab ─────────────────────────────────────────────────────────────── */
function PotTab() {
  const user = useAuthStore(s => s.user)
  const myAfroId = user?.afroId?.raw || 'anonymous'
  const [pots, setPots] = React.useState<EscrowPot[]>([])
  const [showCreate, setShowCreate] = React.useState(false)
  const [form, setForm] = React.useState({ sellerAfroId: '', amountCowrie: '', escrowType: 'MARKETPLACE_HOLD', description: '' })
  const [offline, setOffline] = React.useState(false)

  React.useEffect(() => {
    fetch(`/api/ogbo?afroId=${myAfroId}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => setPots(d.pots ?? []))
      .catch(() => setOffline(true))
  }, [])

  const STATES = ['CREATED', 'HELD', 'PENDING_VERIFICATION', 'COMMITTED', 'SETTLED', 'REVERSED', 'DISPUTED', 'EXPIRED']
  const STATE_COLORS: Record<string, string> = { HELD: T.blue, PENDING_VERIFICATION: T.amber, COMMITTED: T.green, SETTLED: T.green, REVERSED: T.red, DISPUTED: T.red }

  async function createPot() {
    await fetch('/api/ogbo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', buyerAfroId: myAfroId, ...form, amountCowrie: parseInt(form.amountCowrie) }),
    })
    setShowCreate(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {offline && (
        <div style={{ background: 'rgba(212,160,23,.1)', border: '1px solid rgba(212,160,23,.3)', color: '#d4a017', borderRadius: 12, padding: '12px 16px', fontSize: 12, fontWeight: 600 }}>
          Escrow service is temporarily unavailable. Your active pots are safe and will resume shortly.
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: T.gold, fontWeight: 800, fontSize: 20 }}>🏺 Ogbo Ụtụ Escrow</div>
          <div style={{ color: T.muted, fontSize: 12 }}>8-state Pot Ritual — Proof of Hand required</div>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{ background: T.gold, color: '#000', border: 'none', borderRadius: 12, padding: '10px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
          + New Pot
        </button>
      </div>

      {/* State machine visual */}
      <Card>
        <SectionTitle>Pot State Machine</SectionTitle>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {STATES.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ background: T.pill, borderRadius: 8, padding: '6px 10px', whiteSpace: 'nowrap', fontSize: 10, color: STATE_COLORS[s] ?? T.muted, fontWeight: 600 }}>{s}</div>
              {i < STATES.length - 1 && <span style={{ color: T.border, alignSelf: 'center' }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {showCreate && (
        <Card style={{ borderColor: T.gold + '44' }}>
          <SectionTitle>Seal a New Pot</SectionTitle>
          {[
            { ph: 'Seller AfroID', key: 'sellerAfroId' as const },
            { ph: 'Amount (CWR)', key: 'amountCowrie' as const },
            { ph: 'Description', key: 'description' as const },
          ].map(f => (
            <input key={f.key} placeholder={f.ph} type={f.key === 'amountCowrie' ? 'number' : 'text'}
              value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              style={{ width: '100%', background: T.pill, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', color: T.text, marginBottom: 10, boxSizing: 'border-box' }} />
          ))}
          <select value={form.escrowType} onChange={e => setForm({ ...form, escrowType: e.target.value })}
            style={{ width: '100%', background: T.pill, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', color: T.text, marginBottom: 14, boxSizing: 'border-box' }}>
            <option value="MARKETPLACE_HOLD">Marketplace Hold</option>
            <option value="SERVICE_HOLD">Service Hold</option>
            <option value="LAND_DEAL">Land Deal</option>
            <option value="HONOR_BOND">Honour Bond</option>
          </select>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowCreate(false)} style={{ background: T.pill, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 0', cursor: 'pointer', flex: 1 }}>Cancel</button>
            <button onClick={createPot} style={{ background: T.gold, color: '#000', border: 'none', borderRadius: 10, padding: '10px 0', fontWeight: 700, cursor: 'pointer', flex: 2 }}>🏺 Seal Pot</button>
          </div>
        </Card>
      )}

      {pots.map(p => (
        <Card key={p.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ color: T.text, fontWeight: 700 }}>{p.description}</div>
              <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{p.buyerAfroId} ↔ {p.sellerAfroId}</div>
            </div>
            <Chip label={p.state} color={STATE_COLORS[p.state] ?? T.muted} />
          </div>
          <div style={{ color: T.gold, fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{p.amountCowrie.toLocaleString()} CWR</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <NkisiBadge level={p.buyerNkisi} />
            <NkisiBadge level={p.sellerNkisi} />
          </div>
          <div style={{ color: T.muted, fontSize: 10, marginTop: 8 }}>Hash: {p.eventHash?.slice(0, 24)}…</div>
          {p.state === 'HELD' && (
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button style={{ background: T.green + '22', color: T.green, border: `1px solid ${T.green}44`, borderRadius: 10, padding: '8px 0', fontWeight: 600, cursor: 'pointer', flex: 1, fontSize: 12 }}>✅ Submit Proof</button>
              <button style={{ background: T.red + '22', color: T.red, border: `1px solid ${T.red}44`, borderRadius: 10, padding: '8px 0', fontWeight: 600, cursor: 'pointer', flex: 1, fontSize: 12 }}>⚖️ Dispute</button>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

/* ─── OralLedgerTab ──────────────────────────────────────────────────────── */
function OralLedgerTab() {
  const user = useAuthStore(s => s.user)
  const myAfroId = user?.afroId?.raw || 'anonymous'
  const [entries, setEntries] = React.useState<LedgerEntry[]>([])
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    fetch(`/api/cowrie/ledger?afroId=${myAfroId}`).then(r => r.json()).then(d => setEntries(d.entries ?? [])).catch(() => {})
  }, [])

  const filtered = entries.filter(e =>
    !search || e.label.toLowerCase().includes(search.toLowerCase()) || e.koweHash?.includes(search)
  )

  const TYPE_COLORS: Record<string, string> = {
    CREDIT: T.green, DEBIT: T.red, SPRAY: T.purple, ESCROW_LOCK: T.amber,
    ESCROW_RELEASE: T.green, AJO_CONTRIBUTION: T.blue, SEASON_LOCK: T.gold, CORRIDOR_SEND: T.blue,
  }

  const totalIn = entries.filter(e => e.amount > 0).reduce((s, e) => s + e.amount, 0)
  const totalOut = entries.filter(e => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ color: T.gold, fontWeight: 800, fontSize: 20 }}>📜 Oral Ledger</div>
        <div style={{ color: T.muted, fontSize: 12 }}>Every transaction sealed with Kòwè — the Griot remembers all</div>
      </div>

      {/* AI Griot summary */}
      <Card style={{ background: 'linear-gradient(135deg, #1A1000, #0D0D0D)', borderColor: T.gold + '44' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 28 }}>🦅</span>
          <div>
            <div style={{ color: T.gold, fontWeight: 700, fontSize: 13 }}>Griot AI Spending Summary</div>
            <div style={{ color: T.text, fontSize: 12, marginTop: 4 }}>
              You received <span style={{ color: T.green }}>+{totalIn.toLocaleString()} CWR</span> and sent{' '}
              <span style={{ color: T.red }}>-{totalOut.toLocaleString()} CWR</span> this cycle. Your Ajo circle is your strongest savings habit.
            </div>
          </div>
        </div>
      </Card>

      <StatGrid items={[
        { label: 'Total In', value: `+${totalIn.toLocaleString()}`, color: T.green },
        { label: 'Total Out', value: `-${totalOut.toLocaleString()}`, color: T.red },
        { label: 'Transactions', value: entries.length },
      ]} />

      <input placeholder="Search by label or Kòwè hash…" value={search} onChange={e => setSearch(e.target.value)}
        style={{ background: T.pill, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 16px', color: T.text, width: '100%', boxSizing: 'border-box' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.map(e => (
          <div key={e.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <Chip label={e.eventType || e.type} color={TYPE_COLORS[e.eventType || e.type] ?? T.muted} />
                <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{e.label}</span>
              </div>
              <div style={{ color: T.muted, fontSize: 10 }}>{e.koweHash?.slice(0, 22)}…  ·  {new Date(e.timestamp).toLocaleDateString()}</div>
            </div>
            <span style={{ color: e.amount > 0 ? T.green : T.red, fontWeight: 700, fontSize: 15, marginLeft: 12 }}>
              {e.amount > 0 ? '+' : ''}{e.amount.toLocaleString()}
            </span>
          </div>
        ))}
        {!filtered.length && <div style={{ color: T.muted, fontSize: 13, textAlign: 'center', padding: 30 }}>No entries found.</div>}
      </div>
    </div>
  )
}

/* ─── CorridorTab ────────────────────────────────────────────────────────── */
function CorridorTab() {
  const [selected, setSelected] = React.useState<CorridorRail | null>(null)
  const [amount, setAmount] = React.useState('')
  const [recipient, setRecipient] = React.useState('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ color: T.gold, fontWeight: 800, fontSize: 20 }}>🌍 TLP Corridors</div>
        <div style={{ color: T.muted, fontSize: 12 }}>Remittance rails — send home, receive from diaspora</div>
      </div>

      <Card style={{ background: 'linear-gradient(135deg, #001A1A, #0D0D0D)', borderColor: T.blue + '44' }}>
        <div style={{ color: T.blue, fontSize: 12, fontWeight: 600 }}>💡 Corridor Fact</div>
        <div style={{ color: T.text, fontSize: 12, marginTop: 4 }}>Africans in the diaspora send over $100 billion home annually — more than foreign aid. AFRO corridors charge 70% less than traditional banks.</div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CORRIDOR_RAILS.map(r => (
          <div key={r.key} onClick={() => setSelected(r.key === selected?.key ? null : r)}
            style={{ background: selected?.key === r.key ? T.gold + '11' : T.card, border: `1px solid ${selected?.key === r.key ? T.gold + '88' : T.border}`, borderRadius: 14, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>{r.flag}</span>
                <div>
                  <div style={{ color: T.text, fontWeight: 700 }}>{r.label}</div>
                  <div style={{ color: T.muted, fontSize: 11 }}>{r.fullName}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: T.green, fontWeight: 700, fontSize: 13 }}>Fee: {(r.feePct * 100).toFixed(1)}%</div>
                <div style={{ color: T.muted, fontSize: 10 }}>ETA: {r.etaMinutes < 60 ? `${r.etaMinutes}min` : `${Math.round(r.etaMinutes / 60)}h`}</div>
              </div>
            </div>

            {selected?.key === r.key && (
              <div style={{ marginTop: 14 }}>
                <Divider />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {(r.countries as readonly string[]).map(c => <Chip key={c} label={c} color={T.blue} />)}
                </div>
                <input placeholder="Recipient AfroID or phone" value={recipient} onChange={e => setRecipient(e.target.value)}
                  style={{ width: '100%', background: T.pill, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', color: T.text, marginBottom: 10, boxSizing: 'border-box' }} />
                <input placeholder="Amount (CWR)" type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  style={{ width: '100%', background: T.pill, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', color: T.text, marginBottom: 10, boxSizing: 'border-box' }} />
                {amount && (
                  <div style={{ color: T.muted, fontSize: 11, marginBottom: 10 }}>
                    Fee: <span style={{ color: T.amber }}>{Math.ceil(parseInt(amount || '0') * r.feePct)} CWR</span>  ·
                    Recipient receives: <span style={{ color: T.green }}>{Math.floor(parseInt(amount || '0') * (1 - r.feePct)).toLocaleString()} CWR</span>
                  </div>
                )}
                <button style={{ background: T.gold, color: '#000', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                  🌍 Send via {r.label}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── SpiritVaultTab ─────────────────────────────────────────────────────── */
function SpiritVaultTab() {
  const heirs = [
    { name: 'Adaeze Okafor', afroId: 'adaeze-okafor', relation: 'Daughter', amount: 5000, unlock: 'Naming Ceremony', witnesses: ['Elder Chukwu', 'Elder Ngozi', 'Elder Emeka'] },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ color: T.gold, fontWeight: 800, fontSize: 20 }}>🕯 Spirit Vault</div>
        <div style={{ color: T.muted, fontSize: 12 }}>Ancestral inheritance — wealth held in trust for your descendants</div>
      </div>

      <Card style={{ background: 'linear-gradient(135deg, #1A0030, #0D0D0D)', borderColor: T.purple + '44' }}>
        <div style={{ color: T.purple, fontSize: 12, fontWeight: 600 }}>🌙 Ancestral Wisdom</div>
        <div style={{ color: T.text, fontSize: 12, marginTop: 4 }}>
          "Wealth not inherited is wealth wasted. Wealth inherited without ceremony is wealth cursed." — Elder Council Proverb
        </div>
        <div style={{ color: T.muted, fontSize: 11, marginTop: 8 }}>
          Spirit Vaults require 3 Elder witnesses (Crest IV+) to create. Funds auto-transfer on the unlock trigger.
        </div>
      </Card>

      {heirs.map((h, i) => (
        <Card key={i} style={{ borderColor: T.purple + '44' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{h.name}</div>
              <div style={{ color: T.muted, fontSize: 11 }}>{h.relation} · {h.afroId}</div>
            </div>
            <div style={{ color: T.purple, fontWeight: 800, fontSize: 18 }}>{h.amount.toLocaleString()} CWR</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ color: T.muted, fontSize: 11 }}>Unlock trigger:</span>
            <Chip label={h.unlock} color={T.purple} />
          </div>

          <div>
            <div style={{ color: T.muted, fontSize: 11, marginBottom: 6 }}>ELDER WITNESSES</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {h.witnesses.map(w => (
                <div key={w} style={{ background: T.purple + '22', border: `1px solid ${T.purple}44`, borderRadius: 8, padding: '4px 10px', fontSize: 11, color: T.text }}>
                  ⚖️ {w}
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}

      <button style={{ background: T.pill, border: `1px dashed ${T.purple}`, borderRadius: 16, padding: '16px 0', color: T.purple, fontWeight: 600, cursor: 'pointer' }}>
        + Create Spirit Vault (requires 3 Elders)
      </button>
    </div>
  )
}

/* ─── ElderCouncilTab ────────────────────────────────────────────────────── */
function ElderCouncilTab() {
  const disputes = [
    { id: 'dispute-001', category: 'Escrow', parties: ['citizen-alpha', 'bro-kwame-artisan'], description: 'Logo design delivered but buyer claims inconsistent with brief.', status: 'OPEN', timeLeft: '48h', votes: { release: 2, revert: 1 } },
    { id: 'dispute-002', category: 'Ajo', parties: ['mama-ngozi', 'sis-amara'], description: 'Member missed 3 consecutive contributions without notice.', status: 'ESCALATED', timeLeft: '12h', votes: { release: 4, revert: 1 } },
  ]

  const STATUS_COLORS: Record<string, string> = { OPEN: T.amber, ESCALATED: T.red, RESOLVED: T.green }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ color: T.gold, fontWeight: 800, fontSize: 20 }}>⚖️ Elder Council</div>
        <div style={{ color: T.muted, fontSize: 12 }}>Community dispute resolution — wisdom over courts</div>
      </div>

      <Card style={{ background: 'linear-gradient(135deg, #1A1000, #0D0D0D)', borderColor: T.amber + '44' }}>
        <div style={{ color: T.amber, fontSize: 12, fontWeight: 600 }}>⚖️ Elder Council Protocol</div>
        <div style={{ color: T.text, fontSize: 12, marginTop: 4 }}>
          Disputes auto-escalate to Super-Elders after 72 hours. Crest IV+ required to vote. Majority rules. Losing party receives Ubuntu Score deduction.
        </div>
      </Card>

      <StatGrid items={[
        { label: 'Open Cases', value: 2, color: T.amber },
        { label: 'Resolved This Moon', value: 7, color: T.green },
        { label: 'Avg. Resolution', value: '18h', color: T.blue },
      ]} />

      {disputes.map(d => (
        <Card key={d.id} style={{ borderColor: STATUS_COLORS[d.status] + '44' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <Chip label={d.category} color={T.blue} />
                <Chip label={d.status} color={STATUS_COLORS[d.status]} />
              </div>
              <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{d.description}</div>
            </div>
            <div style={{ color: d.status === 'ESCALATED' ? T.red : T.amber, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 10 }}>⏱ {d.timeLeft}</div>
          </div>

          <div style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>
            Parties: {d.parties.join(' vs ')}
          </div>

          <div style={{ background: T.pill, borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: T.green, fontSize: 12 }}>✅ Release ({d.votes.release})</span>
              <span style={{ color: T.red, fontSize: 12 }}>↩️ Revert ({d.votes.revert})</span>
            </div>
            <ProgressBar value={d.votes.release} max={d.votes.release + d.votes.revert} color={T.green} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ background: T.green + '22', color: T.green, border: `1px solid ${T.green}44`, borderRadius: 10, padding: '10px 0', fontWeight: 600, cursor: 'pointer', flex: 1, fontSize: 12 }}>✅ Vote Release</button>
            <button style={{ background: T.red + '22', color: T.red, border: `1px solid ${T.red}44`, borderRadius: 10, padding: '10px 0', fontWeight: 600, cursor: 'pointer', flex: 1, fontSize: 12 }}>↩️ Vote Revert</button>
          </div>
        </Card>
      ))}
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'vault', emoji: '🪙', label: 'Vault' },
  { id: 'ajo', emoji: '🔄', label: 'Ajo 3.0' },
  { id: 'harambee', emoji: '🤝', label: 'Harambee' },
  { id: 'season', emoji: '🌾', label: 'Season Vault' },
  { id: 'pot', emoji: '🏺', label: 'Pot (Escrow)' },
  { id: 'ledger', emoji: '📜', label: 'Oral Ledger' },
  { id: 'corridor', emoji: '🌍', label: 'Corridors' },
  { id: 'spirit', emoji: '🕯', label: 'Spirit Vault' },
  { id: 'council', emoji: '⚖️', label: 'Elder Council' },
]

export default function BankingPage() {
  const [activeTab, setActiveTab] = React.useState('vault')
  const [showSend, setShowSend] = React.useState(false)

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, fontFamily: 'system-ui, sans-serif', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: T.bg, borderBottom: `1px solid ${T.border}`, padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: 22 }}>🏦 AFRO Banking</div>
            <div style={{ color: T.muted, fontSize: 11 }}>Built on 5,000 years of African financial wisdom</div>
          </div>
          <div style={{ background: T.gold + '22', border: `1px solid ${T.gold}44`, borderRadius: 12, padding: '6px 12px', fontSize: 11, color: T.gold, fontWeight: 700 }}>
            {(() => { const m = getTodayMarketDay(); return `${MARKET_DAY_META[m].emoji} ${m} Day` })()}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? T.gold : 'transparent',
                color: activeTab === t.id ? '#000' : T.muted,
                border: 'none',
                borderRadius: '12px 12px 0 0',
                padding: '10px 14px',
                cursor: 'pointer',
                fontWeight: activeTab === t.id ? 700 : 400,
                fontSize: 12,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
        {activeTab === 'vault' && <VaultTab showSend={() => setShowSend(true)} />}
        {activeTab === 'ajo' && <AjoTab />}
        {activeTab === 'harambee' && <HarambeeTab />}
        {activeTab === 'season' && <SeasonVaultTab />}
        {activeTab === 'pot' && <PotTab />}
        {activeTab === 'ledger' && <OralLedgerTab />}
        {activeTab === 'corridor' && <CorridorTab />}
        {activeTab === 'spirit' && <SpiritVaultTab />}
        {activeTab === 'council' && <ElderCouncilTab />}
      </div>

      {showSend && <SendModal onClose={() => setShowSend(false)} />}
    </div>
  )
}
