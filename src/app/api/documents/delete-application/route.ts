import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError } from '@/lib/security/validation'
import { checkRateLimit, getClientIP, rateLimitResponse, GENERATION_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

const deleteApplicationSchema = z.object({
  jobDescriptionId: z.string().uuid('Invalid job description ID'),
})

export async function DELETE(request: Request) {
  try {
    const ip = getClientIP(request)
    const ipRl = checkRateLimit(ip, GENERATION_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'delete-application' })
      return rateLimitResponse(ipRl.retryAfterSeconds!)
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
      return NextResponse.json(
        { error: 'Please verify your email address.' },
        { status: 403 }
      )
    }

    // Pro-only check
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const isPaid = profile?.plan === 'basic' || profile?.plan === 'pro'
    if (!isPaid) {
      return NextResponse.json(
        { error: 'This feature is available for paid plan users only.' },
        { status: 403 }
      )
    }

    const body = await validateBody(request, deleteApplicationSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, user.id, { route: 'delete-application' })
      return body
    }

    const { jobDescriptionId } = body

    logSecurityEvent('delete_application', request, user.id, { jobDescriptionId })

    const { data: result, error } = await supabase.rpc('delete_application', {
      user_uuid: user.id,
      jd_id: jobDescriptionId,
    })

    if (error) throw error

    return NextResponse.json({ success: true, deleted_count: result?.deleted_count ?? 0 })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'delete-application')
  }
}
