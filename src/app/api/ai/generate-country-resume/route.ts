import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSONWithClaude, isAIConfigured } from '@/lib/ai/claude'
import {
  GENERATE_COUNTRY_RESUME_SYSTEM,
  buildCountryResumePrompt,
} from '@/lib/ai/prompts/generate-country-resume'
import { mockCountryResumeData } from '@/lib/ai/mock-responses'
import { getCountryFormat } from '@/lib/resume-formats'
import { FREE_DOCS_PER_MONTH, MAX_APPLICATIONS_PRO } from '@/lib/constants'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, countryResumeSchema } from '@/lib/security/validation'
import { checkRateLimit, getClientIP, rateLimitResponse, GENERATION_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

export async function POST(request: Request) {
  try {
    // Rate limit by IP before auth
    const ip = getClientIP(request)
    const ipRl = checkRateLimit(ip, GENERATION_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'generate-country-resume' })
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
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'generate-country-resume' })
      return rateLimitResponse(userRl.retryAfterSeconds!)
    }

    // Email verification gate
    if (!isEmailVerified(user)) {
      logSecurityEvent('email_not_verified', request, user.id, { route: 'generate-country-resume' })
      return NextResponse.json(
        { error: 'Please verify your email address before generating documents.' },
        { status: 403 }
      )
    }

    // Validate input
    const body = await validateBody(request, countryResumeSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, user.id, { route: 'generate-country-resume' })
      return body
    }

    const { parsedJD, experience, jobDescriptionId, countryCode, contactInfo, language, vaultData } = body

    // Look up country format
    const countryFormat = getCountryFormat(countryCode)
    if (!countryFormat) {
      return NextResponse.json(
        { error: `Unknown country code: ${countryCode}` },
        { status: 400 }
      )
    }

    // Atomic usage check + increment
    const { data: usageResult } = await supabase.rpc('check_and_increment_usage', {
      user_uuid: user.id,
      max_free_usage: FREE_DOCS_PER_MONTH,
    })

    if (usageResult && !usageResult.allowed) {
      logSecurityEvent('usage_limit_hit', request, user.id, { route: 'generate-country-resume' })
      return NextResponse.json(
        { error: 'Free plan limit reached. Upgrade to Pro for unlimited documents.' },
        { status: 403 }
      )
    }

    logSecurityEvent('generation_attempt', request, user.id, { route: 'generate-country-resume' })

    // Fetch profile (needed for language gating + conditional save)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const isPro = profile?.plan === 'pro_monthly' || profile?.plan === 'pro_annual' || profile?.plan === 'team'

    // Language gating: only annual/team users can use non-English
    const effectiveLanguage = (profile?.plan === 'pro_annual' || profile?.plan === 'team') && language
      ? language
      : undefined

    let result
    try {
      result = isAIConfigured()
        ? await generateJSONWithClaude(
            GENERATE_COUNTRY_RESUME_SYSTEM,
            buildCountryResumePrompt(parsedJD, experience, countryFormat, contactInfo, effectiveLanguage, vaultData),
            12288
          )
        : JSON.parse(JSON.stringify(mockCountryResumeData))
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'MOCK_MODE') {
        result = JSON.parse(JSON.stringify(mockCountryResumeData))
      } else {
        throw err
      }
    }

    // Belt-and-suspenders: force-overwrite header with real contact info
    if (contactInfo && result && typeof result === 'object' && 'resume' in result) {
      const resume = (result as Record<string, unknown>).resume as Record<string, unknown>
      if (resume && 'header' in resume) {
        const header = resume.header as Record<string, unknown>
        if (contactInfo.name) header.name = contactInfo.name
        if (contactInfo.email) header.email = contactInfo.email
        if (contactInfo.phone) header.phone = contactInfo.phone
        if (contactInfo.location) header.location = contactInfo.location
        if (contactInfo.linkedin) header.linkedin = contactInfo.linkedin
      }
    }

    if (!isPro && usageResult?.reason !== 'credit_used') {
      // Free user without credits: return content for preview only, no DB save
      return NextResponse.json({ success: true, content: result, saved: false })
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
    const roleTitle = (parsedJD as Record<string, unknown>).role_title || 'Untitled'
    const companyName = (parsedJD as Record<string, unknown>).company_name || 'Company'
    const { data: saveResult, error } = await supabase.rpc('save_document_with_bundle_tracking', {
      p_user_id: user.id,
      p_job_description_id: jobDescriptionId,
      p_type: 'country_resume',
      p_title: `Country Resume (${countryFormat.name}) - ${roleTitle} at ${companyName}`,
      p_content: result as Record<string, unknown>,
      p_template: 'modern',
    })

    if (error) throw error

    return NextResponse.json({ success: true, data: saveResult, content: result, saved: true })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'generate-country-resume')
  }
}
