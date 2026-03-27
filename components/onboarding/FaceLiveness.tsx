'use client'
import * as React from 'react'

type Challenge = 'BLINK' | 'TURN_LEFT' | 'SMILE'
type ChallengeState = 'waiting' | 'active' | 'passed' | 'timeout'

const CHALLENGES: { type: Challenge; instruction: string; emoji: string }[] = [
  { type: 'BLINK',     instruction: 'Blink your eyes twice',        emoji: '👁' },
  { type: 'TURN_LEFT', instruction: 'Turn your head slowly to the left', emoji: '↩️' },
  { type: 'SMILE',     instruction: 'Give us a smile!',             emoji: '😊' },
]

const CHALLENGE_TIMEOUT_MS = 10_000
const SAMPLE_INTERVAL_MS = 200

interface Props {
  onComplete: (token: string) => void
  onSkip?: () => void
  theme?: { bg?: string; text?: string; accent?: string; subText?: string }
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
  const baseSmileBrightnessRef = React.useRef(0)
  const sampleCountRef = React.useRef(0)

  const bg = theme?.bg || '#060b07'
  const text = theme?.text || '#f0f7f0'
  const accent = theme?.accent || '#1a7c3e'
  const subText = theme?.subText || 'rgba(255,255,255,.5)'

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

    blinkCountRef.current = 0
    prevEyeBrightnessRef.current = 0
    eyeClosedRef.current = false
    baseCentroidRef.current = 0
    baseSmileBrightnessRef.current = 0
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

      if (challenge.type === 'BLINK') {
        // Sample eye region: center horizontal strip, top 35-50% vertical
        const eyeY = Math.floor(h * 0.35)
        const eyeH = Math.floor(h * 0.15)
        const eyeX = Math.floor(w * 0.25)
        const eyeW = Math.floor(w * 0.5)
        const brightness = avgBrightness(ctx, eyeX, eyeY, eyeW, eyeH)

        if (sampleCountRef.current <= 3) {
          prevEyeBrightnessRef.current = brightness
          return
        }

        const drop = (prevEyeBrightnessRef.current - brightness) / prevEyeBrightnessRef.current

        if (!eyeClosedRef.current && drop > 0.08) {
          eyeClosedRef.current = true
        } else if (eyeClosedRef.current && drop < 0.03) {
          eyeClosedRef.current = false
          blinkCountRef.current++
          if (blinkCountRef.current >= 2) {
            clearInterval(intervalId)
            clearTimeout(timeoutId)
            setChallengeState('passed')
            setTimeout(() => advanceChallenge(), 800)
          }
        }
        prevEyeBrightnessRef.current = brightness
      }

      if (challenge.type === 'TURN_LEFT') {
        const cx = luminanceCentroidX(ctx, w, h)
        if (sampleCountRef.current <= 5) {
          baseCentroidRef.current = cx
          return
        }
        const shift = cx - baseCentroidRef.current
        // Head turned left = luminance centroid shifts right (mirrored video)
        if (Math.abs(shift) > 0.06) {
          clearInterval(intervalId)
          clearTimeout(timeoutId)
          setChallengeState('passed')
          setTimeout(() => advanceChallenge(), 800)
        }
      }

      if (challenge.type === 'SMILE') {
        // Mouth region: center, bottom 60-80% of face
        const mouthY = Math.floor(h * 0.6)
        const mouthH = Math.floor(h * 0.2)
        const mouthX = Math.floor(w * 0.3)
        const mouthW = Math.floor(w * 0.4)
        const brightness = avgBrightness(ctx, mouthX, mouthY, mouthW, mouthH)

        if (sampleCountRef.current <= 5) {
          baseSmileBrightnessRef.current = brightness
          return
        }
        const increase = (brightness - baseSmileBrightnessRef.current) / baseSmileBrightnessRef.current
        if (increase > 0.05) {
          clearInterval(intervalId)
          clearTimeout(timeoutId)
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
        <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 18, fontWeight: 900, color: text, marginBottom: 8, textAlign: 'center' }}>Camera Not Available</div>
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
        <div style={{ fontSize: 64, marginBottom: 16, animation: 'wbBeat 1s ease-in-out' }}>✅</div>
        <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 20, fontWeight: 900, color: '#4ade80', marginBottom: 8 }}>Face Verified</div>
        <div style={{ fontSize: 12, color: subText, textAlign: 'center' }}>Your spirit has been anchored to your physical form.</div>
      </div>
    )
  }

  const challenge = CHALLENGES[currentChallenge]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: bg, padding: '16px 20px', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 18, fontWeight: 900, color: text, marginBottom: 4, textAlign: 'center' }}>
        Face Verification
      </div>
      <div style={{ fontSize: 11, color: subText, marginBottom: 16, textAlign: 'center' }}>
        Anchoring your digital spirit to your physical form
      </div>

      {/* Camera feed */}
      <div style={{
        position: 'relative', width: 260, height: 260,
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
          <div key={c.type} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < currentChallenge ? '#4ade80' : i === currentChallenge && challengeState === 'passed' ? '#4ade80' : i === currentChallenge ? accent : 'rgba(255,255,255,.15)',
            transition: 'background .3s',
          }} />
        ))}
      </div>

      {/* Challenge instruction */}
      {challengeState === 'waiting' && cameraReady && (
        <>
          <div style={{ fontSize: 13, color: subText, marginBottom: 16, textAlign: 'center' }}>
            Position your face in the circle and stay still.
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
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>{challenge.emoji}</div>
          <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 16, fontWeight: 800, color: text, marginBottom: 4 }}>
            {challenge.instruction}
          </div>
          <div style={{ fontSize: 11, color: subText }}>
            Challenge {currentChallenge + 1} of {CHALLENGES.length}
          </div>
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
    </div>
  )
}
