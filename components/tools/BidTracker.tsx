'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017'

type BidStatus = 'WINNING' | 'OUTBID' | 'CLOSED' | 'WON' | 'LOST'

interface ActiveBid {
  id: string; item: string; auctionHouse: string; myBid: number; highestBid: number; status: BidStatus
  timeLeft: string; maxBid: number | null; autoMax: boolean
}

interface HistoryEntry { item: string; finalPrice: number; outcome: 'WON' | 'LOST'; date: string }

const INIT_BIDS: ActiveBid[] = [
  { id: 'ab1', item: 'Kente Cloth Collection (6m)', auctionHouse: 'Kumasi Craft Market', myBid: 78500, highestBid: 82000, status: 'OUTBID', timeLeft: '04:12', maxBid: null, autoMax: false },
  { id: 'ab2', item: 'Vintage Yoruba Brass Mask', auctionHouse: 'Lagos Heritage Auction', myBid: 145000, highestBid: 145000, status: 'WINNING', timeLeft: '12:45', maxBid: 180000, autoMax: true },
  { id: 'ab3', item: 'Hand-painted Calabash Set (12pc)', auctionHouse: 'Abuja Arts Collective', myBid: 22000, highestBid: 22000, status: 'CLOSED', timeLeft: '00:00', maxBid: null, autoMax: false },
]

const HISTORY: HistoryEntry[] = [
  { item: 'Aso-oke Wedding Fabric', finalPrice: 87000, outcome: 'WON', date: '2026-03-22' },
  { item: 'Adire Resist-dyed Cloth', finalPrice: 31500, outcome: 'LOST', date: '2026-03-18' },
  { item: 'Fulani Silverwork Necklace', finalPrice: 116000, outcome: 'WON', date: '2026-03-15' },
  { item: 'Nok Terra Cotta Replica', finalPrice: 0, outcome: 'LOST', date: '2026-03-10' },
]

const statusColor: Record<BidStatus, string> = { WINNING: green, OUTBID: amber, CLOSED: muted, WON: green, LOST: red }

export default function BidTracker({ villageId, roleKey }: ToolProps) {
  const [bids, setBids] = useState<ActiveBid[]>(INIT_BIDS)
  const [rebidId, setRebidId] = useState<string | null>(null)
  const [rebidAmount, setRebidAmount] = useState('')
  const [maxInput, setMaxInput] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const totalWon = HISTORY.filter(h => h.outcome === 'WON').reduce((s, h) => s + h.finalPrice, 0)

  const rebid = (id: string) => {
    const amount = Number(rebidAmount)
    const bid = bids.find(b => b.id === id)!
    if (amount <= bid.highestBid) { flash(`Must bid above ₡${bid.highestBid.toLocaleString()}`); return }
    setBids(prev => prev.map(b => b.id === id ? { ...b, myBid: amount, highestBid: amount, status: 'WINNING' } : b))
    setRebidId(null); setRebidAmount(''); flash('Re-bid placed! 🏆 Highest bidder')
  }

  const toggleAuto = (id: string) => {
    const maxStr = maxInput[id]
    if (!maxStr) { flash('Set a max bid amount first'); return }
    setBids(prev => prev.map(b => b.id === id ? { ...b, autoMax: !b.autoMax, maxBid: b.autoMax ? null : Number(maxStr) } : b))
    flash('Auto-bid configured')
  }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '6px 12px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Bid Tracker</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 14 }}>All your active & completed bids</div>

      {/* Total spent */}
      <div style={{ background: card, border: `1px solid ${gold}`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: muted }}>Total Spent on Won Auctions</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: gold }}>₡{totalWon.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: muted }}>Active Bids</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{bids.filter(b => b.status !== 'CLOSED').length}</div>
        </div>
      </div>

      {/* Active bids */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: muted, fontWeight: 700, marginBottom: 8 }}>MY ACTIVE BIDS</div>
        {bids.map(b => (
          <div key={b.id} style={{ background: card, border: `2px solid ${b.status === 'OUTBID' ? amber : b.status === 'WINNING' ? green : border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{b.item}</div>
                <div style={{ fontSize: 11, color: muted }}>{b.auctionHouse}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[b.status], background: statusColor[b.status] + '22', padding: '3px 8px', borderRadius: 10, marginLeft: 8 }}>{b.status}</span>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              <div><div style={{ fontSize: 10, color: muted }}>My Bid</div><div style={{ fontWeight: 700, color: b.status === 'OUTBID' ? amber : text }}>₡{b.myBid.toLocaleString()}</div></div>
              <div><div style={{ fontSize: 10, color: muted }}>Highest</div><div style={{ fontWeight: 700, color: b.status === 'WINNING' ? green : gold }}>₡{b.highestBid.toLocaleString()}</div></div>
              <div><div style={{ fontSize: 10, color: muted }}>Time Left</div><div style={{ fontWeight: 700, color: b.status === 'CLOSED' ? muted : text }}>{b.timeLeft}</div></div>
            </div>

            {/* Auto-bid */}
            {b.status !== 'CLOSED' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: muted }}>Max Auto-Bid:</span>
                <input type="number" placeholder="₡ limit" value={maxInput[b.id] || ''} onChange={e => setMaxInput(m => ({ ...m, [b.id]: e.target.value }))} style={{ ...inp, width: 90, fontSize: 11 }} />
                <button onClick={() => toggleAuto(b.id)} style={{ ...btn(b.autoMax ? amber : muted), fontSize: 10, padding: '4px 8px' }}>{b.autoMax ? 'Auto ON' : 'Auto OFF'}</button>
                {b.autoMax && <span style={{ fontSize: 10, color: green }}>↑ up to ₡{b.maxBid?.toLocaleString()}</span>}
              </div>
            )}

            {b.status === 'OUTBID' && (
              <div>
                {rebidId === b.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input type="number" placeholder={`₡${(b.highestBid + 1000).toLocaleString()}+`} value={rebidAmount} onChange={e => setRebidAmount(e.target.value)} style={{ ...inp, flex: 1 }} />
                    <button onClick={() => rebid(b.id)} style={btn(amber)}>Place Re-Bid</button>
                    <button onClick={() => setRebidId(null)} style={{ ...btn(muted), background: 'none', color: muted, border: `1px solid ${border}` }}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => { setRebidId(b.id); setRebidAmount(String(b.highestBid + 1000)) }} style={{ ...btn(amber), width: '100%' }}>Re-Bid Now</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* History */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, fontSize: 11, color: muted, fontWeight: 700 }}>WON / LOST HISTORY</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 60px 90px', padding: '6px 14px', fontSize: 10, color: muted, borderBottom: `1px solid ${border}` }}>
          <span>ITEM</span><span>FINAL PRICE</span><span>RESULT</span><span>DATE</span>
        </div>
        {HISTORY.map((h, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 60px 90px', padding: '8px 14px', borderBottom: `1px solid ${border}`, fontSize: 12 }}>
            <span style={{ fontSize: 12 }}>{h.item}</span>
            <span style={{ color: gold }}>₡{h.finalPrice.toLocaleString()}</span>
            <span style={{ color: h.outcome === 'WON' ? green : red, fontWeight: 700 }}>{h.outcome}</span>
            <span style={{ color: muted }}>{h.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
