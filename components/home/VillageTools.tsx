'use client'
import * as React from 'react'

interface ToolItem {
  id: string
  name: string
  icon: string
  hint: string
  iconBg: string
  locked: boolean
}

// Tools (initially empty -- populated from village tool registry)
const DEFAULT_TOOLS: ToolItem[] = []

export function VillageTools({ villageName = 'Commerce' }: { villageName?: string }) {
  return (
    <>
      <div className="px-4 pt-3 pb-1.5">
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>⚒ Your Village Tools · {villageName}</span>
      </div>
      <div className="flex gap-2.5 px-3 pb-1 no-scrollbar snap-x" style={{ overflowX: 'auto' }}>
        {DEFAULT_TOOLS.map((tool) => (
          <div
            key={tool.id}
            className={`shrink-0 relative rounded-2xl ${tool.locked ? '' : 'card-lift'}`}
            style={{
              minWidth: 110,
              maxWidth: 130,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              padding: '12px 10px',
              cursor: tool.locked ? 'not-allowed' : 'pointer',
              opacity: tool.locked ? 0.4 : 1,
            }}
            title={tool.locked ? 'Requires Crest IV — keep trading to level up' : tool.name}
          >
            <div
              className="rounded-xl flex items-center justify-center mb-2"
              style={{ width: 36, height: 36, fontSize: 18, background: tool.iconBg, border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {tool.icon}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 3 }}>{tool.name}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.35 }}>{tool.hint}</div>
            {tool.locked && <div className="absolute" style={{ top: 8, right: 8, fontSize: 12 }}>🔒</div>}
          </div>
        ))}
      </div>
    </>
  )
}
