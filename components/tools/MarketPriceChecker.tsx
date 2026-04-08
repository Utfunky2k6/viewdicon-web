'use client'
import { useState } from 'react'

const COMMODITIES = [
  { name: 'Maize (50kg)', market: 'Mile 12 Lagos', price: 28500, change: +3.2, unit: 'NGN' },
  { name: 'Rice (50kg)', market: 'Dawanau Kano', price: 42000, change: -1.1, unit: 'NGN' },
  { name: 'Cassava (tonne)', market: 'Ose Onitsha', price: 95000, change: +5.7, unit: 'NGN' },
  { name: 'Palm Oil (25L)', market: 'Bodija Ibadan', price: 18500, change: +0.8, unit: 'NGN' },
  { name: 'Cocoa (64kg bag)', market: 'Ondo Depot', price: 650000, change: +12.4, unit: 'NGN' },
]

export default function MarketPriceChecker() {
  const [search, setSearch] = useState('')

  const filtered = COMMODITIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.market.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>📊 Market Price Checker</h2>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search commodity or market..."
        style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, marginBottom: 14, boxSizing: 'border-box' }} />
      {filtered.map((c, i) => (
        <div key={i} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{c.market}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>₦{c.price.toLocaleString()}</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: c.change >= 0 ? '#1a7c3e' : '#ef4444' }}>
              {c.change >= 0 ? '▲' : '▼'} {Math.abs(c.change)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
