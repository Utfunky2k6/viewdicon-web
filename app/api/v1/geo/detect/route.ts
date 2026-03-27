/**
 * POST /api/v1/geo/detect
 *
 * Multi-signal, VPN-resistant geo-intelligence endpoint.
 * Determines which of the Three Circles a user belongs to.
 *
 * Signal stack (ordered by authority):
 *  1. Phone dial code   — STRONGEST: OTP binding proves ownership
 *  2. Browser timezone  — Hard to fake unintentionally
 *  3. IP geolocation    — Useful, but can be proxied
 *  4. VPN/proxy flag    — From ip-api.com `proxy/hosting` fields
 *  5. Mobile ASN flag   — Mobile carrier ASN = almost never a VPN
 *  6. Accept-Language   — Weak signal but adds to consensus
 *
 * VPN bypass philosophy:
 *   A VPN changes your IP — it CANNOT change your SIM card.
 *   Once the OTP is delivered to +234 (Nigeria), we know the SIM is African.
 *   The IP signal is demoted but never ignored (travel detection).
 *
 * Travel detection:
 *   African phone + non-African IP (non-VPN) = traveling abroad.
 *   Circle 1 status is maintained for 90 days after departure.
 */

import { NextRequest, NextResponse } from 'next/server'

// ── African ISO-3166-1 alpha-2 country codes ──────────────────
const AFRICA_CC = new Set([
  'DZ','AO','BJ','BW','BF','BI','CV','CM','CF','TD','KM','CG','CD','DJ',
  'EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','CI','KE','LS','LR',
  'LY','MG','MW','ML','MR','MU','YT','MA','MZ','NA','NE','NG','RE','RW',
  'ST','SN','SL','SO','ZA','SS','SD','TZ','TG','TN','UG','EH','ZM','ZW',
  'SC','SH','AC','TA','IO',
])

// ── African dial code → ISO country code ─────────────────────
const DIAL_TO_CC: Record<string, string> = {
  '+20':'EG','+212':'MA','+213':'DZ','+216':'TN','+218':'LY',
  '+220':'GM','+221':'SN','+222':'MR','+223':'ML','+224':'GN',
  '+225':'CI','+226':'BF','+227':'NE','+228':'TG','+229':'BJ',
  '+230':'MU','+231':'LR','+232':'SL','+233':'GH','+234':'NG',
  '+235':'TD','+236':'CF','+237':'CM','+238':'CV','+239':'ST',
  '+240':'GQ','+241':'GA','+242':'CG','+243':'CD','+244':'AO',
  '+245':'GW','+247':'SH','+248':'SC','+249':'SD','+250':'RW',
  '+251':'ET','+252':'SO','+253':'DJ','+254':'KE','+255':'TZ',
  '+256':'UG','+257':'BI','+258':'MZ','+260':'ZM','+261':'MG',
  '+262':'RE','+263':'ZW','+264':'NA','+265':'MW','+266':'LS',
  '+267':'BW','+268':'SZ','+269':'KM','+27':'ZA','+290':'SH',
  '+291':'ER',
}

// ── African IANA timezones ────────────────────────────────────
const AFRICA_TZ = new Set([
  'Africa/Abidjan','Africa/Accra','Africa/Addis_Ababa','Africa/Algiers',
  'Africa/Asmara','Africa/Bamako','Africa/Bangui','Africa/Banjul',
  'Africa/Bissau','Africa/Blantyre','Africa/Brazzaville','Africa/Bujumbura',
  'Africa/Cairo','Africa/Casablanca','Africa/Ceuta','Africa/Conakry',
  'Africa/Dakar','Africa/Dar_es_Salaam','Africa/Djibouti','Africa/Douala',
  'Africa/El_Aaiun','Africa/Freetown','Africa/Gaborone','Africa/Harare',
  'Africa/Johannesburg','Africa/Juba','Africa/Kampala','Africa/Khartoum',
  'Africa/Kigali','Africa/Kinshasa','Africa/Lagos','Africa/Libreville',
  'Africa/Lome','Africa/Luanda','Africa/Lubumbashi','Africa/Lusaka',
  'Africa/Malabo','Africa/Maputo','Africa/Maseru','Africa/Mbabane',
  'Africa/Mogadishu','Africa/Monrovia','Africa/Nairobi','Africa/Ndjamena',
  'Africa/Niamey','Africa/Nouakchott','Africa/Ouagadougou','Africa/Porto-Novo',
  'Africa/Sao_Tome','Africa/Tripoli','Africa/Tunis','Africa/Windhoek',
  'Indian/Antananarivo','Indian/Comoro','Indian/Mayotte','Indian/Mauritius',
  'Indian/Reunion',
])

// ── Known mobile carrier ISP patterns (hard to spoof with VPN) ──
const MOBILE_CARRIER_PATTERNS = [
  /\bMTN\b/i, /\bAirtel\b/i, /\bGlo\b/i, /\bEtisalat\b/i,
  /\bSafaricom\b/i, /\bVodacom\b/i, /\bOrange\b/i, /\bMoov\b/i,
  /\bTigo\b/i, /\bMillicom\b/i, /\bZain\b/i, /\bCamtel\b/i,
  /\bNtel\b/i, /\bNigComSat\b/i, /\bEconet\b/i, /\bNetone\b/i,
  /\bTelkom\b/i, /\bCell C\b/i, /\bIntel\b.*\bNigeria\b/i,
]

interface IpApiResponse {
  status: string; country: string; countryCode: string
  isp: string; org: string; as: string
  mobile: boolean; proxy: boolean; hosting: boolean
}

export interface GeoDetectResult {
  circle: 1 | 2 | 3
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  recommendation: string
  isAfrican: boolean
  isVPN: boolean
  travelDetected: boolean
  phoneCountry: string | null
  ipCountry: string | null
  africaScore: number
  signals: string[]
}

function extractIp(req: NextRequest): string | null {
  // Priority: Cloudflare → Real-IP → X-Forwarded-For → socket
  const cf  = req.headers.get('cf-connecting-ip')
  const rip = req.headers.get('x-real-ip')
  const fwd = req.headers.get('x-forwarded-for')
  const raw = cf || rip || (fwd ? fwd.split(',')[0].trim() : null)
  if (!raw) return null
  // Filter private/loopback — these don't geo-locate
  if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1|localhost)/i.test(raw)) return null
  return raw
}

export async function POST(req: NextRequest) {
  let body: { dialCode?: string; timezone?: string; locale?: string } = {}
  try { body = await req.json() } catch { /* ignore */ }

  const { dialCode = '', timezone = '', locale = '' } = body
  const acceptLang = req.headers.get('accept-language') || ''

  // ── Signal 1: Phone dial code (king signal) ───────────────
  const phoneCC = DIAL_TO_CC[dialCode] ?? null
  const phoneIsAfrican = phoneCC !== null

  // ── Signal 2: Browser timezone ───────────────────────────
  const tzIsAfrican = AFRICA_TZ.has(timezone)

  // ── Signal 3: Locale & Accept-Language ───────────────────
  const localeCC = locale.split('-')[1]?.toUpperCase() ?? ''
  const localeIsAfrican = AFRICA_CC.has(localeCC)
  const langIsAfrican = /\b(yo|ig|ha|sw|am|zu|xh|af|ti|so|rw|ln|mg|bm|ff|wo|sn|ny|nd|nr|st|tn|ts|ve|ss)\b/i.test(acceptLang)

  // ── Signal 4: IP geolocation + VPN check ─────────────────
  let ipCC: string | null = null
  let ipIsAfrican = false
  let isVPN = false
  let isMobileAsn = false
  let ipCountry = 'Unknown'
  let ispName = ''

  const ip = extractIp(req)
  if (ip) {
    try {
      const geoRes = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,country,countryCode,isp,org,as,mobile,proxy,hosting`,
        { signal: AbortSignal.timeout(3000), cache: 'no-store' }
      )
      if (geoRes.ok) {
        const geo = (await geoRes.json()) as IpApiResponse
        if (geo.status === 'success') {
          ipCC          = geo.countryCode
          ipIsAfrican   = AFRICA_CC.has(geo.countryCode)
          isVPN         = geo.proxy || geo.hosting
          isMobileAsn   = geo.mobile || MOBILE_CARRIER_PATTERNS.some((p) => p.test(geo.isp + ' ' + geo.org))
          ipCountry     = geo.country
          ispName       = geo.isp || geo.org || ''
        }
      }
    } catch { /* timeout or network error — rely on other signals */ }
  }

  // ── Scoring ────────────────────────────────────────────────
  // Phone bind is KING — 60 points. Everything else is supporting evidence.
  let score = 0
  const signals: string[] = []

  if (phoneIsAfrican) {
    score += 60
    signals.push(`📱 African phone (${dialCode} → ${phoneCC})`)
  }
  if (tzIsAfrican) {
    score += 20
    signals.push(`🕐 African timezone (${timezone})`)
  }
  if (ipIsAfrican && !isVPN) {
    score += 15
    signals.push(`🌍 African IP (${ipCountry})`)
  }
  if (localeIsAfrican) {
    score += 8
    signals.push(`🗣 African locale (${locale})`)
  }
  if (langIsAfrican) {
    score += 5
    signals.push(`💬 African language preference`)
  }
  if (isMobileAsn && phoneIsAfrican) {
    score += 7
    signals.push(`📶 African mobile carrier ASN (${ispName})`)
  }

  if (isVPN) {
    signals.push(`🔒 VPN/proxy detected (${ispName}) — phone binding overrides IP`)
    // VPN over African IP gets no bonus (could be server in Africa)
  }

  // ── Travel detection ──────────────────────────────────────
  // African phone + non-African IP (and it's NOT a VPN/datacenter) = traveling
  const travelDetected = phoneIsAfrican && !ipIsAfrican && !isVPN && ipCC !== null

  if (travelDetected) {
    signals.push(`✈️ Travel detected — SIM home: ${phoneCC}, current location: ${ipCountry}`)
    score += 5 // traveling African still scores African
  }

  // ── Circle assignment ─────────────────────────────────────
  let circle: 1 | 2 | 3
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  let recommendation: string

  if (phoneIsAfrican) {
    // Phone verified African → Circle 1. Phone is sovereign truth.
    circle     = 1
    confidence = score >= 80 ? 'HIGH' : score >= 60 ? 'MEDIUM' : 'LOW'
    if (travelDetected) {
      recommendation = `✈️ You appear to be abroad. Your Circle 1 status as a Continental African is maintained — the SIM never lies.`
    } else if (isVPN) {
      recommendation = `🔒 VPN detected, but your African phone number (${dialCode}) is the binding truth. Welcome, Child of the Soil.`
    } else {
      recommendation = `🌍 Your phone confirms you are a Child of the Soil. Circle 1 auto-selected.`
    }
  } else if (tzIsAfrican || (ipIsAfrican && !isVPN) || localeIsAfrican) {
    // No African phone, but other signals hint at Africa
    circle     = 2
    confidence = 'MEDIUM'
    recommendation = `Our signals suggest an African connection — please choose your circle.`
  } else {
    // No clear African signal
    circle     = 3
    confidence = 'LOW'
    recommendation = `Please select the circle that best describes your connection to Africa.`
  }

  const result: GeoDetectResult = {
    circle, confidence, recommendation,
    isAfrican: phoneIsAfrican || (ipIsAfrican && !isVPN),
    isVPN, travelDetected,
    phoneCountry: phoneCC,
    ipCountry: ipCC,
    africaScore: score,
    signals,
  }

  return NextResponse.json(result)
}
