'use client'
// Spirit Voice — Real-time African Language Translator
// Supports: English ↔ Yoruba, Igbo, Hausa, Swahili, Zulu, Amharic, Twi
import React, { useState, useEffect, useRef, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════════════
   SPIRIT VOICE — Real-Time Voice Translation for African Languages
   Uses Web Speech API for STT + SpeechSynthesis for TTS
   Slide-up drawer overlay with full translation history
   ═══════════════════════════════════════════════════════════════════ */

/* ── Inject CSS once ── */
const INJECT_ID = 'spirit-voice-styles'
const STYLES = `
@keyframes svPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.15)}}
@keyframes svGlow{0%,100%{box-shadow:0 0 8px rgba(251,191,36,.3)}50%{box-shadow:0 0 24px rgba(251,191,36,.6)}}
@keyframes svFadeIn{from{opacity:0;transform:translateY(8px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes svSlideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes svSlideRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes svWave{0%,100%{height:4px}50%{height:18px}}
@keyframes svRipple{0%{transform:scale(.85);opacity:.8}100%{transform:scale(2.4);opacity:0}}
@keyframes svListenPulse{0%{box-shadow:0 0 0 0 rgba(251,191,36,.6)}70%{box-shadow:0 0 0 22px rgba(251,191,36,0)}100%{box-shadow:0 0 0 0 rgba(251,191,36,0)}}
@keyframes svMicRing1{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.7);opacity:0}}
@keyframes svMicRing2{0%{transform:scale(1);opacity:.4}100%{transform:scale(2.2);opacity:0}}
@keyframes svHistoryIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes svBackdropIn{from{opacity:0}to{opacity:1}}
.sv-fade{animation:svFadeIn .25s ease both}
.sv-slide{animation:svSlideUp .38s cubic-bezier(.16,1,.3,1) both}
.sv-slide-right{animation:svSlideRight .25s ease both}
.sv-pulse{animation:svPulse 1.5s ease-in-out infinite}
.sv-glow{animation:svGlow 2s ease-in-out infinite}
.sv-listen{animation:svListenPulse 1.4s ease infinite}
.sv-history-in{animation:svHistoryIn .2s ease both}
.sv-backdrop{animation:svBackdropIn .2s ease both}
`

/* ── Supported languages ── */
export type SpiritLang = 'en' | 'yo' | 'ig' | 'ha' | 'sw' | 'zu' | 'am' | 'tw'

export const SPIRIT_LANGUAGES: { code: SpiritLang; label: string; flag: string; bcp47: string; voiceLang: string }[] = [
  { code: 'en', label: 'English',  flag: '🇬🇧', bcp47: 'en-US', voiceLang: 'en-US' },
  { code: 'yo', label: 'Yoruba',   flag: '🇳🇬', bcp47: 'yo-NG', voiceLang: 'en-NG' },
  { code: 'ig', label: 'Igbo',     flag: '🇳🇬', bcp47: 'ig-NG', voiceLang: 'en-NG' },
  { code: 'ha', label: 'Hausa',    flag: '🇳🇬', bcp47: 'ha-NG', voiceLang: 'en-NG' },
  { code: 'sw', label: 'Swahili',  flag: '🇰🇪', bcp47: 'sw-KE', voiceLang: 'en-KE' },
  { code: 'zu', label: 'Zulu',     flag: '🇿🇦', bcp47: 'zu-ZA', voiceLang: 'en-ZA' },
  { code: 'am', label: 'Amharic',  flag: '🇪🇹', bcp47: 'am-ET', voiceLang: 'en-US' },
  { code: 'tw', label: 'Twi',      flag: '🇬🇭', bcp47: 'ak-GH', voiceLang: 'en-GH' },
]

/* ═══════════════════════════════════════════════════════════════════
   TRANSLATION DICTIONARY — 40+ common phrases per language
   ═══════════════════════════════════════════════════════════════════ */
const DICT: Record<string, Record<SpiritLang, string>> = {
  // Greetings
  'hello':             { en: 'Hello',             yo: 'Bawo ni',           ig: 'Ndewo',              ha: 'Sannu',             sw: 'Habari',             zu: 'Sawubona',           am: 'Selam',             tw: 'Maakye' },
  'good morning':      { en: 'Good morning',      yo: 'E kaaro',           ig: 'Ututo oma',          ha: 'Ina kwana',         sw: 'Habari za asubuhi',  zu: 'Sawubona ekuseni',   am: 'Endemin aderk',     tw: 'Maakye' },
  'good afternoon':    { en: 'Good afternoon',    yo: 'E kaasan',          ig: 'Ehihie oma',         ha: 'Ina wuni',          sw: 'Habari za mchana',   zu: 'Sawubona emini',     am: 'Endemin walk',      tw: 'Maaha' },
  'good evening':      { en: 'Good evening',      yo: 'E kaale',           ig: 'Mgbede oma',         ha: 'Ina yini',          sw: 'Habari za jioni',    zu: 'Sawubona ntambama',  am: 'Endemin ameshu',    tw: 'Maadwo' },
  'good night':        { en: 'Good night',        yo: 'O daro',            ig: 'Ka chi fo',          ha: 'Mu kwana lafiya',   sw: 'Usiku mwema',        zu: 'Ulale kahle',        am: 'Dehna eder',        tw: 'Da yie' },
  'goodbye':           { en: 'Goodbye',           yo: 'O daro',            ig: 'Ka ochi',            ha: 'Sai anjima',        sw: 'Kwaheri',            zu: 'Sala kahle',         am: 'Dehna hun',         tw: 'Nante yie' },

  // Common phrases
  'thank you':         { en: 'Thank you',         yo: 'E se',              ig: 'Dalu',               ha: 'Na gode',           sw: 'Asante',             zu: 'Ngiyabonga',         am: 'Ameseginalehu',     tw: 'Medaase' },
  'please':            { en: 'Please',            yo: 'Jowo',              ig: 'Biko',               ha: 'Don Allah',         sw: 'Tafadhali',          zu: 'Ngicela',            am: 'Ebakih',            tw: 'Mepawo kyew' },
  'sorry':             { en: 'Sorry',             yo: 'E jowo mi gbagbo',  ig: 'Ndo',                ha: 'Yi hakuri',         sw: 'Samahani',           zu: 'Ngiyaxolisa',        am: 'Yikerta',           tw: 'Kosee' },
  'how are you':       { en: 'How are you?',      yo: 'Se daadaa ni',      ig: 'Kedu',               ha: 'Kana lafiya',       sw: 'Habari yako',        zu: 'Unjani',             am: 'Endemin neh',       tw: 'Wo ho te sen' },
  'i am fine':         { en: 'I am fine',         yo: 'Mo wa daadaa',      ig: 'Odi mma',            ha: 'Lafiya lau',        sw: 'Mzuri sana',         zu: 'Ngikhona',           am: 'Dehna negn',        tw: 'Me ho ye' },
  'yes':               { en: 'Yes',               yo: 'Beeni',             ig: 'Ee',                 ha: 'I',                 sw: 'Ndiyo',              zu: 'Yebo',               am: 'Awo',               tw: 'Aane' },
  'no':                { en: 'No',                yo: 'Beko',              ig: 'Mba',                ha: 'A a',               sw: 'Hapana',             zu: 'Cha',                am: 'Aydelem',           tw: 'Dabi' },
  'welcome':           { en: 'Welcome',           yo: 'Eku ile',           ig: 'Nnoo',               ha: 'Barka da zuwa',     sw: 'Karibu',             zu: 'Wamukelekile',       am: 'Enkwan dehna metak', tw: 'Akwaaba' },
  'my name is':        { en: 'My name is',        yo: 'Oruko mi ni',       ig: 'Aha m bu',           ha: 'Sunana',            sw: 'Jina langu ni',      zu: 'Igama lami ngu',     am: 'Sime',              tw: 'Me din de' },

  // Family & community
  'family':            { en: 'Family',            yo: 'Ebi',               ig: 'Ezinaulo',           ha: 'Iyali',             sw: 'Familia',            zu: 'Umndeni',            am: 'Beteseb',           tw: 'Abusua' },
  'brother':           { en: 'Brother',           yo: 'Egbon',             ig: 'Nwanne m nwoke',     ha: 'Dan uwa',           sw: 'Kaka',               zu: 'Umfowethu',          am: 'Wendim',            tw: 'Onua barima' },
  'sister':            { en: 'Sister',            yo: 'Arabinrin',         ig: 'Nwanne m nwanyi',    ha: 'Yar uwa',           sw: 'Dada',               zu: 'Udadewethu',         am: 'Ehit',              tw: 'Onua baa' },
  'mother':            { en: 'Mother',            yo: 'Iya',               ig: 'Nne',                ha: 'Uwa',               sw: 'Mama',               zu: 'Umama',              am: 'Enat',              tw: 'Ena' },
  'father':            { en: 'Father',            yo: 'Baba',              ig: 'Nna',                ha: 'Uba',               sw: 'Baba',               zu: 'Ubaba',              am: 'Abat',              tw: 'Agya' },
  'friend':            { en: 'Friend',            yo: 'Ore',               ig: 'Enyi',               ha: 'Aboki',             sw: 'Rafiki',             zu: 'Umngane',            am: 'Lijoch',            tw: 'Adamfo' },
  'child':             { en: 'Child',             yo: 'Omo',               ig: 'Nwa',                ha: 'Yaro',              sw: 'Mtoto',              zu: 'Ingane',             am: 'Lij',               tw: 'Abofra' },
  'elder':             { en: 'Elder',             yo: 'Agba',              ig: 'Okenye',             ha: 'Dattijo',           sw: 'Mzee',               zu: 'Umdala',             am: 'Shimagile',         tw: 'Opanyin' },
  'village':           { en: 'Village',           yo: 'Abule',             ig: 'Obodo',              ha: 'Kauye',             sw: 'Kijiji',             zu: 'Idolobha',           am: 'Mender',            tw: 'Kuro' },

  // Trade & commerce
  'money':             { en: 'Money',             yo: 'Owo',               ig: 'Ego',                ha: 'Kudi',              sw: 'Pesa',               zu: 'Imali',              am: 'Genzeb',            tw: 'Sika' },
  'market':            { en: 'Market',            yo: 'Oja',               ig: 'Ahia',               ha: 'Kasuwa',            sw: 'Soko',               zu: 'Imakethe',           am: 'Gebya',             tw: 'Dwamu' },
  'water':             { en: 'Water',             yo: 'Omi',               ig: 'Mmiri',              ha: 'Ruwa',              sw: 'Maji',               zu: 'Amanzi',             am: 'Wuha',              tw: 'Nsu' },
  'food':              { en: 'Food',              yo: 'Onje',              ig: 'Nri',                ha: 'Abinci',            sw: 'Chakula',            zu: 'Ukudla',             am: 'Migib',             tw: 'Aduan3' },
  'help':              { en: 'Help',              yo: 'Iranlowo',          ig: 'Enyemaka',           ha: 'Taimako',           sw: 'Msaada',             zu: 'Usizo',              am: 'Erdugn',            tw: 'Boa me' },
  'how much':          { en: 'How much?',         yo: 'Elo ni',            ig: 'Ego ole',            ha: 'Nawa ne',           sw: 'Bei gani',           zu: 'Malini',             am: 'Sint new',          tw: 'Ey3 sen' },
  'i want to buy':     { en: 'I want to buy',     yo: 'Mo fe ra',          ig: 'Achom izu',          ha: 'Ina so in saya',    sw: 'Nataka kununua',     zu: 'Ngifuna ukuthenga',  am: 'Megzat efelgalehu', tw: 'Mep3 at)' },
  'too expensive':     { en: 'Too expensive',     yo: 'O won ju',          ig: 'O di oke',           ha: 'Ya yi tsada',       sw: 'Ghali sana',         zu: 'Kubiza kakhulu',     am: 'Bezu wid new',      tw: 'Ebo d)d)' },

  // Values & everyday
  'i love you':        { en: 'I love you',        yo: 'Mo ni fe re',       ig: 'A huru m gi n anya', ha: 'Ina sonki',         sw: 'Nakupenda',          zu: 'Ngiyakuthanda',      am: 'Ewedihalehu',       tw: 'Me d) wo' },
  'love':              { en: 'Love',              yo: 'Ife',               ig: 'Ihunanya',           ha: 'Soyayya',           sw: 'Upendo',             zu: 'Uthando',            am: 'Fikir',             tw: 'Odo' },
  'peace':             { en: 'Peace',             yo: 'Alaafia',           ig: 'Udo',                ha: 'Salama',            sw: 'Amani',              zu: 'Ukuthula',           am: 'Selam',             tw: 'Asomdwee' },
  'strength':          { en: 'Strength',          yo: 'Agbara',            ig: 'Ike',                ha: 'Karfi',             sw: 'Nguvu',              zu: 'Amandla',            am: 'Hayl',              tw: 'Ahooden' },
  'unity':             { en: 'Unity',             yo: 'Isokan',            ig: 'Njiko',              ha: 'Hadin kai',         sw: 'Umoja',              zu: 'Ubunye',             am: 'Andinet',           tw: 'Nkabom' },
  'respect':           { en: 'Respect',           yo: 'Owo',               ig: 'Nsopuru',            ha: 'Girmamawa',         sw: 'Heshima',            zu: 'Inhlonipho',         am: 'Kibr',              tw: 'Obuo' },
  'wisdom':            { en: 'Wisdom',            yo: 'Ogbon',             ig: 'Amamihe',            ha: 'Hikima',            sw: 'Hekima',             zu: 'Ubuhlakani',         am: 'Tibeb',             tw: 'Nyansa' },
  'truth':             { en: 'Truth',             yo: 'Otito',             ig: 'Eziokwu',            ha: 'Gaskiya',           sw: 'Ukweli',             zu: 'Iqiniso',            am: 'Ewnet',             tw: 'Nokware' },
  'come here':         { en: 'Come here',         yo: 'Wa nibi',           ig: 'Bia ebe a',          ha: 'Zo nan',            sw: 'Njoo hapa',          zu: 'Woza lapha',         am: 'Na wudih',          tw: 'Bra ha' },
  'lets go':           { en: "Let's go",          yo: 'E jeka lo',         ig: 'Ka anyi je',         ha: 'Mu tafi',           sw: 'Twendeni',           zu: 'Masihambe',          am: 'Enihid',            tw: 'Ma yen ko' },
  'wait':              { en: 'Wait',              yo: 'Duro',              ig: 'Chere',              ha: 'Jira',              sw: 'Ngoja',              zu: 'Linda',              am: 'Tebiqu',            tw: 'Twen' },
  'god bless you':     { en: 'God bless you',     yo: 'Olorun a bukun fun e', ig: 'Chukwu gozie gi', ha: 'Allah ya albarkace ka', sw: 'Mungu akubariki', zu: 'UNkulunkulu akubusise', am: 'Igziabher yibarekh', tw: 'Awurade nhyira wo' },
  'i understand':      { en: 'I understand',      yo: 'Mo ti ye mi',       ig: 'A ghota m',          ha: 'Na gane',           sw: 'Ninaelewa',          zu: 'Ngiyaqonda',         am: 'Gebagnalehu',       tw: 'Mete ase3' },
  'help me':           { en: 'Help me',           yo: 'E ran mi lowo',     ig: 'Nyere m aka',        ha: 'Ka taimake ni',     sw: 'Nisaidie',           zu: 'Ngisize',            am: 'Erdugn',            tw: 'Boa me' },
  'where is':          { en: 'Where is?',         yo: 'Nibo ni',           ig: 'Olee ebe',           ha: 'Ina',               sw: 'Iko wapi',           zu: 'Ikuphi',             am: 'Yet new',           tw: 'Ehe na' },
  'courage':           { en: 'Courage',           yo: 'Igboya',            ig: 'Obi ike',            ha: 'Jaruntaka',         sw: 'Ujasiri',            zu: 'Isibindi',           am: 'Defrinet',          tw: 'Akokoduro' },
}

/* Build reverse lookups for each language */
const REVERSE_DICT: Record<SpiritLang, Map<string, string>> = {} as any
for (const lang of SPIRIT_LANGUAGES) {
  REVERSE_DICT[lang.code] = new Map()
}
for (const [key, translations] of Object.entries(DICT)) {
  for (const [lang, phrase] of Object.entries(translations)) {
    REVERSE_DICT[lang as SpiritLang].set(phrase.toLowerCase(), key)
  }
}

/* ── Translation engine ── */
export function translatePhrase(text: string, fromLang: SpiritLang, toLang: SpiritLang): string {
  if (fromLang === toLang) return text
  const lower = text.toLowerCase().trim()

  /* direct dictionary match */
  for (const [, translations] of Object.entries(DICT)) {
    if (translations[fromLang]?.toLowerCase() === lower) {
      return translations[toLang] || text
    }
  }

  /* multi-word phrase matching */
  const words = lower.split(/\s+/)
  let translated = text
  let foundAny = false

  for (let len = Math.min(words.length, 5); len >= 1; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ')
      for (const [, translations] of Object.entries(DICT)) {
        if (translations[fromLang]?.toLowerCase() === phrase) {
          const replacement = translations[toLang]
          if (replacement) {
            const idx = text.toLowerCase().indexOf(phrase)
            if (idx >= 0) {
              const original = text.substring(idx, idx + phrase.length)
              translated = translated.replace(new RegExp(escapeRegex(original), 'i'), replacement)
              foundAny = true
            }
          }
        }
      }
    }
  }

  return foundAny ? translated : text
}

/* Translate message from any language -> target */
export function translateMessage(text: string, targetLang: SpiritLang): { translated: string; detected: SpiritLang } {
  if (!text) return { translated: text, detected: 'en' }
  const lower = text.toLowerCase().trim()

  /* detect source language */
  let detected: SpiritLang = 'en'
  let bestScore = 0

  for (const lang of SPIRIT_LANGUAGES) {
    let score = 0
    for (const [, translations] of Object.entries(DICT)) {
      const phrase = translations[lang.code]?.toLowerCase()
      if (phrase && lower.includes(phrase)) {
        score += phrase.length
      }
    }
    if (score > bestScore) {
      bestScore = score
      detected = lang.code
    }
  }

  if (detected === targetLang && bestScore > 0) {
    return { translated: text, detected }
  }

  const translated = translatePhrase(text, detected, targetLang)
  return { translated, detected }
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/* ═══════════════════════════════════════════════════════════════════
   SPIRIT VOICE COMPONENT
   Slide-up translation drawer with mic, history, and TTS
   ═══════════════════════════════════════════════════════════════════ */

interface SpiritVoiceProps {
  /** Active target language code (e.g. 'yo', 'sw') */
  targetLang: string
  /** Called when a translation is ready to send as a message */
  onTranslate?: (original: string, translated: string) => void
  /** Close/dismiss the overlay */
  onClose: () => void
}

interface HistoryEntry {
  id: string
  original: string
  translated: string
  lang: SpiritLang
  ts: string
}

const QUICK_PHRASES = ['hello', 'thank you', 'how are you', 'peace', 'family', 'welcome', 'love', 'strength']

export function SpiritVoice({ targetLang, onTranslate, onClose }: SpiritVoiceProps) {
  const lang = (SPIRIT_LANGUAGES.find(l => l.code === targetLang) ?? SPIRIT_LANGUAGES[1])
  const [activeLang, setActiveLang] = useState<SpiritLang>(lang.code)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  /* inject CSS */
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.getElementById(INJECT_ID)) return
    const s = document.createElement('style')
    s.id = INJECT_ID
    s.textContent = STYLES
    document.head.appendChild(s)
  }, [])

  /* init speech synthesis */
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
      }
      if (synthRef.current) synthRef.current.cancel()
    }
  }, [])

  /* Update active lang when prop changes */
  useEffect(() => {
    const found = SPIRIT_LANGUAGES.find(l => l.code === targetLang)
    if (found) setActiveLang(found.code)
  }, [targetLang])

  /* Start listening */
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser. Try Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = SPIRIT_LANGUAGES.find(l => l.code === activeLang)?.bcp47 || 'en-US'

    recognition.onresult = (event: any) => {
      let finalText = ''
      let interimText = ''
      let bestConf = 0

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) {
          finalText += r[0].transcript
          bestConf = Math.max(bestConf, r[0].confidence || 0.8)
        } else {
          interimText += r[0].transcript
        }
      }

      const current = finalText || interimText
      setTranscript(current)
      setConfidence(bestConf || 0.5)

      if (current) {
        const fromLang: SpiritLang = activeLang === 'en' ? 'en' : 'en'
        const toLang = activeLang
        const { translated } = translateMessage(current, toLang)
        setTranslatedText(translated !== current ? translated : '')
      }
    }

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)

    recognition.start()
    setIsListening(true)
    setTranscript('')
    setTranslatedText('')
    setConfidence(0)
  }, [activeLang])

  /* Stop listening */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    setIsListening(false)
  }, [])

  /* Speak via TTS */
  const speakText = useCallback((text: string, lang?: SpiritLang) => {
    if (!synthRef.current) return
    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const langInfo = SPIRIT_LANGUAGES.find(l => l.code === (lang || activeLang))
    utterance.lang = langInfo?.voiceLang || 'en-US'
    utterance.rate = 0.85
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    synthRef.current.speak(utterance)
  }, [activeLang])

  /* Add to history and optionally send */
  const commitTranslation = useCallback(() => {
    if (!transcript) return
    const final = translatedText || transcript
    const entry: HistoryEntry = {
      id: `h-${Date.now()}`,
      original: transcript,
      translated: final,
      lang: activeLang,
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setHistory(prev => [entry, ...prev].slice(0, 10))
    onTranslate?.(transcript, final)
    setTranscript('')
    setTranslatedText('')
    setConfidence(0)
  }, [transcript, translatedText, activeLang, onTranslate])

  const activeLangInfo = SPIRIT_LANGUAGES.find(l => l.code === activeLang)!

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="sv-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 900,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* ── Drawer ── */}
      <div className="sv-slide" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 910,
        maxWidth: 520, margin: '0 auto',
        background: 'linear-gradient(180deg, #0e1510, #0a0f08)',
        borderTop: '1px solid rgba(251,191,36,0.2)',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -16px 60px rgba(0,0,0,0.7)',
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Drag handle ── */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.12)' }} />
        </div>

        {/* ── Header ── */}
        <div style={{
          padding: '10px 20px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(251,191,36,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(217,119,6,0.2), rgba(251,191,36,0.1))',
              border: '1px solid rgba(251,191,36,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>🗣️</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fbbf24', fontFamily: 'Sora, sans-serif' }}>Spirit Voice</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                Ohun Emi · {activeLangInfo.flag} {activeLangInfo.label}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s',
            }}
          >✕</button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── Language Selector ── */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Translate To
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SPIRIT_LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => setActiveLang(l.code)}
                  style={{
                    padding: '7px 11px', borderRadius: 99, cursor: 'pointer',
                    background: l.code === activeLang ? 'rgba(217,119,6,0.22)' : 'rgba(255,255,255,0.04)',
                    border: l.code === activeLang ? '1px solid #d97706' : '1px solid rgba(255,255,255,0.08)',
                    color: l.code === activeLang ? '#fbbf24' : 'rgba(255,255,255,0.45)',
                    fontSize: 11, fontWeight: 700, transition: 'all .15s',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Mic Button (center) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingTop: 4 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Pulsing rings when listening */}
              {isListening && <>
                <div style={{
                  position: 'absolute', width: 90, height: 90, borderRadius: '50%',
                  border: '2px solid rgba(251,191,36,0.4)',
                  animation: 'svMicRing1 1.5s ease-out infinite',
                }} />
                <div style={{
                  position: 'absolute', width: 90, height: 90, borderRadius: '50%',
                  border: '2px solid rgba(251,191,36,0.2)',
                  animation: 'svMicRing2 1.5s ease-out infinite 0.4s',
                }} />
              </>}
              <button
                onClick={isListening ? stopListening : startListening}
                className={isListening ? 'sv-listen' : ''}
                style={{
                  width: 76, height: 76, borderRadius: '50%', cursor: 'pointer', border: 'none',
                  background: isListening
                    ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                    : 'linear-gradient(135deg, #92400e, #d97706)',
                  color: '#fff', fontSize: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isListening
                    ? '0 0 28px rgba(239,68,68,0.5), 0 4px 20px rgba(0,0,0,0.4)'
                    : '0 0 20px rgba(217,119,6,0.35), 0 4px 20px rgba(0,0,0,0.4)',
                  transition: 'all .2s',
                  position: 'relative', zIndex: 1,
                }}
              >
                {isListening ? '⏹' : '🎙'}
              </button>
            </div>

            {/* Waveform bars when listening */}
            {isListening && (
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 22 }}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} style={{
                    width: 3, borderRadius: 2, background: '#fbbf24',
                    animation: `svWave ${0.3 + (i % 5) * 0.08}s ease-in-out ${i * 0.055}s infinite alternate`,
                    height: 4,
                  }} />
                ))}
              </div>
            )}

            {/* Confidence bar */}
            {(isListening || confidence > 0) && (
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase' }}>Confidence</span>
                  <span style={{ fontSize: 9, color: '#fbbf24', fontWeight: 700 }}>{Math.round(confidence * 100)}%</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${confidence * 100}%`, background: '#d97706', borderRadius: 99, transition: 'width .3s' }} />
                </div>
              </div>
            )}

            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              {isListening ? 'Listening… speak in English' : `Tap mic · translates to ${activeLangInfo.flag} ${activeLangInfo.label}`}
            </div>
          </div>

          {/* ── Live Transcript ── */}
          {transcript && (
            <div className="sv-fade" style={{
              padding: '12px 14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Heard
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#fff', lineHeight: 1.5 }}>{transcript}</p>
            </div>
          )}

          {/* ── Translated Text (gold) ── */}
          {translatedText && translatedText !== transcript && (
            <div className="sv-fade" style={{
              padding: '12px 14px', borderRadius: 12,
              background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {activeLangInfo.flag} {activeLangInfo.label} Translation
                </div>
                <button
                  onClick={() => speakText(translatedText, activeLang)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: isSpeaking ? '#ef4444' : '#fbbf24', padding: 0 }}
                >
                  {isSpeaking ? '⏹' : '🔊'}
                </button>
              </div>
              <p style={{ margin: 0, fontSize: 15, color: '#fbbf24', lineHeight: 1.5, fontWeight: 600 }}>{translatedText}</p>
            </div>
          )}

          {/* ── Action buttons ── */}
          {transcript && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => speakText(translatedText || transcript, activeLang)}
                style={{
                  flex: 1, padding: '11px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >🔊 Speak</button>
              <button
                onClick={commitTranslation}
                style={{
                  flex: 1, padding: '11px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                  border: '1px solid #fbbf24',
                  color: '#000', fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >➤ Send</button>
            </div>
          )}

          {/* ── Quick Phrase Bar ── */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Quick Phrases
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {QUICK_PHRASES.map(key => {
                const phrase = DICT[key]
                if (!phrase) return null
                const translated = phrase[activeLang]
                if (!translated) return null
                return (
                  <button
                    key={key}
                    onClick={() => {
                      speakText(translated, activeLang)
                      const entry: HistoryEntry = {
                        id: `qp-${Date.now()}-${key}`,
                        original: phrase.en,
                        translated,
                        lang: activeLang,
                        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      }
                      setHistory(prev => [entry, ...prev].slice(0, 10))
                      onTranslate?.(phrase.en, translated)
                    }}
                    style={{
                      padding: '6px 12px', borderRadius: 99,
                      background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)',
                      color: '#fbbf24', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}
                  >{translated}</button>
                )
              })}
            </div>
          </div>

          {/* ── Translation History ── */}
          {history.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                History · {history.length}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {history.map((h, idx) => {
                  const hLang = SPIRIT_LANGUAGES.find(l => l.code === h.lang)
                  return (
                    <div
                      key={h.id}
                      className="sv-history-in"
                      style={{
                        padding: '10px 12px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                        animationDelay: `${idx * 0.04}s`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{h.ts}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 9, color: '#d97706', fontWeight: 700 }}>{hLang?.flag} {hLang?.label}</span>
                          <button
                            onClick={() => speakText(h.translated, h.lang)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#d97706', padding: 0 }}
                          >▶</button>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{h.original}</div>
                      <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>{h.translated}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* bottom padding */}
          <div style={{ height: 12 }} />
        </div>
      </div>
    </>
  )
}

/* Default export for backward compat */
export default SpiritVoice

/* ── Export helper hook ── */
export function useSpiritTranslation(targetLang: SpiritLang) {
  const translate = useCallback((text: string) => {
    return translateMessage(text, targetLang)
  }, [targetLang])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const langInfo = SPIRIT_LANGUAGES.find(l => l.code === targetLang)
    utterance.lang = langInfo?.voiceLang || 'en-US'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }, [targetLang])

  return { translate, speak }
}

/* ── Inline Translation Badge component ── */
export function TranslationBadge({ text, lang }: { text: string; lang: SpiritLang }) {
  const langInfo = SPIRIT_LANGUAGES.find(l => l.code === lang)
  const [speaking, setSpeaking] = useState(false)

  const speak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = langInfo?.voiceLang || 'en-US'
    utterance.rate = 0.85
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="sv-fade" style={{
      marginTop: 4, padding: '6px 10px', borderRadius: 8,
      background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ fontSize: 12 }}>{langInfo?.flag}</span>
      <span style={{ flex: 1, fontSize: 11, color: '#fbbf24', fontWeight: 500, lineHeight: 1.4 }}>{text}</span>
      <button onClick={speak} style={{
        background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
        color: speaking ? '#ef4444' : '#d97706', padding: 0,
      }}>{speaking ? '⏹' : '▶'}</button>
    </div>
  )
}
