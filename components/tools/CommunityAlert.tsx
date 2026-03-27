'use client'
import React, { useState } from 'react'

interface ToolProps { villageId?: string; roleKey?: string }
interface AlertType { key: string; icon: string; label: string }
interface RecentAlert { type: string; icon: string; message: string; sentAt: string; reach: number }

const BG = '#060d07', CARD = '#0f1e11', BD = '#1e3a20', TX = '#f0f7f0', MT = '#7da882', GR = '#2e7d32', RD = '#c62828', AM = '#e65100'

const ALERT_TYPES: AlertType[] = [
  { key: 'security',     icon: '🚨', label: 'Security'     },
  { key: 'health',       icon: '🏥', label: 'Health'        },
  { key: 'weather',      icon: '🌧',  label: 'Weather'       },
  { key: 'outage',       icon: '⚡', label: 'Outage'        },
  { key: 'announcement', icon: '📢', label: 'Announce'      },
]

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
type Severity = typeof SEVERITIES[number]

const RECENT: RecentAlert[] = [
  { type: '🚨', icon: 'Security',     message: 'Armed robbery reported near Market Square. Avoid the area.', sentAt: 'Today 07:42',    reach: 1247 },
  { type: '⚡', icon: 'Outage',       message: 'EKEDC grid maintenance scheduled 10 AM–3 PM today.',         sentAt: 'Today 06:00',    reach: 1247 },
  { type: '🌧', icon: 'Weather',      message: 'Heavy rainfall expected this afternoon. Secure your property.', sentAt: 'Yesterday',   reach: 983  },
]

const severityColor = (s: Severity) =>
  s === 'CRITICAL' ? RD : s === 'HIGH' ? AM : s === 'MEDIUM' ? '#f9a825' : GR

export default function CommunityAlert({ villageId: _v, roleKey: _r }: ToolProps) {
  const [alertType, setAlertType] = useState('security')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<Severity>('MEDIUM')
  const [roleOnly, setRoleOnly] = useState(false)
  const [sent, setSent] = useState(false)
  const [recent, setRecent] = useState<RecentAlert[]>(RECENT)

  const currentType = ALERT_TYPES.find(t => t.key === alertType) ?? ALERT_TYPES[0]

  const broadcast = () => {
    if (!subject || !message) return
    const newAlert: RecentAlert = {
      type: currentType.icon,
      icon: currentType.label,
      message: subject,
      sentAt: 'Just now',
      reach: roleOnly ? 184 : 1247,
    }
    setRecent(r => [newAlert, ...r])
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setSubject('')
    setMessage('')
  }

  const MAX = 200

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TX, fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <h2 style={{ margin: '0 0 18px', fontSize: 18 }}>📣 Community Alert</h2>

      {/* Toast */}
      {sent && (
        <div style={{ background: GR, borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>✅</span>
          <span>Alert sent to {roleOnly ? '184' : '1,247'} members!</span>
        </div>
      )}

      {/* Alert Type Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {ALERT_TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => setAlertType(t.key)}
            style={{
              flex: 1, minWidth: 70, padding: '8px 4px', border: `1px solid ${alertType === t.key ? GR : BD}`,
              borderRadius: 10, background: alertType === t.key ? '#0a2a0a' : CARD,
              color: alertType === t.key ? '#a5d6a7' : MT, cursor: 'pointer', fontSize: 11,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Compose Form */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: MT, fontWeight: 700, marginBottom: 12 }}>COMPOSE ALERT</div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: MT, marginBottom: 4 }}>SUBJECT LINE</div>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder={`${currentType.icon} ${currentType.label} alert for ${_v ?? 'Village'}...`}
            style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: '9px 10px', color: TX, fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: MT }}>MESSAGE</div>
            <div style={{ fontSize: 11, color: message.length > MAX * 0.9 ? AM : MT }}>{message.length}/{MAX}</div>
          </div>
          <textarea
            value={message}
            onChange={e => e.target.value.length <= MAX && setMessage(e.target.value)}
            rows={4}
            placeholder="Describe the situation clearly. Include time, location, and any actions residents should take..."
            style={{ width: '100%', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 6, padding: 9, color: TX, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        {/* Severity */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: MT, marginBottom: 8 }}>SEVERITY</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {SEVERITIES.map(s => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                style={{
                  flex: 1, padding: '7px 4px', border: `1px solid ${severity === s ? severityColor(s) : BD}`,
                  borderRadius: 8, background: severity === s ? severityColor(s) + '33' : 'transparent',
                  color: severity === s ? severityColor(s) : MT, cursor: 'pointer', fontSize: 11, fontWeight: 700
                }}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Target */}
        <div style={{ padding: '10px 12px', background: '#050e06', border: `1px solid ${BD}`, borderRadius: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 13 }}>📍 Target area: {_v ?? 'Whole Village'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: MT }}>
              Recipients: {roleOnly ? 'Market Vendors (184)' : 'All Village Members (1,247)'}
            </span>
            <div
              onClick={() => setRoleOnly(v => !v)}
              style={{ width: 40, height: 22, borderRadius: 11, background: roleOnly ? GR : '#1a2e1b', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
            >
              <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 3, left: roleOnly ? 21 : 3, transition: 'left 0.2s' }} />
            </div>
          </div>
          {roleOnly && <div style={{ fontSize: 11, color: MT, marginTop: 4 }}>Role filter: Market Vendors only</div>}
        </div>

        {/* Preview */}
        <div style={{ background: '#030a04', border: `1px solid ${severityColor(severity)}44`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: MT, fontWeight: 700, marginBottom: 6 }}>MOBILE PREVIEW</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: severityColor(severity) + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {currentType.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{subject || 'Alert Subject'}</div>
              <div style={{ fontSize: 12, color: MT, marginTop: 2, lineHeight: 1.4 }}>{message || 'Message content will appear here...'}</div>
              <div style={{ fontSize: 10, color: MT, marginTop: 4 }}>Viewdicon · Just now</div>
            </div>
          </div>
        </div>

        <button
          onClick={broadcast}
          disabled={!subject || !message}
          style={{ width: '100%', padding: 13, background: !subject || !message ? '#1a2e1b' : severityColor(severity), border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, cursor: !subject || !message ? 'default' : 'pointer', opacity: !subject || !message ? 0.6 : 1 }}
        >
          📣 Broadcast Alert
        </button>
      </div>

      {/* Recent Alerts */}
      <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BD}`, fontSize: 11, color: MT, fontWeight: 700 }}>RECENT ALERTS</div>
        {recent.slice(0, 4).map((a, i) => (
          <div key={i} style={{ padding: '10px 14px', borderBottom: i < Math.min(recent.length, 4) - 1 ? `1px solid ${BD}` : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{a.type} {a.icon}</span>
              <span style={{ fontSize: 11, color: MT }}>Reached: {a.reach.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 12, color: TX, marginBottom: 2 }}>{a.message}</div>
            <div style={{ fontSize: 11, color: MT }}>{a.sentAt}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
