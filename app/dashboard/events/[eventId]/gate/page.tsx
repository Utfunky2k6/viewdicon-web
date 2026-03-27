'use client'
// ══════════════════════════════════════════════════════════════════════
// GATE GUARDIAN — Offline-first venue entry tablet UI
// Connects to gate-guardian Rust service on port 3059
// ══════════════════════════════════════════════════════════════════════
import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
@keyframes ggAdmit{0%{background:rgba(74,222,128,.3)}100%{background:transparent}}
@keyframes ggReject{0%{background:rgba(239,68,68,.3)}100%{background:transparent}}
@keyframes ggSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes ggFade{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
.gg-admit{animation:ggAdmit .8s ease-out}
.gg-reject{animation:ggReject .8s ease-out}
.gg-spin{animation:ggSpin .8s linear infinite}
.gg-fade{animation:ggFade .25s ease both}
`
const CSS_ID = 'gate-guardian-css'

type ScanResult = {
  result: 'ADMIT'|'DUPLICATE'|'INVALID'|'FACE_REQUIRED'|'FACE_MISMATCH'|'VOICE_REQUIRED'|'VOICE_MISMATCH'|'GATE_NOT_READY'
  reason?: string
  tierName?: string
  perks?: string[]
  holderAfroId?: string
}

const RESULT_META: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  ADMIT:          { color: '#4ade80', bg: 'rgba(74,222,128,.15)',  icon: '✅', label: 'ADMIT' },
  DUPLICATE:      { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', icon: '⚠️', label: 'ALREADY SCANNED' },
  INVALID:        { color: '#ef4444', bg: 'rgba(239,68,68,.15)',   icon: '❌', label: 'INVALID' },
  FACE_REQUIRED:  { color: '#fbbf24', bg: 'rgba(251,191,36,.12)', icon: '👤', label: 'FACE CHECK' },
  FACE_MISMATCH:  { color: '#ef4444', bg: 'rgba(239,68,68,.15)',   icon: '🚫', label: 'FACE MISMATCH' },
  VOICE_REQUIRED: { color: '#a78bfa', bg: 'rgba(167,139,250,.12)',icon: '🎙', label: 'VOICE NEEDED' },
  VOICE_MISMATCH: { color: '#ef4444', bg: 'rgba(239,68,68,.15)',   icon: '🔇', label: 'VOICE FAILED' },
  GATE_NOT_READY: { color: '#6b7280', bg: 'rgba(107,114,128,.1)', icon: '⏳', label: 'NOT READY' },
}

interface LogEntry {
  hash: string; result: string; tierName: string; time: string
}

export default function GateGuardianPage() {
  const router   = useRouter()
  const params   = useParams<{ eventId: string }>()
  const eventId  = params.eventId

  const [eventCache, setEventCache] = React.useState({ eventTitle: '', venueName: '', totalTickets: 0 })

  React.useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setEventCache({
            eventTitle: data.title || data.eventTitle || '',
            venueName: data.venueName || data.venue || '',
            totalTickets: data.totalTickets || data.ticketCount || 0,
          })
        }
      })
      .catch(() => {})
  }, [eventId])

  const [synced,       setSynced]       = React.useState(false)
  const [syncing,      setSyncing]      = React.useState(false)
  const [ticketInput,  setTicketInput]  = React.useState('')
  const [scanning,     setScanning]     = React.useState(false)
  const [lastResult,   setLastResult]   = React.useState<ScanResult | null>(null)
  const [log,          setLog]          = React.useState<LogEntry[]>([])
  const [admitted,     setAdmitted]     = React.useState(0)
  const [rejected,     setRejected]     = React.useState(0)
  const [pushing,      setPushing]      = React.useState(false)
  const [pushDone,     setPushDone]     = React.useState(false)
  const [flashClass,   setFlashClass]   = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS
    document.head.appendChild(s)
  }, [])

  // Auto-focus the scan input
  React.useEffect(() => {
    if (synced) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [synced])

  async function handleSync() {
    setSyncing(true)
    // In production: POST /gate-guardian/gate/sync/:eventId
    await new Promise(r => setTimeout(r, 1200))
    setSyncing(false)
    setSynced(true)
  }

  async function handleScan() {
    if (!ticketInput.trim() || scanning) return
    setScanning(true)
    const hash = ticketInput.trim().toUpperCase()

    // In production: POST /gate-guardian/gate/scan { ticketHash: hash }
    // Simulate scan result
    await new Promise(r => setTimeout(r, 400))

    const result: ScanResult = simulateScan(hash)
    setLastResult(result)
    setTicketInput('')

    if (result.result === 'ADMIT') {
      setAdmitted(a => a + 1)
      setFlashClass('gg-admit')
    } else if (['INVALID','FACE_MISMATCH','VOICE_MISMATCH'].includes(result.result)) {
      setRejected(r => r + 1)
      setFlashClass('gg-reject')
    }
    setTimeout(() => setFlashClass(''), 800)

    setLog(prev => [{
      hash:     hash.slice(0, 12) + '…',
      result:   result.result,
      tierName: result.tierName ?? '—',
      time:     new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }),
    }, ...prev].slice(0, 50))

    setScanning(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  async function handlePushLog() {
    setPushing(true)
    // In production: POST /gate-guardian/gate/push-log
    await new Promise(r => setTimeout(r, 1500))
    setPushing(false)
    setPushDone(true)
  }

  function simulateScan(hash: string): ScanResult {
    // Demo logic
    if (hash.startsWith('CTKT-')) {
      const isDupe = log.some(e => e.hash.startsWith(hash.slice(0,8)))
      if (isDupe) return { result: 'DUPLICATE', reason: 'Already scanned' }
      return { result: 'ADMIT', tierName: 'General', perks: [], holderAfroId: 'afro-' + hash.slice(-6) }
    }
    if (hash.startsWith('VIP-')) {
      return { result: 'ADMIT', tierName: 'VIP', perks: ['Backstage access', 'Merch bundle'], holderAfroId: 'afro-vip-' + hash.slice(-4) }
    }
    if (hash === 'FACE') return { result: 'FACE_REQUIRED',  reason: 'Face verification needed' }
    if (hash === 'VOICE')return { result: 'VOICE_REQUIRED', reason: 'Voice Covenant needed' }
    return { result: 'INVALID', reason: 'Ticket not found in gate cache' }
  }

  // ── Pre-sync screen ─────────────────────────────────────────────────
  if (!synced) {
    return (
      <div style={{ background: '#060d08', minHeight: '100dvh', color: '#f0f7f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <button onClick={() => router.back()} style={{ position: 'absolute', top: 20, left: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.35)', fontSize: 20 }}>←</button>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🚪</div>
        <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: 22, fontWeight: 900, color: '#f0f7f0', marginBottom: 6 }}>Gate Guardian</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>Event: <strong style={{ color: '#4ade80' }}>{eventCache.eventTitle}</strong></p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 20 }}>📍 {eventCache.venueName}</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', maxWidth: 280, lineHeight: 1.6, marginBottom: 28 }}>
          Sync the gate cache before the event starts. After syncing, the gate works completely offline — no internet required at the venue.
        </p>
        <button onClick={handleSync} disabled={syncing} style={{
          width: '100%', maxWidth: 280, padding: '15px', borderRadius: 14, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#1a7c3e,#0f5028)', color: '#fff',
          fontSize: 14, fontWeight: 800, fontFamily: 'Sora,sans-serif',
          boxShadow: '0 4px 20px rgba(26,124,62,.3)',
        }}>
          {syncing ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span className="gg-spin">⚙️</span> Syncing {eventCache.totalTickets} tickets…
            </span>
          ) : '🔄 Sync Gate Cache'}
        </button>
      </div>
    )
  }

  const meta = lastResult ? (RESULT_META[lastResult.result] ?? RESULT_META.INVALID) : null

  return (
    <div className={flashClass} style={{ background: '#060d08', minHeight: '100dvh', color: '#f0f7f0', display: 'flex', flexDirection: 'column', transition: 'background .1s' }}>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(180deg,#091608,#060d08)', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div>
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 14, fontWeight: 900, color: '#f0f7f0' }}>🚪 Gate Guardian</div>
            <div style={{ fontSize: 10, color: '#4ade80' }}>{eventCache.eventTitle}</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#4ade80', fontFamily: 'Sora,sans-serif' }}>{admitted}</div>
              <div style={{ fontSize: 8, color: 'rgba(74,222,128,.6)' }}>IN</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#ef4444', fontFamily: 'Sora,sans-serif' }}>{rejected}</div>
              <div style={{ fontSize: 8, color: 'rgba(239,68,68,.5)' }}>OUT</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'rgba(255,255,255,.4)', fontFamily: 'Sora,sans-serif' }}>{eventCache.totalTickets}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,.25)' }}>TOTAL</div>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 9, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
          OFFLINE MODE ACTIVE — {log.length} scans in memory
        </div>
      </div>

      {/* ── Main scan area ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 16px' }}>

        {/* Scan input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.07em', display: 'block', marginBottom: 8 }}>
            SCAN TICKET — tap NFC, scan QR, or type hash
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              type="text"
              value={ticketInput}
              onChange={e => setTicketInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="Hold NFC card to reader · or paste hash…"
              autoFocus
              style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,.06)', border: '2px solid rgba(74,222,128,.25)', color: '#f0f7f0', fontSize: 13, outline: 'none', letterSpacing: '.04em' }}
            />
            <button
              onClick={handleScan}
              disabled={scanning || !ticketInput.trim()}
              style={{
                padding: '14px 18px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: ticketInput.trim() ? 'linear-gradient(135deg,#1a7c3e,#0f5028)' : 'rgba(255,255,255,.07)',
                color: ticketInput.trim() ? '#fff' : 'rgba(255,255,255,.3)', fontSize: 18, transition: 'all .15s',
              }}
            >
              {scanning ? <span className="gg-spin">⚙️</span> : '▶'}
            </button>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 4 }}>
            Try: CTKT-DEMO123 (admit), FACE (layer 2 check), VOICE (layer 3 check), anything else (invalid)
          </div>
        </div>

        {/* Last result */}
        {lastResult && meta && (
          <div className="gg-fade" style={{ background: meta.bg, border: `2px solid ${meta.color}50`, borderRadius: 18, padding: '20px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{meta.icon}</div>
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 22, fontWeight: 900, color: meta.color, marginBottom: 4 }}>
              {meta.label}
            </div>
            {lastResult.reason && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>{lastResult.reason}</div>
            )}
            {lastResult.result === 'ADMIT' && (
              <div>
                {lastResult.tierName && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', marginBottom: 4 }}>🎟 {lastResult.tierName}</div>
                )}
                {lastResult.perks && lastResult.perks.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                    {lastResult.perks.map(p => <span key={p} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: 'rgba(74,222,128,.15)', color: '#4ade80' }}>{p}</span>)}
                  </div>
                )}
                {lastResult.holderAfroId && (
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 8, fontFamily: 'monospace' }}>
                    {lastResult.holderAfroId}
                  </div>
                )}
              </div>
            )}
            {lastResult.result === 'FACE_REQUIRED' && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 10 }}>Position face on camera for biometric check</div>
                <button style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: '#fbbf24', color: '#000', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                  📷 Start Face Scan
                </button>
              </div>
            )}
            {lastResult.result === 'VOICE_REQUIRED' && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 10 }}>Ask attendee to speak their Voice Covenant phrase</div>
                <button style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: '#a78bfa', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                  🎙 Record Voice Covenant
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scan log */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.06em', marginBottom: 8 }}>
            RECENT SCANS
          </div>
          {log.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,.15)', fontSize: 11 }}>No scans yet</div>
          ) : (
            log.slice(0, 8).map((entry, i) => {
              const m = RESULT_META[entry.result] ?? RESULT_META.INVALID
              return (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                  <span style={{ fontSize: 12 }}>{m.icon}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,.5)', flex: 1 }}>{entry.hash}</span>
                  <span style={{ fontSize: 10, color: m.color, fontWeight: 700 }}>{entry.tierName}</span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)' }}>{entry.time}</span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Footer controls ────────────────────────────────────────── */}
      <div style={{ padding: '12px 16px 28px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: 8 }}>
        <button
          onClick={handlePushLog}
          disabled={pushing || log.length === 0}
          style={{
            flex: 2, padding: '12px', borderRadius: 12, border: 'none', cursor: log.length > 0 ? 'pointer' : 'not-allowed',
            background: log.length > 0 ? 'rgba(74,222,128,.12)' : 'rgba(255,255,255,.04)',
            color: log.length > 0 ? '#4ade80' : 'rgba(255,255,255,.25)',
            fontSize: 11, fontWeight: 700,
          }}
        >
          {pushing ? '⏳ Syncing…' : pushDone ? `✓ ${log.length} Entries Synced` : `🔄 Push ${log.length} Scan${log.length !== 1 ? 's' : ''} to CowrieChain`}
        </button>
        <button
          onClick={() => router.back()}
          style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: 'none', color: 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
        >
          ← Exit Gate
        </button>
      </div>
    </div>
  )
}
