/**
 * UFE -- Match Detail
 *
 * The heart of a match connection. Two people's journey together.
 * Hero with dual avatars, compatibility analytics, 3-station journey,
 * question progress -- all driven by loveWorldApi.
 *
 * ~450 lines. Token-driven. No inline fetchApi.
 */
'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '@/components/love-world/tokens'
import {
  RealmProvider, LWText, LWButton, LWCard, LWNav, LWBadge,
  LWProgress, LWDivider, LWSkeleton, LWAvatar, LWEmpty, LWSheet,
} from '@/components/love-world/primitives'
import { loveWorldApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'
import { CompatibilityRadar, GenotypeCard } from '@/components/love-world/ufe/CompatibilityRadar'
import { checkGenotypeCompatibility } from '@/lib/compatibility'

const T = REALM.ufe

/* ── Types ── */

interface Partner {
  name: string
  age: number
  location: string
  photo?: string | null
  verified: boolean
  ethnicity?: string
  religion?: string
  genotype?: string
}

interface Compatibility {
  overall: number
  values: number
  lifestyle: number
  faith: number
  culture: number
  goals: number
}

interface StationInfo {
  status: 'locked' | 'active' | 'completed'
  questionsAnswered: number
}

interface MatchData {
  id: string
  partner: Partner
  compatibility: Compatibility
  status: 'ACTIVE' | 'COOLING' | 'FOCUS_MODE'
  matchedAt: string
  sharedTraits: string[]
  stations: [StationInfo, StationInfo, StationInfo]
  questions: { answered: number; total: number; perStation: [number, number, number] }
  health: { score: number; label: string } | null
}

type Tab = 'overview' | 'journey' | 'questions'

/* ── Helpers ── */

function daysAgo(iso: string, now: number): string {
  if (!now) return ''
  const ms = now - new Date(iso).getTime()
  const d = Math.floor(ms / 86400000)
  if (d === 0) return 'Matched today'
  if (d === 1) return 'Matched yesterday'
  return `Matched ${d} days ago`
}

function levelColor(v: number): string {
  if (v >= 85) return T.accent
  if (v >= 70) return COLOR.success
  if (v >= 50) return COLOR.warning
  return COLOR.danger
}

function levelLabel(v: number): string {
  if (v >= 85) return 'Excellent'
  if (v >= 70) return 'Good'
  if (v >= 50) return 'Fair'
  return 'Low'
}

/* ── Skeleton ── */

function DetailSkeleton() {
  return (
    <RealmProvider realm="ufe">
      <LWNav title="Match" backHref="/dashboard/love/ufe" backLabel="UFE" />
      <div style={{ padding: `${SPACE[6]}px ${SPACE[4]}px`, display: 'flex', flexDirection: 'column', gap: SPACE[5] }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: SPACE[4], alignItems: 'center' }}>
          <LWSkeleton width={72} height={72} radius={RADIUS.full} />
          <LWSkeleton width={32} height={32} radius={RADIUS.full} />
          <LWSkeleton width={72} height={72} radius={RADIUS.full} />
        </div>
        <LWSkeleton width={100} height={36} style={{ alignSelf: 'center' }} />
        <LWSkeleton height={8} radius={RADIUS.full} />
        <LWSkeleton height={44} radius={RADIUS.lg} />
        <LWSkeleton height={180} radius={RADIUS.xl} />
        <LWSkeleton height={140} radius={RADIUS.xl} />
      </div>
    </RealmProvider>
  )
}

/* ── Metric Bar ── */

function MetricBar({ label, value, hint }: { label: string; value: number; hint: string }) {
  const c = levelColor(value)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[1] }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <LWText scale="caption" as="span" style={{ fontWeight: 500 }}>{label}</LWText>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: SPACE[1] }}>
          <span style={{ ...TYPE.body, fontWeight: 600, color: c }}>{value}%</span>
          <span style={{ ...TYPE.micro, color: c, textTransform: 'uppercase' }}>{levelLabel(value)}</span>
        </div>
      </div>
      <LWProgress value={value} height={4} color={c} />
      <LWText scale="micro" color="muted">{hint}</LWText>
    </div>
  )
}

/* ── Station Timeline Item ── */

const STATION_NAMES = ['Cultural Wall', 'Guided Chat', 'Experience Layer'] as const
const STATION_ROUTES = ['wall', 'chat', 'dates'] as const

function StationItem({
  index,
  station,
  matchId,
  isLast,
}: {
  index: number
  station: StationInfo
  matchId: string
  isLast: boolean
}) {
  const router = useRouter()
  const isActive = station.status === 'active'
  const isCompleted = station.status === 'completed'
  const isLocked = station.status === 'locked'

  return (
    <div style={{ display: 'flex', gap: SPACE[3] }}>
      {/* Vertical timeline line + dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: RADIUS.full,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isCompleted ? COLOR.success : isActive ? T.accent : COLOR.elevated,
          border: `2px solid ${isCompleted ? COLOR.success : isActive ? T.accent : COLOR.borderStrong}`,
          color: isCompleted || isActive ? '#fff' : COLOR.textMuted,
          ...TYPE.caption,
          fontWeight: 700,
        }}>
          {isCompleted ? (
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : isLocked ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" />
            </svg>
          ) : (
            index + 1
          )}
        </div>
        {!isLast && (
          <div style={{
            width: 2,
            flex: 1,
            minHeight: 24,
            background: isCompleted ? COLOR.success : COLOR.border,
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        paddingBottom: isLast ? 0 : SPACE[4],
        opacity: isLocked ? 0.45 : 1,
      }}>
        <LWText scale="body" as="span" style={{ fontWeight: 500 }}>
          Station {index + 1}: {STATION_NAMES[index]}
        </LWText>
        <LWText scale="caption" color={isActive ? 'accent' : isCompleted ? 'success' : 'muted'} as="div" style={{ marginTop: 2 }}>
          {isCompleted ? 'Completed' : isActive ? 'In progress' : 'Locked'}
        </LWText>
        {isActive && (
          <LWButton
            variant="secondary"
            size="sm"
            style={{ marginTop: SPACE[2] }}
            onClick={() => router.push(`/dashboard/love/matches/${matchId}/${STATION_ROUTES[index]}`)}
          >
            Enter Station
          </LWButton>
        )}
      </div>
    </div>
  )
}

/* ── Page ── */

export default function MatchDetailPage() {
  const params = useParams()
  const matchId = params.matchId as string

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [match, setMatch] = React.useState<MatchData | null>(null)
  const [tab, setTab] = React.useState<Tab>('overview')
  const [advanceSheet, setAdvanceSheet] = React.useState(false)
  const [exitSheet, setExitSheet] = React.useState(false)
  const [acting, setActing] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [clientNow, setClientNow] = React.useState(0)
  React.useEffect(() => { setClientNow(Date.now()) }, [])

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [matchRes, stationRes, questionsRes, healthRes] = await Promise.all([
        loveWorldApi.getMatch(matchId).catch((e) => { logApiFailure('love/match/get', e); return null }),
        loveWorldApi.getStationStatus(matchId).catch((e) => { logApiFailure('love/match/station', e); return null }),
        loveWorldApi.getQuestionProgress(matchId).catch((e) => { logApiFailure('love/match/questions', e); return null }),
        loveWorldApi.getMatchHealth(matchId).catch((e) => { logApiFailure('love/match/health', e); return null }),
      ])

      if (!matchRes) { setLoading(false); return }

      const m = matchRes.match || matchRes
      const s = stationRes || {}
      const q = questionsRes || {}

      const toStationInfo = (
        raw: any,
        fallbackStatus: 'locked' | 'active' | 'completed',
      ): StationInfo => ({
        status: raw?.completed ? 'completed' : raw?.unlocked ? 'active' : fallbackStatus,
        questionsAnswered: raw?.questionsAnswered || 0,
      })

      const data: MatchData = {
        id: matchId,
        partner: {
          name: m.partnerName || m.partner?.name || 'Match',
          age: m.partnerAge || m.partner?.age || 0,
          location: m.partnerLocation || m.partner?.location || '',
          photo: m.partnerPhoto || m.partner?.photo || null,
          verified: m.partnerVerified ?? m.partner?.verified ?? false,
          ethnicity: m.partner?.ethnicity || m.ethnicity || '',
          religion: m.partner?.religion || m.religion || '',
          genotype: m.partner?.genotype || m.genotype || '',
        },
        compatibility: {
          overall: m.compatibilityScore ?? m.compatibility?.overall ?? 0,
          values: m.breakdown?.values ?? m.compatibility?.values ?? 0,
          lifestyle: m.breakdown?.lifestyle ?? m.compatibility?.lifestyle ?? 0,
          faith: m.breakdown?.faith ?? m.compatibility?.faith ?? 0,
          culture: m.breakdown?.cultural ?? m.compatibility?.culture ?? 0,
          goals: m.breakdown?.goals ?? m.compatibility?.goals ?? 0,
        },
        status: m.status || m.stage || 'ACTIVE',
        matchedAt: m.matchedAt || m.createdAt || new Date().toISOString(),
        sharedTraits: m.sharedTraits || m.partner?.sharedTraits || [],
        stations: [
          toStationInfo(s.station1, 'active'),
          toStationInfo(s.station2, 'locked'),
          toStationInfo(s.station3, 'locked'),
        ],
        questions: {
          answered: q.totalAnswered || 0,
          total: q.totalQuestions || 200,
          perStation: [
            q.station1?.answered || q.perStation?.[0] || 0,
            q.station2?.answered || q.perStation?.[1] || 0,
            q.station3?.answered || q.perStation?.[2] || 0,
          ],
        },
        health: healthRes ? { score: healthRes.score || 0, label: healthRes.label || '' } : null,
      }
      setMatch(data)
    } catch (e) { logApiFailure('love/match/action', e) }
    setLoading(false)
  }, [matchId])

  React.useEffect(() => { load() }, [load])

  async function handleAdvance() {
    setActing(true)
    try { await loveWorldApi.advanceStation(matchId) } catch (e) { logApiFailure('love/match/advance', e) }
    setAdvanceSheet(false)
    setActing(false)
    load()
  }

  async function handleExit() {
    setActing(true)
    try { await loveWorldApi.exitMatch(matchId, 'User initiated') } catch (e) { logApiFailure('love/match/exit', e) }
    setExitSheet(false)
    setActing(false)
  }

  /* ── Loading ── */
  if (loading) return <DetailSkeleton />

  /* ── Error ── */
  if (error || !match) {
    return (
      <RealmProvider realm="ufe">
        <LWNav title="Match" backHref="/dashboard/love/ufe" backLabel="UFE" />
        <LWEmpty
          title={error ? 'Something went wrong' : 'Match not found'}
          message={error ? 'Could not load match data. Please try again.' : 'This match may have expired or been removed.'}
          action={error ? <LWButton variant="secondary" onClick={load}>Retry</LWButton> : undefined}
        />
      </RealmProvider>
    )
  }

  const p = match.partner
  const c = match.compatibility
  const currentStationComplete = match.stations.some(s => s.status === 'active') &&
    match.stations.findIndex(s => s.status === 'active') < 2

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'journey', label: 'Journey' },
    { key: 'questions', label: 'Questions' },
  ]

  const statusVariant = match.status === 'ACTIVE' ? 'success' as const
    : match.status === 'COOLING' ? 'warning' as const
    : 'accent' as const

  return (
    <RealmProvider realm="ufe">
      <LWNav
        title={p.name}
        backHref="/dashboard/love/ufe"
        backLabel="UFE"
        right={
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: COLOR.textSecondary,
              cursor: 'pointer',
              padding: SPACE[1],
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        }
      />

      <div style={{ padding: `${SPACE[5]}px ${SPACE[4]}px ${SPACE[12]}px`, display: 'flex', flexDirection: 'column', gap: SPACE[5] }}>

        {/* ── Hero: Dual Avatars ── */}
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: SPACE[3] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
            <LWAvatar size={68} name="You" />
            <div style={{
              width: 36,
              height: 36,
              borderRadius: RADIUS.full,
              background: T.accentMuted,
              border: `2px solid ${T.accent}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={T.accent} strokeWidth="1.5" fill={`${T.accent}30`} />
              </svg>
            </div>
            <LWAvatar src={p.photo} name={p.name} size={68} verified={p.verified} />
          </div>

          {/* Compatibility score */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ ...TYPE.display, color: c.overall >= 75 ? T.accent : COLOR.textSecondary }}>
              {c.overall}%
            </span>
            <LWProgress value={c.overall} height={6} style={{ width: 200, marginTop: SPACE[2] }} />
          </div>

          {/* Status + timestamp */}
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
            <LWBadge variant={statusVariant}>{match.status.replace('_', ' ')}</LWBadge>
          </div>
          <LWText scale="caption" color="muted">{daysAgo(match.matchedAt, clientNow)}</LWText>
        </section>

        {/* ── Tab Row ── */}
        <div style={{
          display: 'flex',
          background: COLOR.elevated,
          borderRadius: RADIUS.lg,
          padding: 3,
        }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                height: 36,
                borderRadius: RADIUS.md,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                ...TYPE.caption,
                fontWeight: tab === t.key ? 600 : 400,
                background: tab === t.key ? T.accent : 'transparent',
                color: tab === t.key ? COLOR.textInverse : COLOR.textMuted,
                transition: `all ${DURATION.fast} ${EASE.default}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Overview ── */}
        {tab === 'overview' && (
          <>
            {/* Compatibility Radar — financial-analytics style */}
            <LWCard padding={SPACE[5]}>
              <LWText scale="caption" color="muted" transform="uppercase" style={{ marginBottom: SPACE[4], letterSpacing: '0.06em' }}>
                Compatibility Analysis
              </LWText>
              <CompatibilityRadar
                data={{
                  cultural: c.culture,
                  family: c.values,
                  genotype: 0,
                  spiritual: c.faith,
                  economic: c.goals,
                  personality: c.lifestyle,
                }}
                overall={c.overall}
                recommendation={c.overall >= 75 ? 'PROCEED' : c.overall >= 50 ? 'CONDITIONAL' : 'STOP'}
              />
            </LWCard>

            {/* Genotype Safety */}
            {p.genotype && (
              <GenotypeCard
                {...checkGenotypeCompatibility('AA', p.genotype)}
                genotypeA="AA"
                genotypeB={p.genotype}
              />
            )}

            {/* Partner info */}
            <LWCard padding={SPACE[4]}>
              <LWText scale="caption" color="muted" transform="uppercase" style={{ marginBottom: SPACE[3], letterSpacing: '0.06em' }}>
                Partner Info
              </LWText>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
                {p.age > 0 && <InfoRow label="Age" value={String(p.age)} />}
                {p.location && <InfoRow label="Location" value={p.location} />}
                {p.ethnicity && <InfoRow label="Ethnicity" value={p.ethnicity} />}
                {p.religion && <InfoRow label="Religion" value={p.religion} />}
                {p.genotype && <InfoRow label="Genotype" value={p.genotype} />}
              </div>
            </LWCard>

            {/* Shared traits */}
            {match.sharedTraits.length > 0 && (
              <LWCard padding={SPACE[4]}>
                <LWText scale="caption" color="muted" transform="uppercase" style={{ marginBottom: SPACE[3], letterSpacing: '0.06em' }}>
                  Shared Traits
                </LWText>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACE[2] }}>
                  {match.sharedTraits.map((trait) => (
                    <LWBadge key={trait} variant="accent">{trait}</LWBadge>
                  ))}
                </div>
              </LWCard>
            )}
          </>
        )}

        {/* ── Tab 2: Journey ── */}
        {tab === 'journey' && (
          <>
            <LWCard padding={SPACE[5]}>
              <LWText scale="caption" color="muted" transform="uppercase" style={{ marginBottom: SPACE[4], letterSpacing: '0.06em' }}>
                3-Station Journey
              </LWText>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {match.stations.map((station, i) => (
                  <StationItem
                    key={i}
                    index={i}
                    station={station}
                    matchId={matchId}
                    isLast={i === 2}
                  />
                ))}
              </div>
            </LWCard>

            {/* Advance button -- only if current active station is complete */}
            {currentStationComplete && (
              <LWButton
                variant="primary"
                fullWidth
                onClick={() => setAdvanceSheet(true)}
              >
                Advance to Next Station
              </LWButton>
            )}
          </>
        )}

        {/* ── Tab 3: Questions ── */}
        {tab === 'questions' && (
          <>
            {/* Overall progress */}
            <LWCard padding={SPACE[5]}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: SPACE[3] }}>
                <LWText scale="h3" as="span">{match.questions.answered} of {match.questions.total}</LWText>
                <LWText scale="caption" color="muted">answered</LWText>
              </div>
              <LWProgress value={match.questions.answered} max={match.questions.total} height={8} />
            </LWCard>

            {/* Per-station breakdown */}
            <LWCard padding={SPACE[4]}>
              <LWText scale="caption" color="muted" transform="uppercase" style={{ marginBottom: SPACE[3], letterSpacing: '0.06em' }}>
                By Station
              </LWText>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
                {STATION_NAMES.map((name, i) => (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: SPACE[1] }}>
                      <LWText scale="caption" as="span" style={{ fontWeight: 500 }}>
                        Station {i + 1}: {name}
                      </LWText>
                      <LWText scale="caption" color="muted">{match.questions.perStation[i]} answered</LWText>
                    </div>
                    <LWProgress value={match.questions.perStation[i]} max={Math.ceil(match.questions.total / 3)} height={4} />
                  </div>
                ))}
              </div>
            </LWCard>

            {/* Health badge */}
            {match.health && (
              <LWCard padding={SPACE[4]}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <LWText scale="caption" color="secondary">Match Health</LWText>
                  <LWBadge variant={match.health.score >= 70 ? 'success' : match.health.score >= 40 ? 'warning' : 'danger'}>
                    {match.health.label || `${match.health.score}%`}
                  </LWBadge>
                </div>
              </LWCard>
            )}
          </>
        )}

        {/* ── Bottom Actions ── */}
        <LWDivider spacing={SPACE[2]} />
        <div style={{ display: 'flex', gap: SPACE[3] }}>
          <LWButton variant="ghost" fullWidth onClick={() => setMenuOpen(true)}>
            Report
          </LWButton>
          <LWButton variant="danger" fullWidth onClick={() => setExitSheet(true)}>
            Exit Match
          </LWButton>
        </div>
      </div>

      {/* ── Advance Station Sheet ── */}
      <LWSheet open={advanceSheet} onClose={() => setAdvanceSheet(false)} title="Advance Station">
        <LWText scale="body" color="secondary" style={{ marginBottom: SPACE[4] }}>
          You have completed the current station. Advancing will unlock the next station in your journey together. This action cannot be undone.
        </LWText>
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[2] }}>
          <LWButton variant="primary" fullWidth loading={acting} onClick={handleAdvance}>
            Confirm Advance
          </LWButton>
          <LWButton variant="ghost" fullWidth onClick={() => setAdvanceSheet(false)}>
            Cancel
          </LWButton>
        </div>
      </LWSheet>

      {/* ── Exit Match Sheet ── */}
      <LWSheet open={exitSheet} onClose={() => setExitSheet(false)} title="Exit This Match?">
        <LWText scale="body" color="secondary" style={{ marginBottom: SPACE[4] }}>
          Exiting will permanently end this connection. Your question progress and compatibility data will be archived but the match cannot be restored.
        </LWText>
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[2] }}>
          <LWButton variant="danger" fullWidth loading={acting} onClick={handleExit}>
            Exit Match
          </LWButton>
          <LWButton variant="ghost" fullWidth onClick={() => setExitSheet(false)}>
            Keep Match
          </LWButton>
        </div>
      </LWSheet>
    </RealmProvider>
  )
}

/* ── Small Helpers ── */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <LWText scale="caption" color="muted" style={{ flexShrink: 0, marginRight: SPACE[3] }}>{label}</LWText>
      <LWText scale="caption" color="secondary" style={{ textAlign: 'right' }}>{value}</LWText>
    </div>
  )
}
