'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

type OrderStatus = 'ORDERED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'
type PayTerms = 'NET15' | 'NET30' | 'NET60' | 'PREPAID'

interface OrderItem { id: string; name: string; qty: number; unitPrice: number }
interface BulkOrder {
  id: string; supplier: string; items: OrderItem[]; deliveryDate: string; payTerms: PayTerms; status: OrderStatus; partialQty?: number
}

const STATUSES: OrderStatus[] = ['ORDERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

const INIT_ORDERS: BulkOrder[] = [
  {
    id: 'BO-2026-041', supplier: 'Kano Textile Mills', payTerms: 'NET30', deliveryDate: '2026-04-02', status: 'PROCESSING',
    items: [{ id: 'i1', name: 'Ankara Fabric (50m rolls)', qty: 20, unitPrice: 18500 }, { id: 'i2', name: 'Damask Fabric (50m rolls)', qty: 10, unitPrice: 24000 }]
  },
  {
    id: 'BO-2026-042', supplier: 'Jos Farm Cooperative', payTerms: 'NET15', deliveryDate: '2026-03-30', status: 'SHIPPED',
    items: [{ id: 'i3', name: 'Tomatoes (50kg bags)', qty: 100, unitPrice: 3200 }, { id: 'i4', name: 'Peppers (50kg bags)', qty: 50, unitPrice: 4100 }]
  },
  {
    id: 'BO-2026-043', supplier: 'Onitsha Electronics Hub', payTerms: 'NET60', deliveryDate: '2026-04-15', status: 'CONFIRMED',
    items: [{ id: 'i5', name: 'Mobile Phones (unit)', qty: 30, unitPrice: 85000 }, { id: 'i6', name: 'Earphones (unit)', qty: 60, unitPrice: 4500 }]
  },
]

const STATUS_PCT: Record<OrderStatus, number> = { ORDERED: 10, CONFIRMED: 30, PROCESSING: 55, SHIPPED: 80, DELIVERED: 100 }

export default function BulkOrderManager({ villageId, roleKey }: ToolProps) {
  const [orders, setOrders] = useState<BulkOrder[]>(INIT_ORDERS)
  const [showNew, setShowNew] = useState(false)
  const [supplier, setSupplier] = useState('')
  const [newItems, setNewItems] = useState<OrderItem[]>([{ id: 'ni1', name: '', qty: 0, unitPrice: 0 }])
  const [delivDate, setDelivDate] = useState('')
  const [payTerms, setPayTerms] = useState<PayTerms>('NET30')
  const [partialId, setPartialId] = useState<string | null>(null)
  const [partialQty, setPartialQty] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const orderTotal = (o: BulkOrder) => o.items.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const retailMarkup = 1.18
  const savings = (o: BulkOrder) => Math.round(orderTotal(o) * (retailMarkup - 1))

  const addItemRow = () => setNewItems(items => [...items, { id: `ni${Date.now()}`, name: '', qty: 0, unitPrice: 0 }])
  const removeItemRow = (id: string) => setNewItems(items => items.filter(i => i.id !== id))
  const updateItem = (id: string, field: keyof OrderItem, val: string) => setNewItems(items => items.map(i => i.id === id ? { ...i, [field]: field === 'name' ? val : Number(val) } : i))
  const newTotal = newItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)

  const createOrder = () => {
    if (!supplier || newItems.every(i => !i.name)) return
    const order: BulkOrder = { id: `BO-2026-0${orders.length + 44}`, supplier, items: newItems.filter(i => i.name), deliveryDate: delivDate, payTerms, status: 'ORDERED' }
    setOrders(o => [...o, order])
    setSupplier(''); setNewItems([{ id: 'ni1', name: '', qty: 0, unitPrice: 0 }]); setDelivDate(''); setShowNew(false)
    flash('Bulk order created!')
  }

  const receivePartial = (id: string) => {
    setOrders(o => o.map(x => x.id === id ? { ...x, partialQty: Number(partialQty), status: 'PROCESSING' } : x))
    setPartialId(null); setPartialQty(''); flash('Partial delivery logged')
  }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Bulk Order Manager</div>
          <div style={{ color: muted, fontSize: 12 }}>Wholesale procurement tracker</div>
        </div>
        <button onClick={() => setShowNew(s => !s)} style={btn(gold)}>+ New Order</button>
      </div>

      {/* New order form */}
      {showNew && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>New Bulk Order</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <input placeholder="Supplier name" value={supplier} onChange={e => setSupplier(e.target.value)} style={inp} />
            <select value={payTerms} onChange={e => setPayTerms(e.target.value as PayTerms)} style={inp}>
              <option value="PREPAID">Prepaid</option><option value="NET15">NET 15</option><option value="NET30">NET 30</option><option value="NET60">NET 60</option>
            </select>
            <input type="date" value={delivDate} onChange={e => setDelivDate(e.target.value)} style={inp} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: muted, marginBottom: 6, fontWeight: 700 }}>ITEMS</div>
            {newItems.map(item => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 28px', gap: 6, marginBottom: 6 }}>
                <input placeholder="Item name" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} style={inp} />
                <input type="number" placeholder="Qty" value={item.qty || ''} onChange={e => updateItem(item.id, 'qty', e.target.value)} style={inp} />
                <input type="number" placeholder="Unit ₡" value={item.unitPrice || ''} onChange={e => updateItem(item.id, 'unitPrice', e.target.value)} style={inp} />
                <button onClick={() => removeItemRow(item.id)} style={{ background: red + '22', border: `1px solid ${red}`, borderRadius: 4, color: red, cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            ))}
            <button onClick={addItemRow} style={{ background: 'none', border: `1px dashed ${border}`, borderRadius: 6, padding: '4px 10px', color: muted, cursor: 'pointer', fontSize: 12, width: '100%' }}>+ Add Item</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <span style={{ color: muted }}>Total:</span>
            <span style={{ fontWeight: 700, color: gold, fontSize: 16 }}>₡{newTotal.toLocaleString()}</span>
          </div>
          <button onClick={createOrder} style={btn(green)}>Create Order</button>
        </div>
      )}

      {/* Active orders */}
      {orders.map(o => (
        <div key={o.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: muted, fontFamily: 'monospace' }}>{o.id}</span>
              <span style={{ fontSize: 11, color: muted }}>{o.payTerms} · Due {o.deliveryDate}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{o.supplier}</div>
            <div style={{ fontSize: 13, color: muted, marginTop: 2 }}>{o.items.map(i => `${i.name} ×${i.qty}`).join(' · ')}</div>
          </div>

          {/* Status pipeline */}
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              {STATUSES.map(st => (
                <div key={st} style={{ fontSize: 9, fontWeight: 700, color: STATUSES.indexOf(st) <= STATUSES.indexOf(o.status) ? green : muted, textAlign: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: STATUSES.indexOf(st) <= STATUSES.indexOf(o.status) ? green : border, margin: '0 auto 2px' }} />
                  {st.slice(0, 4)}
                </div>
              ))}
            </div>
            <div style={{ height: 4, background: '#1a3a20', borderRadius: 2 }}>
              <div style={{ width: `${STATUS_PCT[o.status]}%`, height: '100%', background: green, borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
          </div>

          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: gold }}>₡{orderTotal(o).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: green }}>₡{savings(o).toLocaleString()} saved vs retail</div>
            </div>
            {o.partialQty && <span style={{ fontSize: 11, color: amber, marginLeft: 8 }}>Partial: {o.partialQty} received</span>}
            {o.status === 'SHIPPED' && partialId !== o.id && (
              <button onClick={() => setPartialId(o.id)} style={{ ...btn(amber), marginLeft: 'auto' }}>Receive Partial</button>
            )}
            {partialId === o.id && (
              <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                <input placeholder="Qty received" type="number" value={partialQty} onChange={e => setPartialQty(e.target.value)} style={{ ...inp, width: 100 }} />
                <button onClick={() => receivePartial(o.id)} style={btn(green)}>Log</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
