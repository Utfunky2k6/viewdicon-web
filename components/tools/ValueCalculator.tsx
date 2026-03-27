'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }

const bg = '#060d07', card = '#0f1e11', border = '#1e3a20'
const text = '#f0f7f0', muted = '#7da882', green = '#4caf7d', gold = '#c9a84c', red = '#c0392b', amber = '#d4a017', blue = '#5b9bd5'

type AssetType = 'REAL_ESTATE' | 'VEHICLE' | 'EQUIPMENT' | 'JEWELLERY' | 'ART' | 'LIVESTOCK'

interface RealEstateFields { location: string; sqm: string; condition: string; age: string }
interface VehicleFields { make: string; model: string; year: string; mileage: string; condition: string }
interface EquipmentFields { type: string; brand: string; year: string; hoursUsed: string }
interface GenericFields { description: string; condition: string; quantity: string }

interface ValuationResult {
  estimated: number; replacementCost: number; depreciation: number; confidence: string
  comparables: { name: string; price: number; date: string }[]
}

const ASSET_TYPES: { value: AssetType; label: string; emoji: string }[] = [
  { value: 'REAL_ESTATE', label: 'Real Estate', emoji: '🏘' },
  { value: 'VEHICLE', label: 'Vehicle', emoji: '🚗' },
  { value: 'EQUIPMENT', label: 'Equipment', emoji: '⚙️' },
  { value: 'JEWELLERY', label: 'Jewellery', emoji: '💍' },
  { value: 'ART', label: 'Art', emoji: '🎨' },
  { value: 'LIVESTOCK', label: 'Livestock', emoji: '🐄' },
]

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor']


export default function ValueCalculator({ villageId, roleKey }: ToolProps) {
  const [assetType, setAssetType] = useState<AssetType>('REAL_ESTATE')
  const [reFields, setReFields] = useState<RealEstateFields>({ location: '', sqm: '', condition: 'Good', age: '' })
  const [vehFields, setVehFields] = useState<VehicleFields>({ make: '', model: '', year: '', mileage: '', condition: 'Good' })
  const [eqFields, setEqFields] = useState<EquipmentFields>({ type: '', brand: '', year: '', hoursUsed: '' })
  const [genFields, setGenFields] = useState<GenericFields>({ description: '', condition: 'Good', quantity: '1' })
  const [result, setResult] = useState<ValuationResult | null>(null)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const calculate = () => {
    setResult(null)
    setSaved(false)
  }

  const confidenceColor = { HIGH: green, MEDIUM: amber, LOW: red }

  const inp = { background: '#0a1a0c', border: `1px solid ${border}`, borderRadius: 6, padding: '6px 10px', color: text, fontSize: 13, outline: 'none', width: '100%' }
  const btn = (c = green) => ({ background: c, border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 })

  const renderFields = () => {
    if (assetType === 'REAL_ESTATE') return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <input placeholder="Location / Area" value={reFields.location} onChange={e => setReFields(f => ({ ...f, location: e.target.value }))} style={inp} />
        <input placeholder="Floor area (sqm)" type="number" value={reFields.sqm} onChange={e => setReFields(f => ({ ...f, sqm: e.target.value }))} style={inp} />
        <select value={reFields.condition} onChange={e => setReFields(f => ({ ...f, condition: e.target.value }))} style={inp}>
          {CONDITIONS.map(c => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="Age (years)" type="number" value={reFields.age} onChange={e => setReFields(f => ({ ...f, age: e.target.value }))} style={inp} />
      </div>
    )
    if (assetType === 'VEHICLE') return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <input placeholder="Make (e.g. Toyota)" value={vehFields.make} onChange={e => setVehFields(f => ({ ...f, make: e.target.value }))} style={inp} />
        <input placeholder="Model (e.g. Camry)" value={vehFields.model} onChange={e => setVehFields(f => ({ ...f, model: e.target.value }))} style={inp} />
        <input placeholder="Year" type="number" value={vehFields.year} onChange={e => setVehFields(f => ({ ...f, year: e.target.value }))} style={inp} />
        <input placeholder="Mileage (km)" type="number" value={vehFields.mileage} onChange={e => setVehFields(f => ({ ...f, mileage: e.target.value }))} style={inp} />
        <select value={vehFields.condition} onChange={e => setVehFields(f => ({ ...f, condition: e.target.value }))} style={{ ...inp, gridColumn: 'span 2' }}>
          {CONDITIONS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
    )
    if (assetType === 'EQUIPMENT') return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <input placeholder="Equipment type" value={eqFields.type} onChange={e => setEqFields(f => ({ ...f, type: e.target.value }))} style={inp} />
        <input placeholder="Brand" value={eqFields.brand} onChange={e => setEqFields(f => ({ ...f, brand: e.target.value }))} style={inp} />
        <input placeholder="Year" type="number" value={eqFields.year} onChange={e => setEqFields(f => ({ ...f, year: e.target.value }))} style={inp} />
        <input placeholder="Hours used" type="number" value={eqFields.hoursUsed} onChange={e => setEqFields(f => ({ ...f, hoursUsed: e.target.value }))} style={inp} />
      </div>
    )
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <input placeholder="Description" value={genFields.description} onChange={e => setGenFields(f => ({ ...f, description: e.target.value }))} style={inp} />
        <input placeholder="Quantity" type="number" value={genFields.quantity} onChange={e => setGenFields(f => ({ ...f, quantity: e.target.value }))} style={inp} />
        <select value={genFields.condition} onChange={e => setGenFields(f => ({ ...f, condition: e.target.value }))} style={{ ...inp, gridColumn: 'span 2' }}>
          {CONDITIONS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
    )
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 16, fontFamily: 'system-ui, sans-serif', color: text }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: green, color: '#000', padding: '10px 24px', borderRadius: 20, fontWeight: 700, zIndex: 100, fontSize: 13 }}>{toast}</div>}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Value Calculator</div>
      <div style={{ color: muted, fontSize: 12, marginBottom: 14 }}>Asset valuation — Cowrie Market Intelligence</div>

      {/* Asset type selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 14 }}>
        {ASSET_TYPES.map(a => (
          <button key={a.value} onClick={() => { setAssetType(a.value); setResult(null) }}
            style={{ background: assetType === a.value ? '#1e3a20' : card, border: `2px solid ${assetType === a.value ? green : border}`, borderRadius: 10, padding: '8px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 18 }}>{a.emoji}</span>
            <span style={{ fontSize: 10, color: assetType === a.value ? green : muted, fontWeight: 700 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Input fields */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: muted, fontWeight: 700, marginBottom: 10 }}>{ASSET_TYPES.find(a => a.value === assetType)?.label.toUpperCase()} DETAILS</div>
        {renderFields()}
      </div>

      <button onClick={calculate} style={{ ...btn(gold), width: '100%', marginBottom: 14, fontSize: 15 }}>Calculate Value</button>

      {result && (
        <div style={{ background: card, border: `2px solid ${gold}`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: muted }}>ESTIMATED MARKET VALUE</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: gold }}>₡{result.estimated.toLocaleString()}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: (confidenceColor as any)[result.confidence], background: (confidenceColor as any)[result.confidence] + '22', padding: '4px 10px', borderRadius: 10 }}>{result.confidence} CONFIDENCE</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{ background: '#0a1a0c', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: muted }}>Replacement Cost</div>
              <div style={{ color: blue, fontWeight: 700 }}>₡{result.replacementCost.toLocaleString()}</div>
            </div>
            <div style={{ background: '#0a1a0c', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: muted }}>Depreciation Factor</div>
              <div style={{ color: amber, fontWeight: 700 }}>{result.depreciation}%</div>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: muted, fontWeight: 700, marginBottom: 8 }}>COMPARABLE SALES</div>
            {result.comparables.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${border}`, fontSize: 12 }}>
                <span style={{ color: muted }}>{c.name}</span>
                <span style={{ color: gold }}>{c.date} · ₡{c.price.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <button onClick={() => { setSaved(true); flash('Saved to Document Vault') }}
            style={{ ...btn(saved ? muted : green), width: '100%' }}>
            {saved ? '✓ Saved to Document Vault' : '🗄 Save to Document Vault'}
          </button>
        </div>
      )}
    </div>
  )
}
