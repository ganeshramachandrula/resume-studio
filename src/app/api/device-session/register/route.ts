import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, rateLimitResponse, DEVICE_SESSION_RATE_LIMIT } from '@/lib/security/rate-limit'
import { validateBody, isValidationError } from '@/lib/security/validation'
import { registerDeviceSession } from '@/lib/security/device-session'
import { logSecurityEvent } from '@/lib/security/audit-log'
import type { Plan } from '@/types/database'

const registerSchema = z.object({
  deviceId: z.string().length(64, 'Invalid device ID'),
  deviceLabel: z.string().max(100, 'Device label too long').default('Unknown Device'),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit by user ID
    const rl = checkRateLimit(user.id, DEVICE_SESSION_RATE_LIMIT)
    if (!rl.allowed) {
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'device-session/register' })
      return rateLimitResponse(rl.retryAfterSeconds!)
    }

    // Validate body
    const body = await validateBody(request, registerSchema)
    if (isValidationError(body)) return body

    const { deviceId, deviceLabel } = body

    // Fetch user plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const plan: Plan = (profile?.plan as Plan) || 'free'

    const result = await registerDeviceSession(user.id, deviceId, deviceLabel, plan, request)

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('[device-session/register] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
