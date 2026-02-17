import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'
import { checkRateLimit, getClientIP, rateLimitResponse } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

const checkSignupSchema = z.object({
  deviceId: z.string().max(128, 'Invalid device ID').optional().default(''),
})

const SIGNUP_CHECK_RATE_LIMIT = { maxRequests: 10, windowSeconds: 60 }

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)

    // Rate limit
    const rl = checkRateLimit(`signup-check:${ip}`, SIGNUP_CHECK_RATE_LIMIT)
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds!)
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = checkSignupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { deviceId } = parsed.data
    const supabase = getAdminClient()

    const { data, error } = await supabase.rpc('check_signup_allowed', {
      p_ip: ip,
      p_device_id: deviceId || null,
    })

    if (error) {
      console.error('[check-signup] RPC error:', error.message)
      // Fail open — allow signup if DB check fails
      return NextResponse.json({ allowed: true })
    }

    if (data && !data.allowed) {
      logSecurityEvent('signup_blocked', request, undefined, {
        ip,
        device_id: deviceId || null,
        reason: data.reason,
      })
      return NextResponse.json(
        { allowed: false, reason: data.reason },
        { status: 403 }
      )
    }

    return NextResponse.json({ allowed: true })
  } catch (err) {
    console.error('[check-signup] Unexpected error:', err)
    // Fail open
    return NextResponse.json({ allowed: true })
  }
}
