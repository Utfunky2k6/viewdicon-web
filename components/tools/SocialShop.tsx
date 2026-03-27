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

interface Product {
  id: string
  emoji: string
  name: string
  price: number
  stock: number
}

interface Pot {
  buyer: string
  item: string
  status: 'INITIATED' | 'ESCROW' | 'SHIPPED'
}

const PRODUCTS: Product[] = [
  { id: 'p1', emoji: '🧵', name: 'Ankara Fabric (3m)', price: 4500, stock: 18 },
  { id: 'p2', emoji: '📿', name: 'Beaded Necklace Set', price: 2800, stock: 7 },
  { id: 'p3', emoji: '🫙', name: 'Shea Butter (1kg)', price: 1200, stock: 42 },
  { id: 'p4', emoji: '👘', name: 'Adire Blouse (L)', price: 6300, stock: 3 },
]

const INITIAL_POTS: Pot[] = [
  { buyer: 'Buyer #A7', item: 'Ankara Fabric (3m)', status: 'ESCROW' },
  { buyer: 'Buyer #B3', item: 'Beaded Necklace Set', status: 'SHIPPED' },
  { buyer: 'Buyer #C9', item: 'Shea Butter (1kg)', status: 'INITIATED' },
]

const potStatusColor: Record<string, string> = {
  INITIATED: gold,
  ESCROW: '#5b9bd5',
  SHIPPED: green,
}

export default function SocialShop({ villageId, roleKey }: ToolProps) {
  const [isLive, setIsLive] = useState(true)
  const [pots, setPots] = useState<Pot[]>(INITIAL_POTS)
  const [showLiveModal, setShowLiveModal] = useState(false)
  const [pinned, setPinned] = useState<string | null>(null)
  const [addedPot, setAddedPot] = useState<string | null>(null)

  function addToPot(p: Product) {
    setAddedPot(p.id)
    setTimeout(() => setAddedPot(null), 1000)
    setPots(prev => [{ buyer: 'Buyer #' + String.fromCharCode(65 + Math.floor(Math.random() * 20)) + Math.floor(Math.random() * 9), item: p.name, status: 'INITIATED' }, ...prev])
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      {/* Shop header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#4caf7d,#c9a84c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#000',
        }}>MN</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Mama Ngozi's Fabrics</div>
          <div style={{ fontSize: 12, color: muted }}>Commerce · Enugu Village</div>
        </div>
        {isLive && (
          <div style={{ background: red, color: '#fff', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, animation: 'pulse 2s infinite' }}>
            ● LIVE
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[['👁 Views', '847'], ['🛒 In Cart', '23'], ['₡ Sold Today', '127K']].map(([lbl, val]) => (
          <div key={lbl} style={{ flex: 1, background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: muted }}>{lbl}</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Products 2x2 */}
      <div style={{ fontSize: 13, color: muted, marginBottom: 10 }}>Products</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {PRODUCTS.map(p => (
          <div key={p.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>{p.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, textAlign: 'center' }}>{p.name}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: gold, textAlign: 'center', marginBottom: 2 }}>₡{p.price.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: muted, textAlign: 'center', marginBottom: 10 }}>Stock: {p.stock}</div>
            <button
              onClick={() => addToPot(p)}
              style={{
                background: addedPot === p.id ? green : '#1a4d2e',
                color: addedPot === p.id ? '#000' : green,
                border: `1px solid ${green}`, borderRadius: 8,
                padding: '7px 0', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'background 0.3s',
              }}
            >
              {addedPot === p.id ? '✓ Added!' : 'Add to Pot 🫙'}
            </button>
          </div>
        ))}
      </div>

      {/* Go Live button */}
      <button
        onClick={() => setShowLiveModal(true)}
        style={{
          width: '100%', background: `linear-gradient(90deg, ${gold}, #e8a020)`,
          color: '#000', border: 'none', borderRadius: 12,
          padding: '14px 0', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 20,
        }}
      >
        🎙 Go Live & Sell
      </button>

      {/* Active Pots */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, color: muted, marginBottom: 10 }}>Active Pots 🫙</div>
        {pots.slice(0, 5).map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.buyer}</div>
              <div style={{ fontSize: 11, color: muted }}>{p.item}</div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: potStatusColor[p.status], background: potStatusColor[p.status] + '22', borderRadius: 20, padding: '3px 8px' }}>
              {p.status}
            </div>
          </div>
        ))}
      </div>

      {/* Live modal */}
      {showLiveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: card, borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 480 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Go Live & Sell</div>
            <div style={{ fontSize: 13, color: muted, marginBottom: 10 }}>Pin a product to your stream</div>
            {PRODUCTS.map(p => (
              <div
                key={p.id}
                onClick={() => setPinned(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px',
                  borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                  background: pinned === p.id ? green + '22' : bg,
                  border: `1px solid ${pinned === p.id ? green : border}`,
                }}
              >
                <span style={{ fontSize: 20 }}>{p.emoji}</span>
                <span style={{ flex: 1, fontSize: 14 }}>{p.name}</span>
                <span style={{ color: gold, fontWeight: 700 }}>₡{p.price.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowLiveModal(false)} style={{ flex: 1, padding: 12, border: `1px solid ${border}`, borderRadius: 10, background: 'transparent', color: muted, cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => { setIsLive(true); setShowLiveModal(false) }}
                style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: gold, color: '#000', fontWeight: 700, cursor: 'pointer' }}
              >🔴 Go Live on Jollof TV</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
