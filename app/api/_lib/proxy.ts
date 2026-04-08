// ── Shared BFF proxy helper ────────────────────────────────────
// Tries the real backend; on any error returns fallbackData.
// Keeps a 2-second timeout so pages never block.
// Includes: SSRF guard, response size cap, content-type validation.
import { USE_MOCKS } from '@/lib/flags'

// Extra allowed hostnames from env (comma-separated), e.g. ngrok tunnel or staging hosts
const EXTRA_ALLOWED_HOSTS: Set<string> = new Set(
  (process.env.ALLOWED_UPSTREAM_HOSTS || '')
    .split(',')
    .map(h => h.trim())
    .filter(Boolean)
)

/** Block SSRF — only allow localhost/private upstreams or explicitly whitelisted hosts */
function isAllowedUpstream(url: string): boolean {
  try {
    const u = new URL(url)
    return (
      u.hostname === 'localhost' ||
      u.hostname === '127.0.0.1' ||
      u.hostname.endsWith('.internal') ||
      EXTRA_ALLOWED_HOSTS.has(u.hostname)
    )
  } catch { return false }
}

/** Cap response body to 5MB to prevent memory exhaustion */
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024

export async function proxyOrMock<T>(
  upstreamUrl: string,
  fallbackData: T,
  reqInit?: RequestInit,
): Promise<{ data: T; live: boolean; error?: string }> {
  // SSRF guard
  if (!isAllowedUpstream(upstreamUrl)) {
    console.warn(`[BFF] Blocked non-local upstream: ${upstreamUrl}`)
    return { data: fallbackData, live: false, ...(USE_MOCKS ? {} : { error: 'SSRF_BLOCKED' }) }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 2000)
  try {
    // Merge default headers with caller-provided headers (caller wins on conflict)
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client': 'viewdicon-bff/1',
      'X-Request-ID': crypto.randomUUID(),
    }
    const callerHeaders = reqInit?.headers as Record<string, string> | undefined
    const mergedHeaders = { ...defaultHeaders, ...callerHeaders }
    const { headers: _drop, ...restInit } = reqInit || {}

    const res = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: mergedHeaders,
      ...restInit,
    })
    clearTimeout(timer)
    if (!res.ok) {
      if (!USE_MOCKS) console.error(`[BFF] Upstream ${res.status} from ${upstreamUrl}`)
      return { data: fallbackData, live: false, ...(USE_MOCKS ? {} : { error: `UPSTREAM_${res.status}` }) }
    }

    // Validate content-type is JSON
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      console.warn(`[BFF] Non-JSON response from ${upstreamUrl}: ${ct}`)
      return { data: fallbackData, live: false, ...(USE_MOCKS ? {} : { error: 'NOT_JSON' }) }
    }

    // Check response size
    const cl = parseInt(res.headers.get('content-length') || '0', 10)
    if (cl > MAX_RESPONSE_BYTES) {
      console.warn(`[BFF] Response too large from ${upstreamUrl}: ${cl} bytes`)
      return { data: fallbackData, live: false, ...(USE_MOCKS ? {} : { error: 'TOO_LARGE' }) }
    }

    const json = await res.json()
    return { data: json, live: true }
  } catch (err) {
    clearTimeout(timer)
    if (!USE_MOCKS) console.error(`[BFF] Failed to reach ${upstreamUrl}:`, err instanceof Error ? err.message : err)
    return { data: fallbackData, live: false, ...(USE_MOCKS ? {} : { error: 'FETCH_FAILED' }) }
  }
}

// Server-only upstream URLs — NEVER use NEXT_PUBLIC_ prefix for internal service URLs
const BANKING = process.env.BANKING_GATEWAY_URL  || process.env.NEXT_PUBLIC_BANKING_GATEWAY_URL || 'http://localhost:9000'
const SOROSOKE = process.env.SOROSOKE_URL        || process.env.NEXT_PUBLIC_SOROSOKE_URL       || 'http://localhost:3003'
const VILLAGE  = process.env.VILLAGE_URL          || process.env.NEXT_PUBLIC_VILLAGE_URL        || 'http://localhost:3002'
const JOLLOF   = process.env.JOLLOF_URL           || process.env.NEXT_PUBLIC_JOLLOF_URL         || 'http://localhost:3046'
const SESO     = process.env.SESO_URL             || process.env.NEXT_PUBLIC_SESO_URL           || 'http://localhost:3050'
const AUTH     = process.env.AUTH_CORE_URL         || process.env.NEXT_PUBLIC_AUTH_CORE_URL      || 'http://localhost:4000'
const GRIOT    = process.env.GRIOT_URL             || process.env.NEXT_PUBLIC_GRIOT_URL          || 'http://localhost:3060'

export const UPSTREAM = { BANKING, SOROSOKE, VILLAGE, JOLLOF, SESO, AUTH, GRIOT }
