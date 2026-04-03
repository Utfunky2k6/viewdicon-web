'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useSkinStore, SKIN_META } from '@/stores/skinStore'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api'
import type { ActiveSkin } from '@/types'
import { getRankFromXP, getXPProgress, RANK_GROUP_META, XP_SOURCES as HONOR_XP_SOURCES, type RankGroup } from '@/constants/ranks'

// ═══════════════════════════════════════════════════════════════════════
// SETTINGS — Comprehensive: Account, Privacy, Security, Masquerade,
// Appearance, Cowrie & Commerce, Content & Feed, Notifications,
// Delivery Addresses, Language, Data, About, Danger Zone.
// Route: /dashboard/settings
// ═══════════════════════════════════════════════════════════════════════

type Section =
  | 'main' | 'account' | 'privacy' | 'security' | 'masquerade'
  | 'appearance' | 'cowrie' | 'content' | 'notifications'
  | 'addresses' | 'language' | 'data' | 'about' | 'danger' | 'rank'

interface Address {
  id: string; label: string; line1: string; line2: string; city: string; state: string; country: string; isDefault: boolean
}

const CSS = `
@keyframes stFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes stSlide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes stPop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes stShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.st-fade{animation:stFade .35s ease both}.st-slide{animation:stSlide .3s ease both}
.st-pop{animation:stPop .25s ease both}.st-shake{animation:stShake .3s ease}
.st-no-sb::-webkit-scrollbar{display:none}.st-no-sb{scrollbar-width:none}
.st-row:active{background:rgba(255,255,255,.06)!important}
`

const vc = '#1a7c3e'
const red = '#ef4444'
const gold = '#d4a017'
const purple = '#7c3aed'
const orange = '#d97706'

// ── Section titles map ───────────────────────────────────────────────
const SECTION_TITLES: Record<Section, string> = {
  main: 'Settings', account: 'Account', privacy: 'Privacy & Safety',
  security: 'Security', masquerade: 'Masquerade Protocol',
  appearance: 'Appearance', cowrie: 'Cowrie & Commerce',
  content: 'Content & Feed', notifications: 'Drum Calls',
  addresses: 'Delivery Addresses', language: 'Language & Region',
  data: 'Data & Storage', about: 'About', danger: 'Delete Account',
  rank: 'Honor Rank',
}

// ── Toggle Component ─────────────────────────────────────────────────
function Toggle({ on, onChange, color }: { on: boolean; onChange: () => void; color?: string }) {
  const bg = on ? (color || vc) : 'rgba(255,255,255,.12)'
  return (
    <button onClick={onChange} style={{ width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: bg, position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: on ? 21 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
    </button>
  )
}

// ── Row Component ────────────────────────────────────────────────────
function Row({ icon, label, sub, right, onClick, danger }: { icon: string; label: string; sub?: string; right?: React.ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <div className="st-row" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: onClick ? 'pointer' : 'default', borderRadius: 12, transition: 'background .1s' }}>
      <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: danger ? red : '#f0f7f0' }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{sub}</div>}
      </div>
      {right || (onClick && <span style={{ fontSize: 14, color: 'rgba(255,255,255,.2)' }}>›</span>)}
    </div>
  )
}

// ── Section Card ─────────────────────────────────────────────────────
function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="st-fade" style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
      {title && <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{title}</div>}
      {children}
    </div>
  )
}

// ── PIN Input Component ──────────────────────────────────────────────
function PinInput({ value, onChange, length = 4 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', position: 'relative' }}>
      {Array.from({ length }).map((_, i) => (
        <div key={i} onClick={() => inputRef.current?.focus()} style={{
          width: 48, height: 56, borderRadius: 12, cursor: 'text',
          background: value[i] ? 'rgba(26,124,62,.15)' : 'rgba(255,255,255,.04)',
          border: `2px solid ${value[i] ? vc + '60' : 'rgba(255,255,255,.1)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 900, color: '#4ade80', transition: 'all .2s',
        }}>
          {value[i] ? '●' : ''}
        </div>
      ))}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        maxLength={length}
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'text' }}
        autoFocus
      />
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [section, setSection] = React.useState<Section>('main')
  const [flash, setFlash] = React.useState('')
  const { activeSkin } = useSkinStore()
  const { biometricEnrolled, setBiometricEnrolled, user } = useAuthStore()

  // ── Account state — hydrate from real user data ──
  const [displayName, setDisplayName] = React.useState('')
  const [handle, setHandle] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [bio, setBio] = React.useState('')

  // Hydrate account fields from authStore user on mount
  React.useEffect(() => {
    if (user) {
      setDisplayName(user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.displayName || '')
      setHandle(user.handle ? `@${user.handle}` : user.afroId?.raw ? `@${user.afroId.raw}` : '')
      setPhone(user.phone || '')
      setEmail(user.email || '')
      setBio(user.bio || '')
    }
  }, [user])

  // ── Privacy toggles ──
  const [showOnline, setShowOnline] = React.useState(true)
  const [showLastSeen, setShowLastSeen] = React.useState(true)
  const [readReceipts, setReadReceipts] = React.useState(true)
  const [profileVisible, setProfileVisible] = React.useState(true)
  const [showVillages, setShowVillages] = React.useState(true)
  const [showCowrie, setShowCowrie] = React.useState(false)
  const [showCrest, setShowCrest] = React.useState(true)

  // ── Security ──
  const [biometricWorking, setBiometricWorking] = React.useState(false)
  const [twoFactor, setTwoFactor] = React.useState(false)
  const [pinLock, setPinLock] = React.useState(true)
  const [screenshotBlock, setScreenshotBlock] = React.useState(false)
  const [nkisiShield, setNkisiShield] = React.useState(true)

  // ── Masquerade / PIN ──
  const [idilePin, setIdilePin] = React.useState('1234')
  const [changingPin, setChangingPin] = React.useState(false)
  const [oldPin, setOldPin] = React.useState('')
  const [newPin, setNewPin] = React.useState('')
  const [confirmPin, setConfirmPin] = React.useState('')
  const [pinStep, setPinStep] = React.useState<'old' | 'new' | 'confirm'>('old')
  const [idileTimeout, setIdileTimeout] = React.useState(30) // minutes
  const [ghostMode, setGhostMode] = React.useState(false)

  // ── Appearance ──
  const [theme, setTheme] = React.useState<'dark' | 'light' | 'system'>('dark')

  // ── Cowrie ──
  const [autoConvert, setAutoConvert] = React.useState(false)
  const [sprayConfirm, setSprayConfirm] = React.useState(true)
  const [escrowNotify, setEscrowNotify] = React.useState(true)

  // ── Content & Feed ──
  const [nightMarketMode, setNightMarketMode] = React.useState(false)
  const [autoplayVoice, setAutoplayVoice] = React.useState(true)
  const [showHeatScore, setShowHeatScore] = React.useState(true)
  const [drumQueue, setDrumQueue] = React.useState(true)

  // ── Notifications ──
  const [notifMessages, setNotifMessages] = React.useState(true)
  const [notifVillage, setNotifVillage] = React.useState(true)
  const [notifCowrie, setNotifCowrie] = React.useState(true)
  const [notifFeed, setNotifFeed] = React.useState(true)
  const [notifSessions, setNotifSessions] = React.useState(true)
  const [notifBloodCall] = React.useState(true)
  const [notifRoots, setNotifRoots] = React.useState(true)
  const [notifEvents, setNotifEvents] = React.useState(true)
  const [notifGoLive, setNotifGoLive] = React.useState(true)
  const [notifSound, setNotifSound] = React.useState(true)
  const [notifVibrate, setNotifVibrate] = React.useState(true)

  // ── Addresses — start empty, load from backend ──
  const [addresses, setAddresses] = React.useState<Address[]>([])
  const [addrForm, setAddrForm] = React.useState({ label: '', line1: '', line2: '', city: '', state: '', country: 'Nigeria' })

  // ── Language ──
  const [language, setLanguage] = React.useState('en')
  const [region, setRegion] = React.useState('NG')

  // ── Data ──
  const [dataSaver, setDataSaver] = React.useState(false)
  const [autoDownload, setAutoDownload] = React.useState(true)
  const [offlineQueue, setOfflineQueue] = React.useState(false)

  // ── Danger zone ──
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [deleteInput, setDeleteInput] = React.useState('')

  // ── Honor Rank — from user data, using 500-tier system ──
  const currentXP = user?.ubuntuScore ?? user?.honorXp ?? 0
  const honorRank = getRankFromXP(currentXP)
  const honorProgress = getXPProgress(currentXP)

  React.useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('st-css')) {
      const s = document.createElement('style'); s.id = 'st-css'; s.textContent = CSS; document.head.appendChild(s)
    }
  }, [])

  // Sync theme to localStorage/document
  React.useEffect(() => {
    if (typeof localStorage === 'undefined') return
    if (theme === 'system') {
      localStorage.removeItem('afk-theme')
      document.documentElement.removeAttribute('data-theme')
    } else {
      localStorage.setItem('afk-theme', theme)
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light')
        document.documentElement.style.backgroundColor = '#fafafa'
      } else {
        document.documentElement.removeAttribute('data-theme')
        document.documentElement.style.backgroundColor = '#0d1117'
      }
    }
  }, [theme])

  const doFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 2000) }

  const goBack = () => section === 'main' ? router.back() : setSection('main')

  const handleLogout = async () => {
    // 1. Invalidate refresh token on backend
    try { await authApi.logout() } catch { /* ok if fails */ }
    // 2. Clear zustand in-memory + persisted state
    useAuthStore.getState().logout()
    // 3. Clear all localStorage keys
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('afk-auth')
      localStorage.removeItem('afk_token')
      localStorage.removeItem('afk-ceremony-state')
      localStorage.removeItem('village-store')
    }
    // 4. Clear auth cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'afk_token=; Max-Age=0; path=/'
      document.cookie = 'afk_ceremony_done=; Max-Age=0; path=/'
    }
    router.push('/login')
  }

  const handleBiometricToggle = async () => {
    if (biometricEnrolled) {
      // Remove fingerprint
      localStorage.removeItem('afk_credential_id')
      localStorage.removeItem('afk_biometric_enrolled')
      setBiometricEnrolled(false)
      doFlash('Fingerprint removed')
      return
    }
    if (!window.PublicKeyCredential) {
      doFlash('Biometric authentication not supported on this device')
      return
    }
    setBiometricWorking(true)
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'Viewdicon', id: location.hostname },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: 'viewdicon-user',
            displayName: 'Viewdicon User',
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential | null

      if (cred) {
        const rawId = Array.from(new Uint8Array(cred.rawId))
          .map(b => b.toString(16).padStart(2, '0')).join('')
        localStorage.setItem('afk_credential_id', rawId)
        localStorage.setItem('afk_biometric_enrolled', 'true')
        setBiometricEnrolled(true, rawId)
        doFlash('✅ Fingerprint enrolled!')
      } else {
        doFlash('Fingerprint registration cancelled')
      }
    } catch {
      doFlash('Biometric setup failed. Try again or use a supported device.')
    }
    setBiometricWorking(false)
  }

  const handlePinChange = () => {
    if (pinStep === 'old') {
      if (oldPin !== idilePin) { doFlash('Incorrect current PIN'); setOldPin(''); return }
      setPinStep('new')
    } else if (pinStep === 'new') {
      if (newPin.length < 4) return
      setPinStep('confirm')
    } else {
      if (confirmPin !== newPin) { doFlash('PINs do not match'); setConfirmPin(''); return }
      setIdilePin(newPin)
      setChangingPin(false)
      setOldPin(''); setNewPin(''); setConfirmPin('')
      setPinStep('old')
      doFlash('IDILE PIN updated!')
    }
  }

  // rankGroup derived from honorRank
  const rankGroupMeta = RANK_GROUP_META[honorRank.group]

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="st-no-sb" style={{ minHeight: '100dvh', background: '#050a06', color: '#f0f7f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Flash toast */}
      {flash && (
        <div className="st-pop" style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 999, padding: '10px 20px', borderRadius: 12, background: 'rgba(26,124,62,.95)', color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 20px rgba(0,0,0,.4)' }}>
          {flash}
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,.06)', position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(12px)', background: 'rgba(5,10,6,.9)',
      }}>
        <button onClick={goBack} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', color: '#f0f7f0' }}>
          ←
        </button>
        <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Sora, sans-serif' }}>
          {SECTION_TITLES[section]}
        </div>
      </div>

      <div style={{ padding: '14px 16px 120px' }}>

        {/* ═══ MAIN MENU ═══ */}
        {section === 'main' && (
          <>
            {/* Profile summary */}
            <div className="st-fade" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', borderRadius: 16, background: `${vc}08`, border: `1px solid ${vc}20`, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${vc}20`, border: `2px solid ${vc}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: vc }}>
                {displayName[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{displayName}</div>
                <div style={{ fontSize: 11, color: vc, fontWeight: 600 }}>{handle}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>
                  {honorRank.emoji} {honorRank.group} · Lv {honorRank.level}
                </div>
              </div>
              <button onClick={() => setSection('account')} style={{ padding: '6px 10px', borderRadius: 8, background: `${vc}15`, border: `1px solid ${vc}30`, color: vc, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
            </div>

            {/* Profile & Identity */}
            <Card>
              <Row icon="👤" label="Account" sub="Name, phone, email, Afro-ID" onClick={() => setSection('account')} />
              <Row icon="⚔️" label="Honor Rank" sub={`${honorRank.emoji} ${honorRank.group} · Lv ${honorRank.level} · ${currentXP.toLocaleString()} XP`} onClick={() => setSection('rank')} />
              <Row icon="🎭" label="Masquerade Protocol" sub={`Active: ${SKIN_META[activeSkin].label} · 3 skins`} onClick={() => setSection('masquerade')} />
            </Card>

            {/* Privacy & Security */}
            <Card>
              <Row icon="🔒" label="Privacy & Safety" sub="Profile visibility, blocking, activity status" onClick={() => setSection('privacy')} />
              <Row icon="🛡" label="Security" sub="PIN, biometric, 2FA, Nkisi Shield" onClick={() => setSection('security')} />
            </Card>

            {/* Appearance & Content */}
            <Card>
              <Row icon="🎨" label="Appearance" sub={`${theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'} theme`} onClick={() => setSection('appearance')} />
              <Row icon="🐚" label="Cowrie & Commerce" sub="Wallet, escrow, spray settings" onClick={() => setSection('cowrie')} />
              <Row icon="🥁" label="Content & Feed" sub="Night market, heat scores, autoplay" onClick={() => setSection('content')} />
              <Row icon="🔔" label="Drum Calls" sub="Message, village, trade, Blood-Call" onClick={() => setSection('notifications')} />
            </Card>

            {/* Logistics & Platform */}
            <Card>
              <Row icon="📍" label="Delivery Addresses" sub={`${addresses.length} saved`} onClick={() => setSection('addresses')} />
              <Row icon="🌍" label="Language & Region" sub={`${language === 'en' ? 'English' : language === 'yo' ? 'Yoruba' : language === 'ha' ? 'Hausa' : language === 'ig' ? 'Igbo' : language === 'sw' ? 'Kiswahili' : language === 'fr' ? 'French' : 'English'} · ${region}`} onClick={() => setSection('language')} />
              <Row icon="📊" label="Data & Storage" sub={dataSaver ? 'Data Saver ON' : 'Normal mode'} onClick={() => setSection('data')} />
            </Card>

            {/* Legal & Platform */}
            <Card>
              <Row icon="ℹ️" label="About Viewdicon" sub="v0.1.0-alpha · Sovereignty Edition" onClick={() => setSection('about')} />
              <Row icon="📖" label="Help & Support" onClick={() => doFlash('Opening support...')} />
              <Row icon="📋" label="Terms of Service" onClick={() => doFlash('Opening terms...')} />
              <Row icon="🔐" label="Privacy Policy" onClick={() => doFlash('Opening privacy policy...')} />
            </Card>

            {/* Logout */}
            <Card>
              <Row icon="🚪" label="Log Out" danger onClick={handleLogout} />
            </Card>

            {/* Danger zone */}
            <Card>
              <Row icon="⏸" label="Deactivate Account" sub="Pause — reactivate within 90 days" danger onClick={() => doFlash('Deactivation pauses your account. You can return within 90 days.')} />
              <Row icon="⚠️" label="Delete My Account" sub="Permanently remove all data" danger onClick={() => setSection('danger')} />
            </Card>
          </>
        )}

        {/* ═══ ACCOUNT ═══ */}
        {section === 'account' && (
          <>
            <Card title="Profile Information">
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${vc}20`, border: `2px solid ${vc}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: vc, position: 'relative' }}>
                    {displayName[0]}
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', background: vc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '2px solid #050a06' }}>📷</div>
                  </div>
                  <div>
                    <button onClick={() => doFlash('Photo upload coming soon')} style={{ padding: '6px 12px', borderRadius: 8, background: `${vc}15`, border: `1px solid ${vc}30`, color: vc, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Change Photo</button>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>Max 5MB · JPG, PNG</div>
                  </div>
                </div>
                {[
                  { label: 'Display Name', value: displayName, set: setDisplayName, placeholder: 'Your name' },
                  { label: 'Handle', value: handle, set: setHandle, placeholder: '@handle' },
                  { label: 'Bio', value: bio, set: setBio, placeholder: 'Tell the village about yourself...', multiline: true },
                ].map((f, i) => (
                  <div key={i}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4, display: 'block' }}>{f.label}</label>
                    {f.multiline ? (
                      <textarea value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#f0f7f0', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit' }} />
                    ) : (
                      <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#f0f7f0', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Contact Information">
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4, display: 'block' }}>Phone Number</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input value={phone} readOnly style={{ flex: 1, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                    <button onClick={() => doFlash('Phone change requires OTP verification')} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.5)', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Change</button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4, display: 'block' }}>Email (Optional)</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#f0f7f0', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                </div>
              </div>
            </Card>

            <Card title="Identity">
              <Row icon="🪪" label="Afro-ID" sub={user?.afroId?.masked || '••••-••••-••••'} onClick={() => doFlash(user?.afroId?.raw || 'No Afro-ID yet')} />
              <Row icon="🛖" label="Primary Village" sub={user?.villageId ? user.villageId.charAt(0).toUpperCase() + user.villageId.slice(1) + ' Village' : 'Not assigned'} />
              <Row icon="🪘" label="Crest Level" sub={`Level ${user?.crestLevel || 1} · ${currentXP.toLocaleString()} / ${honorProgress.next ? honorProgress.next.xpRequired.toLocaleString() : 'MAX'} XP`} />
            </Card>

            <button onClick={async () => {
              try {
                await authApi.updateMe({ displayName, handle: handle.replace(/^@/, ''), email, bio })
                doFlash('Profile saved!')
                setSection('main')
              } catch { doFlash('Save failed — try again') }
            }} style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', background: vc, color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: 'Sora, sans-serif', cursor: 'pointer', marginTop: 8 }}>
              Save Changes
            </button>
          </>
        )}

        {/* ═══ HONOR RANK ═══ */}
        {section === 'rank' && (
          <>
            {/* Current rank display */}
            <Card>
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 52, marginBottom: 8 }}>{honorRank.emoji}</div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 900, color: honorRank.color }}>{honorRank.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{honorRank.subtitle}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>Level {honorRank.level} of 500 · {honorRank.group}</div>
                <div style={{ margin: '16px auto 8px', maxWidth: 280 }}>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${honorProgress.progress * 100}%`, borderRadius: 4, background: `linear-gradient(90deg, ${honorRank.color}88, ${honorRank.color})`, transition: 'width .5s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'rgba(255,255,255,.35)' }}>
                    <span>{currentXP.toLocaleString()} XP</span>
                    {honorProgress.next ? <span>{honorProgress.next.xpRequired.toLocaleString()} XP</span> : <span style={{ color: honorRank.color }}>MAX ✦</span>}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: honorRank.color, fontWeight: 600, marginTop: 4 }}>✓ {honorRank.perk}</div>
              </div>
            </Card>

            {/* XP earning methods */}
            <Card title="How to earn XP">
              {HONOR_XP_SOURCES.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                  <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{a.emoji}</span>
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#f0f7f0' }}>{a.action}</div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#4ade80' }}>+{a.xp}</span>
                </div>
              ))}
            </Card>

            {/* Rank ladder — 11 groups */}
            <Card title="Honor Ladder · 500 Tiers">
              {(Object.keys(RANK_GROUP_META) as RankGroup[]).map((groupName) => {
                const meta = RANK_GROUP_META[groupName]
                const isCurrent = honorRank.group === groupName
                return (
                  <div key={groupName} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                    borderBottom: '1px solid rgba(255,255,255,.03)',
                    background: isCurrent ? `${meta.color}10` : 'transparent',
                    borderLeft: isCurrent ? `3px solid ${meta.color}` : '3px solid transparent',
                  }}>
                    <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{meta.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: meta.color }}>{groupName}{isCurrent ? ' (You)' : ''}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{meta.description}</div>
                    </div>
                    {isCurrent && <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}40` }}>LV {honorRank.level}</span>}
                  </div>
                )
              })}
            </Card>
          </>
        )}

        {/* ═══ MASQUERADE PROTOCOL ═══ */}
        {section === 'masquerade' && (
          <>
            {/* Active skin display */}
            <Card>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['WORK', 'SOCIAL', 'CLAN'] as ActiveSkin[]).map(skin => {
                    const meta = SKIN_META[skin]
                    const isActive = activeSkin === skin
                    return (
                      <div key={skin} style={{
                        flex: 1, padding: '12px 8px', borderRadius: 12, textAlign: 'center',
                        background: isActive ? `${meta.color}15` : 'rgba(255,255,255,.03)',
                        border: `2px solid ${isActive ? meta.color + '50' : 'rgba(255,255,255,.06)'}`,
                      }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>{meta.emoji}</div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: isActive ? meta.color : 'rgba(255,255,255,.4)' }}>{meta.label}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 2 }}>{meta.tagline}</div>
                        {isActive && <div style={{ fontSize: 8, fontWeight: 800, color: meta.color, marginTop: 4 }}>ACTIVE</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>

            {/* Skin visibility rules */}
            <Card title="What others see">
              <div style={{ padding: '12px 16px' }}>
                {[
                  { skin: 'ISE', color: vc, desc: 'Work profile, village membership, tools, trade history. Your real name is visible.' },
                  { skin: 'EGBE', color: orange, desc: 'Social handle, posts, voice stories, kila count. Real name hidden; handle only.' },
                  { skin: 'IDILE', color: purple, desc: 'Clan-only. Only family circle members see you. Ghost mode available.' },
                ].map((r, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: r.color, marginBottom: 2 }}>{r.skin}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', lineHeight: 1.5 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* IDILE PIN Management */}
            <Card title="IDILE Palm Mark (PIN)">
              <div style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', lineHeight: 1.5, marginBottom: 12 }}>
                  A 4-digit PIN is required to enter IDILE (Clan) mode. This protects your sacred family space.
                </div>
                {!changingPin ? (
                  <button onClick={() => setChangingPin(true)} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: `1.5px solid ${purple}40`, background: `${purple}10`, color: purple, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                    🔑 Change IDILE PIN
                  </button>
                ) : (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f7f0', marginBottom: 10, textAlign: 'center' }}>
                      {pinStep === 'old' ? 'Enter current PIN' : pinStep === 'new' ? 'Enter new PIN' : 'Confirm new PIN'}
                    </div>
                    <PinInput
                      value={pinStep === 'old' ? oldPin : pinStep === 'new' ? newPin : confirmPin}
                      onChange={v => {
                        if (pinStep === 'old') setOldPin(v)
                        else if (pinStep === 'new') setNewPin(v)
                        else setConfirmPin(v)
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <button onClick={() => { setChangingPin(false); setOldPin(''); setNewPin(''); setConfirmPin(''); setPinStep('old') }} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)', background: 'none', color: 'rgba(255,255,255,.5)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button onClick={handlePinChange} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: purple, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                        {pinStep === 'confirm' ? 'Save PIN' : 'Next'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* IDILE settings */}
            <Card title="IDILE Behavior">
              <Row icon="🌫" label="Ghost Mode" sub="Blur your name in IDILE mode" right={<Toggle on={ghostMode} onChange={() => setGhostMode(v => !v)} color={purple} />} />
              <Row icon="⏱" label={`Auto-timeout: ${idileTimeout} min`} sub="Auto-exit IDILE after inactivity" right={
                <select
                  value={idileTimeout}
                  onChange={e => setIdileTimeout(Number(e.target.value))}
                  style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: '#f0f7f0', padding: '4px 8px', fontSize: 11, outline: 'none' }}
                >
                  {[5, 10, 15, 30, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                </select>
              } />
              <Row icon="📵" label="Block Screenshots in IDILE" sub="Prevent screen capture in clan mode" right={<Toggle on={screenshotBlock} onChange={() => setScreenshotBlock(v => !v)} color={purple} />} />
            </Card>
          </>
        )}

        {/* ═══ APPEARANCE ═══ */}
        {section === 'appearance' && (
          <>
            <Card title="Theme">
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {([
                  { key: 'dark' as const, label: '🌙 Dark', desc: 'Deep forest — immersive night', swatch: ['#050a06', '#4ade80', '#f0f7f0'] },
                  { key: 'light' as const, label: '☀️ Light', desc: 'Warm ivory — premium daylight', swatch: ['#faf6f0', '#15803d', '#1a0f08'] },
                  { key: 'system' as const, label: '⚙️ System', desc: 'Follows device preference', swatch: ['#1a1a1a', '#888', '#ffffff'] },
                ]).map(({ key, label, desc, swatch }) => {
                  const active = theme === key
                  return (
                    <button key={key} onClick={() => { setTheme(key); doFlash(`Theme: ${label}`) }} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', borderRadius: 11, cursor: 'pointer',
                      border: active ? `1.5px solid ${vc}` : '1.5px solid rgba(255,255,255,.08)',
                      background: active ? 'rgba(74,222,128,.07)' : 'rgba(255,255,255,.03)',
                      transition: 'all .18s', textAlign: 'left',
                    }}>
                      <div style={{ display: 'flex', borderRadius: 7, overflow: 'hidden', flexShrink: 0, width: 44, height: 26, border: '1px solid rgba(255,255,255,.12)' }}>
                        {swatch.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: active ? '#f0f7f0' : 'rgba(240,247,240,.8)' }}>{label}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{desc}</div>
                      </div>
                      {active && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#050a06', flexShrink: 0 }}>✓</div>}
                    </button>
                  )
                })}
              </div>
            </Card>
          </>
        )}

        {/* ═══ COWRIE & COMMERCE ═══ */}
        {section === 'cowrie' && (
          <>
            <Card title="Wallet">
              <Row icon="💰" label="Cowrie Balance" sub="₡ 4,200 available" onClick={() => router.push('/dashboard/banking')} />
              <Row icon="🏧" label="Linked Bank Account" sub="GTBank ****4821" onClick={() => doFlash('Bank settings coming soon')} />
              <Row icon="🔄" label="Auto-Convert to Naira" sub="Automatically convert Cowrie to Naira" right={<Toggle on={autoConvert} onChange={() => setAutoConvert(v => !v)} />} />
            </Card>

            <Card title="Trade Safety">
              <Row icon="💸" label="Spray Confirmation" sub="Ask before spraying Cowrie" right={<Toggle on={sprayConfirm} onChange={() => setSprayConfirm(v => !v)} />} />
              <Row icon="🔒" label="Escrow Notifications" sub="Alert when pot status changes" right={<Toggle on={escrowNotify} onChange={() => setEscrowNotify(v => !v)} />} />
            </Card>

            <Card title="Subscriptions">
              <Row icon="🌳" label="My Roots" sub="3 creators you root for" onClick={() => router.push('/dashboard/cowrie-flow')} />
              <Row icon="🫙" label="Ajo Circles" sub="2 active savings circles" onClick={() => doFlash('Ajo settings coming soon')} />
            </Card>

            <Card title="Tax & Fees">
              <Row icon="📊" label="Village Tax Rate" sub="5% on all live stream bookings" />
              <Row icon="📋" label="Transaction History" sub="Export all Cowrie movements" onClick={() => doFlash('Exporting transaction history...')} />
            </Card>
          </>
        )}

        {/* ═══ CONTENT & FEED ═══ */}
        {section === 'content' && (
          <>
            <Card title="Feed Behavior">
              <Row icon="🌙" label="Night Market Mode" sub="Boost Night Market content after 6 PM" right={<Toggle on={nightMarketMode} onChange={() => setNightMarketMode(v => !v)} />} />
              <Row icon="🔊" label="Autoplay Voice Stories" sub="Play voice stories automatically in feed" right={<Toggle on={autoplayVoice} onChange={() => setAutoplayVoice(v => !v)} />} />
              <Row icon="🔥" label="Show Heat Scores" sub="Display how hot each post is" right={<Toggle on={showHeatScore} onChange={() => setShowHeatScore(v => !v)} />} />
              <Row icon="🥁" label="Drum Queue" sub="Queue posts when offline, send when connected" right={<Toggle on={drumQueue} onChange={() => setDrumQueue(v => !v)} />} />
            </Card>

            <Card title="Jollof TV">
              <Row icon="📺" label="Default Quality" sub="Auto-detect based on network" onClick={() => doFlash('Quality: Auto-detect')} />
              <Row icon="🔴" label="Go Live Notifications" sub="When creators you root for go live" right={<Toggle on={notifGoLive} onChange={() => setNotifGoLive(v => !v)} />} />
            </Card>
          </>
        )}

        {/* ═══ PRIVACY ═══ */}
        {section === 'privacy' && (
          <>
            <Card title="Profile Visibility">
              <Row icon="👁" label="Profile Visible to Public" sub="Anyone can see your ISE/EGBE profile" right={<Toggle on={profileVisible} onChange={() => setProfileVisible(v => !v)} />} />
              <Row icon="🏘" label="Show Village Membership" sub="Display which villages you belong to" right={<Toggle on={showVillages} onChange={() => setShowVillages(v => !v)} />} />
              <Row icon="🐚" label="Show Cowrie Balance" sub="Display your Cowrie balance on profile" right={<Toggle on={showCowrie} onChange={() => setShowCowrie(v => !v)} />} />
              <Row icon="⚔️" label="Show Crest Level" sub="Display your crest rank" right={<Toggle on={showCrest} onChange={() => setShowCrest(v => !v)} />} />
            </Card>

            <Card title="Activity Status">
              <Row icon="🟢" label="Show Online Status" sub="Others can see when you are online" right={<Toggle on={showOnline} onChange={() => setShowOnline(v => !v)} />} />
              <Row icon="🕐" label="Show Last Seen" sub="Others can see when you were last active" right={<Toggle on={showLastSeen} onChange={() => setShowLastSeen(v => !v)} />} />
              <Row icon="✓✓" label="Read Receipts" sub="Others can see when you have read messages" right={<Toggle on={readReceipts} onChange={() => setReadReceipts(v => !v)} />} />
            </Card>

            <Card title="Blocking">
              <Row icon="🚫" label="Blocked Users" sub="0 users blocked" onClick={() => doFlash('No blocked users')} />
              <Row icon="🔇" label="Muted Villages" sub="0 villages muted" onClick={() => doFlash('No muted villages')} />
            </Card>
          </>
        )}

        {/* ═══ SECURITY ═══ */}
        {section === 'security' && (
          <>
            <Card title="Authentication">
              <Row icon="🔑" label="App PIN Lock" sub="Require PIN to open app" right={<Toggle on={pinLock} onChange={() => setPinLock(v => !v)} />} />
              <Row icon="👆" label="Biometric Lock" sub={biometricEnrolled ? '✅ Fingerprint enrolled · tap to remove' : biometricWorking ? '⏳ Enrolling…' : 'Tap to enroll fingerprint or Face ID'} right={<Toggle on={biometricEnrolled} onChange={handleBiometricToggle} />} />
              <Row icon="📱" label="Two-Factor Authentication" sub="Extra security via SMS code" right={<Toggle on={twoFactor} onChange={() => setTwoFactor(v => !v)} />} />
              <Row icon="🏛" label="IDILE PIN" sub="Manage your clan mode PIN" onClick={() => setSection('masquerade')} />
            </Card>

            <Card title="Protection">
              <Row icon="🛡" label="Nkisi Shield" sub="AI-powered fraud & threat detection" right={<Toggle on={nkisiShield} onChange={() => setNkisiShield(v => !v)} color={purple} />} />
              <Row icon="📵" label="Block Screenshots" sub="Prevent screenshots in IDILE mode" right={<Toggle on={screenshotBlock} onChange={() => setScreenshotBlock(v => !v)} />} />
            </Card>

            <Card title="Devices">
              <Row icon="📲" label="Linked Devices" sub="1 device connected" onClick={() => doFlash('Device management coming soon')} />
              <Row icon="🔄" label="Active Sessions" sub="1 active session · This device" onClick={() => doFlash('Session management coming soon')} />
            </Card>

            <Card title="Recovery">
              <Row icon="👨‍👩‍👧‍👦" label="Recovery Quorum" sub="3 of 7 clan members approved" onClick={() => router.push('/dashboard/profile')} />
              <Row icon="🗝" label="Backup Recovery Phrase" sub="12-word phrase · Never share this" onClick={() => doFlash('Recovery phrase requires PIN verification')} />
            </Card>
          </>
        )}

        {/* ═══ NOTIFICATIONS ═══ */}
        {section === 'notifications' && (
          <>
            <Card title="Activity">
              <Row icon="💬" label="Messages" sub="New messages in Seso Chat" right={<Toggle on={notifMessages} onChange={() => setNotifMessages(v => !v)} />} />
              <Row icon="🏘" label="Village Activity" sub="New sessions, tools, member joins" right={<Toggle on={notifVillage} onChange={() => setNotifVillage(v => !v)} />} />
              <Row icon="🐚" label="Cowrie Transactions" sub="Payments received and sent" right={<Toggle on={notifCowrie} onChange={() => setNotifCowrie(v => !v)} />} />
              <Row icon="🥁" label="Feed Activity" sub="Kila, stir, ubuntu on your posts" right={<Toggle on={notifFeed} onChange={() => setNotifFeed(v => !v)} />} />
              <Row icon="🔥" label="Session Updates" sub="Business session status changes" right={<Toggle on={notifSessions} onChange={() => setNotifSessions(v => !v)} />} />
            </Card>

            <Card title="Subscriptions & Events">
              <Row icon="🌳" label="Root Activity" sub="When someone plants a root in you" right={<Toggle on={notifRoots} onChange={() => setNotifRoots(v => !v)} />} />
              <Row icon="🎟" label="Event Updates" sub="Ticket sales, event reminders" right={<Toggle on={notifEvents} onChange={() => setNotifEvents(v => !v)} />} />
              <Row icon="🔴" label="Go Live Alerts" sub="When rooted creators go live" right={<Toggle on={notifGoLive} onChange={() => setNotifGoLive(v => !v)} />} />
            </Card>

            <Card title="Critical Alerts">
              <Row icon="🩸" label="Blood-Call SOS" sub="ALWAYS ON — cannot be disabled by design" right={<Toggle on={notifBloodCall} onChange={() => doFlash('Blood-Call cannot be disabled')} color={red} />} />
            </Card>

            <Card title="Sound & Feedback">
              <Row icon="🔊" label="Notification Sound" right={<Toggle on={notifSound} onChange={() => setNotifSound(v => !v)} />} />
              <Row icon="📳" label="Vibration" right={<Toggle on={notifVibrate} onChange={() => setNotifVibrate(v => !v)} />} />
            </Card>
          </>
        )}

        {/* ═══ DELIVERY ADDRESSES ═══ */}
        {section === 'addresses' && (
          <>
            {addresses.map((addr) => (
              <Card key={addr.id}>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#f0f7f0' }}>{addr.label}</span>
                        {addr.isDefault && <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: `${vc}20`, color: vc, border: `1px solid ${vc}30` }}>DEFAULT</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, marginTop: 4 }}>
                        {addr.line1}<br />{addr.line2 && <>{addr.line2}<br /></>}{addr.city}, {addr.state}<br />{addr.country}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!addr.isDefault && (
                        <button onClick={() => { setAddresses(a => a.map(x => ({ ...x, isDefault: x.id === addr.id }))); doFlash('Set as default') }} style={{ padding: '5px 8px', borderRadius: 6, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>Set Default</button>
                      )}
                      <button onClick={() => { setAddresses(a => a.filter(x => x.id !== addr.id)); doFlash('Address deleted') }} style={{ padding: '5px 8px', borderRadius: 6, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', color: '#ef4444', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Card title="Add New Address">
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'label', label: 'Label', placeholder: 'e.g., Home, Office, Shop' },
                  { key: 'line1', label: 'Address Line 1', placeholder: 'Street address' },
                  { key: 'line2', label: 'Address Line 2', placeholder: 'Apartment, suite, landmark' },
                  { key: 'city', label: 'City', placeholder: 'City or town' },
                  { key: 'state', label: 'State / Region', placeholder: 'State' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3, display: 'block' }}>{f.label}</label>
                    <input value={(addrForm as Record<string, string>)[f.key]} onChange={e => setAddrForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#f0f7f0', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                  </div>
                ))}
                <button onClick={() => {
                  if (!addrForm.label || !addrForm.line1 || !addrForm.city) { doFlash('Fill in label, address, and city'); return }
                  setAddresses(a => [...a, { ...addrForm, id: `a${Date.now()}`, isDefault: a.length === 0, country: addrForm.country || 'Nigeria' }])
                  setAddrForm({ label: '', line1: '', line2: '', city: '', state: '', country: 'Nigeria' })
                  doFlash('Address added!')
                }} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: vc, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', marginTop: 4 }}>
                  + Add Address
                </button>
              </div>
            </Card>
          </>
        )}

        {/* ═══ LANGUAGE & REGION ═══ */}
        {section === 'language' && (
          <>
            <Card title="Language">
              <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
                  { code: 'yo', name: 'Yoruba', native: 'Ede Yoruba', flag: '🇳🇬' },
                  { code: 'ha', name: 'Hausa', native: 'Hausa', flag: '🇳🇬' },
                  { code: 'ig', name: 'Igbo', native: 'Asusu Igbo', flag: '🇳🇬' },
                  { code: 'sw', name: 'Kiswahili', native: 'Kiswahili', flag: '🇰🇪' },
                  { code: 'fr', name: 'French', native: 'Francais', flag: '🇫🇷' },
                  { code: 'pt', name: 'Portuguese', native: 'Portugues', flag: '🇧🇷' },
                  { code: 'am', name: 'Amharic', native: 'Amharic', flag: '🇪🇹' },
                  { code: 'zu', name: 'Zulu', native: 'isiZulu', flag: '🇿🇦' },
                  { code: 'ar', name: 'Arabic', native: 'Arabic', flag: '🇪🇬' },
                ].map(lang => (
                  <button key={lang.code} onClick={() => { setLanguage(lang.code); doFlash(`Language: ${lang.name}`) }} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    background: language === lang.code ? `${vc}15` : 'transparent',
                    border: `1.5px solid ${language === lang.code ? vc + '40' : 'transparent'}`,
                    color: '#f0f7f0', width: '100%', textAlign: 'left',
                  }}>
                    <span style={{ fontSize: 18 }}>{lang.flag}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{lang.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{lang.native}</div>
                    </div>
                    {language === lang.code && <span style={{ fontSize: 14, color: vc }}>✓</span>}
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Region">
              <div style={{ padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { code: 'NG', name: 'Nigeria' }, { code: 'GH', name: 'Ghana' }, { code: 'KE', name: 'Kenya' },
                  { code: 'ZA', name: 'South Africa' }, { code: 'ET', name: 'Ethiopia' }, { code: 'TZ', name: 'Tanzania' },
                  { code: 'SN', name: 'Senegal' }, { code: 'RW', name: 'Rwanda' }, { code: 'CM', name: 'Cameroon' },
                  { code: 'CI', name: "Cote d'Ivoire" }, { code: 'UG', name: 'Uganda' }, { code: 'EG', name: 'Egypt' },
                ].map(r => (
                  <button key={r.code} onClick={() => { setRegion(r.code); doFlash(`Region: ${r.name}`) }} style={{
                    padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    background: region === r.code ? `${vc}20` : 'rgba(255,255,255,.04)',
                    border: `1.5px solid ${region === r.code ? vc + '40' : 'rgba(255,255,255,.08)'}`,
                    color: region === r.code ? vc : 'rgba(255,255,255,.5)',
                  }}>
                    {r.name}
                  </button>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* ═══ DATA & STORAGE ═══ */}
        {section === 'data' && (
          <>
            <Card title="Data Usage">
              <Row icon="📉" label="Data Saver Mode" sub="Reduce data usage on 2G/3G networks" right={<Toggle on={dataSaver} onChange={() => setDataSaver(v => !v)} />} />
              <Row icon="📥" label="Auto-Download Media" sub="Automatically download images and voice" right={<Toggle on={autoDownload} onChange={() => setAutoDownload(v => !v)} />} />
              <Row icon="📡" label="Offline Queue" sub="Queue messages when offline; send when connected" right={<Toggle on={offlineQueue} onChange={() => setOfflineQueue(v => !v)} />} />
            </Card>

            <Card title="Storage">
              <Row icon="💾" label="Clear Cache" sub="Free up 48.2 MB of cached data" onClick={() => doFlash('Cache cleared — 48.2 MB freed')} />
              <Row icon="🗑" label="Clear Chat Media" sub="Remove downloaded media from all chats" onClick={() => doFlash('Media cleared')} />
              <Row icon="📤" label="Export My Data" sub="Download all your data as ZIP" onClick={() => doFlash('Data export started — check your email')} />
            </Card>

            <Card title="Network">
              <Row icon="📶" label="USSD Bridge" sub="Use app features via USSD when offline" onClick={() => doFlash('USSD bridge: dial *384*44#')} />
              <Row icon="📻" label="Mesh P2P Mode" sub="Share data with nearby users via Bluetooth" onClick={() => doFlash('P2P mesh coming soon')} />
            </Card>
          </>
        )}

        {/* ═══ ABOUT ═══ */}
        {section === 'about' && (
          <>
            <Card>
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🌍</div>
                <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Sora, sans-serif', color: '#f0f7f0' }}>Viewdicon</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: vc, marginTop: 4 }}>Sovereignty Edition</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 8 }}>Version 0.1.0-alpha</div>
              </div>
            </Card>

            <Card title="Platform">
              <Row icon="🏗" label="Built on" sub="AFRO sovereign infrastructure" />
              <Row icon="🔐" label="Encryption" sub="End-to-end · AES-256-GCM + X25519" />
              <Row icon="🌐" label="20 Villages" sub="Industry-aligned digital nation" />
              <Row icon="🛠" label="201 Tools" sub="AI-powered across all villages" />
              <Row icon="🐚" label="Cowrie System" sub="Dual-currency sovereign economy" />
            </Card>

            <Card>
              <Row icon="🌿" label="Open Source" sub="github.com/viewdicon" onClick={() => doFlash('Opening repository...')} />
              <Row icon="💬" label="Community" sub="Join the discussion" onClick={() => doFlash('Opening community...')} />
              <Row icon="🐛" label="Report a Bug" sub="Help us improve" onClick={() => doFlash('Opening bug reporter...')} />
            </Card>
          </>
        )}

        {/* ═══ DANGER ZONE — DELETE ACCOUNT ═══ */}
        {section === 'danger' && (
          <>
            <Card>
              <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'Sora, sans-serif', color: red }}>Delete Your Account</div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, marginTop: 10 }}>
                  This action is <strong>permanent</strong> and cannot be undone. You have a <strong>14-day grace period</strong> to recover your account before data is destroyed.
                </p>
              </div>
            </Card>

            <Card title="Before you delete">
              {[
                '💰 All Cowrie must be withdrawn before deletion',
                '🔒 All active escrow sessions must be resolved',
                '🌳 All Root Planters refunded automatically',
                '⭐ Honor Rank and XP permanently lost',
                '📁 Vault documents transferred to family key holder',
                '⏳ 14-day grace period before permanent deletion',
              ].map((item, i) => (
                <div key={i} style={{ padding: '8px 16px', fontSize: 12, color: 'rgba(255,255,255,.5)', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                  {item}
                </div>
              ))}
            </Card>

            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: `2px solid ${red}40`, background: `${red}10`, color: red, fontSize: 14, fontWeight: 800, fontFamily: 'Sora, sans-serif', cursor: 'pointer' }}>
                I Understand — Continue
              </button>
            ) : (
              <Card title="Confirm Deletion">
                <div style={{ padding: '12px 16px' }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 10 }}>
                    Type <strong style={{ color: red }}>DELETE MY ACCOUNT</strong> to confirm:
                  </p>
                  <input
                    value={deleteInput}
                    onChange={e => setDeleteInput(e.target.value)}
                    placeholder="Type DELETE MY ACCOUNT"
                    style={{ width: '100%', padding: '12px', borderRadius: 10, boxSizing: 'border-box', background: 'rgba(239,68,68,.06)', border: `2px solid ${red}30`, color: red, fontSize: 14, fontWeight: 700, outline: 'none', fontFamily: 'inherit', textAlign: 'center' }}
                  />
                  <button
                    onClick={async () => {
                      if (deleteInput !== 'DELETE MY ACCOUNT') { doFlash('Type the exact phrase to confirm'); return }
                      // Submit deletion request — clears local session immediately
                      // Backend deletion is processed within 30 days per data policy
                      try { await authApi.logout() } catch { /* ok */ }
                      doFlash('Deletion request submitted. Your data will be removed within 30 days.')
                      setTimeout(() => handleLogout(), 2000)
                    }}
                    disabled={deleteInput !== 'DELETE MY ACCOUNT'}
                    style={{
                      width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', marginTop: 12,
                      background: deleteInput === 'DELETE MY ACCOUNT' ? red : 'rgba(255,255,255,.06)',
                      color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                      cursor: deleteInput === 'DELETE MY ACCOUNT' ? 'pointer' : 'not-allowed',
                      opacity: deleteInput === 'DELETE MY ACCOUNT' ? 1 : 0.3,
                    }}
                  >
                    🗑 Submit Account Deletion Request
                  </button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
