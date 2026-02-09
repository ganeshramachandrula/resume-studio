import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSONWithClaude, isAIConfigured } from '@/lib/ai/claude'
import {
  GENERATE_LINKEDIN_SYSTEM,
  buildLinkedInPrompt,
} from '@/lib/ai/prompts/generate-linkedin'
import { mockLinkedInData } from '@/lib/ai/mock-responses'
import { FREE_DOCS_PER_MONTH } from '@/lib/constants'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, generateDocSchema } from '@/lib/security/validation'
import { checkRateLimit, getClientIP, rateLimitResponse, GENERATION_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

export async function POST(request: Request) {
  try {
    // Rate limit by IP before auth
    const ip = getClientIP(request)
    const ipRl = checkRateLimit(ip, GENERATION_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'generate-linkedin' })
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
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'generate-linkedin' })
      return rateLimitResponse(userRl.retryAfterSeconds!)
    }

    // Email verification gate
    if (!isEmailVerified(user)) {
      logSecurityEvent('email_not_verified', request, user.id, { route: 'generate-linkedin' })
      return NextResponse.json(
        { error: 'Please verify your email address before generating documents.' },
        { status: 403 }
      )
    }

    // Validate input
    const body = await validateBody(request, generateDocSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, user.id, { route: 'generate-linkedin' })
      return body
    }

    const { parsedJD, experience, jobDescriptionId } = body

    // Atomic usage check + increment
    const { data: usageResult } = await supabase.rpc('check_and_increment_usage', {
      user_uuid: user.id,
      max_free_usage: FREE_DOCS_PER_MONTH,
    })

    if (usageResult && !usageResult.allowed) {
      logSecurityEvent('usage_limit_hit', request, user.id, { route: 'generate-linkedin' })
      return NextResponse.json(
        { error: 'Free plan limit reached. Upgrade to Pro for unlimited documents.' },
        { status: 403 }
      )
    }

    logSecurityEvent('generation_attempt', request, user.id, { route: 'generate-linkedin' })

    const linkedin = isAIConfigured()
      ? await generateJSONWithClaude(GENERATE_LINKEDIN_SYSTEM, buildLinkedInPrompt(parsedJD, experience))
      : mockLinkedInData

    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        job_description_id: jobDescriptionId,
        type: 'linkedin_summary',
        title: `LinkedIn Summary - ${parsedJD.role_title || 'Untitled'}`,
        content: linkedin as Record<string, unknown>,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data, content: linkedin })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'generate-linkedin')
  }
}
