'use client'
import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { loveWorldApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

// ═══════════════════════════════════════════════════════════════════════
// LOVE WORLD — MATCH DETAIL
// Route: /dashboard/love/matches/[matchId]
// ═══════════════════════════════════════════════════════════════════════

type StationKey = 'CULTURAL_WALL' | 'GUIDED_CHAT' | 'VIRTUAL_DATES' | 'NONE'
interface MatchPartner { afroId: string; displayName: string; heritage: string; photoUrl?: string; verified?: boolean }
interface CompatBreakdown { cultural: number; genotype: number; family: number; spiritual: number; personality: number }
interface MatchDetail { id: string; partner: MatchPartner; matchScore: number; status: string; currentStation: StationKey; compatibility: CompatBreakdown; createdAt: string; updatedAt: string }
interface ChecklistItem { key: string; label: string; done: boolean }
interface StationChecklist { station: StationKey; items: ChecklistItem[]; canAdvance: boolean }

const STATION_META: Record<StationKey, { label: string; color: string; route: string; icon: string }> = {
  CULTURAL_WALL: { label: 'Cultural Wall', color: '#D4AF37', route: 'wall',  icon: '\u{1F3DB}' },
  GUIDED_CHAT:   { label: 'Guided Chat',   color: '#60a5fa', route: 'chat',  icon: '\u{1F4AC}' },
  VIRTUAL_DATES: { label: 'Virtual Dates',  color: '#c084fc', route: 'dates', icon: '\u{1F30D}' },
  NONE:          { label: 'Not Started',     color: '#666',    route: '',      icon: '\u{23F3}' },
}

const COMPAT_BARS: { key: keyof CompatBreakdown; label: string; weight: string; color: string }[] = [
  { key: 'cultural',    label: 'Cultural',    weight: '40%', color: '#D4AF37' },
  { key: 'genotype',    label: 'Genotype',    weight: '25%', color: '#00C853' },
  { key: 'family',      label: 'Family',      weight: '20%', color: '#60a5fa' },
  { key: 'spiritual',   label: 'Spiritual',   weight: '10%', color: '#c084fc' },
  { key: 'personality', label: 'Personality',  weight: '5%',  color: '#f97316' },
]

const ZERO_COMPAT: CompatBreakdown = { cultural: 0, genotype: 0, family: 0, spiritual: 0, personality: 0 }
const CARD: React.CSSProperties = { background: '#111118', borderRadius: 16, padding: 18, border: '1px solid #222' }

function hashColor(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); return `hsl(${Math.abs(h) % 360},55%,45%)` }
function initial(n: string) { return (n?.[0] ?? '?').toUpperCase() }

export default function MatchDetailPage() {
  const router = useRouter()
  const params = useParams()
  const matchId = params?.matchId as string
  const { user } = useAuthStore()

  const [match, setMatch] = React.useState<MatchDetail | null>(null)
  const [checklist, setChecklist] = React.useState<StationChecklist | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [advancing, setAdvancing] = React.useState(false)
  const [showReport, setShowReport] = React.useState(false)
  const [reportType, setReportType] = React.useState('INAPPROPRIATE')
  const [reportDesc, setReportDesc] = React.useState('')
  const [reportSending, setReportSending] = React.useState(false)
  const [reportSent, setReportSent] = React.useState(false)

  const reload = React.useCallback(async () => {
    const [m, c] = await Promise.all([loveWorldApi.getMatch(matchId), loveWorldApi.getStationChecklist(matchId)])
    setMatch(m); setChecklist(c)
  }, [matchId])

  React.useEffect(() => {
    if (!matchId) return
    let cancelled = false
    setLoading(true); setError(null)
    reload().catch((e: any) => { if (!cancelled) setError(e?.message ?? 'Failed to load match') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [matchId, reload])

  async function handleAdvance() {
    if (advancing || !checklist?.canAdvance) return
    setAdvancing(true)
    try { await loveWorldApi.advanceStation(matchId); await reload() }
    catch (e: any) { setError(e?.message ?? 'Failed to advance station') }
    finally { setAdvancing(false) }
  }

  async function handleReport() {
    if (reportSending || !match) return
    setReportSending(true)
    try {
      await loveWorldApi.fileReport({ targetAfroId: match.partner.afroId, matchId: match.id, flagType: reportType, description: reportDesc || undefined })
      setReportSent(true)
    } catch { /* silent */ } finally { setReportSending(false) }
  }

  const sm = match ? (STATION_META[match.currentStation] ?? STATION_META.NONE) : STATION_META.NONE
  const compat = match?.compatibility ?? ZERO_COMPAT

  if (loading) return (
    <div style={{ minHeight: '100dvh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
      <div style={{ textAlign: 'center', color: '#666' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #333', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ fontSize: 13 }}>Loading match...</div>
      </div>
    </div>
  )

  if (error || !match) return (
    <div style={{ minHeight: '100dvh', background: '#0A0A0F', fontFamily: 'monospace', padding: 24, color: '#FFF' }}>
      <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: 20, cursor: 'pointer', fontFamily: 'monospace', padding: 0 }}>&larr; Back</button>
      <div style={{ textAlign: 'center', padding: 48, color: '#FF3B30', marginTop: 40 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>!</div>
        <div style={{ fontSize: 14 }}>{error ?? 'Match not found'}</div>
      </div>
    </div>
  )

  const p = match.partner
  const cc = hashColor(p.afroId || p.displayName)
  const scoreColor = match.matchScore >= 80 ? '#00C853' : match.matchScore >= 60 ? '#D4AF37' : '#FF3B30'

  return (
    <div style={{ minHeight: '100dvh', background: '#0A0A0F', color: '#FFF', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.push('/dashboard/love/matches')} style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: 22, cursor: 'pointer', padding: 0, fontFamily: 'monospace' }}>&larr;</button>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>Match Detail</h1>
      </div>

      <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Partner Profile */}
        <div style={{ ...CARD, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: cc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {initial(p.displayName)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{p.displayName}</span>
              {p.verified && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 6, background: 'rgba(0,200,83,.15)', color: '#00C853', fontWeight: 700 }}>Verified</span>}
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>{p.heritage || 'Heritage unknown'}</div>
            <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800, color: scoreColor }}>
              {match.matchScore}% <span style={{ fontSize: 12, fontWeight: 500, color: '#666' }}>match</span>
            </div>
          </div>
        </div>

        {/* Compatibility Breakdown */}
        <div style={CARD}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#D4AF37' }}>Compatibility Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {COMPAT_BARS.map(bar => {
              const val = compat[bar.key] ?? 0
              return (
                <div key={bar.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#ccc' }}>{bar.label}</span>
                    <span style={{ fontSize: 12, color: '#888' }}>{val}% <span style={{ color: '#555' }}>({bar.weight})</span></span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: '#1A1A25', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${Math.min(val, 100)}%`, background: bar.color, transition: 'width .4s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Station */}
        <div style={{ ...CARD, border: `1px solid ${sm.color}33` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>{sm.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: sm.color }}>{sm.label}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Current Station</div>
            </div>
          </div>
          {match.currentStation !== 'NONE' && (
            <button onClick={() => router.push(`/dashboard/love/matches/${matchId}/${sm.route}`)} style={{
              width: '100%', padding: '12px 0', borderRadius: 10, background: sm.color, color: '#0A0A0F',
              fontFamily: 'monospace', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: .5,
            }}>Enter Station</button>
          )}
        </div>

        {/* Station Checklist */}
        {checklist && checklist.items.length > 0 && (
          <div style={CARD}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#ccc' }}>Station Checklist</div>
            {checklist.items.map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                  border: item.done ? '2px solid #00C853' : '2px solid #444',
                  background: item.done ? 'rgba(0,200,83,.15)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#00C853',
                }}>{item.done ? '\u2713' : ''}</div>
                <span style={{ fontSize: 13, color: item.done ? '#888' : '#ccc', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</span>
              </div>
            ))}
            <button onClick={handleAdvance} disabled={!checklist.canAdvance || advancing} style={{
              width: '100%', marginTop: 10, padding: '12px 0', borderRadius: 10,
              background: checklist.canAdvance ? '#00C853' : '#333', color: checklist.canAdvance ? '#0A0A0F' : '#666',
              fontFamily: 'monospace', fontSize: 14, fontWeight: 700, border: 'none',
              cursor: checklist.canAdvance ? 'pointer' : 'not-allowed', opacity: advancing ? .6 : 1, letterSpacing: .5,
            }}>{advancing ? 'Advancing...' : checklist.canAdvance ? 'Advance Station' : 'Complete checklist to advance'}</button>
          </div>
        )}

        {/* Report */}
        <div style={CARD}>
          {!showReport ? (
            <button onClick={() => setShowReport(true)} style={{
              width: '100%', padding: '10px 0', borderRadius: 10, border: '1px solid #FF3B30',
              background: 'transparent', color: '#FF3B30', fontFamily: 'monospace', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Report Match</button>
          ) : reportSent ? (
            <div style={{ textAlign: 'center', padding: 12, color: '#00C853', fontSize: 14 }}>Report submitted. Our elders will review it.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FF3B30' }}>Report this match</div>
              <select value={reportType} onChange={e => setReportType(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, background: '#1A1A25', border: '1px solid #333', color: '#fff', fontFamily: 'monospace', fontSize: 13 }}>
                <option value="INAPPROPRIATE">Inappropriate behavior</option>
                <option value="FAKE_PROFILE">Fake profile</option>
                <option value="HARASSMENT">Harassment</option>
                <option value="SCAM">Scam attempt</option>
                <option value="OTHER">Other</option>
              </select>
              <textarea value={reportDesc} onChange={e => setReportDesc(e.target.value)} placeholder="Describe the issue (optional)..." rows={3} style={{ padding: '10px 12px', borderRadius: 8, resize: 'vertical', background: '#1A1A25', border: '1px solid #333', color: '#fff', fontFamily: 'monospace', fontSize: 13 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setShowReport(false); setReportDesc('') }} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #444', background: 'transparent', color: '#888', fontFamily: 'monospace', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleReport} disabled={reportSending} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#FF3B30', color: '#fff', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: reportSending ? .6 : 1 }}>
                  {reportSending ? 'Sending...' : 'Submit Report'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
