'use client'
import * as React from 'react'
import type { ToolDefinition } from '@/constants/tools'

const C = {
  border: '#1e3a20', text: '#f0f7f0', sub: '#7da882', green: '#1a7c3e',
  gold: '#d4a017', muted: 'rgba(255,255,255,.06)',
}

export default function ToolWorkspace({ tool }: { tool: ToolDefinition }) {
  const [toast, setToast] = React.useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999 }}>
          {toast}
        </div>
      )}

      {/* Icon */}
      <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, rgba(26,124,62,.2), rgba(26,124,62,.05))', border: `1px solid rgba(26,124,62,.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px' }}>
        {tool.icon}
      </div>

      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>{tool.name}</div>
      <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6, marginBottom: 20, maxWidth: 280, margin: '0 auto 20px' }}>{tool.description}</div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', background: 'rgba(96,165,250,.1)', border: '1px solid rgba(96,165,250,.25)', borderRadius: 99, padding: '4px 12px' }}>
          Category: {tool.category}
        </span>
        {tool.cowrieFlow !== 'neutral' && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.25)', borderRadius: 99, padding: '4px 12px' }}>
            ₡ {tool.cowrieFlow === 'earns' ? 'Earns Cowrie' : 'Spends Cowrie'}
          </span>
        )}
        {tool.opensBusinessSession && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.25)', borderRadius: 99, padding: '4px 12px' }}>
            ⚡ Opens Business Session
          </span>
        )}
      </div>

      {/* Coming soon card */}
      <div style={{ background: 'linear-gradient(135deg, rgba(26,124,62,.08), rgba(6,13,7,.6))', border: `1px solid rgba(26,124,62,.2)`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 24, marginBottom: 10 }}>🔧</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>
          This workspace is being configured by the village council
        </div>
        <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.6 }}>
          The village elders are carefully preparing this tool to serve the community. It will be activated after the required council review and blessing ceremony.
        </div>
      </div>

      {/* Waitlist */}
      <button
        onClick={() => showToast("✓ You're on the waitlist for early access")}
        style={{ padding: '12px 28px', borderRadius: 99, background: 'linear-gradient(90deg,#1a7c3e,#065f46)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(26,124,62,.3)' }}
      >
        Join Waitlist for Early Access
      </button>

      <div style={{ marginTop: 16, fontSize: 10, color: C.sub }}>
        🌍 Powered by Viewdicon Village System · All 20 Villages
      </div>
    </div>
  )
}
