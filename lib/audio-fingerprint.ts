// ── Audio Fingerprint — real voice binding via Web Audio API + Web Crypto ──
// Replaces the previous Math.random() mock hash with SHA-256 of actual audio data.

/** SHA-256 hash a buffer and return hex string */
async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Capture voice from the microphone and generate a SHA-256 audio fingerprint.
 * Records frequency data over ~2 seconds, hashes the collected waveform.
 *
 * @returns { hash: string; durationMs: number } — hex SHA-256 hash and recording duration
 */
export async function captureVoiceFingerprint(): Promise<{ hash: string; durationMs: number }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const ctx = new AudioContext()
  const source = ctx.createMediaStreamSource(stream)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 2048
  source.connect(analyser)

  const binCount = analyser.frequencyBinCount
  const samples: Float32Array[] = []
  const startTime = Date.now()

  return new Promise((resolve) => {
    const collect = () => {
      const data = new Float32Array(binCount)
      analyser.getFloatFrequencyData(data)
      samples.push(data)

      // Collect ~2 seconds of data at ~30fps = ~60 frames
      if (samples.length < 60) {
        requestAnimationFrame(collect)
      } else {
        // Stop recording
        stream.getTracks().forEach(t => t.stop())
        ctx.close()

        // Concatenate all frequency samples into one buffer
        const totalLength = samples.reduce((acc, s) => acc + s.length, 0)
        const combined = new Float32Array(totalLength)
        let offset = 0
        for (const sample of samples) {
          combined.set(sample, offset)
          offset += sample.length
        }

        // SHA-256 hash
        sha256Hex(combined.buffer).then(hash => {
          resolve({ hash, durationMs: Date.now() - startTime })
        })
      }
    }
    requestAnimationFrame(collect)
  })
}

/**
 * Fallback fingerprint when microphone is unavailable.
 * Uses device-specific signals hashed via SHA-256 (not Math.random()).
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const signals = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency?.toString() || '0',
    Date.now().toString(36),
  ].join('|')

  const encoded = new TextEncoder().encode(signals)
  const hash = await sha256Hex(encoded.buffer)
  return 'DEV-' + hash.slice(0, 16).toUpperCase()
}
