import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'
import { checkRateLimitDistributed, AUTH_RATE_LIMIT, getClientIP, rateLimitResponse } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

const failedLoginSchema = z.object({
  email: z.string().email().max(300),
})

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
    const rl = await checkRateLimitDistributed(ip, AUTH_RATE_LIMIT)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds!)

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = failedLoginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { email } = parsed.data

    // Use service role to look up user by email and update lockout state
    const supabase = createServerClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\s+/g, ''),
      (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\s+/g, ''),
      { cookies: { getAll() { return [] }, setAll() {} } }
    )

    // Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, failed_login_attempts, locked_until')
      .eq('email', email)
      .single()

    if (!profile) {
      // Don't reveal whether user exists — just return OK
      return NextResponse.json({ success: true })
    }

    // Check if already locked
    if (profile.locked_until && new Date(profile.locked_until) > new Date()) {
      const retryAfter = Math.ceil((new Date(profile.locked_until).getTime() - Date.now()) / 1000)
      logSecurityEvent('account_locked', request, profile.id, { email })
      return NextResponse.json(
        { error: 'Account temporarily locked. Please try again later.', locked: true, retry_after: retryAfter },
        { status: 423 }
      )
    }

    // Increment failed attempts
    const newCount = (profile.failed_login_attempts || 0) + 1
    const updateData: Record<string, unknown> = { failed_login_attempts: newCount }

    if (newCount >= MAX_FAILED_ATTEMPTS) {
      updateData.locked_until = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
      logSecurityEvent('account_lockout_triggered', request, profile.id, {
        email,
        attempts: newCount,
        lockout_minutes: LOCKOUT_MINUTES,
      })
    }

    await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id)

    logSecurityEvent('login_failed', request, profile.id, { email, attempts: newCount })

    // If just locked, tell the client
    if (newCount >= MAX_FAILED_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Account temporarily locked due to too many failed attempts. Please try again in 15 minutes.', locked: true, retry_after: LOCKOUT_MINUTES * 60 },
        { status: 423 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[record-failed-login]', (err as Error).message)
    return NextResponse.json({ success: true }) // Don't fail the flow
  }
}
