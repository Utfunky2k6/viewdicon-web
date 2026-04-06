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
const orange = '#d4813a'
const blue = '#5b9bd5'

type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'

interface Order {
  id: string
  buyer: string
  item: string
  qty: number
  amount: number
  status: OrderStatus
  time: string
}

const ALL_ORDERS: Order[] = [
  { id: 'ORD-2026-001', buyer: 'Ngozi Okonkwo', item: 'Ankara Fabric', qty: 3, amount: 13500, status: 'PENDING', time: '14:22' },
  { id: 'ORD-2026-002', buyer: 'Chukwu Eze', item: 'Groundnut Oil', qty: 10, amount: 18500, status: 'PROCESSING', time: '13:58' },
  { id: 'ORD-2026-003', buyer: 'Fatima Diallo', item: 'Beads Necklace', qty: 2, amount: 5600, status: 'COMPLETED', time: '13:15' },
  { id: 'ORD-2026-004', buyer: 'Kwame Asante', item: 'Adire Blouse', qty: 1, amount: 6300, status: 'PENDING', time: '12:44' },
  { id: 'ORD-2026-005', buyer: 'Amina Bello', item: 'Shea Butter', qty: 5, amount: 6000, status: 'COMPLETED', time: '12:30' },
  { id: 'ORD-2026-006', buyer: 'Adaeze Madu', item: 'Palm Oil (5L)', qty: 4, amount: 7200, status: 'PROCESSING', time: '11:50' },
  { id: 'ORD-2026-007', buyer: 'Tunde Adeyemi', item: 'Smoked Fish', qty: 6, amount: 5400, status: 'COMPLETED', time: '11:20' },
  { id: 'ORD-2026-008', buyer: 'Babajide Coker', item: 'Ankara Fabric', qty: 2, amount: 9000, status: 'CANCELLED', time: '10:45' },
  { id: 'ORD-2026-009', buyer: 'Ngozi Okonkwo', item: 'Kente Stole', qty: 1, amount: 8400, status: 'PENDING', time: '10:15' },
  { id: 'ORD-2026-010', buyer: 'Fatima Diallo', item: 'Tie-Dye Set', qty: 3, amount: 4500, status: 'COMPLETED', time: '09:30' },
  { id: 'ORD-2026-011', buyer: 'Chukwu Eze', item: 'Pottery Bowl', qty: 2, amount: 3600, status: 'PENDING', time: '09:10' },
  { id: 'ORD-2026-012', buyer: 'Kwame Asante', item: 'Carved Mask', qty: 1, amount: 12000, status: 'CANCELLED', time: '08:55' },
]

const TABS: { key: string; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

const COUNTS: Record<string, number> = {
  ALL: ALL_ORDERS.length,
  PENDING: ALL_ORDERS.filter(o => o.status === 'PENDING').length,
  PROCESSING: ALL_ORDERS.filter(o => o.status === 'PROCESSING').length,
  COMPLETED: ALL_ORDERS.filter(o => o.status === 'COMPLETED').length,
  CANCELLED: ALL_ORDERS.filter(o => o.status === 'CANCELLED').length,
}

const statusColor: Record<OrderStatus, string> = {
  PENDING: gold,
  PROCESSING: blue,
  COMPLETED: green,
  CANCELLED: red,
}

export default function OrderDashboard({ villageId, roleKey }: ToolProps) {
  const [tab, setTab] = useState('ALL')
  const [orders, setOrders] = useState<Order[]>(ALL_ORDERS)
  const [accepted, setAccepted] = useState<Set<string>>(new Set())

  const visible = tab === 'ALL' ? orders : orders.filter(o => o.status === tab)
  const todayRevenue = orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + o.amount, 0)

  function accept(id: string) {
    setAccepted(a => new Set([...a, id]))
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'PROCESSING' as OrderStatus } : o))
  }

  function bulkAccept() {
    const pendingIds = orders.filter(o => o.status === 'PENDING').map(o => o.id)
    setOrders(prev => prev.map(o => o.status === 'PENDING' ? { ...o, status: 'PROCESSING' as OrderStatus } : o))
    setAccepted(a => new Set([...a, ...pendingIds]))
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', color: text }}>
      {/* Revenue strip */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: muted }}>TODAY'S REVENUE</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: green }}>₡{todayRevenue.toLocaleString()}</div>
        </div>
        <button
          onClick={bulkAccept}
          style={{ background: '#1a4d2e', color: green, border: `1px solid ${green}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          Bulk Accept Pending
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              whiteSpace: 'nowrap', padding: '7px 14px', borderRadius: 20,
              border: `1px solid ${tab === t.key ? green : border}`,
              background: tab === t.key ? green + '22' : bg,
              color: tab === t.key ? green : muted,
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}
          >{t.label} ({COUNTS[t.key]})</button>
        ))}
      </div>

      {/* Order cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.map(o => (
          <div key={o.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: muted }}>{o.id}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{o.buyer}</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: statusColor[o.status], background: statusColor[o.status] + '22', borderRadius: 20, padding: '3px 10px' }}>
                {o.status}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 13, color: muted }}>{o.item} × {o.qty}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: green }}>₡{o.amount.toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: muted }}>📅 {o.time} today</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => alert(`Order #${o.id}\n${o.buyer}\n${o.item} × ${o.qty}\n₡${o.amount.toLocaleString()}\nStatus: ${o.status}`)} style={{ border: `1px solid ${border}`, background: 'transparent', color: muted, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>View</button>
                {o.status === 'PENDING' && (
                  <button
                    onClick={() => accept(o.id)}
                    style={{ border: 'none', background: green, color: '#000', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >Accept</button>
                )}
                {o.status === 'PROCESSING' && (
                  <button onClick={() => accept(o.id)} style={{ border: 'none', background: blue, color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Dispatch</button>
                )}
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div style={{ textAlign: 'center', color: muted, padding: 40 }}>No orders in this category</div>
        )}
      </div>
    </div>
  )
}
