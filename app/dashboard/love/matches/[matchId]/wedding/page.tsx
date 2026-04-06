'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

// ═══════════════════════════════════════════════════════════════════════
// LOVE WORLD — SACRED UNION PLANNER (AI Wedding Planner)
// Route: /dashboard/love/matches/[matchId]/wedding
// ═══════════════════════════════════════════════════════════════════════

const GOLD = '#D4AF37'
const BG = '#0A0A0F'
const CARD = '#111118'
const CARD2 = '#1A1A25'
const GREEN = '#00C853'
const RED = '#FF3B30'
const BLUE = '#4A90D9'
const PURPLE = '#8B5CF6'
const WHITE = '#FFFFFF'

type CeremonyType = 'TRADITIONAL' | 'RELIGIOUS' | 'CIVIL' | 'FUSION'
type Currency = 'COW' | 'USD' | 'NGN'

interface CeremonyPhase {
  id: string; name: string; description: string; completed: boolean
}
interface Contribution {
  id: string; name: string; amount: number; status: 'PLEDGED' | 'RECEIVED'
}
interface WeddingPlan {
  budget: number; currency: Currency; ceremonyType: CeremonyType
  guestCount: number; weddingDate: string
  phases: CeremonyPhase[]; contributions: Contribution[]
}

const CEREMONY_TYPES: { key: CeremonyType; icon: string; label: string; desc: string }[] = [
  { key: 'TRADITIONAL', icon: '\uD83C\uDFDB\uFE0F', label: 'Traditional', desc: 'Rooted in ancestral customs' },
  { key: 'RELIGIOUS',   icon: '\uD83D\uDD4C', label: 'Religious', desc: 'Faith-centered sacred rites' },
  { key: 'CIVIL',       icon: '\u2696\uFE0F', label: 'Civil', desc: 'Legal & civic ceremony' },
  { key: 'FUSION',      icon: '\uD83C\uDF0D', label: 'Fusion', desc: 'Blending traditions together' },
]

const DEFAULT_PHASES: CeremonyPhase[] = [
  { id: 'p1', name: 'Introduction of Families', description: 'Both families formally meet, exchange greetings, and establish the bonds between households.', completed: false },
  { id: 'p2', name: 'Bride Price / Lobola Ceremony', description: 'The groom\'s family presents gifts, cattle, or monetary offerings to honor the bride\'s family.', completed: false },
  { id: 'p3', name: 'Traditional Engagement', description: 'Cultural engagement rituals including libation pouring, kola nut ceremony, or tying of the knot.', completed: false },
  { id: 'p4', name: 'Religious / Civil Ceremony', description: 'The formal exchange of vows before spiritual leaders, elders, or civic officials.', completed: false },
  { id: 'p5', name: 'Reception / Celebration', description: 'Feasting, dancing, and communal celebration of the new union with all guests.', completed: false },
]

const VENDOR_CATEGORIES: { key: string; icon: string; label: string }[] = [
  { key: 'fashion',        icon: '\uD83D\uDC57', label: 'Fashion & Attire' },
  { key: 'catering',       icon: '\uD83C\uDF5B', label: 'Catering' },
  { key: 'music',          icon: '\uD83C\uDFB5', label: 'Music & Entertainment' },
  { key: 'photography',    icon: '\uD83D\uDCF8', label: 'Photography' },
  { key: 'venue',          icon: '\uD83C\uDFE8', label: 'Venue' },
  { key: 'transportation', icon: '\uD83D\uDE97', label: 'Transportation' },
  { key: 'decor',          icon: '\uD83C\uDF3A', label: 'Decor' },
]

const MOCK_CONTRIBUTIONS: Contribution[] = [
  { id: 'c1', name: 'Uncle Emeka', amount: 50000, status: 'RECEIVED' },
  { id: 'c2', name: 'Aunt Ngozi', amount: 30000, status: 'PLEDGED' },
  { id: 'c3', name: 'Village Elders', amount: 100000, status: 'PLEDGED' },
]

const KEYFRAMES = `
@keyframes glowCard {
  0%, 100% { box-shadow: 0 0 12px rgba(212,175,55,0.2); }
  50% { box-shadow: 0 0 24px rgba(212,175,55,0.5); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
`

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('afk-auth')
    const state = stored ? JSON.parse(stored)?.state : null
    return state?.accessToken ?? state?.token ?? null
  } catch { return null }
}

export default function WeddingPlannerPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const router = useRouter()
  const user = useAuthStore(s => s.user)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Plan state
  const [budget, setBudget] = useState(500000)
  const [currency, setCurrency] = useState<Currency>('COW')
  const [ceremonyType, setCeremonyType] = useState<CeremonyType>('TRADITIONAL')
  const [guestCount, setGuestCount] = useState(150)
  const [weddingDate, setWeddingDate] = useState('')
  const [phases, setPhases] = useState<CeremonyPhase[]>(DEFAULT_PHASES)
  const [contributions, setContributions] = useState<Contribution[]>(MOCK_CONTRIBUTIONS)

  // Accordion
  const [openVendor, setOpenVendor] = useState<string | null>(null)

  // Add contribution form
  const [showAddContrib, setShowAddContrib] = useState(false)
  const [contribName, setContribName] = useState('')
  const [contribAmount, setContribAmount] = useState('')
  const [contribStatus, setContribStatus] = useState<'PLEDGED' | 'RECEIVED'>('PLEDGED')

  const fetchPlan = useCallback(async () => {
    if (!matchId) return
    try {
      const token = getToken()
      const res = await fetch(`/api/love/journey/${matchId}/wedding`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      if (data.budget) setBudget(data.budget)
      if (data.currency) setCurrency(data.currency)
      if (data.ceremonyType) setCeremonyType(data.ceremonyType)
      if (data.guestCount) setGuestCount(data.guestCount)
      if (data.weddingDate) setWeddingDate(data.weddingDate.split('T')[0])
      if (data.phases?.length) setPhases(data.phases)
      if (data.contributions?.length) setContributions(data.contributions)
    } catch {
      // Keep defaults + mock data
    } finally {
      setLoading(false)
    }
  }, [matchId])

  useEffect(() => { fetchPlan() }, [fetchPlan])

  useEffect(() => {
    const tag = document.createElement('style')
    tag.textContent = KEYFRAMES
    document.head.appendChild(tag)
    return () => { document.head.removeChild(tag) }
  }, [])

  const handleSave = async () => {
    if (!matchId) return
    setSaving(true); setError(null); setSaved(false)
    try {
      const token = getToken()
      const res = await fetch(`/api/love/journey/${matchId}/wedding`, {
        method: 'PATCH',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget, currency, ceremonyType, guestCount, weddingDate: weddingDate || undefined, phases, contributions }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Could not save wedding plan. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const togglePhase = (phaseId: string) => {
    setPhases(prev => prev.map(p => p.id === phaseId ? { ...p, completed: !p.completed } : p))
  }

  const addContribution = () => {
    if (!contribName.trim() || !contribAmount) return
    const newContrib: Contribution = {
      id: `c-${Date.now()}`, name: contribName.trim(),
      amount: parseFloat(contribAmount) || 0, status: contribStatus,
    }
    setContributions(prev => [...prev, newContrib])
    setContribName(''); setContribAmount(''); setShowAddContrib(false)
  }

  const removeContribution = (id: string) => {
    setContributions(prev => prev.filter(c => c.id !== id))
  }

  const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0)
  const currSymbol = currency === 'COW' ? '\uD83E\uDE99' : currency === 'USD' ? '$' : '\u20A6'

  if (loading) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: GOLD, fontFamily: 'monospace', fontSize: 14 }}>Loading Wedding Planner...</p>
    </div>
  )

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'monospace', color: WHITE, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 14px', borderBottom: `2px solid ${GOLD}33`,
        background: `linear-gradient(180deg, ${CARD} 0%, ${BG} 100%)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: GOLD, fontSize: 20, cursor: 'pointer', padding: 0, fontFamily: 'monospace' }}>
            &larr;
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 18, color: GOLD, fontFamily: 'monospace', letterSpacing: 1 }}>
              {'\uD83D\uDC51'} SACRED UNION PLANNER
            </h1>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Error */}
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: `${RED}22`, color: RED, fontSize: 12 }}>
            {error}
          </div>
        )}

        {/* Budget Section */}
        <div style={{ background: CARD, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 12 }}>BUDGET</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value) || 0)}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${CARD2}`,
                background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 16, fontWeight: 700,
                outline: 'none', boxSizing: 'border-box',
              }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['COW', 'USD', 'NGN'] as Currency[]).map(c => (
              <button key={c} onClick={() => setCurrency(c)} style={{
                flex: 1, padding: '8px 0', borderRadius: 8, fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', border: `1px solid ${currency === c ? GOLD : '#333'}`,
                background: currency === c ? `${GOLD}22` : 'transparent',
                color: currency === c ? GOLD : '#888',
              }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#666' }}>
            Total Contributions: {currSymbol}{totalContributed.toLocaleString()} / {currSymbol}{budget.toLocaleString()}
          </div>
          <div style={{ marginTop: 6, height: 4, background: CARD2, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${Math.min((totalContributed / Math.max(budget, 1)) * 100, 100)}%`,
              background: totalContributed >= budget ? GREEN : GOLD, borderRadius: 2, transition: 'width 0.4s',
            }} />
          </div>
        </div>

        {/* Ceremony Type Selector */}
        <div style={{ background: CARD, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 12 }}>CEREMONY TYPE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {CEREMONY_TYPES.map(ct => {
              const sel = ceremonyType === ct.key
              return (
                <button key={ct.key} onClick={() => setCeremonyType(ct.key)} style={{
                  padding: '14px 10px', borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                  border: sel ? `2px solid ${GOLD}` : `1px solid #333`,
                  background: sel ? `${GOLD}15` : CARD2, color: WHITE, fontFamily: 'monospace',
                  animation: sel ? 'glowCard 2s ease-in-out infinite' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{ct.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{ct.label}</div>
                  <div style={{ fontSize: 10, color: '#888' }}>{ct.desc}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Guest Count + Wedding Date */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, background: CARD, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, marginBottom: 10 }}>GUESTS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setGuestCount(Math.max(1, guestCount - 10))} style={{
                width: 36, height: 36, borderRadius: '50%', border: `1px solid ${GOLD}`, background: 'transparent',
                color: GOLD, fontSize: 18, cursor: 'pointer', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>-</button>
              <span style={{ fontSize: 24, fontWeight: 800, color: WHITE, minWidth: 50, textAlign: 'center' }}>{guestCount}</span>
              <button onClick={() => setGuestCount(guestCount + 10)} style={{
                width: 36, height: 36, borderRadius: '50%', border: `1px solid ${GOLD}`, background: 'transparent',
                color: GOLD, fontSize: 18, cursor: 'pointer', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+</button>
            </div>
          </div>
          <div style={{ flex: 1, background: CARD, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, marginBottom: 10 }}>WEDDING DATE</div>
            <input type="date" value={weddingDate} onChange={e => setWeddingDate(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${CARD2}`,
                background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 13, outline: 'none',
                boxSizing: 'border-box',
              }} />
          </div>
        </div>

        {/* Cultural Ceremony Template */}
        <div style={{ background: CARD, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 14 }}>CEREMONY PHASES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {phases.map((phase, idx) => (
              <div key={phase.id} style={{
                background: CARD2, borderRadius: 12, padding: '12px 14px',
                borderLeft: `3px solid ${phase.completed ? GREEN : '#444'}`,
                opacity: phase.completed ? 0.75 : 1, transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => togglePhase(phase.id)} style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                    border: phase.completed ? `2px solid ${GREEN}` : '2px solid #555',
                    background: phase.completed ? `${GREEN}22` : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: GREEN, fontFamily: 'monospace',
                  }}>
                    {phase.completed ? '\u2713' : ''}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: WHITE, marginBottom: 2,
                      textDecoration: phase.completed ? 'line-through' : 'none',
                    }}>
                      <span style={{ color: '#666', marginRight: 6 }}>{idx + 1}.</span>
                      {phase.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#888', lineHeight: 1.4 }}>{phase.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Categories */}
        <div style={{ background: CARD, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 14 }}>VENDOR CATEGORIES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {VENDOR_CATEGORIES.map(vc => {
              const isOpen = openVendor === vc.key
              return (
                <div key={vc.key}>
                  <button onClick={() => setOpenVendor(isOpen ? null : vc.key)} style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    background: isOpen ? CARD2 : 'transparent', border: `1px solid ${isOpen ? '#444' : '#2a2a35'}`,
                    color: WHITE, fontFamily: 'monospace', fontSize: 13, textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 18 }}>{vc.icon}</span>
                    <span style={{ flex: 1, fontWeight: 600 }}>{vc.label}</span>
                    <span style={{ fontSize: 14, color: '#666', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                      {'\u25BC'}
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '10px 14px', animation: 'fadeIn 0.2s ease' }}>
                      <p style={{ margin: '0 0 10px', fontSize: 12, color: '#888' }}>
                        Find trusted {vc.label.toLowerCase()} vendors from your village network.
                      </p>
                      <button onClick={() => router.push('/dashboard/villages/marketplace')} style={{
                        padding: '8px 16px', borderRadius: 8, background: `${PURPLE}22`, border: `1px solid ${PURPLE}`,
                        color: PURPLE, fontFamily: 'monospace', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>
                        Browse Village Market
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Family Contributions Tracker */}
        <div style={{ background: CARD, borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: GOLD, fontWeight: 700 }}>FAMILY CONTRIBUTIONS</div>
            <button onClick={() => setShowAddContrib(!showAddContrib)} style={{
              padding: '4px 12px', borderRadius: 8, border: `1px solid ${GOLD}`,
              background: 'transparent', color: GOLD, fontFamily: 'monospace', fontSize: 11,
              cursor: 'pointer', fontWeight: 600,
            }}>
              {showAddContrib ? 'Cancel' : '+ Add'}
            </button>
          </div>

          {/* Add form */}
          {showAddContrib && (
            <div style={{ background: CARD2, borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input type="text" value={contribName} onChange={e => setContribName(e.target.value)}
                  placeholder="Name" style={{
                    flex: 2, padding: '8px 10px', borderRadius: 8, border: `1px solid #333`,
                    background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 12, outline: 'none',
                    boxSizing: 'border-box',
                  }} />
                <input type="number" value={contribAmount} onChange={e => setContribAmount(e.target.value)}
                  placeholder="Amount" style={{
                    flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid #333`,
                    background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 12, outline: 'none',
                    boxSizing: 'border-box',
                  }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={contribStatus} onChange={e => setContribStatus(e.target.value as 'PLEDGED' | 'RECEIVED')}
                  style={{
                    flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid #333`,
                    background: BG, color: WHITE, fontFamily: 'monospace', fontSize: 12, outline: 'none',
                  }}>
                  <option value="PLEDGED">Pledged</option>
                  <option value="RECEIVED">Received</option>
                </select>
                <button onClick={addContribution} disabled={!contribName.trim() || !contribAmount} style={{
                  flex: 1, padding: '8px', borderRadius: 8, background: GREEN, color: BG,
                  border: 'none', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  opacity: (!contribName.trim() || !contribAmount) ? 0.5 : 1,
                }}>
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Contributions table */}
          {contributions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, opacity: 0.4, fontSize: 12 }}>No contributions yet</div>
          ) : (
            <div>
              {/* Table header */}
              <div style={{ display: 'flex', padding: '6px 10px', borderBottom: `1px solid #333`, marginBottom: 4 }}>
                <span style={{ flex: 2, fontSize: 10, color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>Name</span>
                <span style={{ flex: 1, fontSize: 10, color: '#666', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Amount</span>
                <span style={{ flex: 1, fontSize: 10, color: '#666', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Status</span>
                <span style={{ width: 30 }} />
              </div>
              {contributions.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderBottom: '1px solid #1a1a25' }}>
                  <span style={{ flex: 2, fontSize: 12, color: WHITE }}>{c.name}</span>
                  <span style={{ flex: 1, fontSize: 12, color: WHITE, textAlign: 'right', fontWeight: 600 }}>
                    {currSymbol}{c.amount.toLocaleString()}
                  </span>
                  <span style={{
                    flex: 1, textAlign: 'right',
                  }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: c.status === 'RECEIVED' ? `${GREEN}22` : `${GOLD}22`,
                      color: c.status === 'RECEIVED' ? GREEN : GOLD,
                    }}>
                      {c.status}
                    </span>
                  </span>
                  <button onClick={() => removeContribution(c.id)} style={{
                    width: 30, background: 'none', border: 'none', color: '#555', fontSize: 14,
                    cursor: 'pointer', fontFamily: 'monospace', padding: 0, textAlign: 'center',
                  }}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: '14px 0', borderRadius: 12,
          background: `linear-gradient(135deg, ${GOLD}, #F5D76E)`,
          color: BG, border: 'none', fontFamily: 'monospace', fontSize: 15, fontWeight: 800,
          cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1,
          letterSpacing: 1,
        }}>
          {saving ? 'Saving...' : saved ? '\u2713 Saved!' : 'Save Changes'}
        </button>

        {saved && (
          <div style={{ textAlign: 'center', fontSize: 12, color: GREEN, marginTop: -8 }}>
            Wedding plan saved successfully
          </div>
        )}
      </div>
    </div>
  )
}
