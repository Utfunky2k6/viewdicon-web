'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { kerawaApi } from '@/lib/api'
import { USE_MOCKS, logApiFailure } from '@/lib/flags'

const FIRE = { primary: '#ef4444', dark: '#dc2626', light: '#fca5a5', bg: '#0a0a0a', card: '#141414', border: '#1f1f1f' }
const TABS = ['My Vault', 'Purchased', 'Subscribers'] as const
const CONTENT_TYPES = ['PHOTO', 'VIDEO', 'VOICE', 'ALBUM'] as const

export default function KerawaContentPage() {
  const r = useRouter()
  const [tab, setTab] = useState<typeof TABS[number]>('My Vault')
  const [content, setContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadType, setUploadType] = useState<string>('PHOTO')
  const [price, setPrice] = useState('100')
  const [description, setDescription] = useState('')
  const [consentAck, setConsentAck] = useState(false)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await kerawaApi.getMyContent()
        setContent(res?.content || res || [])
      } catch (e) { logApiFailure('kerawa/content/list', e); setContent([]) }
      setLoading(false)
    })()
  }, [])

  const MOCK_CONTENT = [
    { id: 'c1', type: 'PHOTO', price: 50, unlocks: 23, earnings: 1150, createdAt: '2026-04-01', description: 'First drop 🔥' },
    { id: 'c2', type: 'VIDEO', price: 200, unlocks: 8, earnings: 1600, createdAt: '2026-04-03', description: 'The vibe check' },
    { id: 'c3', type: 'VOICE', price: 30, unlocks: 45, earnings: 1350, createdAt: '2026-04-05', description: 'Late night thoughts' },
    { id: 'c4', type: 'ALBUM', price: 500, unlocks: 3, earnings: 1500, createdAt: '2026-04-06', description: 'Premium collection' },
  ]
  const MOCK_PURCHASED = [
    { id: 'p1', type: 'PHOTO', creator: 'NightOrchid', price: 100, purchasedAt: '2026-04-04' },
    { id: 'p2', type: 'VIDEO', creator: 'VelvetSoul', price: 300, purchasedAt: '2026-04-05' },
  ]
  const MOCK_SUBS = [
    { id: 's1', nickname: 'StarChaser_77', amount: 200, since: '2026-03-20' },
    { id: 's2', nickname: 'FlameKing', amount: 150, since: '2026-04-01' },
  ]

  const items = content.length ? content : (USE_MOCKS ? MOCK_CONTENT : [])
  const totalEarnings = items.reduce((s, c) => s + (c.earnings || 0), 0)
  const totalUnlocks = items.reduce((s, c) => s + (c.unlocks || 0), 0)

  async function handleUpload() {
    try {
      await kerawaApi.uploadContent({ type: uploadType, price: +price, description })
      setShowUpload(false)
      setDescription('')
    } catch (e) { logApiFailure('kerawa/content/upload', e) }
  }

  return (
    <div style={{ minHeight: '100vh', background: FIRE.bg, color: '#fff', fontFamily: 'monospace', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span onClick={() => r.push('/dashboard/kerawa')} style={{ fontSize: 20, cursor: 'pointer' }}>←</span>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>🔐 Private Content</h1>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '0 16px', marginBottom: 16 }}>
        {[
          { label: 'Earnings', val: `${totalEarnings} 💰` },
          { label: 'Content', val: items.length },
          { label: 'Unlocks', val: totalUnlocks },
          { label: 'Subs', val: USE_MOCKS ? MOCK_SUBS.length : 0 },
        ].map(s => (
          <div key={s.label} style={{ background: FIRE.card, padding: '10px', borderRadius: 10, border: `1px solid ${FIRE.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: FIRE.light }}>{s.val}</div>
            <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px', marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: tab === t ? FIRE.primary : FIRE.card, border: `1px solid ${tab === t ? FIRE.primary : FIRE.border}`, color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px' }}>
        {tab === 'My Vault' && (
          loading ? <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>Loading...</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {items.map((c: any) => (
                <div key={c.id} style={{ background: FIRE.card, borderRadius: 12, border: `1px solid ${FIRE.border}`, overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '1', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, filter: 'blur(4px)' }}>
                    {c.type === 'PHOTO' ? '📸' : c.type === 'VIDEO' ? '🎬' : c.type === 'VOICE' ? '🎙️' : '📂'}
                  </div>
                  <div style={{ padding: '10px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{c.description || c.type}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, color: FIRE.light }}>{c.price} 💰</span>
                      <span style={{ fontSize: 10, color: '#888' }}>{c.unlocks || 0} 🔓</span>
                    </div>
                    <div style={{ fontSize: 9, color: '#555', marginTop: 4 }}>{c.earnings || 0} earned</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'Purchased' && (
          <div>
            {USE_MOCKS && MOCK_PURCHASED.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: FIRE.card, borderRadius: 12, border: `1px solid ${FIRE.border}`, marginBottom: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {p.type === 'PHOTO' ? '📸' : '🎬'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>From {p.creator}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{p.type} · {p.price} 💰</div>
                </div>
                <button onClick={() => kerawaApi.tipContent(p.id, 50)} style={{ padding: '6px 12px', borderRadius: 8, background: `${FIRE.primary}33`, border: `1px solid ${FIRE.primary}`, color: FIRE.light, fontSize: 11, fontFamily: 'monospace', cursor: 'pointer' }}>💎 Tip</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'Subscribers' && (
          <div>
            {USE_MOCKS && MOCK_SUBS.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: FIRE.card, borderRadius: 12, border: `1px solid ${FIRE.border}`, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔥</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{s.nickname}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>Since {s.since}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: FIRE.light }}>{s.amount} 💰/mo</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: FIRE.card, borderRadius: '20px 20px 0 0', padding: '24px 16px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>📤 Upload Content</h3>
              <span onClick={() => setShowUpload(false)} style={{ fontSize: 20, cursor: 'pointer' }}>✕</span>
            </div>

            <label style={{ fontSize: 11, color: '#aaa' }}>Content Type</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, marginBottom: 14 }}>
              {CONTENT_TYPES.map(t => (
                <div key={t} onClick={() => setUploadType(t)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: uploadType === t ? FIRE.primary : '#1a1a1a', border: `1px solid ${uploadType === t ? FIRE.primary : FIRE.border}`, textAlign: 'center', fontSize: 11, cursor: 'pointer' }}>{t}</div>
              ))}
            </div>

            <label style={{ fontSize: 11, color: '#aaa' }}>Price (Cowries 💰)</label>
            <input value={price} onChange={e => setPrice(e.target.value)} type="number" style={{ width: '100%', padding: 12, background: '#1a1a1a', border: `1px solid ${FIRE.border}`, borderRadius: 8, color: '#fff', fontFamily: 'monospace', marginTop: 4, marginBottom: 12, boxSizing: 'border-box' }} />

            <label style={{ fontSize: 11, color: '#aaa' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="What are they unlocking?" style={{ width: '100%', padding: 12, background: '#1a1a1a', border: `1px solid ${FIRE.border}`, borderRadius: 8, color: '#fff', fontFamily: 'monospace', marginTop: 4, marginBottom: 12, resize: 'none', boxSizing: 'border-box' }} />

            <div onClick={() => setConsentAck(!consentAck)} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, cursor: 'pointer' }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${consentAck ? FIRE.primary : '#555'}`, background: consentAck ? FIRE.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>{consentAck ? '✓' : ''}</div>
              <span style={{ fontSize: 11, color: '#aaa' }}>I confirm this is my original content and I consent to its distribution</span>
            </div>

            <button onClick={handleUpload} disabled={!consentAck} style={{ width: '100%', padding: 14, borderRadius: 10, background: consentAck ? FIRE.primary : '#333', border: 'none', color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>🔥 Upload</button>
          </div>
        </div>
      )}

      {/* Upload FAB */}
      <div onClick={() => setShowUpload(true)} style={{ position: 'fixed', bottom: 90, right: 20, width: 56, height: 56, borderRadius: '50%', background: FIRE.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, cursor: 'pointer', boxShadow: '0 4px 20px rgba(239,68,68,.4)', zIndex: 50 }}>📤</div>
    </div>
  )
}
