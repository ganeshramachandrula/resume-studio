import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/admin/check-admin'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { validateBody, isValidationError, supportContactSchema } from '@/lib/security/validation'
import { checkRateLimitDistributed, getClientIP, rateLimitResponse, SUPPORT_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'
import { sendSupportNotification } from '@/lib/email'

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = getClientIP(request)
    const rl = await checkRateLimitDistributed(ip, SUPPORT_RATE_LIMIT)
    if (!rl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'support-contact' })
      return rateLimitResponse(rl.retryAfterSeconds!)
    }

    // Validate input
    const body = await validateBody(request, supportContactSchema)
    if (isValidationError(body)) return body

    // Optional auth — attach user_id if logged in
    let userId: string | null = null
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) userId = user.id
    } catch {
      // Not logged in, that's fine
    }

    const admin = getServiceClient()
    const { data, error } = await admin
      .from('support_messages')
      .insert({
        name: body.name || null,
        email: body.email,
        subject: body.subject,
        message: body.message,
        category: body.category,
        user_id: userId,
      })
      .select('case_number')
      .single()

    if (error) throw error

    logSecurityEvent('support_message_sent', request, userId ?? undefined, {
      email: body.email,
      category: body.category,
      case_number: data?.case_number,
    })

    // Send email notifications (must await — Vercel kills process after response)
    if (data?.case_number) {
      await sendSupportNotification({
        caseNumber: data.case_number,
        name: body.name || null,
        email: body.email,
        subject: body.subject,
        message: body.message,
        category: body.category,
      })
    }

    return NextResponse.json({ success: true, case_number: data?.case_number })
  } catch (error) {
    return safeErrorResponse(error, 'support-contact')
  }
}
