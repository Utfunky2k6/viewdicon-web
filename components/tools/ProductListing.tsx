'use client';

import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  status: 'active' | 'draft' | 'sold_out';
  icon: string;
}

const CATEGORIES = ['All', 'Food', 'Craft', 'Fashion', 'Electronics', 'Services'];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Shea Butter Jar', price: 450, category: 'Craft', description: 'Pure unrefined shea butter from the north', stock: 24, status: 'active', icon: '🫙' },
  { id: 'p2', name: 'Ankara Headwrap', price: 1200, category: 'Fashion', description: 'Hand-dyed ankara fabric headwrap', stock: 12, status: 'active', icon: '👑' },
  { id: 'p3', name: 'Jollof Spice Mix', price: 320, category: 'Food', description: 'Chioma\'s secret 7-pepper jollof blend', stock: 0, status: 'sold_out', icon: '🌶️' },
  { id: 'p4', name: 'Solar Phone Charger', price: 3500, category: 'Electronics', description: 'Portable solar panel with USB output', stock: 8, status: 'active', icon: '🔋' },
  { id: 'p5', name: 'Braiding Service', price: 2000, category: 'Services', description: 'Full head cornrow or box braids by Amaka', stock: 5, status: 'draft', icon: '💇🏿‍♀️' },
  { id: 'p6', name: 'Smoked Catfish Pack', price: 800, category: 'Food', description: 'Kofi\'s wood-smoked catfish, 1kg pack', stock: 15, status: 'active', icon: '🐟' },
];

const font = 'DM Sans, Inter, sans-serif';
const bg = '#0a0f08';
const cardBg = 'rgba(255,255,255,0.03)';
const textColor = '#f0f7f0';
const dimColor = 'rgba(255,255,255,0.4)';
const accent = '#4ade80';
const amber = '#f59e0b';
const red = '#ef4444';

export default function ProductListing({ villageId, roleKey }: { villageId?: string; roleKey?: string }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', price: '', category: 'Food', description: '', stock: '' });

  const filtered = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);
  const totalProducts = products.length;
  const activeCount = products.filter(p => p.status === 'active').length;
  const outOfStock = products.filter(p => p.status === 'sold_out').length;

  const resetForm = () => {
    setForm({ name: '', price: '', category: 'Food', description: '', stock: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!form.name || !form.price) return;
    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? {
        ...p, name: form.name, price: Number(form.price), category: form.category,
        description: form.description, stock: Number(form.stock),
        status: Number(form.stock) === 0 ? 'sold_out' : p.status,
      } : p));
    } else {
      const newProduct: Product = {
        id: `p${Date.now()}`, name: form.name, price: Number(form.price),
        category: form.category, description: form.description,
        stock: Number(form.stock) || 0, status: 'draft', icon: '📦',
      };
      setProducts(prev => [...prev, newProduct]);
    }
    resetForm();
  };

  const toggleStatus = (id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (p.status === 'sold_out') return p;
      return { ...p, status: p.status === 'active' ? 'draft' : 'active' };
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const startEdit = (p: Product) => {
    setForm({ name: p.name, price: String(p.price), category: p.category, description: p.description, stock: String(p.stock) });
    setEditingId(p.id);
    setShowForm(true);
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = { active: accent, draft: amber, sold_out: red };
    const labels: Record<string, string> = { active: 'Active', draft: 'Draft', sold_out: 'Sold Out' };
    return (
      <span style={{ fontSize: 11, fontWeight: 600, color: colors[status], background: `${colors[status]}22`, padding: '2px 8px', borderRadius: 8 }}>
        {labels[status]}
      </span>
    );
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: textColor, fontFamily: font, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  const btnStyle = (color: string): React.CSSProperties => ({
    padding: '6px 14px', background: `${color}22`, color, border: `1px solid ${color}44`,
    borderRadius: 8, fontFamily: font, fontSize: 12, fontWeight: 600, cursor: 'pointer',
  });

  return (
    <div style={{ fontFamily: font, color: textColor, background: bg, minHeight: '100vh', padding: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Product Listing</h2>
        <p style={{ color: dimColor, fontSize: 13, margin: '4px 0 0' }}>
          Manage your catalog{villageId ? ` for village ${villageId}` : ''}{roleKey ? ` as ${roleKey}` : ''}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Total Products', value: totalProducts, color: textColor },
          { label: 'Active', value: activeCount, color: accent },
          { label: 'Out of Stock', value: outOfStock, color: red },
        ].map(s => (
          <div key={s.label} style={{ background: cardBg, borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: dimColor, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category Chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: font, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
            background: selectedCategory === cat ? accent : 'rgba(255,255,255,0.06)', color: selectedCategory === cat ? '#0a0f08' : dimColor,
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Add Product Button */}
      <button onClick={() => { resetForm(); setShowForm(true); }} style={{
        width: '100%', padding: 12, background: `${accent}22`, color: accent, border: `1px solid ${accent}44`,
        borderRadius: 12, fontFamily: font, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16,
      }}>
        + Add Product
      </button>

      {/* Form */}
      {showForm && (
        <div style={{ background: cardBg, borderRadius: 14, padding: 16, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>{editingId ? 'Edit Product' : 'New Product'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input placeholder="Product name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
            <input placeholder="Price (₡)" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, appearance: 'none' as const }}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c} style={{ background: '#1a1f18' }}>{c}</option>)}
            </select>
            <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            <input placeholder="Stock quantity" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} style={inputStyle} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSubmit} style={{ ...btnStyle(accent), flex: 1, padding: 10 }}>{editingId ? 'Update' : 'Add Product'}</button>
              <button onClick={resetForm} style={{ ...btnStyle(dimColor), flex: 1, padding: 10 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: cardBg, borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 28 }}>{p.icon}</span>
              {statusBadge(p.status)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: dimColor, marginTop: 2 }}>{p.description}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: accent }}>₡{p.price.toLocaleString()}</span>
              <span style={{ fontSize: 11, color: p.stock === 0 ? red : dimColor }}>{p.stock} in stock</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button onClick={() => toggleStatus(p.id)} style={{ ...btnStyle(p.status === 'active' ? amber : accent), flex: 1 }}>
                {p.status === 'active' ? 'Set Draft' : p.status === 'draft' ? 'Activate' : 'Sold Out'}
              </button>
              <button onClick={() => startEdit(p)} style={{ ...btnStyle('#60a5fa'), flex: 1 }}>Edit</button>
              <button onClick={() => deleteProduct(p.id)} style={{ ...btnStyle(red), flex: 0 }}>X</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: dimColor }}>No products in this category</div>
      )}
    </div>
  );
}
