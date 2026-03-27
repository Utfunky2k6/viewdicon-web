'use client';

import { useState } from 'react';

interface Supplier {
  name: string;
  distance: number;
  verified: boolean;
}

interface Part {
  id: string;
  name: string;
  partNumber: string;
  price: number;
  category: string;
  availability: 'in_stock' | 'order' | 'scarce';
  suppliers: Supplier[];
}

const font = 'DM Sans, Inter, sans-serif';
const bg = '#0a0f08';
const cardBg = 'rgba(255,255,255,0.03)';
const textColor = '#f0f7f0';
const dimColor = 'rgba(255,255,255,0.4)';
const accent = '#4ade80';
const amber = '#f59e0b';
const red = '#ef4444';
const blue = '#60a5fa';

const CATEGORIES = ['All', 'Electrical', 'Mechanical', 'Building', 'Plumbing', 'Auto'];

const AVAILABILITY_CONFIG: Record<string, { label: string; color: string }> = {
  in_stock: { label: 'In Stock', color: accent },
  order: { label: 'Order (3-5 days)', color: amber },
  scarce: { label: 'Scarce', color: red },
};


export default function PartsFinder({ villageId, roleKey }: { villageId?: string; roleKey?: string }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [orderItems, setOrderItems] = useState<Record<string, number>>({});
  const [showBasket, setShowBasket] = useState(false);
  const [parts] = useState<Part[]>([]);

  const filtered = parts.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.partNumber.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || p.category === category;
    return matchSearch && matchCategory;
  });

  const toggleOrder = (partId: string) => {
    setOrderItems(prev => {
      const copy = { ...prev };
      if (copy[partId]) {
        delete copy[partId];
      } else {
        copy[partId] = 1;
      }
      return copy;
    });
  };

  const updateQuantity = (partId: string, qty: number) => {
    if (qty < 1) return;
    setOrderItems(prev => ({ ...prev, [partId]: qty }));
  };

  const orderCount = Object.keys(orderItems).length;
  const orderTotal = Object.entries(orderItems).reduce((sum, [id, qty]) => {
    const part = parts.find(p => p.id === id);
    return sum + (part ? part.price * qty : 0);
  }, 0);

  const getLowestPrice = (part: Part) => {
    if (part.suppliers.length <= 1) return null;
    const lowest = Math.round(part.price * 0.85);
    const avg = Math.round(part.price * 0.95);
    return { lowest, avg };
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: textColor, fontFamily: font, fontSize: 15, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ fontFamily: font, color: textColor, background: bg, minHeight: '100vh', padding: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Parts Finder</h2>
            <p style={{ color: dimColor, fontSize: 13, margin: '4px 0 0' }}>
              Search parts and materials{villageId ? ` for village ${villageId}` : ''}
            </p>
          </div>
          {orderCount > 0 && (
            <button onClick={() => setShowBasket(!showBasket)} style={{
              padding: '8px 14px', background: `${accent}22`, color: accent, border: `1px solid ${accent}44`,
              borderRadius: 10, fontFamily: font, fontSize: 13, fontWeight: 700, cursor: 'pointer', position: 'relative',
            }}>
              Order ({orderCount})
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <input placeholder="Search parts by name or part number..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: font, fontSize: 13,
            fontWeight: 600, whiteSpace: 'nowrap',
            background: category === cat ? accent : 'rgba(255,255,255,0.06)',
            color: category === cat ? '#0a0f08' : dimColor,
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Order Basket */}
      {showBasket && orderCount > 0 && (
        <div style={{ background: cardBg, borderRadius: 14, padding: 16, border: `1px solid ${accent}33`, marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px', color: accent }}>Order Basket</h3>
          {Object.entries(orderItems).map(([id, qty]) => {
            const part = parts.find(p => p.id === id);
            if (!part) return null;
            return (
              <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{part.name}</div>
                  <div style={{ fontSize: 12, color: dimColor }}>{part.partNumber}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => updateQuantity(id, qty - 1)} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: 'none', color: textColor, cursor: 'pointer', fontSize: 16 }}>-</button>
                  <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => updateQuantity(id, qty + 1)} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: 'none', color: textColor, cursor: 'pointer', fontSize: 16 }}>+</button>
                  <span style={{ fontSize: 14, fontWeight: 700, color: accent, minWidth: 60, textAlign: 'right' }}>₡{(part.price * qty).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: accent }}>₡{orderTotal.toLocaleString()}</span>
          </div>
          <button onClick={() => { setOrderItems({}); setShowBasket(false); }} style={{
            width: '100%', padding: 12, background: accent, color: '#0a0f08', border: 'none',
            borderRadius: 10, fontFamily: font, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 12,
          }}>
            Place Order
          </button>
        </div>
      )}

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(part => {
          const avail = AVAILABILITY_CONFIG[part.availability];
          const inOrder = !!orderItems[part.id];
          const priceComp = getLowestPrice(part);
          return (
            <div key={part.id} style={{ background: cardBg, borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{part.name}</div>
                  <div style={{ fontSize: 12, color: dimColor, marginTop: 2 }}>Part# {part.partNumber}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: avail.color,
                  background: `${avail.color}22`, padding: '2px 8px', borderRadius: 8, whiteSpace: 'nowrap',
                }}>
                  {avail.label}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: accent }}>₡{part.price.toLocaleString()}</span>
                  {priceComp && (
                    <div style={{ fontSize: 11, color: dimColor, marginTop: 2 }}>
                      Lowest ₡{priceComp.lowest.toLocaleString()} | Avg ₡{priceComp.avg.toLocaleString()}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: dimColor, background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 6 }}>
                  {part.category}
                </span>
              </div>

              {/* Suppliers */}
              <div style={{ marginBottom: 10 }}>
                {part.suppliers.map((sup, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0',
                    borderBottom: i < part.suppliers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13 }}>{sup.name}</span>
                      {sup.verified && (
                        <span style={{ fontSize: 10, color: accent, background: `${accent}22`, padding: '1px 5px', borderRadius: 4 }}>Verified</span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: dimColor }}>{sup.distance} km</span>
                  </div>
                ))}
              </div>

              {/* Add to Order */}
              <button onClick={() => toggleOrder(part.id)} style={{
                width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${inOrder ? accent : 'rgba(255,255,255,0.15)'}`,
                background: inOrder ? `${accent}22` : 'rgba(255,255,255,0.04)',
                color: inOrder ? accent : textColor, fontFamily: font, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                {inOrder ? 'Added \u2713' : 'Add to Order'}
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: dimColor }}>
          No parts found. Try a different search or category.
        </div>
      )}
    </div>
  );
}
