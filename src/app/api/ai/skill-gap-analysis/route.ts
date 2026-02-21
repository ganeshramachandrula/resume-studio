import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSONWithClaude, isAIConfigured } from '@/lib/ai/claude'
import {
  SKILL_GAP_ANALYSIS_SYSTEM,
  buildSkillGapPrompt,
} from '@/lib/ai/prompts/skill-gap-analysis'
import { mockSkillGapData } from '@/lib/ai/mock-responses'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, skillGapSchema } from '@/lib/security/validation'
import { checkRateLimitDistributed, getClientIP, rateLimitResponse, GENERATION_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'
import { FREE_DOCS_PER_MONTH } from '@/lib/constants'

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
    const ipRl = await checkRateLimitDistributed(ip, GENERATION_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'skill-gap-analysis' })
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

    const userRl = await checkRateLimitDistributed(user.id, GENERATION_RATE_LIMIT)
    if (!userRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'skill-gap-analysis' })
      return rateLimitResponse(userRl.retryAfterSeconds!)
    }

    if (!isEmailVerified(user)) {
      return NextResponse.json(
        { error: 'Please verify your email address before using this feature.' },
        { status: 403 }
      )
    }

    const body = await validateBody(request, skillGapSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, user.id, { route: 'skill-gap-analysis' })
      return body
    }

    const { jobDescription, skills, targetRole } = body

    // Check usage (counts as a generation)
    const { data: usageResult } = await supabase.rpc('check_and_increment_usage', {
      user_uuid: user.id,
      max_free_usage: FREE_DOCS_PER_MONTH,
    })

    if (usageResult && !usageResult.allowed) {
      logSecurityEvent('usage_limit_hit', request, user.id, { route: 'skill-gap-analysis' })
      return NextResponse.json(
        { error: 'Free plan limit reached. Upgrade to Pro for unlimited access.' },
        { status: 403 }
      )
    }

    logSecurityEvent('generation_attempt', request, user.id, { route: 'skill-gap-analysis' })

    const result = isAIConfigured()
      ? await generateJSONWithClaude(
          SKILL_GAP_ANALYSIS_SYSTEM,
          buildSkillGapPrompt(jobDescription, skills, targetRole),
          8192
        )
      : mockSkillGapData

    return NextResponse.json({ success: true, data: result })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'skill-gap-analysis')
  }
}
