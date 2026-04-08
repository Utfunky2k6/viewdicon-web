/**
 * UFÈ — Match Card
 *
 * High-value presentation. Not a swipe card.
 * Each match is presented as a structured, analytical profile.
 * Design reference: Revolut portfolio card, Stripe customer card.
 */
'use client'

import * as React from 'react'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, REALM } from '../tokens'
import { LWAvatar, LWBadge, LWText } from '../primitives'

const T = REALM.ufe

/* ─── Types ─── */

export interface MatchProfile {
  id: string
  name: string
  age: number
  location: string
  photo?: string | null
  verified: boolean
  compatibilityScore: number
  breakdown: {
    cultural: number
    values: number
    genotype: number
    intent: number
  }
  stage: 'DISCOVERY' | 'ENGAGED' | 'INTENT' | 'UNION_READY'
  currentStation: 1 | 2 | 3
  matchedAt: string
}

const STAGE_LABEL: Record<string, string> = {
  DISCOVERY: 'Discovery',
  ENGAGED: 'Engaged',
  INTENT: 'Intent Declared',
  UNION_READY: 'Union Ready',
}

/* ─── Compatibility Bar ─── */

function CompatibilityBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
      <span style={{
        ...TYPE.micro,
        color: COLOR.textMuted,
        width: 52,
        textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{
        flex: 1,
        height: 4,
        borderRadius: RADIUS.full,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${value}%`,
          borderRadius: RADIUS.full,
          background: value >= 80 ? T.accent : value >= 60 ? COLOR.textSecondary : COLOR.textMuted,
          transition: `width ${DURATION.slow} ${EASE.default}`,
        }} />
      </div>
      <span style={{
        ...TYPE.micro,
        color: value >= 80 ? T.accent : COLOR.textSecondary,
        width: 28,
        textAlign: 'right',
      }}>
        {value}%
      </span>
    </div>
  )
}

/* ─── Match Card ─── */

export function MatchCard({
  match,
  onClick,
  index = 0,
}: {
  match: MatchProfile
  onClick: () => void
  index?: number
}) {
  return (
    <button
      onClick={onClick}
      className="lw-card-hover"
      style={{
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: SPACE[4],
        padding: SPACE[5],
        background: T.card,
        border: `1px solid ${COLOR.border}`,
        borderRadius: RADIUS.xl,
        fontFamily: 'inherit',
        color: COLOR.textPrimary,
        animation: `lw-card-enter ${DURATION.slow} ${EASE.default} both`,
        animationDelay: `${index * 80 + 100}ms`,
      }}
    >
      {/* Top row: avatar + name + score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
        <LWAvatar
          src={match.photo}
          name={match.name}
          size={56}
          verified={match.verified}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
            <LWText scale="h3" as="span" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {match.name}
            </LWText>
            <LWText scale="caption" color="muted" as="span">{match.age}</LWText>
          </div>
          <LWText scale="caption" color="secondary" style={{ marginTop: 2 }}>
            {match.location}
          </LWText>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{
            ...TYPE.h1,
            color: match.compatibilityScore >= 80 ? T.accent : COLOR.textSecondary,
          }}>
            {match.compatibilityScore}
          </span>
          <p style={{ ...TYPE.micro, color: COLOR.textMuted, margin: 0, marginTop: 2 }}>
            MATCH
          </p>
        </div>
      </div>

      {/* Compatibility breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[1.5] }}>
        <CompatibilityBar label="Culture" value={match.breakdown.cultural} />
        <CompatibilityBar label="Values" value={match.breakdown.values} />
        <CompatibilityBar label="Geno" value={match.breakdown.genotype} />
        <CompatibilityBar label="Intent" value={match.breakdown.intent} />
      </div>

      {/* Footer: stage + action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <LWBadge variant="accent">
          Station {match.currentStation} · {STAGE_LABEL[match.stage] || match.stage}
        </LWBadge>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[1], color: T.accent }}>
          <LWText scale="caption" color="accent" as="span" style={{ fontWeight: 500 }}>
            View Profile
          </LWText>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </button>
  )
}

/* ─── Weekly Match Counter ─── */

export function WeeklyMatchCounter({ remaining, total = 3 }: { remaining: number; total?: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: SPACE[3],
      padding: `${SPACE[3]}px ${SPACE[4]}px`,
      background: T.accentMuted,
      borderRadius: RADIUS.lg,
      border: `1px solid ${T.accent}20`,
    }}>
      <div style={{ display: 'flex', gap: SPACE[1] }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: RADIUS.full,
              background: i < remaining ? T.accent : 'rgba(255,255,255,0.08)',
              transition: `background ${DURATION.normal} ${EASE.default}`,
            }}
          />
        ))}
      </div>
      <LWText scale="caption" color="accent" as="span">
        {remaining} match{remaining !== 1 ? 'es' : ''} remaining this week
      </LWText>
    </div>
  )
}

/* ─── Station Tracker ─── */

const STATIONS = [
  { num: 1, name: 'Cultural Wall', duration: '72 hours' },
  { num: 2, name: 'Guided Chat', duration: '5 days' },
  { num: 3, name: 'Experience', duration: '14 days' },
]

export function StationTracker({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'flex', gap: 0 }}>
      {STATIONS.map((s, i) => {
        const isActive = s.num === current
        const isComplete = s.num < current
        const isLocked = s.num > current
        return (
          <div
            key={s.num}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: SPACE[2],
              position: 'relative',
              opacity: isLocked ? 0.35 : 1,
            }}
          >
            {/* Connector line */}
            {i > 0 && (
              <div style={{
                position: 'absolute',
                top: 14,
                right: '50%',
                width: '100%',
                height: 2,
                background: isComplete || isActive ? T.accent : COLOR.border,
                zIndex: 0,
              }} />
            )}
            {/* Node */}
            <div style={{
              position: 'relative',
              zIndex: 1,
              width: 28,
              height: 28,
              borderRadius: RADIUS.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isComplete ? T.accent : isActive ? T.accentMuted : COLOR.elevated,
              border: isActive ? `2px solid ${T.accent}` : `1px solid ${COLOR.border}`,
              color: isComplete ? COLOR.textInverse : isActive ? T.accent : COLOR.textMuted,
              ...TYPE.micro,
              fontWeight: 700,
            }}>
              {isComplete ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : isLocked ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" />
                </svg>
              ) : (
                s.num
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <LWText scale="micro" color={isActive ? 'primary' : 'muted'} as="div" style={{ fontWeight: isActive ? 600 : 400 }}>
                {s.name}
              </LWText>
              <LWText scale="micro" color="muted" as="div" style={{ marginTop: 2 }}>
                {s.duration}
              </LWText>
            </div>
          </div>
        )
      })}
    </div>
  )
}
