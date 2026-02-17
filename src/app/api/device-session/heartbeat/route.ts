import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, rateLimitResponse, DEVICE_SESSION_RATE_LIMIT } from '@/lib/security/rate-limit'
import { validateBody, isValidationError } from '@/lib/security/validation'
import { isSessionValid, heartbeatSession } from '@/lib/security/device-session'

const heartbeatSchema = z.object({
  deviceId: z.string().length(64, 'Invalid device ID'),
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
      return rateLimitResponse(rl.retryAfterSeconds!)
    }

    // Validate body
    const body = await validateBody(request, heartbeatSchema)
    if (isValidationError(body)) return body

    const { deviceId } = body

    const valid = await isSessionValid(user.id, deviceId)

    if (valid) {
      // Fire-and-forget heartbeat update
      void heartbeatSession(user.id, deviceId)
      return NextResponse.json({ valid: true })
    }

    return NextResponse.json({ valid: false })
  } catch (error: unknown) {
    console.error('[device-session/heartbeat] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
