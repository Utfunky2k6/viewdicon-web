'use client'
import * as React from 'react'
import { useVoiceCommand, VoiceCommandOptions, VoiceState } from '@/hooks/useVoiceCommand'

// ── Styles (module-level — never re-parsed) ───────────────────
if (typeof document !== 'undefined' && !document.getElementById('vcl-css')) {
  const s = document.createElement('style')
  s.id = 'vcl-css'
  s.textContent = `
@keyframes vcl-pulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.18);opacity:1}}
@keyframes vcl-ring{0%{transform:scale(.85);opacity:.8}100%{transform:scale(1.9);opacity:0}}
@keyframes vcl-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes vcl-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
`
  document.head.appendChild(s)
}

// ── Label cards for each state ────────────────────────────────
const STATE_META: Record<VoiceState, { color:string; bg:string; label:string; icon:string }> = {
  locked:     { color:'#9ca3af', bg:'rgba(156,163,175,.15)', label:'Unlocks after Voice Binding', icon:'🔒' },
  idle:       { color:'#4ade80', bg:'rgba(74,222,128,.12)',  label:'Tap to speak a command',      icon:'🎙' },
  listening:  { color:'#f87171', bg:'rgba(248,113,113,.15)', label:'Listening…',                  icon:'🔴' },
  processing: { color:'#fbbf24', bg:'rgba(251,191,36,.15)',  label:'Processing command…',          icon:'⚡' },
  error:      { color:'#f87171', bg:'rgba(248,113,113,.12)', label:'Microphone error — retry',    icon:'⚠' },
}

// ── Voice command reference card ─────────────────────────────
const COMMANDS = [
  { cmd: '"Continue"',        desc: 'Go to next step' },
  { cmd: '"Go back"',         desc: 'Previous step' },
  { cmd: '"Skip this"',       desc: 'Skip optional field' },
  { cmd: '"Take me home"',    desc: 'Return to splash' },
  { cmd: '"I am [name]"',     desc: 'Fill name field' },
  { cmd: '"My people are…"',  desc: 'Fill heritage group' },
  { cmd: '"I live in…"',      desc: 'Fill address' },
  { cmd: '"Send my drum"',    desc: 'Submit phone number' },
  { cmd: '"My code is XXXXXX"', desc: 'Submit OTP' },
]

interface Props extends VoiceCommandOptions {
  enabled: boolean // true after device binding
}

export default function VoiceCommandLayer(props: Props) {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const [showHelp, setShowHelp] = React.useState(false)
  const tooltipRef = React.useRef<ReturnType<typeof setTimeout>>()
  const longPressRef = React.useRef<ReturnType<typeof setTimeout>>()

  const voice = useVoiceCommand({
    enabled:       props.enabled,
    onNavigate:    props.onNavigate,
    onFill:        props.onFill,
    onAuth:        props.onAuth,
    onLangDetected: props.onLangDetected,
  })

  const meta = STATE_META[voice.state]

  // Auto-dismiss tooltip after 3 s
  const handleToggle = () => {
    voice.toggle()
    setShowTooltip(true)
    clearTimeout(tooltipRef.current)
    tooltipRef.current = setTimeout(() => setShowTooltip(false), 3000)
  }

  React.useEffect(() => () => { clearTimeout(tooltipRef.current); clearTimeout(longPressRef.current) }, [])

  return (
    <>
      {/* ── Floating button ── */}
      <div style={{
        position: 'absolute', top: 14, right: 14, zIndex: 200,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
      }}>
        {/* Pulse rings when listening */}
        {voice.state === 'listening' && (
          <>
            <div style={{ position:'absolute', inset:-6, borderRadius:'50%', border:'2px solid rgba(248,113,113,.6)', animation:'vcl-ring 1.2s ease-out infinite' }} />
            <div style={{ position:'absolute', inset:-6, borderRadius:'50%', border:'2px solid rgba(248,113,113,.6)', animation:'vcl-ring 1.2s ease-out .4s infinite' }} />
          </>
        )}

        {/* Main button */}
        <button
          onClick={handleToggle}
          onMouseDown={() => { longPressRef.current = setTimeout(() => setShowHelp(h => !h), 600) }}
          onMouseUp={() => clearTimeout(longPressRef.current)}
          onTouchStart={() => { longPressRef.current = setTimeout(() => setShowHelp(h => !h), 600) }}
          onTouchEnd={() => clearTimeout(longPressRef.current)}
          title={meta.label}
          style={{
            position: 'relative',
            width: 38, height: 38, borderRadius: 11,
            background: meta.bg,
            border: `1.5px solid ${meta.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, cursor: props.enabled ? 'pointer' : 'default',
            animation: voice.state === 'idle' && props.enabled
              ? 'vcl-bounce 3s ease-in-out infinite' : 'none',
            flexShrink: 0,
          }}
        >
          <span>{meta.icon}</span>
          {/* Language flag badge */}
          {props.enabled && voice.state !== 'locked' && (
            <span style={{
              position: 'absolute', bottom: -4, right: -4,
              fontSize: 10, background: '#060b07', borderRadius: 4, lineHeight: 1, padding:'1px 2px',
              border: '1px solid rgba(255,255,255,.15)',
            }}>
              {voice.langFlag}
            </span>
          )}
        </button>

        {/* Tooltip — shows on click */}
        {showTooltip && (
          <div style={{
            background: 'rgba(6,11,7,.95)', border: '1px solid rgba(74,222,128,.25)',
            borderRadius: 12, padding: '10px 13px', minWidth: 200, maxWidth: 240,
            animation: 'vcl-fadein .25s ease',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: meta.color, marginBottom: 4, display:'flex', alignItems:'center', gap:5 }}>
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
            </div>
            {voice.transcript && (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontStyle:'italic', marginTop: 2 }}>
                "{voice.transcript}"
              </div>
            )}
            {voice.state === 'idle' && props.enabled && (
              <button
                onClick={() => setShowHelp(h => !h)}
                style={{ marginTop: 6, fontSize: 9, color: 'rgba(74,222,128,.6)', background:'none', border:'none', cursor:'pointer', padding:0, fontWeight:700 }}>
                {showHelp ? '▲ Hide commands' : '▼ See all commands'}
              </button>
            )}
          </div>
        )}

        {/* Help card — all voice commands */}
        {showHelp && props.enabled && (
          <div style={{
            background: 'rgba(6,11,7,.97)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 14, padding: 14, minWidth: 240, maxWidth: 260,
            animation: 'vcl-fadein .25s ease', maxHeight: 320, overflowY: 'auto',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#4ade80', marginBottom: 10, display:'flex', alignItems:'center', gap:6 }}>
              🎙 Voice Commands
              <span style={{ marginLeft:'auto', color:'rgba(255,255,255,.3)', fontWeight:400, fontSize:10 }}>
                {voice.langFlag} {voice.lang}
              </span>
            </div>
            {COMMANDS.map(c => (
              <div key={c.cmd} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:6 }}>
                <code style={{ fontSize:10, color:'#fbbf24', fontFamily:'monospace', flexShrink:0 }}>{c.cmd}</code>
                <span style={{ fontSize:10, color:'rgba(255,255,255,.4)', textAlign:'right' }}>{c.desc}</span>
              </div>
            ))}
            <div style={{ marginTop:8, paddingTop:8, borderTop:'1px solid rgba(255,255,255,.07)', fontSize:9, color:'rgba(255,255,255,.2)', lineHeight:1.6 }}>
              🌍 Speaks Yoruba, Igbo, Hausa, Swahili, Amharic, French, Portuguese, Arabic
            </div>
          </div>
        )}
      </div>
    </>
  )
}
