'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────
export type VoiceState = 'idle' | 'listening' | 'processing' | 'error' | 'locked'
export type VoiceLang = 'en-NG' | 'yo' | 'ig' | 'ha' | 'sw' | 'am' | 'fr' | 'pt' | 'ar'

const LANG_FLAGS: Record<VoiceLang, string> = {
  'en-NG': '🇳🇬', 'yo': '🫘', 'ig': '🦅', 'ha': '🌙',
  'sw': '🌍', 'am': '🇪🇹', 'fr': '🇫🇷', 'pt': '🇧🇷', 'ar': '☪️'
}

export interface VoiceCommandOptions {
  onNavigate?: (dir: 'home' | 'back' | 'next' | 'skip') => void
  onFill?: (field: string, value: string) => void
  onAuth?: (action: 'send_drum' | 'submit_otp', data?: string) => void
  onLangDetected?: (lang: VoiceLang, flag: string) => void
  enabled?: boolean // only active after voice binding
}

// ── Detect African language from first few words ──────────────
function detectLang(text: string): VoiceLang | null {
  const t = text.toLowerCase()
  if (/\b(ẹ|ọ|mo jẹ|bẹ́ẹ̀|ibo|ìyá|bàbá|egbon|abúrò|kí ló)\b/i.test(t)) return 'yo'
  if (/\b(nna|nne|kedu|ọ bụ|ka mma|ụmụ|chukwu)\b/i.test(t)) return 'ig'
  if (/\b(yauwa|sannu|gida|ranka|haka|kai|ban)\b/i.test(t)) return 'ha'
  if (/\b(habari|karibu|asante|sawa|ndiyo|bwana)\b/i.test(t)) return 'sw'
  if (/\b(amesegnalehu|selam|betam|yihe|ayzoh)\b/i.test(t)) return 'am'
  if (/\b(bonjour|merci|s'il vous|oui|non|comment)\b/i.test(t)) return 'fr'
  if (/\b(obrigado|olá|por favor|sim|não|tudo)\b/i.test(t)) return 'pt'
  if (/\b(مرحبا|شكرا|نعم|لا|إن شاء الله)\b/u.test(t)) return 'ar'
  return null
}

// ── Command matching ──────────────────────────────────────────
function parseCommand(
  t: string,
  opts: VoiceCommandOptions
): void {
  const clean = t.toLowerCase().trim()

  // Detect and broadcast language change
  const lang = detectLang(clean)
  if (lang) opts.onLangDetected?.(lang, LANG_FLAGS[lang])

  // ── Navigation ──
  if (/take me home|go home|back to start|start over/i.test(clean)) {
    opts.onNavigate?.('home'); return
  }
  if (/go back|previous|back/i.test(clean)) {
    opts.onNavigate?.('back'); return
  }
  if (/\b(continue|next|proceed|move on|go on)\b/i.test(clean)) {
    opts.onNavigate?.('next'); return
  }
  if (/skip this|skip step|skip/i.test(clean)) {
    opts.onNavigate?.('skip'); return
  }

  // ── Field filling ──
  const namePat = /(?:i am|my name is|call me)\s+([a-zA-ZÀ-ÿ ]+)/i
  const nameM = clean.match(namePat)
  if (nameM) { opts.onFill?.('name', nameM[1].trim()); return }

  const tribePat = /(?:my people are|my tribe is|i am from|i belong to)\s+([a-zA-ZÀ-ÿ ]+)/i
  const tribeM = clean.match(tribePat)
  if (tribeM) { opts.onFill?.('heritage', tribeM[1].trim()); return }

  const cityPat = /(?:i live in|i am in|i stay in|my address is)\s+([a-zA-ZÀ-ÿ ,]+)/i
  const cityM = clean.match(cityPat)
  if (cityM) { opts.onFill?.('address', cityM[1].trim()); return }

  // ── Authentication ──
  if (/send (?:my )?drum|send (?:my )?code|call the drum/i.test(clean)) {
    opts.onAuth?.('send_drum'); return
  }
  const otpPat = /(?:my code is|code is|the code is|otp is)\s*(\d[\d\s]{4,11})/i
  const otpM = clean.match(otpPat)
  if (otpM) {
    const digits = otpM[1].replace(/\D/g, '').slice(0, 6)
    if (digits.length === 6) { opts.onAuth?.('submit_otp', digits); return }
  }
}

// ── Main hook ─────────────────────────────────────────────────
export function useVoiceCommand(opts: VoiceCommandOptions) {
  const [state, setState] = useState<VoiceState>(opts.enabled ? 'idle' : 'locked')
  const [transcript, setTranscript] = useState('')
  const [lang, setLang] = useState<VoiceLang>('en-NG')
  const [langFlag, setLangFlag] = useState('🇳🇬')
  const recRef = useRef<any>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  // Unlock commands as soon as enabled flips true
  useEffect(() => {
    if (opts.enabled && state === 'locked') setState('idle')
  }, [opts.enabled]) // eslint-disable-line

  const start = useCallback(() => {
    if (!isSupported || state !== 'idle') return
    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SR()
    rec.lang = lang
    rec.continuous = false
    rec.interimResults = false
    rec.onstart = () => setState('listening')
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      setTranscript(text)
      setState('processing')
      parseCommand(text, {
        ...opts,
        onLangDetected: (l, f) => {
          setLang(l); setLangFlag(f)
          opts.onLangDetected?.(l, f)
        }
      })
      setTimeout(() => setState('idle'), 1500)
    }
    rec.onerror = () => setState('error')
    rec.onend = () => setState(prev => prev === 'listening' ? 'idle' : prev)
    rec.start()
    recRef.current = rec
  }, [isSupported, state, lang, opts])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setState('idle')
  }, [])

  const toggle = useCallback(() => {
    if (state === 'listening') stop()
    else if (state === 'idle') start()
  }, [state, start, stop])

  return { state, transcript, lang, langFlag, isSupported, toggle, start, stop }
}
