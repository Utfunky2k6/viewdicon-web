'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017'

type Section = 'BREAKFAST' | 'LUNCH' | 'SPECIALS'

interface MenuItem {
  id: string; name: string; emoji: string; price: number; qty: number; section: Section; active: boolean
}

const EMOJIS = ['🍲', '🥘', '🌽', '🍗', '🍛', '🐟', '🥗', '🍞', '🥜', '🫙']

const INIT_MENU: MenuItem[] = [
  { id: 'm1', name: 'Akara & Ogi', emoji: '🍞', price: 800, qty: 40, section: 'BREAKFAST', active: true },
  { id: 'm2', name: 'Fried Plantain', emoji: '🌽', price: 600, qty: 30, section: 'BREAKFAST', active: true },
  { id: 'm3', name: 'Moi Moi & Pap', emoji: '🥘', price: 950, qty: 25, section: 'BREAKFAST', active: true },
  { id: 'm4', name: 'Egusi Soup & Fufu', emoji: '🍲', price: 2200, qty: 20, section: 'LUNCH', active: true },
  { id: 'm5', name: 'Jollof Rice & Chicken', emoji: '🍛', price: 2800, qty: 35, section: 'LUNCH', active: true },
  { id: 'm6', name: 'Ofe Onugbu & Eba', emoji: '🥘', price: 1900, qty: 15, section: 'LUNCH', active: true },
  { id: 'm7', name: 'Buka Stew & Yam', emoji: '🍗', price: 2400, qty: 18, section: 'LUNCH', active: true },
  { id: 'm8', name: 'Suya Platter', emoji: '🥗', price: 3500, qty: 10, section: 'SPECIALS', active: true },
  { id: 'm9', name: 'Pepper Soup (Goat)', emoji: '🐟', price: 4200, qty: 8, section: 'SPECIALS', active: true },
]

const SECTIONS: Section[] = ['BREAKFAST', 'LUNCH', 'SPECIALS']
const SEC_COLOR: Record<Section, string> = { BREAKFAST: '#5b9bd5', LUNCH: green, SPECIALS: gold }

export default function DailyMenuBoard({ villageId, roleKey }: ToolProps) {
  const [menu, setMenu] = useState<MenuItem[]>(INIT_MENU)
  const [published, setPublished] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', section: 'LUNCH' as Section, price: '', qty: '', emoji: '🍲' })
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const toggleItem = (id: string) => setMenu(m => m.map(i => i.id === id ? { ...i, active: !i.active } : i))
  const markOOS = (id: string) => { setMenu(m => m.map(i => i.id === id ? { ...i, qty: 0, active: false } : i)); flash('Marked out of stock') }

  const addItem = () => {
    if (!form.name || !form.price || !form.qty) return
    const item: MenuItem = { id: `m${Date.now()}`, name: form.name, emoji: form.emoji, price: Number(form.price), qty: Number(form.qty), section: form.section, active: true }
    setMenu(m => [...m, item])
    setForm({ name: '', section: 'LUNCH', price: '', qty: '', emoji: '🍲' })
    setShowAdd(false)
    flash('Item added to menu')
  }

  const shareToFeed = () => flash('Menu shared to village feed! 🌍')

  const row = { display: 'flex', alignItems: 'center', gap: 8 }
  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 16px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 })

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Today's Menu Board</div>
          <div style={{ color: muted, fontSize: 12 }}>March 26, 2026 — Mama Ngozi's Kitchen</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, color: published ? green : red, fontWeight: 700 }}>{published ? '● LIVE' : '○ HIDDEN'}</div>
          <button onClick={() => { setPublished(p => !p); flash(published ? 'Menu unpublished' : 'Menu published!') }} style={btn(published ? red : green)}>{published ? 'Unpublish' : 'Publish'}</button>
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map(sec => {
        const items = menu.filter(i => i.section === sec)
        return (
          <div key={sec} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
            <div style={{ background: SEC_COLOR[sec] + '22', borderBottom: `1px solid ${border}`, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: SEC_COLOR[sec] }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: SEC_COLOR[sec] }}>{sec}</span>
              <span style={{ fontSize: 11, color: muted, marginLeft: 4 }}>{items.filter(i => i.active).length} available</span>
            </div>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: `1px solid ${border}`, opacity: item.active ? 1 : 0.4 }}>
                <span style={{ fontSize: 20 }}>{item.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, textDecoration: item.active ? 'none' : 'line-through' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: muted }}>Qty: {item.qty}</div>
                </div>
                <div style={{ color: gold, fontWeight: 700, fontSize: 15 }}>₡{item.price.toLocaleString()}</div>
                <button onClick={() => toggleItem(item.id)} style={{ background: item.active ? '#1a3a1e' : '#2a1010', border: `1px solid ${item.active ? green : red}`, borderRadius: 6, padding: '4px 10px', color: item.active ? green : red, fontSize: 11, cursor: 'pointer' }}>
                  {item.active ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => markOOS(item.id)} style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 6, padding: '4px 8px', color: muted, fontSize: 11, cursor: 'pointer' }}>OOS</button>
              </div>
            ))}
          </div>
        )
      })}

      {/* Add Item */}
      <button onClick={() => setShowAdd(s => !s)} style={{ ...btn(gold), width: '100%', marginBottom: 10 }}>+ Add Item</button>
      {showAdd && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>New Menu Item</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input placeholder="Item name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inp} />
            <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value as Section }))} style={inp}>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input placeholder="Price (₡)" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={inp} />
            <input placeholder="Quantity" type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} style={inp} />
          </div>
          <div style={{ ...row, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: muted }}>Emoji:</span>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))} style={{ fontSize: 18, background: form.emoji === e ? '#1e3a20' : 'none', border: `1px solid ${form.emoji === e ? green : border}`, borderRadius: 6, padding: '2px 6px', cursor: 'pointer' }}>{e}</button>
            ))}
          </div>
          <button onClick={addItem} style={btn(green)}>Add to Menu</button>
        </div>
      )}

      <button onClick={shareToFeed} style={{ ...btn('#5b9bd5'), width: '100%' }}>🌍 Share to Village Feed</button>
    </div>
  )
}
