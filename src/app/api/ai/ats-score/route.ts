import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSONWithClaude, isAIConfigured } from '@/lib/ai/claude'
import { ATS_SCORE_SYSTEM, buildATSScorePrompt } from '@/lib/ai/prompts/ats-score'
import { mockATSScoreData } from '@/lib/ai/mock-responses'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, atsScoreSchema } from '@/lib/security/validation'
import { checkRateLimit, getClientIP, rateLimitResponse, GENERATION_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

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

    // Validate input
    const body = await validateBody(request, atsScoreSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, user.id, { route: 'ats-score' })
      return body
    }

    const { resumeJSON, parsedJD, documentId } = body

    logSecurityEvent('generation_attempt', request, user.id, { route: 'ats-score' })

    const atsScore = isAIConfigured()
      ? await generateJSONWithClaude(ATS_SCORE_SYSTEM, buildATSScorePrompt(resumeJSON, parsedJD))
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
