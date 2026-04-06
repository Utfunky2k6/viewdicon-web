'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { loveWorldApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

const GENOTYPES = [
  { value: 'AA', label: 'AA', desc: 'Normal hemoglobin', color: '#00C853' },
  { value: 'AS', label: 'AS', desc: 'Sickle cell trait (carrier)', color: '#D4AF37' },
  { value: 'SS', label: 'SS', desc: 'Sickle cell disease', color: '#FF3B30' },
  { value: 'AC', label: 'AC', desc: 'Hemoglobin C trait (carrier)', color: '#D4AF37' },
  { value: 'SC', label: 'SC', desc: 'Hemoglobin SC disease', color: '#FF3B30' },
  { value: 'CC', label: 'CC', desc: 'Hemoglobin C disease', color: '#FF3B30' },
] as const

const COMPAT: { pair: string; safe: boolean; note: string }[] = [
  { pair: 'AA + AA', safe: true, note: 'Fully safe — no risk' },
  { pair: 'AA + AS', safe: true, note: 'Safe — children may carry trait' },
  { pair: 'AA + SS', safe: true, note: 'Safe — all children will carry trait' },
  { pair: 'AS + AS', safe: false, note: '25% chance of SS child — risky' },
  { pair: 'AS + SS', safe: false, note: '50% chance of SS child — high risk' },
  { pair: 'SS + SS', safe: false, note: '100% SS children — very high risk' },
]

type VerifLevel = 'self_declared' | 'lab_uploaded'

export default function GenotypePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [current, setCurrent] = React.useState<any>(null)
  const [selected, setSelected] = React.useState('')
  const [verif, setVerif] = React.useState<VerifLevel>('self_declared')
  const [labUrl, setLabUrl] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    loveWorldApi.getGenotype().then(r => { setCurrent(r); setSelected(r?.genotype || ''); setVerif(r?.verification || 'self_declared'); setLabUrl(r?.labDocUrl || '') }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const badgeColor = (g: string) => GENOTYPES.find(x => x.value === g)?.color || '#888'

  const submit = async () => {
    setSaving(true)
    try {
      const data = { genotype: selected, verification: verif, labDocUrl: verif === 'lab_uploaded' ? labUrl : undefined }
      if (current?.genotype) await loveWorldApi.updateGenotype(data)
      else await loveWorldApi.submitGenotype(data)
      setCurrent({ ...current, ...data })
    } catch {}
    setSaving(false)
  }

  const box: React.CSSProperties = { background: '#111118', borderRadius: 12, padding: 16, marginBottom: 14 }

  if (loading) return <div style={{ background: '#0A0A0F', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', padding: '16px 16px 100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => router.push('/dashboard/love')} style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: 22, cursor: 'pointer' }}>&#8592;</button>
        <span style={{ fontSize: 24 }}>&#129516;</span>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Genotype Safety</h1>
      </div>

      {/* Current badge */}
      {current?.genotype && (
        <div style={{ ...box, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: badgeColor(current.genotype), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 }}>{current.genotype}</div>
          <div>
            <div style={{ fontWeight: 700 }}>Current: {current.genotype}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{current.verification === 'lab_uploaded' ? 'Lab Verified' : 'Self-Declared'}</div>
          </div>
        </div>
      )}

      {/* Selection */}
      <div style={box}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Select Genotype</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {GENOTYPES.map(g => (
            <button key={g.value} onClick={() => setSelected(g.value)} style={{ background: selected === g.value ? g.color + '22' : '#1A1A25', border: `2px solid ${selected === g.value ? g.color : '#333'}`, borderRadius: 10, padding: '12px 10px', cursor: 'pointer', textAlign: 'left', color: '#fff', fontFamily: 'monospace' }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: g.color }}>{g.label}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{g.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Verification level */}
      <div style={box}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Verification Level</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['self_declared', 'lab_uploaded'] as VerifLevel[]).map(v => (
            <button key={v} onClick={() => setVerif(v)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: `2px solid ${verif === v ? '#D4AF37' : '#333'}`, background: verif === v ? '#D4AF3722' : '#1A1A25', color: '#fff', fontFamily: 'monospace', cursor: 'pointer', fontSize: 13 }}>
              {v === 'self_declared' ? 'Self-Declared' : 'Lab Uploaded'}
            </button>
          ))}
        </div>
        {verif === 'lab_uploaded' && (
          <input value={labUrl} onChange={e => setLabUrl(e.target.value)} placeholder="Lab document URL..." style={{ width: '100%', marginTop: 10, padding: 10, borderRadius: 8, border: '1px solid #333', background: '#1A1A25', color: '#fff', fontFamily: 'monospace', fontSize: 13, boxSizing: 'border-box' }} />
        )}
      </div>

      {/* Submit */}
      <button onClick={submit} disabled={!selected || saving} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: selected ? '#D4AF37' : '#333', color: '#0A0A0F', fontFamily: 'monospace', fontWeight: 800, fontSize: 15, cursor: selected ? 'pointer' : 'default', marginBottom: 16 }}>
        {saving ? 'Saving...' : current?.genotype ? 'Update Genotype' : 'Submit Genotype'}
      </button>

      {/* Safety info */}
      <div style={{ ...box, border: '1px solid #D4AF3744' }}>
        <div style={{ fontWeight: 700, marginBottom: 10, color: '#D4AF37' }}>Compatibility Guide</div>
        {COMPAT.map(c => (
          <div key={c.pair} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: c.safe ? '#00C853' : '#FF3B30', fontSize: 16 }}>{c.safe ? '\u2713' : '\u2717'}</span>
            <span style={{ fontWeight: 700, minWidth: 80 }}>{c.pair}</span>
            <span style={{ color: '#aaa' }}>{c.note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
