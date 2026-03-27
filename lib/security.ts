// ════════════════════════════════════════════════════════════════
// Security utilities for frontend — XSS prevention, sanitization,
// CSRF token management, and input validation
// ════════════════════════════════════════════════════════════════

/**
 * Sanitize user input — strip HTML tags and dangerous characters.
 * Use on all user-submitted text before rendering or sending to API.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Strip all HTML tags from a string (for display-only contexts).
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

/**
 * Validate handle format: alphanumeric + dots + underscores, 3-30 chars.
 */
export function isValidHandle(handle: string): boolean {
  return /^[a-zA-Z0-9._]{3,30}$/.test(handle)
}

/**
 * Validate Afro-ID format.
 */
export function isValidAfroId(id: string): boolean {
  return /^AFR-[A-Z0-9]{8,16}$/.test(id)
}

/**
 * Validate phone number (E.164 or local NG format).
 */
export function isValidPhone(phone: string): boolean {
  return /^(\+?[1-9]\d{7,14}|0[7-9][01]\d{8})$/.test(phone.replace(/\s/g, ''))
}

/**
 * Validate Cowrie amount — positive number, max 2 decimals, max ₵10M.
 */
export function isValidCowrieAmount(amount: string): boolean {
  const n = parseFloat(amount)
  return !isNaN(n) && n > 0 && n <= 10_000_000 && /^\d+(\.\d{1,2})?$/.test(amount)
}

/**
 * Validate PIN — exactly 4 digits.
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

/**
 * Check for common injection patterns in form fields.
 */
export function containsInjection(input: string): boolean {
  const patterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /eval\s*\(/i,
    /union\s+select/i,
    /;\s*drop\s+/i,
    /'\s*or\s+1\s*=\s*1/i,
    /--\s*$/,
    /\/\*.*\*\//,
  ]
  return patterns.some(p => p.test(input))
}

/**
 * Safe JSON parse — returns null on failure instead of throwing.
 */
export function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

/**
 * Generate CSRF token (use with API routes).
 */
export function generateCsrfToken(): string {
  const arr = new Uint8Array(32)
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(arr)
  }
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Rate limit a function call (client-side debounce for submissions).
 */
export function createClientRateLimiter(maxCalls: number, windowMs: number) {
  let calls = 0
  let resetTime = Date.now() + windowMs

  return function isAllowed(): boolean {
    const now = Date.now()
    if (now > resetTime) {
      calls = 0
      resetTime = now + windowMs
    }
    calls++
    return calls <= maxCalls
  }
}

/**
 * Mask sensitive data for display (e.g., phone numbers, IDs).
 */
export function maskSensitive(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return value
  const visible = value.slice(-visibleChars)
  const masked = '●'.repeat(Math.min(value.length - visibleChars, 12))
  return masked + visible
}
