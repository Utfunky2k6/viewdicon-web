'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface Story { id: string; name: string; avatar: string; before: string; after: string }
interface NewStoryForm { name: string; challenge: string; intervention: string; outcome: string }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32'

const MONTHLY_DATA = [
  { month: 'Oct', people: 380  },
  { month: 'Nov', people: 420  },
  { month: 'Dec', people: 390  },
  { month: 'Jan', people: 510  },
  { month: 'Feb', people: 580  },
  { month: 'Mar', people: 647  },
]

const MAX_PEOPLE = Math.max(...MONTHLY_DATA.map(d => d.people))

const INIT_STORIES: Story[] = [
  {
    id: 's1', name: 'Adaeze Nwankwo', avatar: '👩🏾',
    before: 'No income source, supporting 3 children alone',
    after: 'Runs shea butter cooperative, earning ₡45,000/month',
  },
  {
    id: 's2', name: 'Tunde Adesanya', avatar: '👨🏾',
    before: 'No market stall, selling from roadside in rain',
    after: 'Has formal stall in covered market, ₡28,000/month revenue',
  },
  {
    id: 's3', name: 'Amina Garba', avatar: '👩🏽',
    before: 'Children out of school due to fees',
    after: 'All 4 children back in school via village scholarship fund',
  },
]

const METRICS = [
  { icon: '👥', label: 'People Served',       value: '2,847', color: '#a5d6a7' },
  { icon: '✅', label: 'Projects Completed',   value: '34',    color: '#90caf9' },
  { icon: '🏘', label: 'Communities Reached',  value: '8',     color: '#ce93d8' },
  { icon: '₡',  label: 'Funds Distributed',    value: '₡4.2M', color: '#ffe0b2' },
]

export default function ImpactTracker({ villageId: _v, roleKey: _r }: ToolProps) {
  const [stories, setStories] = useState<Story[]>(INIT_STORIES)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<NewStoryForm>({ name: '', challenge: '', intervention: '', outcome: '' })
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)

  const upd = (k: keyof NewStoryForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const addStory = () => {
    if (!form.name) return
    setStories(ss => [...ss, {
      id: `s${Date.now()}`,
      name: form.name,
      avatar: '👤',
      before: form.challenge,
      after: form.outcome,
    }])
    setSaved(true)
    setTimeout(() => { setSaved(false); setShowAdd(false) }, 2000)
    setForm({ name: '', challenge: '', intervention: '', outcome: '' })
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <h2 style={{ margin: '0 0 18px', fontSize: 18 }}>🌍 Impact Tracker</h2>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {METRICS.map(m => (
          <div key={m.label} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 24 }}>{m.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: m.color, marginTop: 4 }}>{m.value}</div>
            <div style={{ fontSize: 11, color: MT, marginTop: 3 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly Trend */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 12 }}>MONTHLY BENEFICIARIES</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
          {MONTHLY_DATA.map((d, i) => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 9, color: MT }}>{d.people}</div>
              <div style={{ width: '100%', background: i === MONTHLY_DATA.length - 1 ? GR : '#1e3a20', height: Math.round((d.people / MAX_PEOPLE) * 54), borderRadius: '3px 3px 0 0' }} />
              <div style={{ fontSize: 10, color: MT }}>{d.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Coverage */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 10 }}>GEOGRAPHIC COVERAGE</div>
        <div style={{ background: '#040c05', borderRadius: 10, height: 130, position: 'relative', overflow: 'hidden' }}>
          {[
            { left: '22%', top: '28%', size: 48, opacity: 0.8, label: 'Lagos' },
            { left: '52%', top: '18%', size: 36, opacity: 0.6, label: 'Abuja' },
            { left: '68%', top: '50%', size: 28, opacity: 0.5, label: 'Enugu' },
            { left: '18%', top: '58%', size: 22, opacity: 0.5, label: 'Ibadan' },
            { left: '40%', top: '64%', size: 18, opacity: 0.4, label: 'Benin' },
            { left: '75%', top: '28%', size: 14, opacity: 0.35, label: 'Kano' },
            { left: '60%', top: '76%', size: 12, opacity: 0.3, label: 'PHC' },
            { left: '30%', top: '80%', size: 10, opacity: 0.3, label: 'Aba' },
          ].map((c, i) => (
            <div key={i} style={{ position: 'absolute', left: c.left, top: c.top, width: c.size, height: c.size, borderRadius: '50%', background: GR, opacity: c.opacity, transform: 'translate(-50%,-50%)' }}>
              <div style={{ position: 'absolute', top: '115%', left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: '#a5d6a7', whiteSpace: 'nowrap' }}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stories */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700 }}>BENEFICIARY STORIES</div>
        <button onClick={() => setShowAdd(v => !v)} style={{ padding: '5px 12px', background: GR, border: 'none', borderRadius: 7, color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
          {showAdd ? '✕' : '+ Add Story'}
        </button>
      </div>

      {showAdd && (
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
          {saved
            ? <div style={{ textAlign: 'center', padding: 12, color: '#a5d6a7' }}>✅ Story added!</div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[['Beneficiary name', 'name', 'text'], ['Challenge faced', 'challenge', 'text'], ['Intervention provided', 'intervention', 'text'], ['Outcome / Result', 'outcome', 'text']].map(([label, key, _type]) => (
                  <div key={key}>
                    <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>{label}</div>
                    <input value={form[key as keyof NewStoryForm]} onChange={upd(key as keyof NewStoryForm)} placeholder={`Enter ${label.toLowerCase()}...`}
                      style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '7px 10px', color: TX, fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                ))}
                <button onClick={addStory} style={{ padding: 10, background: GR, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Save Story
                </button>
              </div>
            )
          }
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {stories.map(s => (
          <div key={s.id} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, display: 'flex', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e3a20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{s.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{s.name}</div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: '#ef9a9a' }}>Before:</span> {s.before}
              </div>
              <div style={{ fontSize: 12 }}>
                <span style={{ color: '#a5d6a7' }}>After:</span> {s.after}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => { setExporting(true); setTimeout(() => setExporting(false), 2000) }}
        style={{ width: '100%', padding: 12, background: CARD, border: `1px solid ${BD}`, borderRadius: 10, color: TX, fontSize: 13, cursor: 'pointer' }}
      >
        {exporting ? '⏳ Generating...' : '📊 Export Donor Impact Report'}
      </button>
    </div>
  )
}
