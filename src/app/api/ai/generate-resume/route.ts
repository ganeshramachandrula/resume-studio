import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSONWithClaude, isAIConfigured } from '@/lib/ai/claude'
import {
  GENERATE_RESUME_SYSTEM,
  buildGenerateResumePrompt,
} from '@/lib/ai/prompts/generate-resume'
import { mockResumeData } from '@/lib/ai/mock-responses'
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
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'generate-resume' })
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
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'generate-resume' })
      return rateLimitResponse(userRl.retryAfterSeconds!)
    }

    // Email verification gate
    if (!isEmailVerified(user)) {
      logSecurityEvent('email_not_verified', request, user.id, { route: 'generate-resume' })
      return NextResponse.json(
        { error: 'Please verify your email address before generating documents.' },
        { status: 403 }
      )
    }

    // Validate input
    const body = await validateBody(request, generateDocSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, user.id, { route: 'generate-resume' })
      return body
    }

    const { parsedJD, experience, jobDescriptionId } = body

    // Atomic usage check + increment (prevents race condition)
    const { data: usageResult } = await supabase.rpc('check_and_increment_usage', {
      user_uuid: user.id,
      max_free_usage: FREE_DOCS_PER_MONTH,
    })

    if (usageResult && !usageResult.allowed) {
      logSecurityEvent('usage_limit_hit', request, user.id, { route: 'generate-resume' })
      return NextResponse.json(
        { error: 'Free plan limit reached. Upgrade to Pro for unlimited documents.' },
        { status: 403 }
      )
    }

    logSecurityEvent('generation_attempt', request, user.id, { route: 'generate-resume' })

    const resume = isAIConfigured()
      ? await generateJSONWithClaude(GENERATE_RESUME_SYSTEM, buildGenerateResumePrompt(parsedJD, experience))
      : mockResumeData

    // Save document
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        job_description_id: jobDescriptionId,
        type: 'resume',
        title: `Resume - ${parsedJD.role_title || 'Untitled'} at ${parsedJD.company_name || 'Company'}`,
        content: resume as Record<string, unknown>,
        template: 'modern',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data, content: resume })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'generate-resume')
  }
}
