import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSONWithClaude, isAIConfigured } from '@/lib/ai/claude'
import {
  GENERATE_RESUME_SYSTEM,
  buildGenerateResumePrompt,
} from '@/lib/ai/prompts/generate-resume'
import { mockResumeData } from '@/lib/ai/mock-responses'
import { FREE_DOCS_PER_MONTH, MAX_APPLICATIONS_PRO } from '@/lib/constants'
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

    const { parsedJD, experience, jobDescriptionId, contactInfo, language } = body

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

    // Fetch profile early (needed for language gating + conditional save)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const isPro = profile?.plan === 'pro_monthly' || profile?.plan === 'pro_annual'

    // Language gating: only annual users can use non-English
    const effectiveLanguage = profile?.plan === 'pro_annual' && language ? language : undefined

    let resume = isAIConfigured()
      ? await generateJSONWithClaude(GENERATE_RESUME_SYSTEM, buildGenerateResumePrompt(parsedJD, experience, contactInfo, effectiveLanguage))
      : JSON.parse(JSON.stringify(mockResumeData))

    // Belt-and-suspenders: force-overwrite header with real contact info
    if (contactInfo && resume && typeof resume === 'object' && 'header' in resume) {
      const header = (resume as Record<string, unknown>).header as Record<string, unknown>
      if (contactInfo.name) header.name = contactInfo.name
      if (contactInfo.email) header.email = contactInfo.email
      if (contactInfo.phone) header.phone = contactInfo.phone
      if (contactInfo.location) header.location = contactInfo.location
      if (contactInfo.linkedin) header.linkedin = contactInfo.linkedin
    }

    if (!isPro) {
      // Free user: return content for preview only, no DB save
      return NextResponse.json({ success: true, content: resume, saved: false })
    }

    // Pro user: check application limit before saving
    const { data: limitResult } = await supabase.rpc('check_application_limit', {
      user_uuid: user.id,
      job_description_uuid: jobDescriptionId,
      max_applications: MAX_APPLICATIONS_PRO,
    })

    if (limitResult && !limitResult.allowed) {
      return NextResponse.json(
        { error: 'Application limit reached (10/10). Delete an existing application to save new ones.' },
        { status: 403 }
      )
    }

    // Save with bundle tracking
    const { data: saveResult, error } = await supabase.rpc('save_document_with_bundle_tracking', {
      p_user_id: user.id,
      p_job_description_id: jobDescriptionId,
      p_type: 'resume',
      p_title: `Resume - ${parsedJD.role_title || 'Untitled'} at ${parsedJD.company_name || 'Company'}`,
      p_content: resume as Record<string, unknown>,
      p_template: 'modern',
    })

    if (error) throw error

    return NextResponse.json({ success: true, data: saveResult, content: resume, saved: true })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'generate-resume')
  }
}
