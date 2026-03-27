// ── Shared BFF proxy helper ────────────────────────────────────
// Tries the real backend; on any error returns fallbackData.
// Keeps a 2-second timeout so pages never block.
// Includes: SSRF guard, response size cap, content-type validation.

/** Block SSRF — only allow localhost/private upstreams */
function isAllowedUpstream(url: string): boolean {
  try {
    const u = new URL(url)
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname.endsWith('.internal')
  } catch { return false }
}

/** Cap response body to 5MB to prevent memory exhaustion */
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024

export async function proxyOrMock<T>(
  upstreamUrl: string,
  fallbackData: T,
  reqInit?: RequestInit,
): Promise<{ data: T; live: boolean }> {
  // SSRF guard
  if (!isAllowedUpstream(upstreamUrl)) {
    console.warn(`[BFF] Blocked non-local upstream: ${upstreamUrl}`)
    return { data: fallbackData, live: false }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 2000)
  try {
    const res = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'viewdicon-bff/1',
        'X-Request-ID': crypto.randomUUID(),
      },
      ...reqInit,
    })
    clearTimeout(timer)
    if (!res.ok) return { data: fallbackData, live: false }

    // Validate content-type is JSON
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      console.warn(`[BFF] Non-JSON response from ${upstreamUrl}: ${ct}`)
      return { data: fallbackData, live: false }
    }

    // Check response size
    const cl = parseInt(res.headers.get('content-length') || '0', 10)
    if (cl > MAX_RESPONSE_BYTES) {
      console.warn(`[BFF] Response too large from ${upstreamUrl}: ${cl} bytes`)
      return { data: fallbackData, live: false }
    }

    const json = await res.json()
    return { data: json, live: true }
  } catch {
    clearTimeout(timer)
    return { data: fallbackData, live: false }
  }
}

const BANKING = process.env.NEXT_PUBLIC_BANKING_GATEWAY_URL || 'http://localhost:9000'
const SOROSOKE = process.env.NEXT_PUBLIC_SOROSOKE_URL       || 'http://localhost:3003'
const VILLAGE  = process.env.NEXT_PUBLIC_VILLAGE_URL        || 'http://localhost:3002'
const JOLLOF   = process.env.NEXT_PUBLIC_JOLLOF_URL         || 'http://localhost:3046'
const SESO     = process.env.NEXT_PUBLIC_SESO_URL           || 'http://localhost:3050'
const AUTH     = process.env.NEXT_PUBLIC_AUTH_CORE_URL      || 'http://localhost:4000'
const GRIOT    = process.env.NEXT_PUBLIC_GRIOT_URL          || 'http://localhost:3060'

export const UPSTREAM = { BANKING, SOROSOKE, VILLAGE, JOLLOF, SESO, AUTH, GRIOT }
