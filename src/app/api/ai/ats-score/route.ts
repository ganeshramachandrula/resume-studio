import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSONWithClaude, isAIConfigured } from '@/lib/ai/claude'
import { ATS_SCORE_SYSTEM, buildATSScorePrompt } from '@/lib/ai/prompts/ats-score'
import { mockATSScoreData } from '@/lib/ai/mock-responses'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, atsScoreSchema } from '@/lib/security/validation'
import { checkRateLimit, getClientIP, rateLimitResponse, GENERATION_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'
import { ATS_SCORE_DAILY_FREE, ATS_SCORE_DAILY_PRO, ATS_SCORE_DAILY_MAX } from '@/lib/constants'
import type { Plan } from '@/types/database'

function getATSScoreLimit(plan: Plan): number {
  if (plan === 'pro_annual' || plan === 'team') return ATS_SCORE_DAILY_MAX
  if (plan === 'pro_monthly') return ATS_SCORE_DAILY_PRO
  return ATS_SCORE_DAILY_FREE
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP before auth
    const ip = getClientIP(request)
    const ipRl = checkRateLimit(ip, GENERATION_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'ats-score' })
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

    // Rate limit by user ID
    const userRl = checkRateLimit(user.id, GENERATION_RATE_LIMIT)
    if (!userRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'ats-score' })
      return rateLimitResponse(userRl.retryAfterSeconds!)
    }

    // Email verification gate
    if (!isEmailVerified(user)) {
      logSecurityEvent('email_not_verified', request, user.id, { route: 'ats-score' })
      return NextResponse.json(
        { error: 'Please verify your email address before generating documents.' },
        { status: 403 }
      )
    }

    // Fetch user plan for daily limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const plan = (profile?.plan as Plan) || 'free'
    const dailyLimit = getATSScoreLimit(plan)

    // Atomic daily usage gate
    const { data: gateResult, error: gateError } = await supabase.rpc(
      'check_and_increment_ats_score',
      { p_user_id: user.id, p_max_daily: dailyLimit }
    )

    if (gateError) {
      console.error('[ats-score] Daily gate RPC error:', gateError.message)
      // Fail open — don't block legitimate users on DB errors
    } else if (gateResult && !gateResult.allowed) {
      logSecurityEvent('usage_limit_hit', request, user.id, {
        route: 'ats-score',
        plan,
        daily_limit: dailyLimit,
      })
      return NextResponse.json(
        { error: `Daily limit reached (${dailyLimit}/day for your plan). Try again tomorrow or upgrade your plan.` },
        { status: 403 }
      )
    }

    // Validate input
    const body = await validateBody(request, atsScoreSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, user.id, { route: 'ats-score' })
      return body
    }

    const { resumeJSON, parsedJD, documentId } = body

    logSecurityEvent('generation_attempt', request, user.id, { route: 'ats-score' })

    const atsScore = isAIConfigured()
      ? await generateJSONWithClaude(ATS_SCORE_SYSTEM, buildATSScorePrompt(resumeJSON, parsedJD), 8192)
      : mockATSScoreData

    // Update document with ATS score if documentId provided
    if (documentId) {
      await supabase
        .from('documents')
        .update({
          ats_score: (atsScore as Record<string, unknown>).overall_score as number,
        })
        .eq('id', documentId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({ success: true, data: atsScore })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'ats-score')
  }
}
