'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ThemeMode, t } from './shared'
import { useVillageStore } from '@/stores/villageStore'
import { TOOL_REGISTRY } from '@/constants/tools'
import { VILLAGE_TOOL_MAP } from '@/lib/village-tool-map'

export default function VillageTools({ mode }: { mode: ThemeMode }) {
  const router = useRouter()
  const activeVillageId  = useVillageStore(s => s.activeVillageId)
  const activeRoleKey    = useVillageStore(s => s.activeRoleKey)
  const activeVillageColor = useVillageStore(s => s.activeVillageColor)
  const [liveToolKeys, setLiveToolKeys] = React.useState<string[] | null>(null)

  // Fetch live tools from village-registry API (with static fallback)
  React.useEffect(() => {
    if (!activeVillageId || !activeRoleKey) return
    fetch(`/api/v1/villages/${activeVillageId}/tools?roleKey=${encodeURIComponent(activeRoleKey)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list = d?.data ?? d?.tools ?? (Array.isArray(d) ? d : null)
        if (list && list.length > 0) {
          setLiveToolKeys(list.map((item: any) => item.toolKey ?? item.key ?? item))
        }
      })
      .catch(() => {})
  }, [activeVillageId, activeRoleKey])

  // No village selected
  if (!activeVillageId) {
    return (
      <div style={{ margin: '0 12px', borderRadius: 14, padding: 18, background: t('card', mode), border: `1px solid ${t('border', mode)}`, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🏘️</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: t('text', mode), marginBottom: 6 }}>No Village Selected</div>
        <div style={{ fontSize: 11, color: t('sub', mode), marginBottom: 12 }}>Choose your village to unlock your role tools.</div>
        <button
          onClick={() => router.push('/dashboard/villages')}
          style={{ padding: '8px 20px', borderRadius: 99, background: '#1a7c3e', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}
        >
          Select a Village →
        </button>
      </div>
    )
  }

  // Village selected but no role
  if (!activeRoleKey) {
    return (
      <div style={{ margin: '0 12px', borderRadius: 14, padding: 18, background: t('card', mode), border: `1px solid ${t('border', mode)}`, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🎭</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: t('text', mode), marginBottom: 6 }}>Choose Your Role</div>
        <div style={{ fontSize: 11, color: t('sub', mode), marginBottom: 12 }}>Select your role to see your personalised toolkit.</div>
        <button
          onClick={() => router.push(`/dashboard/villages/${activeVillageId}`)}
          style={{ padding: '8px 20px', borderRadius: 99, background: activeVillageColor, color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}
        >
          Select Your Role →
        </button>
      </div>
    )
  }

  // Use live API data if available, fall back to static map
  const roleTools: string[] = liveToolKeys ?? VILLAGE_TOOL_MAP[activeVillageId]?.[activeRoleKey] ?? []

  if (roleTools.length === 0) {
    return (
      <div style={{ margin: '0 12px', borderRadius: 14, padding: 18, background: t('card', mode), border: `1px solid ${t('border', mode)}`, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: t('sub', mode) }}>No tools mapped for this role. Please re-select your role.</div>
      </div>
    )
  }

  return (
    <div
      style={{ display: 'flex', gap: 8, padding: '0 12px', overflowX: 'auto', scrollbarWidth: 'none' }}
      className="vd-no-sb"
    >
      {roleTools.map(toolKey => {
        const tool = TOOL_REGISTRY[toolKey]
        if (!tool) return null
        return (
          <div
            key={tool.key}
            onClick={() => router.push(`/dashboard/tools/${tool.key}?village=${activeVillageId}&role=${activeRoleKey}`)}
            style={{
              minWidth: 110,
              maxWidth: 110,
              borderRadius: 14,
              padding: '10px 10px 8px',
              flexShrink: 0,
              cursor: 'pointer',
              background: t('card', mode),
              border: `1px solid ${t('border', mode)}`,
              transition: 'transform .15s, box-shadow .15s',
              position: 'relative',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 16px rgba(0,0,0,.25)`
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'none'
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
            }}
          >
            {/* Icon */}
            <div style={{ width: 34, height: 34, borderRadius: 10, background: t('muted', mode), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 6 }}>
              {tool.icon}
            </div>
            {/* Name */}
            <div style={{ fontSize: 11, fontWeight: 700, color: t('text', mode), lineHeight: 1.3, marginBottom: 3 }}>{tool.name}</div>
            {/* Description */}
            <div style={{ fontSize: 9, color: t('sub', mode), lineHeight: 1.4, marginBottom: 5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
              {tool.description}
            </div>
            {/* Badges */}
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {tool.cowrieFlow === 'earns' && (
                <span style={{ fontSize: 8, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.25)', borderRadius: 99, padding: '2px 5px' }}>
                  ₡ Earns
                </span>
              )}
              {tool.opensBusinessSession && (
                <span style={{ fontSize: 8, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.25)', borderRadius: 99, padding: '2px 5px' }}>
                  ⚡ Session
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
