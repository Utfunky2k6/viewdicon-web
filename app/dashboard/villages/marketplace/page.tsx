'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { VILLAGE_TOOL_MAP } from '@/lib/village-tool-map'
import { TOOL_REGISTRY, type ToolDefinition } from '@/constants/tools'
import { ALL_VILLAGES } from '@/lib/villages-data'

// ── Village accent colors ──────────────────────────────────────
const VILLAGE_COLORS: Record<string, string> = {
  commerce: '#e07b00', agriculture: '#1a7c3e', health: '#0369a1',
  education: '#4f46e5', arts: '#7c3aed', builders: '#b45309',
  energy: '#b91c1c', transport: '#0891b2', technology: '#0f766e',
  finance: '#065f46', media: '#6b21a8', justice: '#1e3a5f',
  government: '#1e40af', security: '#1a1a2e', spirituality: '#4c1d95',
  sports: '#1d4ed8', fashion: '#be185d', family: '#064e3b',
  hospitality: '#7c2d12', holdings: '#d4a017',
}

const VILLAGE_EMOJI: Record<string, string> = {
  commerce: '🧺', agriculture: '🌾', health: '🌿', education: '📚',
  arts: '🎭', builders: '🏗️', energy: '⚡', transport: '🚛',
  technology: '💻', media: '📰', finance: '💰', justice: '⚖️',
  government: '🏛️', security: '🛡️', spirituality: '🙏', sports: '⚽',
  fashion: '👗', family: '🏠', hospitality: '🍽️', holdings: '🚪',
}

// ── Build village name lookup from ALL_VILLAGES ────────────────
const VILLAGE_NAME: Record<string, string> = {}
const VILLAGE_ANCIENT: Record<string, string> = {}
ALL_VILLAGES.forEach(v => {
  VILLAGE_NAME[v.id] = v.name
  VILLAGE_ANCIENT[v.id] = v.ancientName
})

// ── Flat tool entry type ───────────────────────────────────────
interface FlatTool {
  toolKey: string
  roleKey: string
  villageId: string
  def: ToolDefinition
}

// ── Flatten VILLAGE_TOOL_MAP into searchable list ──────────────
function buildFlatTools(): FlatTool[] {
  const result: FlatTool[] = []
  const seen = new Set<string>() // deduplicate toolKey+villageId

  for (const [villageId, roleMap] of Object.entries(VILLAGE_TOOL_MAP)) {
    for (const [roleKey, toolKeys] of Object.entries(roleMap)) {
      for (const toolKey of toolKeys) {
        const dedupeKey = `${villageId}:${roleKey}:${toolKey}`
        if (seen.has(dedupeKey)) continue
        seen.add(dedupeKey)

        const def: ToolDefinition = TOOL_REGISTRY[toolKey] ?? {
          key: toolKey,
          name: toolKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          icon: '🛠',
          description: 'Village tool',
          category: 'commerce',
          opensBusinessSession: false,
          cowrieFlow: 'neutral',
        }

        result.push({ toolKey, roleKey, villageId, def })
      }
    }
  }
  return result
}

const ALL_TOOLS = buildFlatTools()

// ── Featured tools this week ───────────────────────────────────
const FEATURED_KEYS = ['afroflix', 'night_market', 'talent_stage', 'watch_party', 'ajo_circle', 'live_auction']

// ── Category options (from ToolDefinition.category) ──────────
const TOOL_CATEGORIES = [
  'all', 'commerce', 'finance', 'logistics', 'professional', 'community',
  'health', 'agriculture', 'education', 'media', 'creative',
  'government', 'security', 'energy', 'sports', 'communication',
]

// ── Cowrie badge ───────────────────────────────────────────────
function CowrieBadge({ flow }: { flow: 'earns' | 'spends' | 'neutral' }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    earns:   { bg: 'rgba(74,222,128,.12)',  color: '#4ade80', label: '₵ Earns' },
    spends:  { bg: 'rgba(248,113,113,.12)', color: '#f87171', label: '₵ Spends' },
    neutral: { bg: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.4)', label: '₵ Free' },
  }
  const s = styles[flow]
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '2px 6px',
      borderRadius: 99, background: s.bg, color: s.color,
      border: `1px solid ${s.color}30`,
    }}>{s.label}</span>
  )
}

// ── Single tool card ───────────────────────────────────────────
function ToolCard({ entry, compact }: { entry: FlatTool; compact?: boolean }) {
  const router = useRouter()
  const vc = VILLAGE_COLORS[entry.villageId] ?? '#1a7c3e'

  const launch = () => {
    router.push(`/dashboard/tools/${entry.toolKey}?village=${entry.villageId}&role=${entry.roleKey}`)
  }

  return (
    <div
      style={{
        background: '#0d1a0e',
        borderRadius: 14,
        border: `1.5px solid ${vc}30`,
        padding: compact ? '12px' : '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxShadow: `0 2px 12px rgba(0,0,0,.35)`,
        transition: 'border-color .2s, box-shadow .2s',
      }}
    >
      {/* Icon + name row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          fontSize: 28, lineHeight: 1, flexShrink: 0,
          width: 44, height: 44, borderRadius: 11,
          background: `${vc}18`, border: `1px solid ${vc}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {entry.def.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12.5, fontWeight: 800, color: '#f0f7f0',
            lineHeight: 1.3, marginBottom: 3,
          }}>
            {entry.def.name}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
            {/* Village badge */}
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 6px',
              borderRadius: 99, background: `${vc}20`, color: vc,
              border: `1px solid ${vc}40`, whiteSpace: 'nowrap',
            }}>
              {VILLAGE_EMOJI[entry.villageId] ?? '🌍'} {VILLAGE_ANCIENT[entry.villageId] ?? entry.villageId}
            </span>
            {/* Role badge */}
            <span style={{
              fontSize: 9, fontWeight: 600, padding: '2px 6px',
              borderRadius: 99, background: 'rgba(255,255,255,.06)',
              color: 'rgba(255,255,255,.45)', border: '1px solid rgba(255,255,255,.1)',
              whiteSpace: 'nowrap',
            }}>
              {entry.roleKey.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {!compact && (
        <p style={{
          fontSize: 10.5, color: 'rgba(255,255,255,.45)', lineHeight: 1.55,
          margin: 0, display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {entry.def.description}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto' }}>
        <CowrieBadge flow={entry.def.cowrieFlow} />
        <div style={{ flex: 1 }} />
        <button
          onClick={launch}
          style={{
            padding: '7px 14px', borderRadius: 9,
            background: `linear-gradient(135deg, ${vc}50, ${vc}28)`,
            border: `1.5px solid ${vc}60`, color: '#f0f7f0',
            fontSize: 11, fontWeight: 800, cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          Launch →
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function MarketplacePage() {
  const router = useRouter()
  const [search, setSearch] = React.useState('')
  const [villageFilter, setVillageFilter] = React.useState<string>('all')
  const [catFilter, setCatFilter] = React.useState<string>('all')

  // Build featured entries (first occurrence of each key, fallback)
  const featuredEntries = React.useMemo<FlatTool[]>(() => {
    return FEATURED_KEYS.map(fk => {
      const found = ALL_TOOLS.find(t => t.toolKey === fk)
      if (found) return found
      // Fallback for keys not in registry
      const fallbackDef: ToolDefinition = {
        key: fk,
        name: fk.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        icon: fk === 'afroflix' ? '🎬' : fk === 'night_market' ? '🌙' : fk === 'talent_stage' ? '🎤' : fk === 'watch_party' ? '📺' : '🛠',
        description: 'Premium cross-village tool',
        category: 'media',
        opensBusinessSession: false,
        cowrieFlow: 'earns',
      }
      // Pick a sensible village/role for fallback
      const villageId = fk === 'afroflix' || fk === 'watch_party' ? 'media' :
                        fk === 'night_market' ? 'hospitality' :
                        fk === 'talent_stage' ? 'arts' :
                        fk === 'ajo_circle' ? 'finance' : 'commerce'
      const roleKey = 'broadcaster'
      return { toolKey: fk, roleKey, villageId, def: fallbackDef }
    })
  }, [])

  // Filter main tool list
  const filteredTools = React.useMemo<FlatTool[]>(() => {
    const q = search.toLowerCase().trim()
    return ALL_TOOLS.filter(t => {
      if (villageFilter !== 'all' && t.villageId !== villageFilter) return false
      if (catFilter !== 'all' && t.def.category !== catFilter) return false
      if (q) {
        return (
          t.def.name.toLowerCase().includes(q) ||
          t.def.description.toLowerCase().includes(q) ||
          t.toolKey.includes(q) ||
          t.roleKey.includes(q) ||
          (VILLAGE_ANCIENT[t.villageId] ?? '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [search, villageFilter, catFilter])

  const villages = ALL_VILLAGES.filter(v => !v.holding)

  return (
    <div style={{ background: '#060d07', minHeight: '100dvh', paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{
        padding: '16px 14px 14px',
        background: 'linear-gradient(180deg, rgba(26,124,62,.16) 0%, rgba(26,124,62,.04) 60%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        {/* Nav row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button
            onClick={() => router.push('/dashboard/villages')}
            style={{
              padding: '7px 12px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,.12)',
              background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.6)',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}
          >← Villages</button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => {
              const stored = typeof window !== 'undefined'
                ? (JSON.parse(localStorage.getItem('afk-auth') || '{}')?.state?.villageId ?? null)
                : null
              router.push(stored ? `/dashboard/villages/${stored}` : '/dashboard/villages')
            }}
            style={{
              padding: '7px 12px', borderRadius: 10,
              border: '1px solid rgba(26,124,62,.4)',
              background: 'rgba(26,124,62,.12)', color: '#4ade80',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}
          >My Village →</button>
        </div>

        {/* Cross-Village Banner */}
        <div style={{
          padding: '12px 14px', borderRadius: 13,
          background: 'linear-gradient(135deg, rgba(212,160,23,.1), rgba(26,124,62,.08))',
          border: '1px solid rgba(212,160,23,.2)', marginBottom: 14,
        }}>
          <div style={{
            fontFamily: '"Cinzel","Palatino","Georgia",serif',
            fontSize: 11, fontWeight: 900, color: '#d4a017', letterSpacing: '0.06em', marginBottom: 3,
          }}>
            🌍 CROSS-VILLAGE ACCESS
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#f0f7f0', marginBottom: 2 }}>
            Access tools from any village. Your AfroID travels with you.
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', lineHeight: 1.55 }}>
            1,280 tools across 20 Pan-African villages · Use AfroFlix in Media, Night Market in Hospitality, Ajo Circle in Finance — wherever you are.
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: '"Cinzel","Palatino","Georgia",serif',
          fontSize: 20, fontWeight: 900, color: '#f0f7f0',
          margin: '0 0 2px', letterSpacing: '0.05em',
        }}>
          🛒 Tool Marketplace
        </h1>
        <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,.35)', margin: 0, fontStyle: 'italic' }}>
          {ALL_TOOLS.length.toLocaleString()} tools · 20 villages · Pan-African sovereignty
        </p>
      </div>

      {/* ── Search ── */}
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 16, pointerEvents: 'none', color: 'rgba(255,255,255,.35)',
          }}>🔍</span>
          <input
            type="search"
            placeholder="Search 1,280 tools by name, description, or village..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '11px 12px 11px 38px', borderRadius: 12,
              background: '#0d1a0e', border: '1.5px solid rgba(255,255,255,.1)',
              color: '#f0f7f0', fontSize: 13, outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* ── Village filter chips ── */}
      <div style={{ overflowX: 'auto', display: 'flex', gap: 7, padding: '12px 14px 0', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setVillageFilter('all')}
          style={{
            flexShrink: 0, padding: '6px 13px', borderRadius: 20,
            border: `1.5px solid ${villageFilter === 'all' ? '#1a7c3e' : 'rgba(255,255,255,.1)'}`,
            background: villageFilter === 'all' ? 'rgba(26,124,62,.2)' : 'rgba(255,255,255,.04)',
            color: villageFilter === 'all' ? '#4ade80' : 'rgba(255,255,255,.45)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >🌍 All Villages</button>
        {villages.map(v => {
          const active = villageFilter === v.id
          const vc = v.color
          return (
            <button
              key={v.id}
              onClick={() => setVillageFilter(active ? 'all' : v.id)}
              style={{
                flexShrink: 0, padding: '6px 13px', borderRadius: 20,
                border: `1.5px solid ${active ? vc : 'rgba(255,255,255,.1)'}`,
                background: active ? `${vc}22` : 'rgba(255,255,255,.04)',
                color: active ? vc : 'rgba(255,255,255,.45)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {v.emoji} {v.ancientName}
            </button>
          )
        })}
      </div>

      {/* ── Category filter chips ── */}
      <div style={{ overflowX: 'auto', display: 'flex', gap: 6, padding: '10px 14px 0', scrollbarWidth: 'none' }}>
        {TOOL_CATEGORIES.map(cat => {
          const active = catFilter === cat
          return (
            <button
              key={cat}
              onClick={() => setCatFilter(active ? 'all' : cat)}
              style={{
                flexShrink: 0, padding: '5px 11px', borderRadius: 99,
                border: `1px solid ${active ? 'rgba(212,160,23,.6)' : 'rgba(255,255,255,.08)'}`,
                background: active ? 'rgba(212,160,23,.15)' : 'transparent',
                color: active ? '#d4a017' : 'rgba(255,255,255,.38)',
                fontSize: 10.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                textTransform: 'capitalize',
              }}
            >{cat === 'all' ? '📦 All Categories' : cat}</button>
          )
        })}
      </div>

      {/* ── Featured section (only when no active search/filter) ── */}
      {search === '' && villageFilter === 'all' && catFilter === 'all' && (
        <div style={{ padding: '18px 14px 0' }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{
              fontSize: 9.5, fontWeight: 800, color: '#d4a017',
              letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 2,
            }}>🔥 Hot Tools This Week</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>
              Trending across all 20 villages
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            {featuredEntries.map(entry => (
              <ToolCard key={`featured-${entry.toolKey}`} entry={entry} compact />
            ))}
          </div>
        </div>
      )}

      {/* ── Divider / results count ── */}
      <div style={{ padding: '16px 14px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,.07)' }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', whiteSpace: 'nowrap' }}>
          {filteredTools.length.toLocaleString()} tools
          {villageFilter !== 'all' ? ` · ${VILLAGE_ANCIENT[villageFilter] ?? villageFilter}` : ''}
          {catFilter !== 'all' ? ` · ${catFilter}` : ''}
          {search ? ` · "${search}"` : ''}
        </span>
        <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,.07)' }} />
      </div>

      {/* ── Tool grid ── */}
      <div style={{ padding: '0 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
        {filteredTools.slice(0, 200).map((entry, i) => (
          <ToolCard key={`${entry.villageId}-${entry.roleKey}-${entry.toolKey}-${i}`} entry={entry} />
        ))}
      </div>

      {/* Load-more hint if too many results */}
      {filteredTools.length > 200 && (
        <div style={{ textAlign: 'center', padding: '18px 14px 0', color: 'rgba(255,255,255,.3)', fontSize: 11 }}>
          Showing first 200 of {filteredTools.length.toLocaleString()} — use search or filters to narrow down
        </div>
      )}

      {/* Empty state */}
      {filteredTools.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,.3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>
            No tools found
          </div>
          <div style={{ fontSize: 11 }}>Try a different search term or clear the filters</div>
          <button
            onClick={() => { setSearch(''); setVillageFilter('all'); setCatFilter('all') }}
            style={{
              marginTop: 16, padding: '9px 18px', borderRadius: 11,
              background: 'rgba(26,124,62,.2)', border: '1px solid rgba(26,124,62,.4)',
              color: '#4ade80', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >Clear Filters</button>
        </div>
      )}

    </div>
  )
}
