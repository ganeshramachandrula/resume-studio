import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, ghostboardRatingSchema } from '@/lib/security/validation'
import {
  checkRateLimitDistributed,
  getClientIP,
  isIpBlocked,
  blockedIpResponse,
  rateLimitResponse,
  GHOSTBOARD_SUBMIT_RATE_LIMIT,
} from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'
import { companySlug, displayCompanyName } from '@/lib/ghostboard/normalize'

const URL_PATTERN = /https?:\/\/[^\s]+/i

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
    if (await isIpBlocked(ip)) return blockedIpResponse()

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const rl = await checkRateLimitDistributed(`ghostboard-submit:${user.id}`, GHOSTBOARD_SUBMIT_RATE_LIMIT)
    if (!rl.allowed) {
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'ghostboard-submit' })
      return rateLimitResponse(rl.retryAfterSeconds!)
    }

    if (!isEmailVerified(user)) {
      return NextResponse.json({ error: 'Email verification required' }, { status: 403 })
    }

    const body = await validateBody(request, ghostboardRatingSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, user.id, { route: 'ghostboard-submit' })
      return body
    }

    const slug = companySlug(body.company_name)
    if (!slug) {
      return NextResponse.json({ error: 'Invalid company name' }, { status: 400 })
    }

    const canonicalName = displayCompanyName(body.company_name)

    // Auto-moderation
    let isFlagged = false
    if (body.review_text && URL_PATTERN.test(body.review_text)) {
      isFlagged = true
    }
    if (
      !body.review_text &&
      body.overall_recommendation === 1 &&
      body.response_time === 1 &&
      body.ghosting_rate === 1 &&
      body.interview_quality === 1
    ) {
      isFlagged = true
    }
    // Check account age
    const accountAge = Date.now() - new Date(user.created_at).getTime()
    if (accountAge < 3600_000) {
      isFlagged = true
    }

    const { data, error } = await supabase
      .from('company_ratings')
      .upsert(
        {
          user_id: user.id,
          company_name: canonicalName,
          company_slug: slug,
          role: body.role || null,
          job_application_id: body.job_application_id || null,
          response_time: body.response_time ?? null,
          ghosting_rate: body.ghosting_rate ?? null,
          interview_quality: body.interview_quality ?? null,
          offer_fairness: body.offer_fairness ?? null,
          transparency: body.transparency ?? null,
          recruiter_professionalism: body.recruiter_professionalism ?? null,
          overall_recommendation: body.overall_recommendation,
          review_text: body.review_text || null,
          is_flagged: isFlagged,
          is_approved: !isFlagged,
        },
        { onConflict: 'user_id,company_slug' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'ghostboard-submit')
  }
}
