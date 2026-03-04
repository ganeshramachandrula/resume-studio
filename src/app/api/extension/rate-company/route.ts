import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, ghostboardRatingSchema } from '@/lib/security/validation'
import {
  checkRateLimitDistributed,
  getClientIP,
  GHOSTBOARD_SUBMIT_RATE_LIMIT,
} from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'
import { companySlug, displayCompanyName } from '@/lib/ghostboard/normalize'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.EXTENSION_CORS_ORIGIN || 'https://resume-studio.io',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const URL_PATTERN = /https?:\/\/[^\s]+/i

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = getClientIP(request)
    const ipRl = await checkRateLimitDistributed(ip, GHOSTBOARD_SUBMIT_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'extension-rate-company' })
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Bearer token auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in via the extension.' },
        { status: 401, headers: CORS_HEADERS }
      )
    }

    const token = authHeader.slice(7)
    const supabase = createServerClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\s+/g, ''),
      (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\s+/g, ''),
      { cookies: { getAll() { return [] }, setAll() {} } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token. Please log in again.' },
        { status: 401, headers: CORS_HEADERS }
      )
    }

    // Rate limit by user
    const userRl = await checkRateLimitDistributed(
      `ghostboard-submit:${user.id}`,
      GHOSTBOARD_SUBMIT_RATE_LIMIT
    )
    if (!userRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'extension-rate-company' })
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Email verification required
    if (!isEmailVerified(user)) {
      return NextResponse.json(
        { error: 'Email verification required' },
        { status: 403, headers: CORS_HEADERS }
      )
    }

    // Validate body
    const body = await validateBody(request, ghostboardRatingSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, user.id, { route: 'extension-rate-company' })
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const slug = companySlug(body.company_name)
    if (!slug) {
      return NextResponse.json(
        { error: 'Invalid company name' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const canonicalName = displayCompanyName(body.company_name)

    // Auto-moderation (same logic as /api/ghostboard/ratings)
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

    return NextResponse.json(
      { success: true, data },
      { headers: CORS_HEADERS }
    )
  } catch (error: unknown) {
    return safeErrorResponse(error, 'extension-rate-company')
  }
}
