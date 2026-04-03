'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ThemeMode, t } from './shared'
import { useVillageStore } from '@/stores/villageStore'
import { useAuthStore } from '@/stores/authStore'
import { TOOL_REGISTRY } from '@/constants/tools'
import { VILLAGE_TOOL_MAP } from '@/lib/village-tool-map'
import * as AfroIcons from '@/components/ui/afro-icons'

export default function VillageTools({ mode }: { mode: ThemeMode }) {
  const router = useRouter()
  const activeVillageId  = useVillageStore(s => s.activeVillageId)
  const activeRoleKey    = useVillageStore(s => s.activeRoleKey)
  const activeVillageColor = useVillageStore(s => s.activeVillageColor)
  const user = useAuthStore(s => s.user)

  // Fallback to user.villageId if villageStore not yet synced (fixes post-ceremony flash)
  const resolvedVillageId = activeVillageId || user?.villageId
  const resolvedRoleKey = activeRoleKey || user?.roleKey

  // Resolve tools synchronously with useMemo (no 1-frame flash)
  const toolsToRender = React.useMemo(() => {
    if (resolvedVillageId && resolvedRoleKey) {
      const staticKeys = (VILLAGE_TOOL_MAP as any)[resolvedVillageId]?.[resolvedRoleKey] ?? []
      return staticKeys.map((k: string) => (TOOL_REGISTRY as any)[k]).filter(Boolean)
    }
    return []
  }, [resolvedVillageId, resolvedRoleKey])

  // No village selected
  if (!resolvedVillageId) {
    return (
      <div style={{ margin: '0 12px', borderRadius: 14, padding: 18, background: t('card', mode), border: `1px solid ${t('border', mode)}`, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🛖</div>
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
  if (!resolvedRoleKey) {
    return (
      <div style={{ margin: '0 12px', borderRadius: 14, padding: 18, background: t('card', mode), border: `1px solid ${t('border', mode)}`, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🪘</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: t('text', mode), marginBottom: 6 }}>Choose Your Role</div>
        <div style={{ fontSize: 11, color: t('sub', mode), marginBottom: 12 }}>Select your role to see your personalised toolkit.</div>
        <button
          onClick={() => router.push(`/dashboard/villages/${resolvedVillageId}`)}
          style={{ padding: '8px 20px', borderRadius: 99, background: activeVillageColor, color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}
        >
          Select Your Role →
        </button>
      </div>
    )
  }

  if (toolsToRender.length === 0) {
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
      {toolsToRender.map((tool: any) => {
        const key = tool.toolKey || tool.key
        const name = tool.toolName || tool.name
        const desc = tool.description
        const icon = tool.emoji || tool.icon

        return (
          <div
            key={key}
            onClick={() => router.push(`/dashboard/tools/${key}?village=${resolvedVillageId}&role=${resolvedRoleKey}`)}
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
            <div style={{ width: 34, height: 34, borderRadius: 10, background: t('muted', mode), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 6 }}>
              {tool.iconComponent && (AfroIcons as any)[tool.iconComponent] 
                ? React.createElement((AfroIcons as any)[tool.iconComponent], { size: 18 }) 
                : icon
              }
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: t('text', mode), lineHeight: 1.3, marginBottom: 3 }}>{name}</div>
            <div style={{ fontSize: 9, color: t('sub', mode), lineHeight: 1.4, marginBottom: 5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
              {desc}
            </div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {(tool.cowrieFlow === 'earns' || tool.earnsCowrie) && (
                <span style={{ fontSize: 8, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.25)', borderRadius: 99, padding: '2px 5px' }}>
                  ₡ Earns
                </span>
              )}
              {(tool.opensBusinessSession || tool.opensSession) && (
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
