'use client'
// ═══════════════════════════════════════════════════════════════════
// SESO CHAT SETTINGS — World-Class Privacy, Security & Preferences
// Africa-first design: data saver, offline mode, USSD bridge,
// multilingual, biometric lock, Nkisi Shield integration
// ═══════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter } from 'next/navigation'

const STYLES = `
@keyframes cs-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes cs-slide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes cs-toggle{0%{transform:scale(.8)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
.cs-fade{animation:cs-fade .3s ease both}
.cs-slide{animation:cs-slide .25s ease both}
.cs-no-scroll::-webkit-scrollbar{display:none}
.cs-no-scroll{-ms-overflow-style:none;scrollbar-width:none}
`

const C = {
  bg: '#050a06', bgCard: '#0a140c', bgEl: '#0f1d10',
  green: '#1a7c3e', greenL: '#4ade80',
  gold: '#d4a017', goldL: '#fbbf24',
  purple: '#7c3aed', purpleL: '#c084fc',
  red: '#dc2626', redL: '#f87171',
  blue: '#2563eb', blueL: '#60a5fa',
  text: '#f0f7f0', textDim: 'rgba(255,255,255,.45)', textDim2: 'rgba(255,255,255,.25)',
  border: 'rgba(255,255,255,.07)',
}

type Section = 'main' | 'privacy' | 'security' | 'notifications' | 'data' | 'storage' | 'blocked' | 'about'

interface Toggle { value: boolean; toggle: () => void }
function useToggle(init = false): Toggle {
  const [value, setValue] = React.useState(init)
  return { value, toggle: () => setValue(v => !v) }
}

function ToggleSwitch({ on, onToggle, color = C.greenL }: { on: boolean; onToggle: () => void; color?: string }) {
  return (
    <button onClick={onToggle} style={{
      width: 46, height: 26, borderRadius: 13, padding: 3,
      background: on ? color : 'rgba(255,255,255,.1)',
      border: 'none', cursor: 'pointer', transition: 'background .25s',
      display: 'flex', alignItems: 'center',
      justifyContent: on ? 'flex-end' : 'flex-start',
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: on ? '#050a06' : 'rgba(255,255,255,.5)',
        transition: 'all .25s', boxShadow: on ? `0 0 8px ${color}88` : 'none',
      }} />
    </button>
  )
}

function Row({ icon, label, sub, right, onClick, danger, accent }: {
  icon: string; label: string; sub?: string; right?: React.ReactNode
  onClick?: () => void; danger?: boolean; accent?: string
}) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 18px', cursor: onClick ? 'pointer' : 'default',
      borderBottom: `1px solid ${C.border}`, transition: 'background .15s',
    }}
    onMouseEnter={e => onClick && (e.currentTarget.style.background = 'rgba(255,255,255,.025)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        background: danger ? 'rgba(220,38,38,.1)' : accent ? `${accent}14` : 'rgba(255,255,255,.05)',
        border: `1px solid ${danger ? 'rgba(220,38,38,.2)' : accent ? `${accent}28` : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: danger ? C.redL : C.text, lineHeight: 1.3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: C.textDim, marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      {right}
      {onClick && !right && <div style={{ fontSize: 14, color: C.textDim2 }}>›</div>}
    </div>
  )
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ padding: '20px 18px 8px' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: C.textDim, textTransform: 'uppercase', letterSpacing: '.1em' }}>{sub}</div>
      <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 16, fontWeight: 900, color: C.text, marginTop: 2 }}>{title}</div>
    </div>
  )
}

function GroupLabel({ label }: { label: string }) {
  return (
    <div style={{ padding: '16px 18px 6px', fontSize: 10, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '.1em' }}>
      {label}
    </div>
  )
}

// ── BLOCKED USERS LIST (initially empty -- fetched from backend) ────
const INITIAL_BLOCKED: { handle: string; village: string; reason: string; ago: string }[] = []

// ── STORAGE ITEMS ────────────────────────────────────────────────────
const STORAGE_CATS = [
  { label: 'Photos',    size: '124 MB', icon: '🖼', color: C.blueL,   pct: 62 },
  { label: 'Videos',   size: '48 MB',  icon: '🎬', color: C.purpleL, pct: 24 },
  { label: 'Voice',    size: '18 MB',  icon: '🎙', color: C.greenL,  pct: 9  },
  { label: 'Docs',     size: '9 MB',   icon: '📄', color: C.goldL,   pct: 4.5},
  { label: 'Stickers', size: '1 MB',   icon: '🎭', color: '#f472b6',  pct: 0.5},
]

/* ═══════════════════════════════════════════════════════════════════ */
export default function ChatSettingsPage() {
  const router = useRouter()
  const [section, setSection] = React.useState<Section>('main')
  const [unblockId, setUnblockId] = React.useState<string | null>(null)
  const [blocked, setBlocked] = React.useState(INITIAL_BLOCKED)

  // Privacy toggles
  const lastSeen      = useToggle(true)
  const profilePhoto  = useToggle(true)
  const readReceipts  = useToggle(true)
  const onlineStatus  = useToggle(true)
  const groupInvite   = useToggle(true)
  const disappearing  = useToggle(false)
  const [disappearTimer, setDisappearTimer] = React.useState<'24h' | '7d' | '90d'>('7d')

  // Security toggles
  const biometricLock = useToggle(false)
  const twoStep       = useToggle(false)
  const nkisiShield   = useToggle(true)
  const screenshotLock= useToggle(true)
  const autoDelete    = useToggle(false)
  const incognito     = useToggle(false)

  // Notification toggles
  const msgNotif      = useToggle(true)
  const groupNotif    = useToggle(true)
  const callNotif     = useToggle(true)
  const bloodCallAlert= useToggle(true)
  const tradeAlert    = useToggle(true)
  const soundNotif    = useToggle(true)
  const vibration     = useToggle(true)
  const preview       = useToggle(false)

  // Data toggles
  const dataSaver     = useToggle(false)
  const autoDownload  = useToggle(true)
  const autoDownloadWifi = useToggle(true)
  const spiritVoiceAuto  = useToggle(false)
  const offlineQueue  = useToggle(true)
  const ussdFallback  = useToggle(false)

  // Inject CSS
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('cs-styles')) {
      const s = document.createElement('style'); s.id = 'cs-styles'; s.textContent = STYLES
      document.head.appendChild(s)
    }
  }, [])

  const back = () => section === 'main' ? router.back() : setSection('main')

  // ── HEADER ──────────────────────────────────────────────────────
  const Header = ({ title }: { title: string }) => (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: C.bg, borderBottom: `1px solid ${C.border}`,
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <button onClick={back} style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'rgba(255,255,255,.05)', border: `1px solid ${C.border}`,
        color: C.textDim, fontSize: 18, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>‹</button>
      <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 17, fontWeight: 900, color: C.text }}>{title}</div>
    </div>
  )

  const wrap = (content: React.ReactNode, title: string) => (
    <div className="cs-no-scroll" style={{ height: '100vh', background: C.bg, color: C.text, fontFamily: 'DM Sans,sans-serif', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <Header title={title} />
      <div className="cs-fade cs-no-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {content}
      </div>
    </div>
  )

  // ── PRIVACY SECTION ──────────────────────────────────────────────
  if (section === 'privacy') return wrap(<>
    <GroupLabel label="Who can see" />
    <Row icon="👁" label="Last Seen" sub={lastSeen.value ? 'Everyone' : 'Nobody'}
      right={<ToggleSwitch on={lastSeen.value} onToggle={lastSeen.toggle} />} />
    <Row icon="🖼" label="Profile Photo" sub={profilePhoto.value ? 'Village Circle & above' : 'Nobody'}
      right={<ToggleSwitch on={profilePhoto.value} onToggle={profilePhoto.toggle} />} />
    <Row icon="✅" label="Read Receipts" sub={readReceipts.value ? 'Contacts see blue ticks' : 'Hidden from all'}
      right={<ToggleSwitch on={readReceipts.value} onToggle={readReceipts.toggle} />} />
    <Row icon="🟢" label="Online Status" sub={onlineStatus.value ? 'Contacts can see you online' : 'Always appear offline'}
      right={<ToggleSwitch on={onlineStatus.value} onToggle={onlineStatus.toggle} />} />

    <GroupLabel label="Groups" />
    <Row icon="🏘" label="Group Invites" sub={groupInvite.value ? 'Village Circle & above' : 'Nobody — manual only'}
      right={<ToggleSwitch on={groupInvite.value} onToggle={groupInvite.toggle} />} />

    <GroupLabel label="Disappearing Messages" />
    <div style={{ padding: '12px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Auto-Delete New Chats</div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>New messages vanish after set time</div>
        </div>
        <ToggleSwitch on={disappearing.value} onToggle={disappearing.toggle} color="#9333ea" />
      </div>
      {disappearing.value && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {(['24h', '7d', '90d'] as const).map(t => (
            <button key={t} onClick={() => setDisappearTimer(t)} style={{
              flex: 1, padding: '8px 0', borderRadius: 10,
              background: disappearTimer === t ? C.purple : 'rgba(255,255,255,.05)',
              border: `1px solid ${disappearTimer === t ? C.purpleL : C.border}`,
              color: disappearTimer === t ? '#fff' : C.textDim,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>
      )}
    </div>

    <GroupLabel label="Africa-First" />
    <div style={{ margin: '0 18px 12px', padding: '14px', borderRadius: 14, background: 'rgba(26,124,62,.06)', border: '1px solid rgba(26,124,62,.15)' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: C.greenL, marginBottom: 5 }}>🛡 Nkisi Shield Privacy Score</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: '78%', height: '100%', background: `linear-gradient(to right, ${C.green}, ${C.greenL})`, borderRadius: 99 }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.greenL }}>78/100</span>
      </div>
      <div style={{ fontSize: 10, color: C.textDim, marginTop: 6, lineHeight: 1.6 }}>Enable Read Receipts off + Incognito to reach 95+</div>
    </div>
  </>, '🔒 Privacy')

  // ── SECURITY SECTION ──────────────────────────────────────────────
  if (section === 'security') return wrap(<>
    <GroupLabel label="Access Control" />
    <Row icon="🔐" label="Biometric Lock" sub={biometricLock.value ? 'Fingerprint / Face ID required' : 'Off — anyone can open'}
      right={<ToggleSwitch on={biometricLock.value} onToggle={biometricLock.toggle} color={C.blueL} />} accent={C.blueL} />
    <Row icon="🔑" label="Two-Step Verification" sub={twoStep.value ? 'PIN required on new device' : 'Recommended — adds extra layer'}
      onClick={twoStep.value ? undefined : () => twoStep.toggle()}
      right={<ToggleSwitch on={twoStep.value} onToggle={twoStep.toggle} color={C.blueL} />} accent={C.blueL} />
    <Row icon="🖼" label="Screenshot Lock" sub={screenshotLock.value ? 'Others cannot screenshot your chats' : 'Screenshots allowed'}
      right={<ToggleSwitch on={screenshotLock.value} onToggle={screenshotLock.toggle} color={C.blueL} />} accent={C.blueL} />
    <Row icon="🕵" label="Incognito Typing" sub={incognito.value ? 'Typing not shared with anyone' : 'Typing indicator visible'}
      right={<ToggleSwitch on={incognito.value} onToggle={incognito.toggle} color={C.purpleL} />} accent={C.purpleL} />

    <GroupLabel label="Nkisi Shield" />
    <Row icon="🛡" label="Nkisi Shield Active" sub={nkisiShield.value ? 'Scam detection + threat scoring running' : 'Disabled — you are exposed'}
      right={<ToggleSwitch on={nkisiShield.value} onToggle={nkisiShield.toggle} />} />
    <div style={{ margin: '0 18px 12px', padding: 14, borderRadius: 14, background: 'rgba(74,222,128,.04)', border: '1px solid rgba(74,222,128,.15)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Scam Attempts Blocked', value: '14', icon: '🚫' },
          { label: 'Trust Score', value: 'GREEN', icon: '🟢' },
          { label: 'Encrypted Chats', value: '100%', icon: '🔒' },
          { label: 'Kyber-512 Keys', value: 'Active', icon: '🧬' },
        ].map(s => (
          <div key={s.label} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.greenL }}>{s.value}</div>
            <div style={{ fontSize: 9, color: C.textDim, marginTop: 2, lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>

    <GroupLabel label="Auto-Delete" />
    <Row icon="🗑" label="Auto-Delete Old Messages" sub={autoDelete.value ? 'Messages older than 30 days deleted' : 'Keep messages forever'}
      right={<ToggleSwitch on={autoDelete.value} onToggle={autoDelete.toggle} color={C.redL} />} />

    <GroupLabel label="Session Management" />
    <Row icon="📱" label="Linked Devices" sub="2 active sessions" onClick={() => {}} />
    <Row icon="🔓" label="View Active Sessions" sub="See all devices with access" onClick={() => {}} />
    <Row icon="⚠" label="Report a Security Issue" sub="Contact Nkisi Shield team" onClick={() => {}} danger />
  </>, '🛡 Security')

  // ── NOTIFICATIONS SECTION ─────────────────────────────────────────
  if (section === 'notifications') return wrap(<>
    <GroupLabel label="General" />
    <Row icon="💬" label="Message Notifications" sub="All DMs and personal chats"
      right={<ToggleSwitch on={msgNotif.value} onToggle={msgNotif.toggle} />} />
    <Row icon="🏘" label="Group Notifications" sub="Village circles and community chats"
      right={<ToggleSwitch on={groupNotif.value} onToggle={groupNotif.toggle} />} />
    <Row icon="📞" label="Call Alerts" sub="Incoming voice and video calls"
      right={<ToggleSwitch on={callNotif.value} onToggle={callNotif.toggle} />} />

    <GroupLabel label="Africa-Critical Alerts" />
    <Row icon="🩸" label="Blood-Call SOS" sub="ALWAYS ON — cannot be disabled for safety"
      right={<div style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(220,38,38,.1)', border: '1px solid rgba(220,38,38,.2)', fontSize: 9, fontWeight: 800, color: C.redL }}>ALWAYS ON</div>}
      accent={C.redL} />
    <Row icon="🤝" label="Trade & Escrow Alerts" sub="Payment locks, delivery confirmations"
      right={<ToggleSwitch on={tradeAlert.value} onToggle={tradeAlert.toggle} color={C.goldL} />} accent={C.goldL} />

    <GroupLabel label="Sound & Vibration" />
    <Row icon="🔊" label="Notification Sound"
      right={<ToggleSwitch on={soundNotif.value} onToggle={soundNotif.toggle} />} />
    <Row icon="📳" label="Vibration"
      right={<ToggleSwitch on={vibration.value} onToggle={vibration.toggle} />} />
    <Row icon="👁" label="Message Preview in Notifications" sub={preview.value ? 'Content visible on lock screen' : 'Hidden — privacy first'}
      right={<ToggleSwitch on={preview.value} onToggle={preview.toggle} />} />

    <GroupLabel label="Custom Sounds" />
    <Row icon="🥁" label="Talking Drum Tone" sub="Default notification sound" onClick={() => {}} />
    <Row icon="🎵" label="Custom Ringtone" sub="Upload your own sound" onClick={() => {}} />

    <GroupLabel label="Do Not Disturb" />
    <Row icon="🌙" label="Night Quiet Hours" sub="Auto-mute 11 PM – 6 AM" onClick={() => {}} />
    <Row icon="🕌" label="Prayer Time Silence" sub="Auto-mute during Fajr, Dhuhr, Asr, Maghrib, Isha" onClick={() => {}} accent={C.goldL} />
  </>, '🔔 Notifications')

  // ── DATA SAVER SECTION ────────────────────────────────────────────
  if (section === 'data') return wrap(<>
    <div style={{ margin: '16px 18px', padding: 14, borderRadius: 14, background: dataSaver.value ? 'rgba(26,124,62,.1)' : 'rgba(255,255,255,.03)', border: `1px solid ${dataSaver.value ? 'rgba(26,124,62,.25)' : C.border}`, transition: 'all .3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: dataSaver.value ? 10 : 0 }}>
        <div>
          <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 15, fontWeight: 900, color: dataSaver.value ? C.greenL : C.text }}>
            {dataSaver.value ? '✅ Data Saver Active' : '📡 Data Saver'}
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 3 }}>
            {dataSaver.value ? 'Saving data — optimized for 2G/3G' : 'Reduces mobile data usage by up to 70%'}
          </div>
        </div>
        <ToggleSwitch on={dataSaver.value} onToggle={dataSaver.toggle} />
      </div>
      {dataSaver.value && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {['No auto-download', 'Compressed images', 'Spirit Voice on demand', 'Text-only mode ready'].map(tag => (
            <span key={tag} style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.2)', color: C.greenL }}>{tag}</span>
          ))}
        </div>
      )}
    </div>

    <GroupLabel label="Auto-Download" />
    <Row icon="📱" label="On Mobile Data" sub={autoDownload.value ? 'Photos auto-download on any connection' : 'Manual download only'}
      right={<ToggleSwitch on={autoDownload.value} onToggle={autoDownload.toggle} />} />
    <Row icon="📶" label="On Wi-Fi Only" sub={autoDownloadWifi.value ? 'Videos & docs download on Wi-Fi' : 'Never auto-download on Wi-Fi'}
      right={<ToggleSwitch on={autoDownloadWifi.value} onToggle={autoDownloadWifi.toggle} />} />

    <GroupLabel label="Spirit Voice" />
    <Row icon="🎙" label="Auto-Translate Messages" sub={spiritVoiceAuto.value ? 'Translates all incoming messages' : 'Translate on tap only (saves data)'}
      right={<ToggleSwitch on={spiritVoiceAuto.value} onToggle={spiritVoiceAuto.toggle} />} />

    <GroupLabel label="Offline & Low-Connectivity" />
    <Row icon="💤" label="Offline Message Queue" sub={offlineQueue.value ? 'Messages queued when offline, sent when connected' : 'Fail immediately if no connection'}
      right={<ToggleSwitch on={offlineQueue.value} onToggle={offlineQueue.toggle} />} />
    <Row icon="📟" label="USSD Bridge" sub={ussdFallback.value ? 'Send basic messages via *767# USSD on feature phones' : 'Voice/data only'}
      right={<ToggleSwitch on={ussdFallback.value} onToggle={ussdFallback.toggle} color={C.goldL} />} accent={C.goldL} />

    <GroupLabel label="Data Usage" />
    {[
      { label: 'This month', value: '48 MB', pct: 48 },
      { label: 'Last month', value: '124 MB', pct: 100 },
    ].map(row => (
      <div key={row.label} style={{ padding: '10px 18px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{row.label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.greenL }}>{row.value}</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 99 }}>
          <div style={{ width: `${row.pct}%`, height: '100%', background: `linear-gradient(to right, ${C.green}, ${C.greenL})`, borderRadius: 99 }} />
        </div>
      </div>
    ))}
  </>, '📡 Data & Connectivity')

  // ── STORAGE SECTION ────────────────────────────────────────────────
  if (section === 'storage') return wrap(<>
    <div style={{ margin: '16px 18px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 32, fontWeight: 900, color: C.text }}>200 MB</div>
      <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>Total chat storage used</div>
      <div style={{ height: 10, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden', margin: '12px 0 4px' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          {STORAGE_CATS.map(c => (
            <div key={c.label} style={{ width: `${c.pct}%`, background: c.color, transition: 'width .5s' }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
        {STORAGE_CATS.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
            <span style={{ fontSize: 10, color: C.textDim }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>

    <GroupLabel label="By Type" />
    {STORAGE_CATS.map(c => (
      <Row key={c.label} icon={c.icon} label={c.label} sub={c.size}
        right={
          <button style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.2)', color: C.redL, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            Clear
          </button>
        } accent={c.color} />
    ))}

    <GroupLabel label="Tools" />
    <Row icon="🔍" label="Review Large Files" sub="Find and delete files over 5 MB" onClick={() => {}} />
    <Row icon="📦" label="Export Chat History" sub="Download all messages as PDF or JSON" onClick={() => {}} />
    <Row icon="☁" label="Back Up to Vault" sub="Encrypt and store in your Ancestral Vault" onClick={() => {}} accent={C.purpleL} />
    <Row icon="🗑" label="Clear All Chat Media" sub="Frees storage, keeps message text" onClick={() => {}} danger />
  </>, '💾 Storage')

  // ── BLOCKED USERS SECTION ──────────────────────────────────────────
  if (section === 'blocked') return wrap(<>
    <div style={{ margin: '14px 18px 8px', padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,.03)', border: `1px solid ${C.border}`, fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>
      Blocked users cannot call you, message you, or see your activity. They are also flagged in the Nkisi Shield network.
    </div>

    {blocked.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '40px 24px', color: C.textDim }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🛡</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>No blocked users</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>Your village is clean</div>
      </div>
    ) : blocked.map((u, i) => (
      <div key={i} style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🚫</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{u.handle}</div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{u.village} · {u.reason}</div>
          <div style={{ fontSize: 10, color: C.textDim2, marginTop: 1 }}>{u.ago}</div>
        </div>
        <button onClick={() => setUnblockId(u.handle)} style={{
          padding: '6px 12px', borderRadius: 8,
          background: 'rgba(255,255,255,.05)', border: `1px solid ${C.border}`,
          color: C.textDim, fontSize: 11, fontWeight: 700, cursor: 'pointer',
        }}>Unblock</button>
      </div>
    ))}

    {/* Unblock confirmation */}
    {unblockId && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 24 }}>
        <div style={{ background: C.bgCard, borderRadius: 20, padding: 24, maxWidth: 320, width: '100%', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 8 }}>Unblock {unblockId}?</div>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 20, lineHeight: 1.6 }}>They will be able to message you again. Their Nkisi flag will remain in the network.</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setUnblockId(null)} style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: `1px solid ${C.border}`, color: C.textDim, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => { setBlocked(b => b.filter(u => u.handle !== unblockId)); setUnblockId(null) }} style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: C.green, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Unblock</button>
          </div>
        </div>
      </div>
    )}
  </>, '🚫 Blocked Users')

  // ── ABOUT SECTION ──────────────────────────────────────────────────
  if (section === 'about') return wrap(<>
    <div style={{ padding: '24px 18px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>💬</div>
      <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 20, fontWeight: 900, color: C.text }}>Seso Chat</div>
      <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>v2.4.0 · Sovereign Division</div>
    </div>

    <GroupLabel label="Encryption" />
    <div style={{ margin: '0 18px 16px', padding: 14, borderRadius: 14, background: 'rgba(26,124,62,.05)', border: '1px solid rgba(26,124,62,.15)' }}>
      {[
        { label: 'Protocol', value: 'Seso Signal + KYBER-512' },
        { label: 'Key Exchange', value: 'Post-Quantum X25519' },
        { label: 'Cipher', value: 'AES-256-GCM' },
        { label: 'Identity', value: 'Afro-ID + Blood Quorum' },
      ].map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
          <span style={{ fontSize: 11, color: C.textDim }}>{r.label}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.greenL, fontFamily: 'monospace' }}>{r.value}</span>
        </div>
      ))}
    </div>

    <GroupLabel label="Links" />
    <Row icon="📜" label="Privacy Policy" onClick={() => {}} />
    <Row icon="📋" label="Terms of Service" onClick={() => {}} />
    <Row icon="🔓" label="Open Source Licenses" onClick={() => {}} />
    <Row icon="🐛" label="Report a Bug" onClick={() => {}} />
    <Row icon="💡" label="Send Feedback" onClick={() => {}} />
  </>, 'ℹ About')

  // ── MAIN SETTINGS PAGE ─────────────────────────────────────────────
  return (
    <div className="cs-no-scroll" style={{ height: '100vh', background: C.bg, color: C.text, fontFamily: 'DM Sans,sans-serif', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <Header title="⚙ Chat Settings" />

      {/* Profile card */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 17, background: 'rgba(26,124,62,.15)', border: '2px solid rgba(26,124,62,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, position: 'relative' }}>
            🧑
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: C.greenL, border: `2px solid ${C.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>✦</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 16, fontWeight: 900, color: C.text }}>Umoh Okonkwo</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>@umoh_okokwo · NG-IGB-5532-1123</div>
            <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: 'rgba(26,124,62,.1)', border: '1px solid rgba(26,124,62,.2)', color: C.greenL }}>🛡 GREEN</span>
              <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: 'rgba(212,160,23,.1)', border: '1px solid rgba(212,160,23,.2)', color: C.goldL }}>Crest III</span>
            </div>
          </div>
          <button style={{ padding: '6px 12px', borderRadius: 9, background: 'rgba(255,255,255,.05)', border: `1px solid ${C.border}`, color: C.textDim, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
        </div>
      </div>

      <div className="cs-fade cs-no-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {/* Main menu items */}
        <div style={{ marginTop: 8 }}>
          <Row icon="🔒" label="Privacy" sub="Last seen, read receipts, who can reach you" onClick={() => setSection('privacy')} accent={C.greenL} />
          <Row icon="🛡" label="Security" sub="Biometric lock, 2FA, Nkisi Shield, sessions" onClick={() => setSection('security')} accent={C.blueL} />
          <Row icon="🔔" label="Notifications" sub="Sounds, alerts, Blood-Call, prayer times" onClick={() => setSection('notifications')} accent={C.goldL} />
          <Row icon="📡" label="Data & Connectivity" sub="Data saver, offline queue, USSD bridge" onClick={() => setSection('data')} accent="#22d3ee" />
          <Row icon="💾" label="Storage" sub="Media, exports, Vault backup — 200 MB used" onClick={() => setSection('storage')} accent={C.purpleL} />
          <Row icon="🚫" label="Blocked Users" sub={`${blocked.length} blocked · Nkisi flagged`} onClick={() => setSection('blocked')} accent={C.redL} />
          <Row icon="ℹ" label="About Seso" sub="Encryption, licenses, version" onClick={() => setSection('about')} />
        </div>

        {/* Danger zone */}
        <div style={{ margin: '16px 18px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim2, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Account</div>
          <button style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.15)', color: C.redL, fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🗑</span>
            <div>
              <div>Delete My Account</div>
              <div style={{ fontSize: 10, color: 'rgba(248,113,113,.6)', fontWeight: 500, marginTop: 2 }}>Permanent — removes all data from the village</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
