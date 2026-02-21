import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSONWithClaude, isAIConfigured } from '@/lib/ai/claude'
import { PARSE_JD_SYSTEM, buildParseJDPrompt } from '@/lib/ai/prompts/parse-jd'
import { mockParsedJD } from '@/lib/ai/mock-responses'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, parseJDSchema } from '@/lib/security/validation'
import { checkRateLimitDistributed, getClientIP, rateLimitResponse, GENERATION_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'
import { PARSE_JD_DAILY_FREE, PARSE_JD_DAILY_PRO, PARSE_JD_DAILY_MAX } from '@/lib/constants'
import type { Plan } from '@/types/database'

function getParseJDLimit(plan: Plan): number {
  if (plan === 'pro') return PARSE_JD_DAILY_MAX
  if (plan === 'basic') return PARSE_JD_DAILY_PRO
  return PARSE_JD_DAILY_FREE
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP before auth
    const ip = getClientIP(request)
    const ipRl = await checkRateLimitDistributed(ip, GENERATION_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'parse-jd' })
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
    const userRl = await checkRateLimitDistributed(user.id, GENERATION_RATE_LIMIT)
    if (!userRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'parse-jd' })
      return rateLimitResponse(userRl.retryAfterSeconds!)
    }

    // Email verification gate
    if (!isEmailVerified(user)) {
      logSecurityEvent('email_not_verified', request, user.id, { route: 'parse-jd' })
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
    const dailyLimit = getParseJDLimit(plan)

    // Atomic daily usage gate
    const { data: gateResult, error: gateError } = await supabase.rpc(
      'check_and_increment_parse_jd',
      { p_user_id: user.id, p_max_daily: dailyLimit }
    )

    if (gateError) {
      console.error('[parse-jd] Daily gate RPC error:', gateError.message)
      // Fail open — don't block legitimate users on DB errors
    } else if (gateResult && !gateResult.allowed) {
      logSecurityEvent('usage_limit_hit', request, user.id, {
        route: 'parse-jd',
        plan,
        daily_limit: dailyLimit,
      })
      return NextResponse.json(
        { error: `Daily limit reached (${dailyLimit}/day for your plan). Try again tomorrow or upgrade your plan.` },
        { status: 403 }
      )
    }

    // Validate input
    const body = await validateBody(request, parseJDSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, user.id, { route: 'parse-jd' })
      return body
    }

    const { jobDescription } = body

    logSecurityEvent('generation_attempt', request, user.id, { route: 'parse-jd' })

    const parsed = isAIConfigured()
      ? await generateJSONWithClaude(PARSE_JD_SYSTEM, buildParseJDPrompt(jobDescription))
      : mockParsedJD

    const { data, error } = await supabase
      .from('job_descriptions')
      .insert({
        user_id: user.id,
        raw_text: jobDescription,
        parsed_data: parsed,
        company_name: (parsed as Record<string, unknown>).company_name as string,
        role_title: (parsed as Record<string, unknown>).role_title as string,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'parse-jd')
  }
}
