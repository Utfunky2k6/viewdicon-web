'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ringsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

type NodeState = 'verified' | 'pending' | 'deceased'
interface TreeNode {
  id: string
  label: string
  sub: string
  state: NodeState
  cx: number
  cy: number
  isViewdicon?: boolean
}

const RELATIONSHIP_TYPES = [
  'PARENT', 'CHILD', 'SIBLING', 'SPOUSE', 'PARTNER',
  'GRANDPARENT', 'GRANDCHILD', 'AUNT', 'UNCLE', 'COUSIN',
  'NIECE', 'NEPHEW', 'GUARDIAN', 'WARD', 'ADOPTIVE_PARENT',
  'ADOPTIVE_CHILD', 'STEP_PARENT', 'STEP_CHILD', 'HALF_SIBLING',
  'IN_LAW', 'SPIRITUAL_GUIDE', 'TRIBAL_ELDER',
] as const

type Relationship = typeof RELATIONSHIP_TYPES[number]

interface AddedMember {
  id: string
  name: string
  relationship: Relationship
  targetIdentifier: string
  addedAt: string
  inviteSent: boolean
}

const LS_KEY = 'vd-family-tree'

function loadPersistedMembers(): AddedMember[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function persistMembers(members: AddedMember[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LS_KEY, JSON.stringify(members)) } catch { /* noop */ }
}

function relLabel(r: string): string {
  return r
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

// Default mock tree nodes (original hardcoded set — shown as fallback)
const MOCK_TREE_NODES: TreeNode[] = [
  { id: 'gf_pat', label: 'Baba Agba',  sub: 'Grandfather', state: 'deceased', cx: 200, cy: 100 },
  { id: 'gm_pat', label: 'Iya Agba',   sub: 'Grandmother', state: 'deceased', cx: 350, cy: 100 },
  { id: 'gf_mat', label: 'Baba Iya',   sub: 'Grandfather', state: 'verified', cx: 650, cy: 100 },
  { id: 'gm_mat', label: 'Iya Iya',    sub: 'Grandmother', state: 'verified', cx: 800, cy: 100 },
  { id: 'father', label: 'Umoh Snr',   sub: 'Baba',        state: 'verified', cx: 275, cy: 250, isViewdicon: true },
  { id: 'mother', label: 'Mma Utibe',  sub: 'Iya',         state: 'verified', cx: 725, cy: 250, isViewdicon: true },
  { id: 'bro',    label: 'Kwame',      sub: 'Egbon',       state: 'pending',  cx: 300, cy: 400, isViewdicon: true },
  { id: 'me',     label: 'You',        sub: 'ME',          state: 'verified', cx: 500, cy: 400, isViewdicon: true },
  { id: 'sis',    label: 'Chioma',     sub: 'Aburo',       state: 'verified', cx: 700, cy: 400 },
  { id: 'child',  label: 'Ebenezer',   sub: 'Son',         state: 'pending',  cx: 500, cy: 550 },
]

const MOCK_LINKS = [
  { x1: 200, y1: 100, x2: 350, y2: 100 },
  { x1: 650, y1: 100, x2: 800, y2: 100 },
  { x1: 275, y1: 100, x2: 275, y2: 250 },
  { x1: 725, y1: 100, x2: 725, y2: 250 },
  { x1: 275, y1: 250, x2: 725, y2: 250 },
  { x1: 500, y1: 250, x2: 500, y2: 400 },
  { x1: 300, y1: 400, x2: 700, y2: 400 },
  { x1: 500, y1: 400, x2: 500, y2: 550 },
]

export default function FamilyTreeSVG() {
  const router = useRouter()
  const [selected, setSelected] = useState<TreeNode | null>(null)
  const [nodes, setNodes]       = useState<TreeNode[]>(MOCK_TREE_NODES)
  const [links, setLinks]       = useState(MOCK_LINKS)
  const [addedMembers, setAddedMembers] = useState<AddedMember[]>([])
  const [showSheet, setShowSheet]       = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [submitMsg, setSubmitMsg]       = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Form fields
  const [formName,       setFormName]       = useState('')
  const [formRel,        setFormRel]        = useState<Relationship>('PARENT')
  const [formIdentifier, setFormIdentifier] = useState('')

  const user   = useAuthStore(s => s.user)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = user?.id || (user as any)?.afroId?.raw || ''

  // ── Load persisted members from localStorage on mount ──────────
  useEffect(() => {
    const stored = loadPersistedMembers()
    setAddedMembers(stored)
  }, [])

  // ── Fetch real bonds from rings-service ─────────────────────────
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await ringsApi.getBonds(userId)
        if (cancelled) return
        const bonds = res?.data?.bonds || res?.bonds || []
        if (Array.isArray(bonds) && bonds.length > 0) {
          const apiNodes: TreeNode[] = bonds.map((bond: Record<string, unknown>, i: number) => ({
            id:          (bond.id as string) || `bond-${i}`,
            label:       (bond.displayName as string) || (bond.name as string) || (bond.handle as string) || 'Unknown',
            sub:         relLabel((bond.relationship as string) || (bond.type as string) || 'Bond'),
            state:       (
              bond.status === 'accepted' || bond.status === 'verified' ||
              bond.status === 'ACCEPTED' || bond.status === 'ACTIVE'
            ) ? 'verified' as const : 'pending' as const,
            cx: 150 + (i % 5) * 175,
            cy: 100 + Math.floor(i / 5) * 150,
            isViewdicon: !!(bond.afroId),
          }))
          const meNode: TreeNode = {
            id: 'me', label: 'You', sub: 'ME', state: 'verified', cx: 500, cy: 400, isViewdicon: true,
          }
          setNodes([meNode, ...apiNodes])
          const apiLinks = apiNodes.map(n => ({ x1: 500, y1: 400, x2: n.cx, y2: n.cy }))
          setLinks(apiLinks)
        }
        // If empty, keep MOCK_TREE_NODES (already set as default state)
      } catch {
        // API failed — keep mock nodes (already default)
      }
    })()
    return () => { cancelled = true }
  }, [userId])

  // ── Map added (locally-persisted) members to SVG nodes ─────────
  const addedMemberNodes: TreeNode[] = addedMembers.map((m, i) => ({
    id:         `added-${m.id}`,
    label:      m.name,
    sub:        relLabel(m.relationship),
    state:      'pending' as const,
    cx:         150 + (i % 5) * 175,
    cy:         650 + Math.floor(i / 5) * 130,
    isViewdicon: false,
  }))

  // Links from "me" node → each added member node
  const addedMemberLinks = addedMemberNodes.map(n => ({
    x1: 500,
    y1: nodes.find(nd => nd.id === 'me')?.cy ?? 400,
    x2: n.cx,
    y2: n.cy,
  }))

  const allNodes     = [...nodes, ...addedMemberNodes]
  const allLinks     = [...links, ...addedMemberLinks]
  const totalMembers = allNodes.filter(n => n.id !== 'me').length
  const maxY         = Math.max(...allNodes.map(n => n.cy), 700) + 120

  // ── Chat / blood-call routing ───────────────────────────────────
  const familyChatId = `f-family-${user?.id ?? 'default'}`

  // ── Submit add-member form ──────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!formName.trim() || !formIdentifier.trim()) return
    setSubmitting(true)
    setSubmitMsg(null)

    const newMember: AddedMember = {
      id:               `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name:             formName.trim(),
      relationship:     formRel,
      targetIdentifier: formIdentifier.trim(),
      addedAt:          new Date().toISOString(),
      inviteSent:       false,
    }

    try {
      await ringsApi.sendInvite({
        name:             newMember.name,
        relationship:     newMember.relationship,
        targetIdentifier: newMember.targetIdentifier,
      } as any)
      newMember.inviteSent = true
      setSubmitMsg({ type: 'ok', text: "Bond request sent! They'll appear once they accept." })
    } catch {
      setSubmitMsg({ type: 'err', text: 'Added locally — invite will be sent when online.' })
    }

    const updated = [...addedMembers, newMember]
    setAddedMembers(updated)
    persistMembers(updated)

    setFormName('')
    setFormRel('PARENT')
    setFormIdentifier('')
    setSubmitting(false)

    // Auto-dismiss sheet ~2.5s after success/error message
    setTimeout(() => {
      setSubmitMsg(null)
      setShowSheet(false)
    }, 2500)
  }, [formName, formRel, formIdentifier, addedMembers])

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      background: '#0c1009', color: '#fff', fontFamily: 'system-ui, sans-serif',
    }}>

      {/* ── Header bar with back button ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px 6px', flexShrink: 0,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '7px 14px',
            color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600,
          }}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0, color: '#4ade80', fontSize: 20, fontWeight: 800, flex: 1 }}>
          Idile Family Tree
        </h2>
      </div>

      {/* ── UKOO unlock banner (shown until ≥3 members) ── */}
      {totalMembers < 3 && (
        <div style={{
          margin: '10px 16px 0',
          padding: '14px 16px',
          borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(74,222,128,0.04))',
          border: '1.5px solid rgba(74,222,128,0.35)',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <span style={{ fontSize: 26 }}>🌳</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#4ade80', marginBottom: 3, lineHeight: 1.4 }}>
              Add at least 3 family members to unlock the full UKOO experience
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              {totalMembers} / 3 members added
            </div>
          </div>
          <button
            onClick={() => setShowSheet(true)}
            style={{
              padding: '8px 14px', borderRadius: 10,
              background: '#4ade80', color: '#0c1009',
              border: 'none', fontWeight: 800, fontSize: 11,
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            Add Member
          </button>
        </div>
      )}

      {/* ── Main content: SVG tree + node detail side panel ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* SVG Canvas */}
        <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 1000 ${maxY}`}
            style={{ minHeight: maxY, filter: 'drop-shadow(0 0 20px rgba(74,222,128,0.08))' }}
          >
            {/* ── Connecting lines ── */}
            {allLinks.map((l, i) => {
              const isAddedLink = i >= links.length
              return (
                <line
                  key={i}
                  x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                  stroke={isAddedLink ? 'rgba(74,222,128,0.25)' : 'rgba(168,85,247,0.3)'}
                  strokeWidth="3"
                  strokeDasharray={isAddedLink ? '8 4' : '6 6'}
                />
              )
            })}

            {/* ── SVG Nodes ── */}
            {allNodes.map(node => {
              const isVerified = node.state === 'verified'
              const isDeceased = node.state === 'deceased'
              const isPending  = node.state === 'pending'
              const isAdded    = node.id.startsWith('added-')

              const strokeColor = isDeceased
                ? '#52525B'
                : isAdded
                  ? '#4ade80'
                  : isVerified
                    ? '#22C55E'
                    : '#F59E0B'   // pending amber

              const bgColor = isDeceased ? '#18181B' : isAdded ? '#0c2618' : '#1a2e12'
              const isDashed = isAdded || isPending

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.cx}, ${node.cy})`}
                  onClick={() => setSelected(node)}
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                >
                  {/* Node circle */}
                  <circle
                    r="40"
                    fill={bgColor}
                    stroke={strokeColor}
                    strokeWidth={isAdded ? 3 : 4}
                    strokeDasharray={isDashed ? '6 3' : 'none'}
                  />

                  {/* Vi badge for Viewdicon users */}
                  {node.isViewdicon && !isDeceased && (
                    <circle cx="28" cy="-28" r="12" fill="#4ade80" stroke="#0c1009" strokeWidth="2" />
                  )}
                  {node.isViewdicon && !isDeceased && (
                    <text x="28" y="-24" textAnchor="middle" fill="#0c1009" fontSize="10" fontWeight="bold">Vi</text>
                  )}

                  {/* Hourglass indicator for pending API bonds (not locally-added) */}
                  {isPending && !isAdded && (
                    <text x="-28" y="-24" textAnchor="middle" fontSize="14">⏳</text>
                  )}

                  {/* Deceased dove emoji */}
                  {isDeceased && (
                    <text x="0" y="5" textAnchor="middle" fontSize="24">&#x1F54A;&#xFE0F;</text>
                  )}
                  {!isDeceased && (
                    <text x="0" y="5" textAnchor="middle" fill="#fff" fontSize="24">
                      {isAdded
                        ? '👤'
                        : (node.id.includes('pat') || node.id.includes('ather') || node.id.includes('bro')
                            ? '👨🏾'
                            : '👩🏾'
                          )
                      }
                    </text>
                  )}

                  {/* Name & relationship label */}
                  <text y="60" textAnchor="middle" fill={isAdded ? '#4ade80' : '#e9d5ff'} fontSize="14" fontWeight="bold">
                    {node.label}
                  </text>
                  <text y="75" textAnchor="middle" fill={isAdded ? 'rgba(74,222,128,0.5)' : 'rgba(233,213,255,0.6)'} fontSize="11">
                    {node.sub}
                  </text>

                  {/* PENDING badge — locally added members */}
                  {isAdded && (
                    <>
                      <rect x="-24" y="80" width="48" height="16" rx="8"
                        fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.3)" strokeWidth="1" />
                      <text x="0" y="91" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="700">PENDING</text>
                    </>
                  )}

                  {/* PENDING badge — API bonds not yet accepted */}
                  {isPending && !isAdded && (
                    <>
                      <rect x="-32" y="80" width="64" height="16" rx="8"
                        fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
                      <text x="0" y="91" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="700">⏳ PENDING</text>
                    </>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* ── Node detail side panel ── */}
        {selected && (
          <div style={{
            width: 300, background: '#111a0e',
            borderLeft: '1px solid rgba(74,222,128,0.15)',
            padding: 20, display: 'flex', flexDirection: 'column',
            overflowY: 'auto', flexShrink: 0,
          }}>
            <button
              onClick={() => setSelected(null)}
              style={{ alignSelf: 'flex-end', background: 'transparent', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
            >
              ×
            </button>

            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: '#1a2e12',
                margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
                border: selected.id.startsWith('added-') ? '2px dashed #4ade80' : '2px solid #22c55e',
              }}>
                {selected.state === 'deceased' ? '🕊️' : '📸'}
              </div>
              <h3 style={{ margin: 0, fontSize: 20, color: '#fff' }}>{selected.label}</h3>
              <p style={{ margin: '4px 0 16px', color: '#4ade80', fontSize: 13 }}>{selected.sub}</p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Status</span>
                <strong style={{
                  color: selected.state === 'verified' ? '#22c55e' : selected.state === 'deceased' ? '#71717a' : '#f59e0b',
                  textTransform: 'capitalize',
                }}>
                  {selected.id.startsWith('added-') ? 'invite pending' : selected.state}
                </strong>
              </div>
              {selected.isViewdicon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Viewdicon ID</span>
                  <strong style={{ color: '#fff' }}>AKN-4X9P</strong>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
              <button
                disabled={selected.state === 'deceased'}
                onClick={() => router.push(`/dashboard/chat/${familyChatId}`)}
                style={{
                  padding: 12, borderRadius: 12, background: '#4ade80', color: '#0c1009',
                  border: 'none', fontWeight: 700, fontSize: 13,
                  cursor: selected.state === 'deceased' ? 'not-allowed' : 'pointer',
                  opacity: selected.state === 'deceased' ? 0.3 : 1,
                }}
              >
                💬 Message in Family Chat
              </button>
              <button
                disabled={selected.state === 'deceased'}
                onClick={() => router.push(`/dashboard/chat/${familyChatId}?bloodCall=1`)}
                style={{
                  padding: 12, borderRadius: 12,
                  background: 'rgba(220,38,38,0.1)', color: '#ef4444',
                  border: '1px solid rgba(220,38,38,0.3)',
                  fontWeight: 700, fontSize: 13,
                  cursor: selected.state === 'deceased' ? 'not-allowed' : 'pointer',
                  opacity: selected.state === 'deceased' ? 0.3 : 1,
                }}
              >
                🚨 Send Blood-Call Test
              </button>
              <button onClick={() => router.push('/dashboard/settings')} style={{
                padding: 12, borderRadius: 12, background: 'transparent', color: '#4ade80',
                border: '1px solid rgba(74,222,128,0.3)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>
                ⚙️ Update Details
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── FAB: Add Family Member ── */}
      <button
        onClick={() => setShowSheet(true)}
        aria-label="Add family member"
        style={{
          position: 'fixed', bottom: 88, right: 20,
          width: 56, height: 56, borderRadius: '50%',
          background: '#4ade80', color: '#0c1009',
          border: 'none', fontSize: 28, fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(74,222,128,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 40, transition: 'transform 0.15s, box-shadow 0.15s',
          lineHeight: 1,
        }}
      >
        +
      </button>

      {/* ── Add Member Bottom Sheet ── */}
      {showSheet && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 80,
            background: 'rgba(0,0,0,0.72)',
            display: 'flex', alignItems: 'flex-end',
          }}
          onClick={() => setShowSheet(false)}
        >
          <div
            style={{
              width: '100%', background: '#111a0e',
              borderRadius: '20px 20px 0 0',
              padding: '20px 20px 48px',
              maxHeight: '85vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 18px' }} />

            {/* Sheet header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: '#4ade80', fontWeight: 800 }}>Add Family Member</h3>
              <button
                onClick={() => setShowSheet(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            {/* Submit feedback message */}
            {submitMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 14,
                background: submitMsg.type === 'ok' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
                border: `1px solid ${submitMsg.type === 'ok' ? 'rgba(74,222,128,0.35)' : 'rgba(251,191,36,0.35)'}`,
                fontSize: 13, fontWeight: 600,
                color: submitMsg.type === 'ok' ? '#4ade80' : '#fbbf24',
              }}>
                {submitMsg.text}
              </div>
            )}

            {/* Input: Name or AfroID */}
            <label style={{
              fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6, display: 'block',
            }}>
              Name or AfroID
            </label>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="Full name or AFR-NGA-..."
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1px solid rgba(74,222,128,0.22)',
                background: 'rgba(0,0,0,0.3)', color: '#fff',
                fontSize: 14, marginBottom: 16, outline: 'none', boxSizing: 'border-box',
              }}
            />

            {/* Input: Relationship */}
            <label style={{
              fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6, display: 'block',
            }}>
              Relationship
            </label>
            <select
              value={formRel}
              onChange={e => setFormRel(e.target.value as Relationship)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1px solid rgba(74,222,128,0.22)',
                background: '#0c1009', color: '#fff',
                fontSize: 14, marginBottom: 16, outline: 'none',
                boxSizing: 'border-box', cursor: 'pointer',
              }}
            >
              {RELATIONSHIP_TYPES.map(r => (
                <option key={r} value={r} style={{ background: '#0c1009', color: '#fff' }}>
                  {relLabel(r)}
                </option>
              ))}
            </select>

            {/* Input: AfroID or Phone (targetIdentifier) */}
            <label style={{
              fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6, display: 'block',
            }}>
              AfroID or Phone
            </label>
            <input
              type="text"
              value={formIdentifier}
              onChange={e => setFormIdentifier(e.target.value)}
              placeholder="AFR-NGA-... or +234..."
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1px solid rgba(74,222,128,0.22)',
                background: 'rgba(0,0,0,0.3)', color: '#fff',
                fontSize: 14, marginBottom: 20, outline: 'none', boxSizing: 'border-box',
              }}
            />

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !formName.trim() || !formIdentifier.trim()}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: (!formName.trim() || !formIdentifier.trim())
                  ? 'rgba(74,222,128,0.15)'
                  : '#4ade80',
                color: (!formName.trim() || !formIdentifier.trim())
                  ? 'rgba(255,255,255,0.4)'
                  : '#0c1009',
                border: 'none', fontWeight: 800, fontSize: 14,
                cursor: (!formName.trim() || !formIdentifier.trim() || submitting)
                  ? 'not-allowed'
                  : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {submitting ? 'Sending Request...' : '🌳 Send Bond Request'}
            </button>

            {/* Recently added members list */}
            {addedMembers.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{
                  fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10,
                }}>
                  Recently Added ({addedMembers.length})
                </div>
                {addedMembers.map(m => (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                    background: 'rgba(74,222,128,0.04)',
                    border: '1px dashed rgba(74,222,128,0.2)',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(74,222,128,0.1)',
                      border: '1.5px dashed rgba(74,222,128,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, flexShrink: 0,
                    }}>
                      👤
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(74,222,128,0.6)' }}>
                        {relLabel(m.relationship)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
                        background: m.inviteSent ? 'rgba(74,222,128,0.12)' : 'rgba(251,191,36,0.12)',
                        color: m.inviteSent ? '#4ade80' : '#fbbf24',
                      }}>
                        {m.inviteSent ? 'INVITED' : 'PENDING'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
