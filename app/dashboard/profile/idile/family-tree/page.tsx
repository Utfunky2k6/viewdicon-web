'use client'
// ═══════════════════════════════════════════════════════════════════
// UKOO — The Living Lineage  (Idile Family Tree)
// Generational layout · Baobab metaphor · African-first design
// "Igi kan kò le dúró sí ara rẹ̀" — A single tree cannot make a forest.
// ═══════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ringsApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { USE_MOCKS } from '@/lib/flags'

type NodeState = 'verified' | 'pending' | 'deceased'
type Generation = 'great_grandparent' | 'grandparent' | 'parent' | 'self' | 'sibling' | 'child' | 'grandchild' | 'other'

interface TreeNode {
  id: string
  label: string
  sub: string
  state: NodeState
  generation: Generation
  isViewdicon?: boolean
  gender?: 'male' | 'female' | 'unknown'
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
  id: string; name: string; relationship: Relationship
  targetIdentifier: string; addedAt: string; inviteSent: boolean
}

const LS_KEY = 'vd-family-tree'
function loadPersisted(): AddedMember[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}
function persist(m: AddedMember[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LS_KEY, JSON.stringify(m)) } catch { /**/ }
}
function relLabel(r: string) {
  return r.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}
function relToGeneration(rel: string): Generation {
  const r = rel.toUpperCase()
  if (['GRANDPARENT','GRANDMOTHER','GRANDFATHER'].some(x => r.includes(x))) return 'grandparent'
  if (['GREAT'].some(x => r.includes(x))) return 'great_grandparent'
  if (['PARENT','FATHER','MOTHER'].some(x => r.includes(x))) return 'parent'
  if (['CHILD','SON','DAUGHTER','ADOPTIVE_CHILD','STEP_CHILD','WARD'].some(x => r.includes(x))) return 'child'
  if (['GRANDCHILD','GRANDSON','GRANDDAUGHTER'].some(x => r.includes(x))) return 'grandchild'
  if (['SIBLING','BROTHER','SISTER','STEP_SIBLING','HALF_SIBLING'].some(x => r.includes(x))) return 'sibling'
  return 'other'
}

const GENERATION_META: Record<Generation, { label: string; color: string; emoji: string; order: number }> = {
  great_grandparent: { label: 'Great-Grandparents', color: '#a78bfa', emoji: '🕊️', order: 0 },
  grandparent:       { label: 'Grandparents',        color: '#f59e0b', emoji: '🏺', order: 1 },
  parent:            { label: 'Parents',             color: '#4ade80', emoji: '🌿', order: 2 },
  self:              { label: 'You',                 color: '#22d3ee', emoji: '⭐', order: 3 },
  sibling:           { label: 'Siblings',            color: '#4ade80', emoji: '🌱', order: 3 },
  child:             { label: 'Children',            color: '#fb923c', emoji: '🌸', order: 4 },
  grandchild:        { label: 'Grandchildren',       color: '#f472b6', emoji: '✨', order: 5 },
  other:             { label: 'Extended Family',     color: '#94a3b8', emoji: '🤝', order: 6 },
}

// ── Default mock nodes (fallback before API loads) ──────────────
const MOCK_NODES: TreeNode[] = [
  { id: 'ggf', label: 'Baba Nla Agba',  sub: 'Great-Grandfather', state: 'deceased', generation: 'great_grandparent', gender: 'male' },
  { id: 'ggm', label: 'Iya Nla Agba',   sub: 'Great-Grandmother', state: 'deceased', generation: 'great_grandparent', gender: 'female' },
  { id: 'gf1', label: 'Baba Agba',      sub: 'Grandfather',       state: 'deceased', generation: 'grandparent', gender: 'male' },
  { id: 'gm1', label: 'Iya Agba',       sub: 'Grandmother',       state: 'deceased', generation: 'grandparent', gender: 'female' },
  { id: 'gf2', label: 'Baba Iya',       sub: 'Grandfather',       state: 'verified', generation: 'grandparent', gender: 'male', isViewdicon: true },
  { id: 'gm2', label: 'Iya Iya',        sub: 'Grandmother',       state: 'verified', generation: 'grandparent', gender: 'female', isViewdicon: true },
  { id: 'dad', label: 'Umoh Snr',       sub: 'Father',            state: 'verified', generation: 'parent',      gender: 'male',   isViewdicon: true },
  { id: 'mum', label: 'Mma Utibe',      sub: 'Mother',            state: 'verified', generation: 'parent',      gender: 'female', isViewdicon: true },
  { id: 'bro', label: 'Kwame',          sub: 'Brother',           state: 'pending',  generation: 'sibling',     gender: 'male',   isViewdicon: true },
  { id: 'me',  label: 'You',            sub: 'ME',                state: 'verified', generation: 'self',        gender: 'unknown', isViewdicon: true },
  { id: 'sis', label: 'Chioma',         sub: 'Sister',            state: 'verified', generation: 'sibling',     gender: 'female' },
  { id: 'kid', label: 'Ebenezer',       sub: 'Son',               state: 'pending',  generation: 'child',       gender: 'male', isViewdicon: true },
]

function nodeEmoji(n: TreeNode) {
  if (n.id === 'me') return '⭐'
  if (n.state === 'deceased') return '🕊️'
  if (n.gender === 'male') return '👨🏾'
  if (n.gender === 'female') return '👩🏾'
  return '🧑🏾'
}
function stateColor(s: NodeState) {
  if (s === 'verified') return 'var(--nkisi-green)'
  if (s === 'deceased') return '#52525b'
  return '#f59e0b'
}
function stateBg(s: NodeState) {
  if (s === 'verified') return 'rgba(34,197,94,0.08)'
  if (s === 'deceased') return 'rgba(82,82,91,0.1)'
  return 'rgba(245,158,11,0.08)'
}

export default function FamilyTreePage() {
  const router = useRouter()
  const user   = useAuthStore(s => s.user)
  const userId = user?.id || (user as any)?.afroId?.raw || ''

  const [nodes, setNodes]           = useState<TreeNode[]>(USE_MOCKS ? MOCK_NODES : [])
  const [added, setAdded]           = useState<AddedMember[]>([])
  const [selected, setSelected]     = useState<TreeNode | null>(null)
  const [showSheet, setShowSheet]   = useState(false)
  const [loading, setLoading]       = useState(false)
  const [msg, setMsg]               = useState<{ ok: boolean; text: string } | null>(null)

  const [formName, setFormName]     = useState('')
  const [formRel, setFormRel]       = useState<Relationship>('PARENT')
  const [formId, setFormId]         = useState('')

  // Load persisted + fetch API
  useEffect(() => { setAdded(loadPersisted()) }, [])
  useEffect(() => {
    if (!userId) return
    let dead = false
    ;(async () => {
      try {
        const res = await ringsApi.getBonds(userId)
        if (dead) return
        const bonds = res?.data?.bonds || res?.bonds || []
        if (Array.isArray(bonds) && bonds.length > 0) {
          const fromApi: TreeNode[] = bonds.map((b: any, i: number) => {
            const rel = b.relationship || b.type || 'OTHER'
            return {
              id: b.id || `api-${i}`, label: b.displayName || b.name || b.handle || 'Member',
              sub: relLabel(rel), state: ['accepted','verified','ACCEPTED','ACTIVE'].includes(b.status) ? 'verified' : 'pending',
              generation: relToGeneration(rel), gender: 'unknown', isViewdicon: !!b.afroId,
            }
          })
          setNodes([{ id: 'me', label: 'You', sub: 'ME', state: 'verified', generation: 'self', isViewdicon: true }, ...fromApi])
        }
      } catch { /**/ }
    })()
    return () => { dead = true }
  }, [userId])

  // Merge added members
  const addedNodes: TreeNode[] = added.map((m, i) => ({
    id: `added-${m.id}`, label: m.name, sub: relLabel(m.relationship),
    state: 'pending', generation: relToGeneration(m.relationship), gender: 'unknown', isViewdicon: false,
  }))
  const allNodes = [...nodes, ...addedNodes]
  const familyChatId = `f-family-${user?.id ?? 'default'}`
  const totalVerified = allNodes.filter(n => n.state === 'verified').length
  const totalPending  = allNodes.filter(n => n.state === 'pending').length
  const totalMembers  = allNodes.filter(n => n.id !== 'me').length

  // Group by generation
  const byGen: Partial<Record<Generation, TreeNode[]>> = {}
  for (const n of allNodes) {
    if (!byGen[n.generation]) byGen[n.generation] = []
    byGen[n.generation]!.push(n)
  }
  const sortedGens = (Object.keys(byGen) as Generation[]).sort(
    (a, b) => GENERATION_META[a].order - GENERATION_META[b].order
  )

  const handleAdd = useCallback(async () => {
    if (!formName.trim() || !formId.trim()) return
    setLoading(true); setMsg(null)
    const m: AddedMember = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      name: formName.trim(), relationship: formRel,
      targetIdentifier: formId.trim(), addedAt: new Date().toISOString(), inviteSent: false,
    }
    try {
      await ringsApi.sendInvite({ name: m.name, relationship: m.relationship, targetIdentifier: m.targetIdentifier } as any)
      m.inviteSent = true
      setMsg({ ok: true, text: "Bond request sent! They'll appear once they accept." })
    } catch {
      setMsg({ ok: false, text: 'Saved locally — invite will send when back online.' })
    }
    const updated = [...added, m]
    setAdded(updated); persist(updated)
    setFormName(''); setFormRel('PARENT'); setFormId('')
    setLoading(false)
    setTimeout(() => { setMsg(null); setShowSheet(false) }, 2500)
  }, [formName, formRel, formId, added])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', paddingBottom: 100 }}>

      {/* ── Adinkra Sankofa overlay ── */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23d4a017' fill='none' stroke-linecap='round'%3E%3Ccircle cx='40' cy='44' r='16' stroke-width='1'/%3E%3Cpath d='M40 28 Q32 16 26 18 Q20 22 26 28 Q32 24 40 28' stroke-width='1'/%3E%3Ccircle cx='40' cy='22' r='4' stroke-width='1.2' fill='%23d4a017' fill-opacity='.2'/%3E%3Cpath d='M56 44 Q68 36 66 28 Q62 22 56 28' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px' }} />

      {/* ── Kente top stripe ── */}
      <div style={{ height: 3, background: 'linear-gradient(90deg,#1a7c3e 0%,#1a7c3e 25%,#d4a017 25%,#d4a017 50%,#b22222 50%,#b22222 75%,#1a1a1a 75%,#1a1a1a 100%)', position: 'relative', zIndex: 2 }} />

      {/* ── Header ── */}
      <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>Ukoo · Idile</h1>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Your Living Lineage</p>
        </div>
        <button onClick={() => setShowSheet(true)} style={{ height: 36, padding: '0 14px', borderRadius: 10, background: 'var(--green-primary)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)', flexShrink: 0 }}>+ Add Bond</button>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ margin: '14px 16px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, position: 'relative', zIndex: 1 }}>
        {[
          { value: totalMembers, label: 'Members', color: 'var(--text-primary)' },
          { value: totalVerified, label: 'Verified', color: 'var(--nkisi-green)' },
          { value: totalPending,  label: 'Pending',  color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center', padding: '10px 0', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginTop: 3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Proverb ── */}
      <div style={{ margin: '10px 16px 0', padding: '10px 14px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--gold)', fontStyle: 'italic', fontFamily: 'var(--font-body)', lineHeight: 1.6, opacity: 0.8 }}>
          "Igi kan kò le dúró sí ara rẹ̀" — A single tree cannot make a forest. <span style={{ fontSize: 9, color: 'var(--text-muted)', fontStyle: 'normal' }}>Yoruba proverb</span>
        </p>
      </div>

      {/* ── Unlock banner (< 3 members) ── */}
      {totalMembers < 3 && (
        <div style={{ margin: '10px 16px 0', padding: '14px 16px', borderRadius: 14, background: 'rgba(74,222,128,0.06)', border: '1.5px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🌳</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--nkisi-green)', fontFamily: 'var(--font-display)', marginBottom: 2 }}>Add 3 members to unlock UKOO</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{totalMembers} / 3 family members added</div>
          </div>
          <button onClick={() => setShowSheet(true)} style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--green-primary)', color: '#fff', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Add</button>
        </div>
      )}

      {/* ── Generational Tree ── */}
      <div style={{ padding: '20px 16px 0', position: 'relative', zIndex: 1 }}>
        {sortedGens.map((gen, gi) => {
          const genNodes = byGen[gen]!
          const meta = GENERATION_META[gen]
          const isSelf = gen === 'self'
          return (
            <div key={gen} style={{ marginBottom: 0 }}>
              {/* Generation label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: 2, background: meta.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: meta.color, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{meta.label}</span>
                <div style={{ flex: 1, height: 1, background: `${meta.color}20` }} />
                <span style={{ fontSize: 12, opacity: 0.5 }}>{meta.emoji}</span>
              </div>

              {/* Node cards row */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 0 }}>
                {genNodes.map(n => (
                  <button key={n.id} onClick={() => setSelected(n)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 10px', borderRadius: 14, cursor: 'pointer',
                    background: n.id === 'me' ? 'rgba(34,211,238,0.08)' : stateBg(n.state),
                    border: `1.5px solid ${n.id === 'me' ? '#22d3ee' : stateColor(n.state)}${n.id === 'me' ? '' : '40'}`,
                    minWidth: 72, flex: '0 0 auto', textAlign: 'center', transition: 'transform .15s',
                    position: 'relative',
                  }}>
                    {/* Viewdicon badge */}
                    {n.isViewdicon && n.state !== 'deceased' && (
                      <div style={{ position: 'absolute', top: 6, right: 6, width: 14, height: 14, borderRadius: '50%', background: 'var(--green-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 7, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>Vi</span>
                      </div>
                    )}
                    {/* Avatar */}
                    <div style={{
                      width: isSelf ? 48 : 40, height: isSelf ? 48 : 40, borderRadius: '50%',
                      background: n.state === 'deceased' ? 'rgba(82,82,91,0.15)' : `${stateColor(n.state)}12`,
                      border: `${n.id === 'me' ? 2.5 : 1.5}px ${n.state === 'pending' ? 'dashed' : 'solid'} ${stateColor(n.state)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isSelf ? 22 : 18, flexShrink: 0,
                    }}>
                      {nodeEmoji(n)}
                    </div>
                    {/* Name */}
                    <span style={{ fontSize: n.id === 'me' ? 11 : 10, fontWeight: n.id === 'me' ? 900 : 700, color: n.id === 'me' ? '#22d3ee' : 'var(--text-primary)', fontFamily: 'var(--font-display)', maxWidth: 68, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.label}</span>
                    {/* Relationship */}
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', maxWidth: 68, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.sub}</span>
                    {/* Status pill */}
                    {n.state === 'pending' && (
                      <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontFamily: 'var(--font-display)' }}>PENDING</span>
                    )}
                  </button>
                ))}

                {/* Add member placeholder for this generation */}
                <button onClick={() => { setFormRel(gen === 'parent' ? 'PARENT' : gen === 'child' ? 'CHILD' : gen === 'grandparent' ? 'GRANDPARENT' : gen === 'sibling' ? 'SIBLING' : 'PARENT'); setShowSheet(true) }} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  padding: '12px 10px', borderRadius: 14, cursor: 'pointer',
                  background: 'transparent', border: `1.5px dashed var(--border)`, minWidth: 72, flex: '0 0 auto',
                  opacity: 0.5, transition: 'opacity .15s',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>+</div>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Add</span>
                </button>
              </div>

              {/* Generation connector — vertical line between gens */}
              {gi < sortedGens.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', margin: '0 0 8px' }}>
                  <div style={{ width: 1, height: 24, background: 'var(--border)', borderRadius: 1 }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── FAB ── */}
      <button onClick={() => setShowSheet(true)} aria-label="Add family member" style={{
        position: 'fixed', bottom: 90, right: 20, width: 52, height: 52, borderRadius: '50%',
        background: 'var(--green-primary)', color: '#fff', border: 'none', fontSize: 24, fontWeight: 700,
        cursor: 'pointer', boxShadow: '0 4px 20px rgba(26,124,62,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40,
      }}>+</button>

      {/* ── Member detail bottom sheet ── */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setSelected(null)}>
          <div style={{ width: '100%', background: 'var(--bg-card)', borderRadius: '20px 20px 0 0', padding: '0 20px 48px', maxHeight: '70vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '12px auto 20px' }} />

            {/* Avatar + name */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
                background: stateBg(selected.state),
                border: `2.5px ${selected.state === 'pending' ? 'dashed' : 'solid'} ${stateColor(selected.state)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38,
              }}>{nodeEmoji(selected)}</div>
              <h3 style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{selected.label}</h3>
              <p style={{ margin: 0, fontSize: 13, color: stateColor(selected.state), fontFamily: 'var(--font-body)' }}>{selected.sub}</p>
            </div>

            {/* Details */}
            <div style={{ background: 'var(--bg-raised)', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
              {[
                { k: 'Generation', v: GENERATION_META[selected.generation].label },
                { k: 'Status', v: selected.id.startsWith('added-') ? 'Invite pending' : selected.state.charAt(0).toUpperCase() + selected.state.slice(1) },
                ...(selected.isViewdicon ? [{ k: 'On Viewdicon', v: '✓ Member' }] : []),
              ].map(row => (
                <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{row.k}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{row.v}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selected.state !== 'deceased' && (
                <button onClick={() => { setSelected(null); router.push(`/dashboard/chat/${familyChatId}`) }} style={{ padding: '13px 0', borderRadius: 12, background: 'var(--green-primary)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
                  💬 Message in Family Chat
                </button>
              )}
              {selected.state !== 'deceased' && (
                <button onClick={() => { setSelected(null); router.push(`/dashboard/chat/${familyChatId}?bloodCall=1`) }} style={{ padding: '13px 0', borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
                  🚨 Send Blood-Call SOS
                </button>
              )}
              <button onClick={() => setSelected(null)} style={{ padding: '13px 0', borderRadius: 12, background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Member bottom sheet ── */}
      {showSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowSheet(false)}>
          <div style={{ width: '100%', background: 'var(--bg-card)', borderRadius: '20px 20px 0 0', padding: '0 20px 48px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '12px auto 20px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Add Family Member</h3>
              <button onClick={() => setShowSheet(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
            </div>

            {msg && (
              <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 14, background: msg.ok ? 'rgba(74,222,128,0.08)' : 'rgba(251,191,36,0.08)', border: `1px solid ${msg.ok ? 'rgba(74,222,128,0.25)' : 'rgba(251,191,36,0.25)'}`, fontSize: 13, fontWeight: 600, color: msg.ok ? 'var(--nkisi-green)' : '#fbbf24', fontFamily: 'var(--font-body)' }}>{msg.text}</div>
            )}

            {[
              { label: 'Full name or AfroID', value: formName, set: setFormName, placeholder: 'e.g. Adaeze Okafor or AFR-NGA-...' },
              { label: 'AfroID or Phone number', value: formId, set: setFormId, placeholder: 'AFR-NGA-... or +234...' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginBottom: 6 }}>{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-raised)', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginBottom: 6 }}>Relationship</label>
              <select value={formRel} onChange={e => setFormRel(e.target.value as Relationship)} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-raised)', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                {RELATIONSHIP_TYPES.map(r => <option key={r} value={r} style={{ background: 'var(--bg-card)' }}>{relLabel(r)}</option>)}
              </select>
            </div>

            <button onClick={handleAdd} disabled={loading || !formName.trim() || !formId.trim()} style={{ width: '100%', padding: '14px', borderRadius: 12, background: (!formName.trim() || !formId.trim()) ? 'var(--bg-raised)' : 'var(--green-primary)', color: (!formName.trim() || !formId.trim()) ? 'var(--text-muted)' : '#fff', border: 'none', fontWeight: 800, fontSize: 14, cursor: (!formName.trim() || !formId.trim() || loading) ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)', transition: 'all 0.2s' }}>
              {loading ? 'Sending...' : '🌳 Send Bond Request'}
            </button>

            {/* Recently added list */}
            {added.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', fontFamily: 'var(--font-display)', marginBottom: 10 }}>RECENTLY ADDED ({added.length})</div>
                {added.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 6, background: 'var(--bg-raised)', border: '1px dashed var(--border)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(74,222,128,0.08)', border: '1.5px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>👤</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{relLabel(m.relationship)}</div>
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: m.inviteSent ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)', color: m.inviteSent ? 'var(--nkisi-green)' : '#fbbf24', fontFamily: 'var(--font-display)' }}>{m.inviteSent ? 'INVITED' : 'PENDING'}</span>
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
