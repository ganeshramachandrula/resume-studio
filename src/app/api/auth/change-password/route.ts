import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { checkRateLimitDistributed, getClientIP, AUTH_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'
import { validatePassword } from '@/lib/security/password'

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = getClientIP(request)
    const ipRl = await checkRateLimitDistributed(ip, AUTH_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'change-password' })
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isEmailVerified(user)) {
      return NextResponse.json({ error: 'Please verify your email first.' }, { status: 403 })
    }

    let body: { newPassword?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { newPassword } = body
    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 })
    }

    // Validate password complexity
    const validation = validatePassword(newPassword)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 })
    }

    // Update password via Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) {
      logSecurityEvent('password_change_failed', request, user.id, { error: updateError.message })
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Update password_changed_at in profiles via service role
    const serviceSupabase = createServerClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\s+/g, ''),
      (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\s+/g, ''),
      { cookies: { getAll() { return [] }, setAll() {} } }
    )

    await serviceSupabase
      .from('profiles')
      .update({ password_changed_at: new Date().toISOString() })
      .eq('id', user.id)

    logSecurityEvent('password_changed', request, user.id, {})

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'change-password')
  }
}
