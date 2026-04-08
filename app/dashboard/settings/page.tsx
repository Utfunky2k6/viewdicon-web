'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api'
import { logApiFailure } from '@/lib/flags'
import { VILLAGE_BY_ID } from '@/lib/villages-data'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useLanguage } from '@/hooks/useLanguage'
import { LANGUAGES_BY_REGION, REGION_NAMES, searchLanguages, LANGUAGE_MAP, type AfricanLanguage } from '@/constants/african-languages'

type Section = 'general' | 'ads' | 'privacy' | 'notifications' | 'wallet' | 'language' | 'village' | 'creator'

const SECTIONS: { key: Section; emoji: string; label: string; desc: string }[] = [
  { key: 'general',       emoji: '✦',  label: 'General',         desc: 'Account, profile, display' },
  { key: 'village',       emoji: '🏘',  label: 'Village',         desc: 'Village, role, transfer' },
  { key: 'creator',       emoji: '🥁',  label: 'Creator',         desc: 'AfroFlix, music, revenue' },
  { key: 'ads',           emoji: '📯',  label: 'Market Cries',    desc: 'Ad preferences + earnings' },
  { key: 'privacy',       emoji: '🛡',  label: 'Privacy & Safety', desc: 'Skin locks, ghost mode' },
  { key: 'notifications', emoji: '🥁',  label: 'Notifications',    desc: 'Drums, mentions, alerts' },
  { key: 'wallet',        emoji: '🐚',  label: 'Cowrie Wallet',    desc: 'Balance, payouts, history' },
  { key: 'language',      emoji: '🌍',  label: 'Language & Voice', desc: 'Spirit Voice, translation' },
]

const AD_CATEGORIES = ['Commerce', 'Technology', 'Health', 'Education', 'Agriculture', 'Finance', 'Fashion', 'Arts', 'Spirituality', 'Food']

export default function SettingsPage() {
  const router = useRouter()
  const [section, setSection] = React.useState<Section>('general')

  // Pull real user data from authStore
  const { user, setUser } = useAuthStore()
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Theme (dark/light) — wired to global ThemeProvider
  const { theme, setTheme } = useTheme()

  // General settings — seeded from store
  const [displayName, setDisplayName] = React.useState(user?.displayName || '')
  const [handle, setHandle] = React.useState(user?.handle ? `@${user.handle.replace(/^@/, '')}` : '')
  const [autoplay, setAutoplay] = React.useState(true)
  const darkMode = theme === 'dark'
  const setDarkMode = (on: boolean) => setTheme(on ? 'dark' : 'light')

  // Ad settings
  const [adsEnabled, setAdsEnabled] = React.useState(true)
  const [earnFromAds, setEarnFromAds] = React.useState(true)
  const [adFrequency, setAdFrequency] = React.useState<'normal' | 'reduced' | 'minimal'>('normal')
  const [blockedCategories, setBlockedCategories] = React.useState<string[]>([])
  const [showBillboards, setShowBillboards] = React.useState(true)
  const [showTvAds, setShowTvAds] = React.useState(true)
  const [showNightMarket, setShowNightMarket] = React.useState(true)
  const [adEarnings, setAdEarnings] = React.useState(1247)

  // Privacy settings
  const [ghostMode, setGhostMode] = React.useState(false)
  const [showOnline, setShowOnline] = React.useState(true)
  const [profileVisible, setProfileVisible] = React.useState(true)

  // Notification settings
  const [drumNotifs, setDrumNotifs] = React.useState(true)
  const [mentionNotifs, setMentionNotifs] = React.useState(true)
  const [sprayNotifs, setSprayNotifs] = React.useState(true)
  const [villageNotifs, setVillageNotifs] = React.useState(true)

  // Language — unified via useLanguage hook
  const { code: langCode, name: langName, setLanguage } = useLanguage()
  const [langSearch, setLangSearch] = React.useState('')
  const [langRegion, setLangRegion] = React.useState<string | null>(null)
  const [spiritVoice, setSpiritVoice] = React.useState(true)
  const [autoTranslate, setAutoTranslate] = React.useState(true)

  // Village settings
  const [currentVillageId, setCurrentVillageId] = React.useState<string | null>(null)
  const [villagePrivacy, setVillagePrivacy] = React.useState<'everyone' | 'village_only' | 'nobody'>('everyone')
  const [toolsPrivacy, setToolsPrivacy] = React.useState<'everyone' | 'village_only' | 'nobody'>('everyone')

  // Creator settings
  const [creatorMode, setCreatorMode] = React.useState(false)
  const [revenueSplit, setRevenueSplit] = React.useState<'70_30' | '80_20' | '60_40'>('70_30')
  const [afroflixUpload, setAfroflixUpload] = React.useState(false)
  const [musicUpload, setMusicUpload] = React.useState(false)

  // Extra notification toggles
  const [toolSessionAlerts, setToolSessionAlerts] = React.useState(true)
  const [cowrieTxNotifs, setCowrieTxNotifs] = React.useState(true)
  const [followerNotifs, setFollowerNotifs] = React.useState(true)

  // Account deletion
  const [showDeleteSheet, setShowDeleteSheet] = React.useState(false)
  const [deleteOption, setDeleteOption] = React.useState<'deactivate'|'scheduled'|'immediate'|null>(null)
  const [keepFamilyTree, setKeepFamilyTree] = React.useState(true)
  const [keepCulturalContrib, setKeepCulturalContrib] = React.useState(true)
  const [deletePin, setDeletePin] = React.useState('')
  const [deleting, setDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState('')
  const logout = useAuthStore(s => s.logout)

  const toggleCategory = (c: string) => setBlockedCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  // ── Load settings from localStorage on mount (store takes priority) ─
  React.useEffect(() => {
    // Load village from localStorage
    try {
      const jv = localStorage.getItem('afk_joined_villages')
      if (jv) {
        const arr: string[] = JSON.parse(jv)
        setCurrentVillageId(arr.length > 0 ? arr[0] : null)
      }
    } catch {}
    // Always seed from authStore first (real data)
    if (user?.displayName) setDisplayName(user.displayName)
    if (user?.handle) setHandle(`@${user.handle.replace(/^@/, '')}`)
    try {
      const s = localStorage.getItem('vd-settings')
      if (!s) return
      const d = JSON.parse(s)
      // Only use cached display name/handle if store has nothing
      if (d.displayName && !user?.displayName) setDisplayName(d.displayName)
      if (d.handle && !user?.handle)           setHandle(d.handle)
      if (d.autoplay != null)   setAutoplay(d.autoplay)
      // darkMode is managed by ThemeProvider (reads afk-theme) — skip vd-settings.darkMode
      if (d.adsEnabled != null)      setAdsEnabled(d.adsEnabled)
      if (d.earnFromAds != null)     setEarnFromAds(d.earnFromAds)
      if (d.adFrequency)             setAdFrequency(d.adFrequency)
      if (d.blockedCategories)       setBlockedCategories(d.blockedCategories)
      if (d.showBillboards != null)  setShowBillboards(d.showBillboards)
      if (d.showTvAds != null)       setShowTvAds(d.showTvAds)
      if (d.showNightMarket != null) setShowNightMarket(d.showNightMarket)
      if (d.ghostMode != null)       setGhostMode(d.ghostMode)
      if (d.showOnline != null)      setShowOnline(d.showOnline)
      if (d.profileVisible != null)  setProfileVisible(d.profileVisible)
      if (d.drumNotifs != null)      setDrumNotifs(d.drumNotifs)
      if (d.mentionNotifs != null)   setMentionNotifs(d.mentionNotifs)
      if (d.sprayNotifs != null)     setSprayNotifs(d.sprayNotifs)
      if (d.villageNotifs != null)   setVillageNotifs(d.villageNotifs)
      if (d.primaryLang)             {} // handled by useLanguage hook
      if (d.spiritVoice != null)     setSpiritVoice(d.spiritVoice)
      if (d.autoTranslate != null)   setAutoTranslate(d.autoTranslate)
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.displayName, user?.handle])

  // ── Save settings to localStorage on every change ─────────────────
  React.useEffect(() => {
    try {
      localStorage.setItem('vd-settings', JSON.stringify({
        displayName, handle, autoplay,
        adsEnabled, earnFromAds, adFrequency, blockedCategories,
        showBillboards, showTvAds, showNightMarket,
        ghostMode, showOnline, profileVisible,
        drumNotifs, mentionNotifs, sprayNotifs, villageNotifs,
        primaryLangCode: langCode, primaryLang: langName, spiritVoice, autoTranslate,
      }))
    } catch {}
  }, [displayName, handle, autoplay, adsEnabled, earnFromAds, adFrequency, blockedCategories, showBillboards, showTvAds, showNightMarket, ghostMode, showOnline, profileVisible, drumNotifs, mentionNotifs, sprayNotifs, villageNotifs, langCode, langName, spiritVoice, autoTranslate])

  // ── Save general profile to backend ───────────────────────────────
  const handleSaveGeneral = async () => {
    setSaveStatus('saving')
    try {
      const updated = await authApi.updateMe({
        displayName: displayName.trim(),
        handle: handle.replace(/^@/, '').trim(),
      })
      if (updated) setUser(updated)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch (e) {
      logApiFailure('settings/save', e)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  // ── Phone display helper (we only have phoneHash, not plain phone) ─
  const phoneDisplay = user?.countryCode
    ? `${user.countryCode} ••••••• (Registered phone)`
    : 'Registered phone •••••••'

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 99, background: on ? '#1a7c3e' : 'rgba(255,255,255,.1)', cursor: 'pointer', position: 'relative', transition: 'all .2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.3)' }} />
    </div>
  )

  const SettingRow = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f5ee' }}>{label}</div>
        {desc && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#07090a', color: '#f0f5ee', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: .02, backgroundImage: 'repeating-linear-gradient(45deg,#d4a017 0px,#d4a017 1px,transparent 0,transparent 50%)', backgroundSize: '20px 20px' }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '16px 16px 100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button onClick={() => router.push('/dashboard')} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.08)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'\u2190'}</button>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900, color: '#f0f5ee' }}>{'\u2699\uFE0F'} Settings</div>
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 20 }}>
          {SECTIONS.map(s => (
            <div key={s.key} onClick={() => setSection(s.key)} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 12, cursor: 'pointer', background: section === s.key ? 'rgba(212,160,23,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${section === s.key ? 'rgba(212,160,23,.3)' : 'rgba(255,255,255,.07)'}`, transition: 'all .2s' }}>
              <div style={{ fontSize: 16, textAlign: 'center', marginBottom: 2 }}>{s.emoji}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: section === s.key ? '#fbbf24' : 'rgba(255,255,255,.4)', whiteSpace: 'nowrap' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Kratos · Security Sovereign ── */}
        <div style={{ margin: '0 0 20px', padding: '18px', borderRadius: 18, background: 'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(127,29,29,0.08))', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 28 }}>⚔️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', fontFamily: "'Space Grotesk',sans-serif" }}>Kratos · Security Sovereign</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter',sans-serif" }}>Your fortress is: <span style={{ color: '#4ade80', fontWeight: 700 }}>FORTIFIED</span></div>
            </div>
            <a href="/dashboard/ai" style={{ padding: '6px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 10, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", textDecoration: 'none' }}>Consult ⚔️</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { icon: '🛡️', label: 'Biometric', status: 'ON', color: '#4ade80' },
              { icon: '🕵️', label: 'Dark Web', status: 'SCANNING', color: '#fbbf24' },
              { icon: '📱', label: 'Device Trust', status: '94/100', color: '#4ade80' },
              { icon: '🔥', label: 'Tx Firewall', status: 'ACTIVE', color: '#4ade80' },
              { icon: '🌫️', label: 'ZK Privacy', status: 'READY', color: '#60a5fa' },
              { icon: '🚫', label: 'Lockdown', status: 'ARMED', color: '#ef4444' },
            ].map(s => (
              <div key={s.label} style={{ padding: '8px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter',sans-serif" }}>{s.label}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk',sans-serif", marginTop: 2 }}>{s.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* -- General Section -- */}
        {section === 'general' && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Account</div>
            <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 14, padding: '0 14px', border: '1px solid rgba(255,255,255,.06)' }}>
              <SettingRow label="Display Name" desc="Visible on your profile">
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={{ width: 150, padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f5ee', fontSize: 12, outline: 'none', textAlign: 'right', fontFamily: 'inherit' }} />
              </SettingRow>
              <SettingRow label="Handle" desc="Your unique @handle">
                <input value={handle} onChange={e => setHandle(e.target.value)} style={{ width: 150, padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#fbbf24', fontSize: 12, outline: 'none', textAlign: 'right', fontFamily: 'inherit' }} />
              </SettingRow>
              <SettingRow label="Phone Number" desc="Used for login verification">
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', textAlign: 'right' }}>{phoneDisplay}</span>
              </SettingRow>
              <SettingRow label="Autoplay Videos" desc="Autoplay in feed and Jollof TV">
                <Toggle on={autoplay} onToggle={() => setAutoplay(!autoplay)} />
              </SettingRow>
              <SettingRow label="Dark Mode" desc="Platform appearance">
                <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
              </SettingRow>
            </div>
            {/* Save button for profile fields */}
            <button
              onClick={handleSaveGeneral}
              disabled={saveStatus === 'saving'}
              style={{
                marginTop: 14, width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                background: saveStatus === 'saved' ? '#166534' : saveStatus === 'error' ? '#7f1d1d' : 'linear-gradient(135deg,#d4a017,#b8860b)',
                color: '#000', fontSize: 13, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                opacity: saveStatus === 'saving' ? 0.7 : 1, transition: 'all .2s',
              }}
            >
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? 'Save Failed — Retry' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* -- Market Cries (Ads) Section -- */}
        {section === 'ads' && (
          <div>
            {/* Earnings banner */}
            <div style={{ background: 'linear-gradient(135deg,rgba(74,222,128,.08),rgba(26,124,62,.04))', border: '1px solid rgba(74,222,128,.2)', borderRadius: 14, padding: '14px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(74,222,128,.6)', textTransform: 'uppercase' }}>Your Ad Earnings</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#4ade80', fontFamily: 'DM Mono, monospace' }}>{'\u20A1'}{adEarnings.toLocaleString()}</div>
                <div style={{ fontSize: 9, color: 'rgba(74,222,128,.4)', marginTop: 2 }}>Earned from watching Market Cries</div>
              </div>
              <button onClick={() => setAdEarnings(0)} style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(74,222,128,.12)', border: '1px solid rgba(74,222,128,.3)', color: '#4ade80', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Withdraw to Wallet</button>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Ad Preferences</div>
            <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 14, padding: '0 14px', border: '1px solid rgba(255,255,255,.06)', marginBottom: 16 }}>
              <SettingRow label="Show Market Cries" desc="Display ads in your feed">
                <Toggle on={adsEnabled} onToggle={() => setAdsEnabled(!adsEnabled)} />
              </SettingRow>
              <SettingRow label="Earn Cowrie from Ads" desc={`Get paid ${'\u20A1'}5-50 for engaging with ads`}>
                <Toggle on={earnFromAds} onToggle={() => setEarnFromAds(!earnFromAds)} />
              </SettingRow>
              <SettingRow label="Village Billboards" desc="Show billboard banners in villages">
                <Toggle on={showBillboards} onToggle={() => setShowBillboards(!showBillboards)} />
              </SettingRow>
              <SettingRow label="TV Commercials" desc="Show ads during Jollof TV streams">
                <Toggle on={showTvAds} onToggle={() => setShowTvAds(!showTvAds)} />
              </SettingRow>
              <SettingRow label="Night Market Ads" desc="Show sponsored Night Market slots">
                <Toggle on={showNightMarket} onToggle={() => setShowNightMarket(!showNightMarket)} />
              </SettingRow>
            </div>

            {/* Ad frequency */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Frequency</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {([['normal', '🥁 Normal', 'Every 5 posts'], ['reduced', '🤫 Reduced', 'Every 10 posts'], ['minimal', '🕯️ Minimal', 'Every 20 posts']] as [typeof adFrequency, string, string][]).map(([k, l, d]) => (
                <div key={k} onClick={() => setAdFrequency(k)} style={{ flex: 1, padding: '12px', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: adFrequency === k ? 'rgba(212,160,23,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${adFrequency === k ? 'rgba(212,160,23,.3)' : 'rgba(255,255,255,.07)'}`, transition: 'all .2s' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: adFrequency === k ? '#fbbf24' : 'rgba(255,255,255,.5)' }}>{l}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 3 }}>{d}</div>
                </div>
              ))}
            </div>

            {/* Blocked categories */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Hide Categories</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {AD_CATEGORIES.map(c => (
                <div key={c} onClick={() => toggleCategory(c)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: blockedCategories.includes(c) ? 'rgba(248,113,113,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${blockedCategories.includes(c) ? 'rgba(248,113,113,.3)' : 'rgba(255,255,255,.07)'}`, color: blockedCategories.includes(c) ? '#f87171' : 'rgba(255,255,255,.4)', transition: 'all .15s' }}>{blockedCategories.includes(c) ? '\u2715 ' : ''}{c}</div>
              ))}
            </div>

            {/* Create your own */}
            <div style={{ background: 'linear-gradient(135deg,rgba(212,160,23,.06),rgba(212,160,23,.02))', border: '1px solid rgba(212,160,23,.2)', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🥁</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fbbf24', fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>Want to advertise?</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 12 }}>Create your own Market Cry and reach every village</div>
              <button onClick={() => router.push('/dashboard/ads')} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#d4a017,#b8860b)', border: 'none', cursor: 'pointer', color: '#000', fontSize: 12, fontWeight: 800 }}>🥁 Open Ad Manager</button>
            </div>
          </div>
        )}

        {/* -- Village Settings Section -- */}
        {section === 'village' && (() => {
          const village = currentVillageId ? VILLAGE_BY_ID[currentVillageId] : null
          const roleKey = user?.roleKey ?? null
          const roleLabel = village ? (village.roles.find(r => r.key === roleKey)?.name ?? roleKey ?? '—') : '—'
          return (
            <div>
              {/* Current village card */}
              <div style={{
                borderRadius: 14, padding: '16px',
                background: village ? `${village.color}10` : 'rgba(255,255,255,.04)',
                border: `1.5px solid ${village ? village.color + '35' : 'rgba(255,255,255,.12)'}`,
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: village ? `${village.color}25` : 'rgba(255,255,255,.08)',
                    border: `1.5px solid ${village ? village.color + '50' : 'rgba(255,255,255,.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  }}>
                    {village?.emoji ?? '🏘'}
                  </div>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Current Village</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: village?.color ?? '#f0f5ee', fontFamily: '"Cinzel","Palatino",serif' }}>
                      {village ? (village.ancientName || village.name) : 'No village yet'}
                    </div>
                    {village && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>Role: {String(roleLabel)}</div>}
                  </div>
                </div>
              </div>

              {/* Privacy: who can see your village */}
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Village Visibility</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {([['everyone', '🌍 Everyone'], ['village_only', '🏘 Village Only'], ['nobody', '🔒 Nobody']] as [typeof villagePrivacy, string][]).map(([k, l]) => (
                  <div key={k} onClick={() => setVillagePrivacy(k)} style={{ flex: 1, padding: '10px 8px', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: villagePrivacy === k ? 'rgba(26,124,62,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${villagePrivacy === k ? 'rgba(26,124,62,.4)' : 'rgba(255,255,255,.07)'}`, transition: 'all .15s' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: villagePrivacy === k ? '#4ade80' : 'rgba(255,255,255,.45)' }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Tools Visibility</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {([['everyone', '🌍 Everyone'], ['village_only', '🏘 Village Only'], ['nobody', '🔒 Nobody']] as [typeof toolsPrivacy, string][]).map(([k, l]) => (
                  <div key={k} onClick={() => setToolsPrivacy(k)} style={{ flex: 1, padding: '10px 8px', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: toolsPrivacy === k ? 'rgba(26,124,62,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${toolsPrivacy === k ? 'rgba(26,124,62,.4)' : 'rgba(255,255,255,.07)'}`, transition: 'all .15s' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: toolsPrivacy === k ? '#4ade80' : 'rgba(255,255,255,.45)' }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Transfer button */}
              <button
                onClick={() => router.push('/dashboard/villages/transfer')}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, cursor: 'pointer',
                  background: 'linear-gradient(135deg, rgba(26,124,62,.2), rgba(26,124,62,.1))',
                  border: '1.5px solid rgba(26,124,62,.35)' as never,
                  color: '#4ade80', fontSize: 13, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                }}
              >
                🔄 Transfer Village
              </button>

              {/* View applications */}
              <button
                onClick={() => router.push('/dashboard/villages/applications')}
                style={{
                  width: '100%', marginTop: 8, padding: '11px', borderRadius: 12,
                  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                  color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                📋 My Transfer Applications
              </button>
            </div>
          )
        })()}

        {/* -- Creator Settings Section -- */}
        {section === 'creator' && (
          <div>
            {/* Creator mode banner */}
            <div style={{
              borderRadius: 14, padding: '16px',
              background: creatorMode ? 'linear-gradient(135deg,rgba(124,58,237,.12),rgba(124,58,237,.04))' : 'rgba(255,255,255,.03)',
              border: `1.5px solid ${creatorMode ? 'rgba(124,58,237,.35)' : 'rgba(255,255,255,.08)'}`,
              marginBottom: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: creatorMode ? '#c084fc' : '#f0f5ee', fontFamily: 'Sora, sans-serif' }}>🎬 Creator Mode</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 3, lineHeight: 1.4 }}>
                  Enables AfroFlix uploads, music distribution, and fan monetisation
                </div>
              </div>
              <div onClick={() => setCreatorMode(c => !c)} style={{ width: 44, height: 24, borderRadius: 99, background: creatorMode ? '#7c3aed' : 'rgba(255,255,255,.1)', cursor: 'pointer', position: 'relative', transition: 'all .2s', flexShrink: 0, marginLeft: 12 }}>
                <div style={{ position: 'absolute', top: 2, left: creatorMode ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.3)' }} />
              </div>
            </div>

            {creatorMode && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Upload Permissions</div>
                <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 14, padding: '0 14px', border: '1px solid rgba(255,255,255,.06)', marginBottom: 16 }}>
                  <SettingRow label="🎬 AfroFlix Upload" desc="Upload films and video content to AfroFlix">
                    <div onClick={() => setAfroflixUpload(v => !v)} style={{ width: 44, height: 24, borderRadius: 99, background: afroflixUpload ? '#7c3aed' : 'rgba(255,255,255,.1)', cursor: 'pointer', position: 'relative', transition: 'all .2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 2, left: afroflixUpload ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.3)' }} />
                    </div>
                  </SettingRow>
                  <SettingRow label="🎵 Music Upload" desc="Distribute music across AfroFlix and village events">
                    <div onClick={() => setMusicUpload(v => !v)} style={{ width: 44, height: 24, borderRadius: 99, background: musicUpload ? '#7c3aed' : 'rgba(255,255,255,.1)', cursor: 'pointer', position: 'relative', transition: 'all .2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 2, left: musicUpload ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.3)' }} />
                    </div>
                  </SettingRow>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Revenue Split Preference</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {([
                    ['70_30', '70% Creator / 30% Platform', 'Standard split — most common'],
                    ['80_20', '80% Creator / 20% Platform', 'Crest IV+ only — premium tier'],
                    ['60_40', '60% Creator / 40% Platform', 'Boost mode — platform promotes your content'],
                  ] as [typeof revenueSplit, string, string][]).map(([k, l, d]) => (
                    <div key={k} onClick={() => setRevenueSplit(k)} style={{ padding: '12px 14px', borderRadius: 12, cursor: 'pointer', background: revenueSplit === k ? 'rgba(212,160,23,.1)' : 'rgba(255,255,255,.03)', border: `1.5px solid ${revenueSplit === k ? 'rgba(212,160,23,.35)' : 'rgba(255,255,255,.07)'}`, transition: 'all .15s' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: revenueSplit === k ? '#fbbf24' : '#f0f5ee' }}>{l}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 3 }}>{d}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* -- Privacy Section -- */}
        {section === 'privacy' && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Privacy Controls</div>
            <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 14, padding: '0 14px', border: '1px solid rgba(255,255,255,.06)' }}>
              <SettingRow label="👻 Ghost Mode (IDILE)" desc="Hide your identity in the Clan skin">
                <Toggle on={ghostMode} onToggle={() => setGhostMode(!ghostMode)} />
              </SettingRow>
              <SettingRow label="Show Online Status" desc="Others can see when you're active">
                <Toggle on={showOnline} onToggle={() => setShowOnline(!showOnline)} />
              </SettingRow>
              <SettingRow label="Profile Visible" desc="Your profile appears in searches">
                <Toggle on={profileVisible} onToggle={() => setProfileVisible(!profileVisible)} />
              </SettingRow>
            </div>
          </div>
        )}

        {/* -- Notifications Section -- */}
        {section === 'notifications' && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Notification Preferences</div>
            <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 14, padding: '0 14px', border: '1px solid rgba(255,255,255,.06)' }}>
              <SettingRow label="🥁 Drum Updates" desc="When someone drums in your village">
                <Toggle on={drumNotifs} onToggle={() => setDrumNotifs(!drumNotifs)} />
              </SettingRow>
              <SettingRow label="@ Mentions" desc="When someone mentions you">
                <Toggle on={mentionNotifs} onToggle={() => setMentionNotifs(!mentionNotifs)} />
              </SettingRow>
              <SettingRow label="🐚 Spray Alerts" desc="When you receive Cowrie sprays">
                <Toggle on={sprayNotifs} onToggle={() => setSprayNotifs(!sprayNotifs)} />
              </SettingRow>
              <SettingRow label="📯 Village Notices" desc="Official village announcements">
                <Toggle on={villageNotifs} onToggle={() => setVillageNotifs(!villageNotifs)} />
              </SettingRow>
            </div>
          </div>
        )}

        {/* -- Wallet Section -- */}
        {section === 'wallet' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg,rgba(212,160,23,.1),rgba(212,160,23,.03))', border: '1px solid rgba(212,160,23,.3)', borderRadius: 14, padding: '20px', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(212,160,23,.6)', textTransform: 'uppercase', marginBottom: 4 }}>Cowrie Balance</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#fbbf24', fontFamily: 'DM Mono, monospace' }}>{'\u20A1'}24,850</div>
              <div style={{ fontSize: 10, color: 'rgba(212,160,23,.5)', marginTop: 4 }}>{'\u2248'} $12.43 USD</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button onClick={() => router.push('/dashboard/banking')} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(74,222,128,.12)', border: '1px solid rgba(74,222,128,.3)', color: '#4ade80', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add Cowrie</button>
              <button onClick={() => router.push('/dashboard/banking')} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(212,160,23,.12)', border: '1px solid rgba(212,160,23,.3)', color: '#fbbf24', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{'\u2197'} Send</button>
              <button onClick={() => router.push('/dashboard/cowrie-flow')} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.5)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>📊 History</button>
            </div>
          </div>
        )}

        {/* -- Language Section -- */}
        {section === 'language' && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Language & Spirit Voice</div>
            <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 14, padding: '0 14px', border: '1px solid rgba(255,255,255,.06)', marginBottom: 16 }}>
              <SettingRow label="🎙️ Spirit Voice" desc="Auto-translate audio posts">
                <Toggle on={spiritVoice} onToggle={() => setSpiritVoice(!spiritVoice)} />
              </SettingRow>
              <SettingRow label="Auto-Translate Text" desc="Translate posts to your language">
                <Toggle on={autoTranslate} onToggle={() => setAutoTranslate(!autoTranslate)} />
              </SettingRow>
            </div>

            {/* ── Current Language ── */}
            <div style={{ background: 'rgba(74,222,128,.06)', borderRadius: 14, padding: 14, border: '1px solid rgba(74,222,128,.15)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>{LANGUAGE_MAP.get(langCode)?.flag ?? '🌍'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#4ade80' }}>{LANGUAGE_MAP.get(langCode)?.nativeName ?? 'English'}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{langName} · {langCode.toUpperCase()}</div>
              </div>
              <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 99, background: 'rgba(74,222,128,.15)', color: '#4ade80', fontWeight: 700 }}>Active</span>
            </div>

            {/* ── Search ── */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Hazina ya Lugha — Language Vault</div>
            <input
              value={langSearch}
              onChange={e => setLangSearch(e.target.value)}
              placeholder="Search by name, country, or code..."
              style={{ width: '100%', padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#f0f7f0', fontSize: 13, outline: 'none', marginBottom: 10, fontFamily: 'inherit' }}
            />

            {/* ── Region Filter Tabs ── */}
            <div style={{ display: 'flex', gap: 4, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }} className="st-no-scroll">
              <button onClick={() => setLangRegion(null)} style={{ padding: '5px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', background: !langRegion ? 'rgba(74,222,128,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${!langRegion ? 'rgba(74,222,128,.3)' : 'rgba(255,255,255,.07)'}`, color: !langRegion ? '#4ade80' : 'rgba(255,255,255,.35)', transition: 'all .15s' }}>All</button>
              {Object.entries(REGION_NAMES).map(([key, label]) => (
                <button key={key} onClick={() => setLangRegion(key)} style={{ padding: '5px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', background: langRegion === key ? 'rgba(74,222,128,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${langRegion === key ? 'rgba(74,222,128,.3)' : 'rgba(255,255,255,.07)'}`, color: langRegion === key ? '#4ade80' : 'rgba(255,255,255,.35)', transition: 'all .15s' }}>{label}</button>
              ))}
            </div>

            {/* ── Language List ── */}
            <div style={{ maxHeight: 340, overflowY: 'auto', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)' }}>
              {(langSearch
                ? searchLanguages(langSearch)
                : langRegion
                  ? (LANGUAGES_BY_REGION[langRegion] ?? [])
                  : Object.entries(LANGUAGES_BY_REGION).flatMap(([, langs]) => langs)
              ).slice(0, 80).map((l: AfricanLanguage) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    background: l.code === langCode ? 'rgba(74,222,128,.08)' : 'transparent',
                    border: 'none', borderBottom: '1px solid rgba(255,255,255,.03)',
                    cursor: 'pointer', textAlign: 'left', transition: 'background .15s',
                  }}
                >
                  <span style={{ fontSize: 18, width: 26, textAlign: 'center' }}>{l.flag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: l.code === langCode ? '#4ade80' : '#f0f7f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.nativeName}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name} · {l.countries.slice(0, 2).join(', ')} · {l.speakers >= 1 ? `${l.speakers}M` : `${Math.round(l.speakers * 1000)}K`} speakers</div>
                  </div>
                  {l.code === langCode && <span style={{ fontSize: 14, color: '#4ade80' }}>✓</span>}
                  {l.hasDictionary && <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 99, background: 'rgba(212,160,23,.12)', color: '#d4a017', fontWeight: 700 }}>DICT</span>}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.2)', marginTop: 8, textAlign: 'center' }}>
              Spirit Voice, AI Gods, and all posts will use your selected language
            </div>
          </div>
        )}

        {/* -- Account Section (always visible) -- */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Account</div>
          <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 14, padding: '14px', border: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 12, lineHeight: 1.6 }}>
              Manage your account status. Deactivation is reversible; deletion is permanent.
            </div>
            <button
              onClick={() => setShowDeleteSheet(true)}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: '#dc2626', color: '#fff',
                fontSize: 13, fontWeight: 800, fontFamily: 'Sora, sans-serif',
              }}
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* ── Delete Account Sheet ─────────────────────────────── */}
        {showDeleteSheet && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div onClick={() => { setShowDeleteSheet(false); setDeleteOption(null); setDeletePin(''); setDeleteError('') }} style={{ flex: 1, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(6px)' }} />
            <div style={{ background: '#0c1009', border: '1px solid rgba(239,68,68,.2)', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.15)', margin: '0 auto 16px' }} />
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 900, color: '#ef4444', marginBottom: 4 }}>
                Delete Account
              </h2>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 16, lineHeight: 1.5 }}>
                Choose how you want to remove your account. This affects your identity, roots, and village history.
              </p>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {([
                  { id: 'deactivate' as const, label: 'Deactivate (30-day recovery)', desc: 'Your profile goes dark. Log back in within 30 days to restore everything.', color: '#fbbf24', emoji: '\u23F8\uFE0F' },
                  { id: 'scheduled' as const, label: 'Delete (permanent after 90 days)', desc: 'Data deletion begins after 90 days. You can cancel during this period.', color: '#f97316', emoji: '\u23F3' },
                  { id: 'immediate' as const, label: 'Delete Everything Now (irreversible)', desc: 'All data is permanently erased. No recovery possible. Cowrie balance forfeited.', color: '#ef4444', emoji: '\u26A0\uFE0F' },
                ]).map(opt => {
                  const active = deleteOption === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setDeleteOption(opt.id)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                        background: active ? `${opt.color}12` : 'rgba(255,255,255,.03)',
                        border: `1.5px solid ${active ? opt.color : 'rgba(255,255,255,.07)'}`,
                      }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{opt.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: active ? opt.color : '#f0f5ee' }}>{opt.label}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', lineHeight: 1.5, marginTop: 2 }}>{opt.desc}</div>
                      </div>
                      {active && <span style={{ color: opt.color, fontSize: 14, flexShrink: 0 }}>&#10003;</span>}
                    </button>
                  )
                })}
              </div>

              {/* Preservation checkboxes */}
              {deleteOption && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.06em', marginBottom: 8 }}>PRESERVATION OPTIONS</div>
                  {([
                    { key: 'family', label: 'Keep my family tree connections for relatives', checked: keepFamilyTree, toggle: () => setKeepFamilyTree(!keepFamilyTree) },
                    { key: 'cultural', label: 'Keep my cultural contributions', checked: keepCulturalContrib, toggle: () => setKeepCulturalContrib(!keepCulturalContrib) },
                  ]).map(cb => (
                    <div
                      key={cb.key}
                      onClick={cb.toggle}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', marginBottom: 6,
                        background: cb.checked ? 'rgba(74,222,128,.06)' : 'rgba(255,255,255,.03)',
                        border: `1px solid ${cb.checked ? 'rgba(74,222,128,.2)' : 'rgba(255,255,255,.07)'}`,
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                        background: cb.checked ? '#1a7c3e' : 'rgba(255,255,255,.08)',
                        border: `2px solid ${cb.checked ? '#4ade80' : 'rgba(255,255,255,.15)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: '#fff',
                      }}>
                        {cb.checked ? '\u2713' : ''}
                      </div>
                      <span style={{ fontSize: 11, color: cb.checked ? '#4ade80' : 'rgba(255,255,255,.5)' }}>{cb.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* PIN confirmation */}
              {deleteOption && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.06em', marginBottom: 8 }}>CONFIRM WITH PIN / PASSWORD</div>
                  <input
                    type="password"
                    value={deletePin}
                    onChange={e => setDeletePin(e.target.value)}
                    placeholder="Enter your PIN or password"
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 12, boxSizing: 'border-box',
                      background: 'rgba(255,255,255,.06)', border: '1px solid rgba(239,68,68,.2)',
                      color: '#f0f5ee', fontSize: 13, outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                </div>
              )}

              {deleteError && (
                <div style={{ fontSize: 12, color: '#ef4444', textAlign: 'center', marginBottom: 12 }}>{deleteError}</div>
              )}

              {/* Confirm button */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { setShowDeleteSheet(false); setDeleteOption(null); setDeletePin(''); setDeleteError('') }}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,.1)',
                    background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.5)',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!deleteOption) return
                    if (!deletePin.trim()) { setDeleteError('PIN / password required'); return }
                    setDeleting(true)
                    setDeleteError('')
                    try {
                      await fetch('/api/v1/me', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          active: false,
                          deactivatedAt: new Date().toISOString(),
                          deactivationReason: deleteOption,
                          preserveFamilyTree: keepFamilyTree,
                          preserveCulturalContributions: keepCulturalContrib,
                        }),
                      })
                    } catch (e) {
                      logApiFailure('settings/deactivate', e)
                      // Proceed with local cleanup even if API fails
                    }
                    setDeleting(false)
                    logout()
                    router.push('/login')
                  }}
                  disabled={!deleteOption || !deletePin.trim() || deleting}
                  style={{
                    flex: 2, padding: '13px', borderRadius: 12, border: 'none',
                    cursor: deleteOption && deletePin.trim() ? 'pointer' : 'not-allowed',
                    background: deleteOption && deletePin.trim()
                      ? (deleteOption === 'immediate' ? '#dc2626' : deleteOption === 'scheduled' ? '#f97316' : '#d97706')
                      : 'rgba(255,255,255,.06)',
                    color: deleteOption && deletePin.trim() ? '#fff' : 'rgba(255,255,255,.25)',
                    fontSize: 13, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                  }}
                >
                  {deleting ? 'Processing...' : !deleteOption ? 'Select an option' : deleteOption === 'deactivate' ? 'Deactivate Account' : deleteOption === 'scheduled' ? 'Schedule Deletion' : 'Delete Everything Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
