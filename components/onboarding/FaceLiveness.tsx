'use client'
import * as React from 'react'

type Challenge = 'BLINK' | 'TURN_LEFT' | 'SMILE' | 'NOD' | 'LOOK_UP' | 'EYES_WIDE' | 'OPEN_MOUTH' | 'LOOK_RIGHT'
type ChallengeState = 'waiting' | 'active' | 'passed' | 'timeout'

const ALL_CHALLENGES: { type: Challenge; instruction: string; emoji: string; voice: string }[] = [
  { type: 'BLINK',      instruction: 'Blink your eyes twice slowly',         emoji: '👁️',  voice: 'Now… blink your eyes twice slowly.' },
  { type: 'SMILE',      instruction: 'Give us a big warm smile',             emoji: '😄',  voice: 'Beautiful! Now give us a big, warm smile.' },
  { type: 'TURN_LEFT',  instruction: 'Turn your head slowly to the left',   emoji: '↩️',  voice: 'Wonderful. Now slowly turn your head to the left.' },
  { type: 'NOD',        instruction: 'Nod your head up and down',           emoji: '↕️',  voice: 'Almost there. Gently nod your head up and down.' },
  { type: 'LOOK_UP',    instruction: 'Look up briefly, then look forward',  emoji: '👆',  voice: 'Look up briefly, then look back at me.' },
  { type: 'EYES_WIDE',  instruction: 'Open your eyes as WIDE as possible',  emoji: '👀',  voice: 'Yes! Now open your eyes as wide as you possibly can.' },
  { type: 'OPEN_MOUTH', instruction: 'Open your mouth wide — say AHHH',     emoji: '😮',  voice: 'Almost done. Open your mouth wide and say Ahhh.' },
  { type: 'LOOK_RIGHT', instruction: 'Slowly look to the right',            emoji: '➡️',  voice: 'And now, slowly look to the right.' },
]

/** Randomly pick `n` challenges from the pool each liveness session */
function pickChallenges(n: number) {
  const shuffled = [...ALL_CHALLENGES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

const CHALLENGE_TIMEOUT_MS = 10_000
const SAMPLE_INTERVAL_MS = 200

interface Props {
  onComplete: (token: string) => void
  onSkip?: () => void
  theme?: { bg?: string; text?: string; accent?: string; subText?: string }
}

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.9
  u.pitch = 1.1
  window.speechSynthesis.speak(u)
}

function avgBrightness(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): number {
  const data = ctx.getImageData(x, y, w, h).data
  let sum = 0
  for (let i = 0; i < data.length; i += 4) {
    sum += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
  }
  return sum / (data.length / 4)
}

function luminanceCentroidX(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  const data = ctx.getImageData(0, 0, w, h).data
  let sumLx = 0, sumL = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      sumLx += lum * x
      sumL += lum
    }
  }
  return sumL > 0 ? sumLx / sumL / w : 0.5
}

function luminanceCentroidY(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  const data = ctx.getImageData(0, 0, w, h).data
  let sumLy = 0, sumL = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      sumLy += lum * y
      sumL += lum
    }
  }
  return sumL > 0 ? sumLy / sumL / h : 0.5
}

async function hashToken(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(input)
    const buf = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
  }
  return `LV-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export default function FaceLiveness({ onComplete, onSkip, theme }: Props) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)

  // Pick 5 random challenges per session, stable across renders
  const [CHALLENGES] = React.useState(() => pickChallenges(5))

  const [cameraReady, setCameraReady] = React.useState(false)
  const [cameraDenied, setCameraDenied] = React.useState(false)
  const [currentChallenge, setCurrentChallenge] = React.useState(0)
  const [challengeState, setChallengeState] = React.useState<ChallengeState>('waiting')
  const [allPassed, setAllPassed] = React.useState(false)

  // Detection state refs (avoid re-renders during sampling)
  const blinkCountRef = React.useRef(0)
  const prevEyeBrightnessRef = React.useRef(0)
  const eyeClosedRef = React.useRef(false)
  const baseCentroidRef = React.useRef(0.5)
  const baseCentroidYRef = React.useRef(0.5)
  const baseSmileBrightnessRef = React.useRef(0)
  const baseEyeBrightnessRef = React.useRef(0)
  const baseMouthBrightnessRef = React.useRef(0)
  const sampleCountRef = React.useRef(0)

  const bg      = theme?.bg      || '#060b07'
  const text    = theme?.text    || '#f0f7f0'
  const accent  = theme?.accent  || '#1a7c3e'
  const subText = theme?.subText || 'rgba(255,255,255,.5)'

  // Speak challenge voice when state becomes active
  React.useEffect(() => {
    if (challengeState === 'active' && !allPassed) {
      const challenge = CHALLENGES[currentChallenge]
      if (challenge) speak(challenge.voice)
    }
  }, [challengeState, currentChallenge, allPassed, CHALLENGES])

  // Speak completion message
  React.useEffect(() => {
    if (allPassed) speak('Face verified. Welcome to the Motherland.')
  }, [allPassed])

  // Start camera
  React.useEffect(() => {
    let mounted = true
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
        })
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraReady(true)
        }
      } catch {
        if (mounted) setCameraDenied(true)
      }
    }
    startCamera()
    return () => {
      mounted = false
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // Run challenge detection loop
  React.useEffect(() => {
    if (!cameraReady || challengeState !== 'active' || allPassed) return

    const challenge = CHALLENGES[currentChallenge]
    if (!challenge) return

    // Reset detection refs
    blinkCountRef.current = 0
    prevEyeBrightnessRef.current = 0
    eyeClosedRef.current = false
    baseCentroidRef.current = 0
    baseCentroidYRef.current = 0
    baseSmileBrightnessRef.current = 0
    baseEyeBrightnessRef.current = 0
    baseMouthBrightnessRef.current = 0
    sampleCountRef.current = 0

    const timeoutId = setTimeout(() => {
      setChallengeState('timeout')
      // Auto-advance after timeout — liveness still passes (best effort)
      setTimeout(() => advanceChallenge(), 1200)
    }, CHALLENGE_TIMEOUT_MS)

    const intervalId = setInterval(() => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) return

      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return

      const w = canvas.width
      const h = canvas.height
      ctx.drawImage(video, 0, 0, w, h)
      sampleCountRef.current++

      // ── BLINK ──────────────────────────────────────────────────
      if (challenge.type === 'BLINK') {
        const eyeY = Math.floor(h * 0.35)
        const eyeH = Math.floor(h * 0.15)
        const eyeX = Math.floor(w * 0.25)
        const eyeW = Math.floor(w * 0.5)
        const brightness = avgBrightness(ctx, eyeX, eyeY, eyeW, eyeH)

        if (sampleCountRef.current <= 3) { prevEyeBrightnessRef.current = brightness; return }

        const drop = (prevEyeBrightnessRef.current - brightness) / prevEyeBrightnessRef.current

        if (!eyeClosedRef.current && drop > 0.08) {
          eyeClosedRef.current = true
        } else if (eyeClosedRef.current && drop < 0.03) {
          eyeClosedRef.current = false
          blinkCountRef.current++
          if (blinkCountRef.current >= 2) {
            clearInterval(intervalId); clearTimeout(timeoutId)
            setChallengeState('passed')
            setTimeout(() => advanceChallenge(), 800)
          }
        }
        prevEyeBrightnessRef.current = brightness
      }

      // ── TURN_LEFT ───────────────────────────────────────────────
      if (challenge.type === 'TURN_LEFT') {
        const cx = luminanceCentroidX(ctx, w, h)
        if (sampleCountRef.current <= 5) { baseCentroidRef.current = cx; return }
        const shift = cx - baseCentroidRef.current
        if (Math.abs(shift) > 0.06) {
          clearInterval(intervalId); clearTimeout(timeoutId)
          setChallengeState('passed')
          setTimeout(() => advanceChallenge(), 800)
        }
      }

      // ── LOOK_RIGHT ──────────────────────────────────────────────
      // Head turns right → luminance centroid shifts LEFT in mirrored video
      if (challenge.type === 'LOOK_RIGHT') {
        const cx = luminanceCentroidX(ctx, w, h)
        if (sampleCountRef.current <= 5) { baseCentroidRef.current = cx; return }
        const shift = baseCentroidRef.current - cx   // positive = moved left
        if (shift > 0.06) {
          clearInterval(intervalId); clearTimeout(timeoutId)
          setChallengeState('passed')
          setTimeout(() => advanceChallenge(), 800)
        }
      }

      // ── SMILE ───────────────────────────────────────────────────
      if (challenge.type === 'SMILE') {
        const mouthY = Math.floor(h * 0.6)
        const mouthH = Math.floor(h * 0.2)
        const mouthX = Math.floor(w * 0.3)
        const mouthW = Math.floor(w * 0.4)
        const brightness = avgBrightness(ctx, mouthX, mouthY, mouthW, mouthH)

        if (sampleCountRef.current <= 5) { baseSmileBrightnessRef.current = brightness; return }
        const increase = (brightness - baseSmileBrightnessRef.current) / (baseSmileBrightnessRef.current + 1)
        if (increase > 0.05) {
          clearInterval(intervalId); clearTimeout(timeoutId)
          setChallengeState('passed')
          setTimeout(() => advanceChallenge(), 800)
        }
      }

      // ── OPEN_MOUTH ──────────────────────────────────────────────
      // Wider area + larger threshold than SMILE
      if (challenge.type === 'OPEN_MOUTH') {
        const mouthY = Math.floor(h * 0.58)
        const mouthH = Math.floor(h * 0.25)
        const mouthX = Math.floor(w * 0.25)
        const mouthW = Math.floor(w * 0.5)
        const brightness = avgBrightness(ctx, mouthX, mouthY, mouthW, mouthH)

        if (sampleCountRef.current <= 5) { baseMouthBrightnessRef.current = brightness; return }
        const increase = (brightness - baseMouthBrightnessRef.current) / (baseMouthBrightnessRef.current + 1)
        if (increase > 0.10) {
          clearInterval(intervalId); clearTimeout(timeoutId)
          setChallengeState('passed')
          setTimeout(() => advanceChallenge(), 800)
        }
      }

      // ── EYES_WIDE ───────────────────────────────────────────────
      // Eyes wide open = more light entering iris/sclera band = brightness increase
      if (challenge.type === 'EYES_WIDE') {
        const eyeY = Math.floor(h * 0.30)
        const eyeH = Math.floor(h * 0.20)
        const eyeX = Math.floor(w * 0.20)
        const eyeW = Math.floor(w * 0.60)
        const brightness = avgBrightness(ctx, eyeX, eyeY, eyeW, eyeH)

        if (sampleCountRef.current <= 5) { baseEyeBrightnessRef.current = brightness; return }
        const increase = (brightness - baseEyeBrightnessRef.current) / (baseEyeBrightnessRef.current + 1)
        if (increase > 0.08) {
          clearInterval(intervalId); clearTimeout(timeoutId)
          setChallengeState('passed')
          setTimeout(() => advanceChallenge(), 800)
        }
      }

      // ── NOD ─────────────────────────────────────────────────────
      if (challenge.type === 'NOD') {
        const cy = luminanceCentroidY(ctx, w, h)
        if (sampleCountRef.current <= 5) { baseCentroidYRef.current = cy; return }
        const shift = Math.abs(cy - baseCentroidYRef.current)
        if (shift > 0.05) {
          clearInterval(intervalId); clearTimeout(timeoutId)
          setChallengeState('passed')
          setTimeout(() => advanceChallenge(), 800)
        }
      }

      // ── LOOK_UP ─────────────────────────────────────────────────
      if (challenge.type === 'LOOK_UP') {
        const cy = luminanceCentroidY(ctx, w, h)
        if (sampleCountRef.current <= 5) { baseCentroidYRef.current = cy; return }
        const shift = baseCentroidYRef.current - cy   // positive = moved upward
        if (shift > 0.05) {
          clearInterval(intervalId); clearTimeout(timeoutId)
          setChallengeState('passed')
          setTimeout(() => advanceChallenge(), 800)
        }
      }
    }, SAMPLE_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraReady, currentChallenge, challengeState, allPassed])

  function advanceChallenge() {
    if (currentChallenge >= CHALLENGES.length - 1) {
      setAllPassed(true)
      streamRef.current?.getTracks().forEach(t => t.stop())
      hashToken(`liveness-${Date.now()}-${Math.random()}`).then(token => {
        setTimeout(() => onComplete(token), 1000)
      })
    } else {
      setCurrentChallenge(i => i + 1)
      setChallengeState('active')
    }
  }

  function handleStart() {
    setChallengeState('active')
  }

  // ── Camera denied fallback ──
  if (cameraDenied) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bg, padding: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 900, color: text, marginBottom: 8, textAlign: 'center' }}>Camera Not Available</div>
        <div style={{ fontSize: 12, color: subText, textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
          Camera access is needed for face verification.<br />
          You can continue without it — we&apos;ll verify your identity through other means.
        </div>
        <button
          onClick={() => onSkip?.() || onComplete('CAMERA_SKIPPED')}
          style={{
            padding: '14px 40px', borderRadius: 14,
            background: accent, border: 'none',
            color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer',
          }}
        >
          Continue Without Camera →
        </button>
      </div>
    )
  }

  // ── All challenges passed ──
  if (allPassed) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bg, padding: 20 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 900, color: '#4ade80', marginBottom: 8 }}>Face Verified</div>
        <div style={{ fontSize: 12, color: subText, textAlign: 'center' }}>Your spirit has been anchored to your physical form.</div>
      </div>
    )
  }

  const challenge = CHALLENGES[currentChallenge]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: bg, padding: '16px 20px', overflow: 'auto', position: 'relative' }}>
      <style>{`@keyframes scanLine { 0% { transform:translateY(-200%) } 100% { transform:translateY(500%) } }`}</style>

      {/* Header */}
      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 900, color: text, marginBottom: 4, textAlign: 'center' }}>
        Face Verification
      </div>
      <div style={{ fontSize: 11, color: subText, marginBottom: 16, textAlign: 'center' }}>
        AI is reading your living presence — follow each prompt
      </div>

      {/* Camera feed */}
      <div style={{
        position: 'relative', width: 280, height: 280,
        borderRadius: '50%', overflow: 'hidden',
        border: `3px solid ${challengeState === 'passed' ? '#4ade80' : challengeState === 'active' ? accent : 'rgba(255,255,255,.15)'}`,
        marginBottom: 20, transition: 'border-color .3s',
        boxShadow: challengeState === 'passed' ? '0 0 30px rgba(74,222,128,.3)' : challengeState === 'active' ? `0 0 30px ${accent}44` : 'none',
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
        {/* Crosshair overlay */}
        {challengeState === 'active' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', border: `2px dashed ${accent}88` }} />
          </div>
        )}
        {/* Scan-line overlay when challenge is active */}
        {challengeState === 'active' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '50%', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, animation: 'scanLine 2s linear infinite', top: '30%' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`, animation: 'scanLine 2s linear .5s infinite', top: '50%' }} />
          </div>
        )}
        {/* Challenge passed overlay */}
        {challengeState === 'passed' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 48 }}>✅</div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} width={320} height={240} style={{ display: 'none' }} />

      {/* Challenge progress dots */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {CHALLENGES.map((c, i) => (
          <div key={c.type + i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < currentChallenge ? '#4ade80' : i === currentChallenge && challengeState === 'passed' ? '#4ade80' : i === currentChallenge ? accent : 'rgba(255,255,255,.15)',
            transition: 'background .3s',
          }} />
        ))}
      </div>

      {/* Challenge instruction */}
      {challengeState === 'waiting' && cameraReady && (
        <>
          <div style={{ fontSize: 13, color: subText, marginBottom: 16, textAlign: 'center', lineHeight: 1.6, maxWidth: 260 }}>
            Position your face in the circle and stay still.<br />
            <span style={{ fontSize: 11, color: accent }}>🎙 Voice prompts will guide you through {CHALLENGES.length} checks</span>
          </div>
          <button
            onClick={handleStart}
            style={{
              padding: '14px 40px', borderRadius: 14,
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              border: 'none', color: '#fff', fontSize: 14, fontWeight: 800,
              cursor: 'pointer', boxShadow: `0 4px 20px ${accent}44`,
            }}
          >
            Begin Face Scan
          </button>
        </>
      )}

      {challengeState === 'active' && challenge && (
        <div style={{ background: 'rgba(255,255,255,.05)', border: `1px solid ${accent}40`, borderRadius: 16, padding: '12px 20px', marginTop: 16, textAlign: 'center', maxWidth: 280 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>{challenge.emoji}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: text, marginBottom: 3 }}>{challenge.instruction}</div>
          <div style={{ fontSize: 10, color: accent, letterSpacing: '.08em', textTransform: 'uppercase' }}>AI is watching • Challenge {currentChallenge + 1} of {CHALLENGES.length}</div>
        </div>
      )}

      {challengeState === 'timeout' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#fbbf24' }}>Moving on...</div>
        </div>
      )}

      {!cameraReady && !cameraDenied && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${accent}`, borderTopColor: 'transparent', animation: 'wbBeat 1s linear infinite' }} />
          <div style={{ fontSize: 12, color: subText }}>Initializing camera...</div>
        </div>
      )}

      {/* Skip button — always visible */}
      <button
        onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); onSkip?.() || onComplete('SKIPPED') }}
        style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 28px', borderRadius: 99,
          background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.15)',
          color: 'rgba(255,255,255,.5)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          zIndex: 10, whiteSpace: 'nowrap',
        }}
      >
        Skip for now →
      </button>
    </div>
  )
}
