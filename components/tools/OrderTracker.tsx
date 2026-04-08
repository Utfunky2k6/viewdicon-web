'use client'
import { useState } from 'react'

const ORDERS = [
  { id: 'ORD-4501', customer: 'Binta Sow', items: 3, total: 45200, status: 'processing', date: '2026-04-06' },
  { id: 'ORD-4500', customer: 'Emeka Nwankwo', items: 1, total: 128000, status: 'shipped', date: '2026-04-05' },
  { id: 'ORD-4499', customer: 'Aisha Kone', items: 5, total: 23500, status: 'delivered', date: '2026-04-04' },
  { id: 'ORD-4498', customer: 'Yaw Mensah', items: 2, total: 67800, status: 'processing', date: '2026-04-03' },
]

const COLORS: Record<string, string> = { processing: '#f59e0b', shipped: '#3b82f6', delivered: '#16a34a' }

export default function OrderTracker() {
  const [orders, setOrders] = useState(ORDERS)
  const advance = (id: string) => setOrders(os => os.map(o => {
    if (o.id !== id) return o
    if (o.status === 'processing') return { ...o, status: 'shipped' }
    if (o.status === 'shipped') return { ...o, status: 'delivered' }
    return o
  }))
  return (
    <div style={{ padding: 16, fontFamily: 'Inter,system-ui,sans-serif', color: '#1a2e1a' }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, marginBottom: 16 }}>📦 Order Tracker</h2>
      {orders.map(o => (
        <div key={o.id} style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{o.id}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: COLORS[o.status], padding: '2px 10px', borderRadius: 99 }}>{o.status}</span>
          </div>
          <p style={{ fontSize: 13, margin: '2px 0', color: '#374151' }}>{o.customer} — {o.items} item(s)</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>₦{o.total.toLocaleString()}</span>
            {o.status !== 'delivered' && <button onClick={() => advance(o.id)} style={{ padding: '4px 12px', borderRadius: 12, border: 'none', background: '#1a7c3e', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{o.status === 'processing' ? 'Ship' : 'Deliver'}</button>}
          </div>
        </div>
      ))}
    </div>
  )
}
