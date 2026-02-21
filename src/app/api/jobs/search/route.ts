import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchAllProviders } from '@/lib/job-feed/aggregator'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, jobSearchSchema } from '@/lib/security/validation'
import { checkRateLimit, getClientIP, rateLimitResponse, JOB_SEARCH_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'
import {
  JOB_SEARCH_DAILY_FREE,
  JOB_SEARCH_DAILY_PRO,
  JOB_SEARCH_DAILY_MAX,
  JOB_FEED_RESULTS_FREE,
  JOB_FEED_RESULTS_PRO,
} from '@/lib/constants'
import type { Plan } from '@/types/database'

function getJobSearchLimit(plan: Plan): number {
  if (plan === 'pro') return JOB_SEARCH_DAILY_MAX
  if (plan === 'basic') return JOB_SEARCH_DAILY_PRO
  return JOB_SEARCH_DAILY_FREE
}

function getResultsLimit(plan: Plan): number {
  if (plan === 'free') return JOB_FEED_RESULTS_FREE
  return JOB_FEED_RESULTS_PRO
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = getClientIP(request)
    const ipRl = checkRateLimit(ip, JOB_SEARCH_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'job-search' })
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
    const userRl = checkRateLimit(user.id, JOB_SEARCH_RATE_LIMIT)
    if (!userRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'job-search' })
      return rateLimitResponse(userRl.retryAfterSeconds!)
    }

    // Email verification gate
    if (!isEmailVerified(user)) {
      logSecurityEvent('email_not_verified', request, user.id, { route: 'job-search' })
      return NextResponse.json(
        { error: 'Please verify your email address before searching jobs.' },
        { status: 403 }
      )
    }

    // Fetch user plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const plan = (profile?.plan as Plan) || 'free'
    const dailyLimit = getJobSearchLimit(plan)
    const resultsLimit = getResultsLimit(plan)

    // Atomic daily usage gate
    const { data: gateResult, error: gateError } = await supabase.rpc(
      'check_and_increment_job_search',
      { p_user_id: user.id, p_max_daily: dailyLimit }
    )

    if (gateError) {
      console.error('[job-search] Daily gate RPC error:', gateError.message)
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again.' },
        { status: 503 }
      )
    } else if (gateResult && !gateResult.allowed) {
      logSecurityEvent('usage_limit_hit', request, user.id, {
        route: 'job-search',
        plan,
        daily_limit: dailyLimit,
      })
      return NextResponse.json(
        { error: `Daily search limit reached (${dailyLimit}/day for your plan). Try again tomorrow or upgrade.` },
        { status: 403 }
      )
    }

    // Validate input
    const body = await validateBody(request, jobSearchSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, user.id, { route: 'job-search' })
      return body
    }

    logSecurityEvent('job_search', request, user.id, { query: body.query })

    const { jobs, cached, providers } = await searchAllProviders(body, resultsLimit)

    return NextResponse.json({
      jobs,
      total: jobs.length,
      page: body.page || 1,
      providers_queried: providers,
      cached,
      remaining: gateResult?.remaining ?? null,
    })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'job-search')
  }
}
