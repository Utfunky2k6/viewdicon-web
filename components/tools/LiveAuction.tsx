'use client'
import React, { useState, useEffect } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017'

interface Bid { bidder: string; amount: number; time: string }

const INITIAL_BIDS: Bid[] = [
  { bidder: '#B3', amount: 78500, time: '14:32:18' },
  { bidder: '#K7', amount: 76000, time: '14:31:55' },
  { bidder: '#M2', amount: 73000, time: '14:30:40' },
  { bidder: '#B3', amount: 71000, time: '14:29:12' },
  { bidder: '#A9', amount: 68500, time: '14:28:00' },
]

export default function LiveAuction({ villageId, roleKey }: ToolProps) {
  const [bids, setBids] = useState<Bid[]>(INITIAL_BIDS)
  const [bidAmount, setBidAmount] = useState('')
  const [timeLeft, setTimeLeft] = useState(300)
  const [myHighest, setMyHighest] = useState(false)
  const [bidStatus, setBidStatus] = useState<'idle' | 'winning' | 'outbid'>('idle')
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0) { clearInterval(timer); return 0 }
        // Simulate a competing bid every 45 seconds
        if (t > 0 && t % 47 === 0 && bidStatus === 'winning') {
          const newBid = bids[0].amount + Math.round(Math.random() * 3000 + 1000)
          setBids(prev => [{ bidder: '#K7', amount: newBid, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)])
          setBidStatus('outbid'); setMyHighest(false)
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [bidStatus, bids])

  const currentBid = bids[0].amount
  const minBid = currentBid + 1000
  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const placeBid = () => {
    const amount = Number(bidAmount)
    if (amount < minBid) { flash(`Minimum bid is ₡${minBid.toLocaleString()}`); return }
    const now = new Date().toLocaleTimeString()
    setBids(prev => [{ bidder: '#YOU', amount, time: now }, ...prev.slice(0, 4)])
    setBidStatus('winning'); setMyHighest(true); setBidAmount('')
    flash('Bid placed! You are the highest bidder!')
  }

  const quickRebid = () => {
    const amount = currentBid + 2000
    const now = new Date().toLocaleTimeString()
    setBids(prev => [{ bidder: '#YOU', amount, time: now }, ...prev.slice(0, 4)])
    setBidStatus('winning'); setMyHighest(true)
    flash('Quick re-bid placed!')
  }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Live Auction</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 14 }}>Oṣun Craft Marketplace — Live Bidding Floor</div>

      {/* Item card */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ background: '#0f2015', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🧵</div>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Handwoven Kente Cloth Collection</div>
          <div style={{ fontSize: 12, color: muted, marginTop: 4, lineHeight: 1.5 }}>Authentic Ghanaian Kente — 6 metres, premium silk-cotton blend. Condition: New · Certified by Kumasi Weavers Guild</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <div><span style={{ color: muted, fontSize: 11 }}>Reserve Price</span><div style={{ color: gold }}>₡45,000</div></div>
            <div><span style={{ color: muted, fontSize: 11 }}>Current Bid</span><div style={{ color: green, fontWeight: 700, fontSize: 20 }}>₡{currentBid.toLocaleString()}</div></div>
            <div><span style={{ color: muted, fontSize: 11 }}>Bidders</span><div style={{ fontWeight: 700 }}>18</div></div>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div style={{ background: timeLeft < 60 ? red + '22' : '#0a1e0c', border: `2px solid ${timeLeft < 60 ? red : green}`, borderRadius: 14, padding: '14px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: muted }}>TIME REMAINING</div>
          <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'monospace', color: timeLeft < 60 ? red : text }}>{formatTime(timeLeft)}</div>
        </div>
        {timeLeft === 0 && <span style={{ color: red, fontWeight: 700, fontSize: 16 }}>AUCTION ENDED</span>}
        {timeLeft > 0 && <span style={{ color: muted, fontSize: 12 }}>🔴 LIVE</span>}
      </div>

      {/* Status banners */}
      {bidStatus === 'winning' && (
        <div style={{ background: green + '22', border: `1px solid ${green}`, borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 14, fontWeight: 700, color: green }}>
          🏆 You are the highest bidder!
        </div>
      )}
      {bidStatus === 'outbid' && (
        <div style={{ background: red + '22', border: `1px solid ${red}`, borderRadius: 10, padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: red }}>⚡ You've been outbid!</span>
          <button onClick={quickRebid} style={{ ...btn(red), color: text }}>Quick Re-Bid +₡2,000</button>
        </div>
      )}

      {/* Bid history */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, fontSize: 11, color: muted, fontWeight: 700 }}>RECENT BIDS</div>
        {bids.map((b, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: `1px solid ${border}`, background: i === 0 ? (b.bidder === '#YOU' ? green + '11' : red + '11') : 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i === 0 && <span style={{ fontSize: 10, background: i === 0 ? gold : 'none', color: '#000', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>TOP</span>}
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: b.bidder === '#YOU' ? green : text }}>{b.bidder}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: i === 0 ? 700 : 400, color: i === 0 ? gold : text }}>₡{b.amount.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: muted }}>{b.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Place bid */}
      {timeLeft > 0 && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>Min bid: ₡{minBid.toLocaleString()}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" placeholder={`₡${minBid.toLocaleString()}+`} value={bidAmount} onChange={e => setBidAmount(e.target.value)} style={{ ...inp, flex: 1, fontSize: 16 }} />
            <button onClick={placeBid} style={{ ...btn(gold), fontSize: 14, padding: '8px 20px', boxShadow: `0 0 16px ${gold}44` }}>🗣 Raise Voice</button>
          </div>
        </div>
      )}
    </div>
  )
}
