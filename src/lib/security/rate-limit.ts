/**
 * In-memory sliding window rate limiter.
 * No external dependencies. Auto-cleans expired entries.
 *
 * NOTE: This is per-process. In a multi-instance deployment (Vercel serverless),
 * each instance has its own map. For production, consider Redis-backed rate limiting.
 */

interface RateLimitEntry {
  timestamps: number[]
}

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number
  /** Window size in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds?: number
}

const store = new Map<string, RateLimitEntry>()

// Auto-cleanup every 60 seconds to prevent memory leaks
let cleanupInterval: ReturnType<typeof setInterval> | null = null

function ensureCleanup() {
  if (cleanupInterval) return
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      // Remove entries where all timestamps are expired (oldest window)
      const validTimestamps = entry.timestamps.filter(
        (ts) => now - ts < 300_000 // Keep entries from the last 5 minutes max
      )
      if (validTimestamps.length === 0) {
        store.delete(key)
      } else {
        entry.timestamps = validTimestamps
      }
    }
  }, 60_000)
  // Allow Node.js to exit without waiting for this interval
  if (cleanupInterval && typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
    cleanupInterval.unref()
  }
}

/**
 * Check and enforce a rate limit for an identifier (IP or user ID).
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  ensureCleanup()

  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = `${config.windowSeconds}:${config.maxRequests}:${identifier}`

  let entry = store.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs)

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0]
    const retryAfterSeconds = Math.ceil((oldestInWindow + windowMs - now) / 1000)
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) }
  }

  // Allow and record
  entry.timestamps.push(now)
  return { allowed: true }
}

// ── Presets ─────────────────────────────────────────────────

/** Auth routes: 5 requests per minute per IP */
export const AUTH_RATE_LIMIT: RateLimitConfig = { maxRequests: 5, windowSeconds: 60 }

/** AI generation routes: 10 requests per minute per user */
export const GENERATION_RATE_LIMIT: RateLimitConfig = { maxRequests: 10, windowSeconds: 60 }

/** Stripe routes: 10 requests per minute per user */
export const STRIPE_RATE_LIMIT: RateLimitConfig = { maxRequests: 10, windowSeconds: 60 }

/** General: 60 requests per minute per IP */
export const GENERAL_RATE_LIMIT: RateLimitConfig = { maxRequests: 60, windowSeconds: 60 }

// ── IP Extraction ──────────────────────────────────────────

/**
 * Extracts the client IP from request headers.
 * Checks common proxy headers in order of trust.
 */
export function getClientIP(request: Request): string {
  const headers = request.headers

  // Cloudflare
  const cfIp = headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()

  // Standard proxy header (first IP is the client)
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]
    if (first) return first.trim()
  }

  // Vercel
  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'unknown'
}

/**
 * Returns a 429 Too Many Requests response.
 */
export function rateLimitResponse(retryAfterSeconds: number) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
      },
    }
  )
}
