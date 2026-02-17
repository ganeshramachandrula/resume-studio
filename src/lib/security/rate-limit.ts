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
      // Parse the window from the key format: "{windowSeconds}:{maxRequests}:{identifier}"
      const windowSeconds = parseInt(key.split(':')[0], 10) || 300
      const windowMs = windowSeconds * 1000
      const validTimestamps = entry.timestamps.filter(
        (ts) => now - ts < windowMs
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

/** Support contact form: 3 requests per 5 minutes per IP */
export const SUPPORT_RATE_LIMIT: RateLimitConfig = { maxRequests: 3, windowSeconds: 300 }

/** Admin routes: 60 requests per minute per user */
export const ADMIN_RATE_LIMIT: RateLimitConfig = { maxRequests: 60, windowSeconds: 60 }

/** Career Coach: 20 requests per minute per user */
export const COACH_RATE_LIMIT: RateLimitConfig = { maxRequests: 20, windowSeconds: 60 }

/** Career Coach monthly cap: 100 messages per 30 days per user */
export const COACH_MONTHLY_LIMIT: RateLimitConfig = { maxRequests: 100, windowSeconds: 2_592_000 }

/** Device session register/heartbeat: 10 requests per minute per user */
export const DEVICE_SESSION_RATE_LIMIT: RateLimitConfig = { maxRequests: 10, windowSeconds: 60 }

/** Job search: 15 requests per minute per user */
export const JOB_SEARCH_RATE_LIMIT: RateLimitConfig = { maxRequests: 15, windowSeconds: 60 }

/** Extension JD submission: 5 requests per minute per user */
export const EXTENSION_RATE_LIMIT: RateLimitConfig = { maxRequests: 5, windowSeconds: 60 }

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
 * Extracts the client country from request headers.
 * Vercel sets x-vercel-ip-country, Cloudflare sets cf-ipcountry.
 */
export function getClientCountry(request: Request): string | null {
  const headers = request.headers

  // Vercel
  const vercelCountry = headers.get('x-vercel-ip-country')
  if (vercelCountry) return vercelCountry.trim().toUpperCase()

  // Cloudflare
  const cfCountry = headers.get('cf-ipcountry')
  if (cfCountry && cfCountry !== 'XX') return cfCountry.trim().toUpperCase()

  return null
}

// ── IP Blocking (in-memory cache, synced from DB) ──────────

const blockedIpCache = new Set<string>()
let lastBlockedIpSync = 0
const BLOCKED_IP_SYNC_INTERVAL = 60_000 // Re-sync every 60s

/**
 * Syncs blocked IPs from the database into the in-memory cache.
 * Called lazily on first check and refreshed periodically.
 */
async function syncBlockedIps(): Promise<void> {
  try {
    // Dynamic import to avoid circular dependencies
    const { createServerClient } = await import('@supabase/ssr')
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll() { return [] }, setAll() {} } }
    )
    const { data } = await supabase.from('blocked_ips').select('ip_address')
    blockedIpCache.clear()
    if (data) {
      for (const row of data) blockedIpCache.add(row.ip_address)
    }
    lastBlockedIpSync = Date.now()
  } catch {
    // Silently fail — don't break request flow
  }
}

/**
 * Adds an IP to the blocked cache immediately (called after admin blocks an IP).
 */
export function addBlockedIp(ip: string): void {
  blockedIpCache.add(ip)
}

/**
 * Removes an IP from the blocked cache immediately.
 */
export function removeBlockedIp(ip: string): void {
  blockedIpCache.delete(ip)
}

/**
 * Checks if an IP is blocked. Syncs from DB if cache is stale.
 */
export async function isIpBlocked(ip: string): Promise<boolean> {
  if (ip === 'unknown') return false
  if (Date.now() - lastBlockedIpSync > BLOCKED_IP_SYNC_INTERVAL) {
    await syncBlockedIps()
  }
  return blockedIpCache.has(ip)
}

/**
 * Returns a 403 Forbidden response for blocked IPs.
 */
export function blockedIpResponse() {
  return new Response(
    JSON.stringify({ error: 'Access denied.' }),
    { status: 403, headers: { 'Content-Type': 'application/json' } }
  )
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
