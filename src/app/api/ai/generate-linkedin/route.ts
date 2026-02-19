import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSONWithClaude, isAIConfigured } from '@/lib/ai/claude'
import {
  GENERATE_LINKEDIN_SYSTEM,
  buildLinkedInPrompt,
} from '@/lib/ai/prompts/generate-linkedin'
import { mockLinkedInData } from '@/lib/ai/mock-responses'
import { FREE_DOCS_PER_MONTH, MAX_APPLICATIONS_PRO } from '@/lib/constants'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, generateDocSchema } from '@/lib/security/validation'
import { checkRateLimitDistributed, getClientIP, rateLimitResponse, GENERATION_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

export async function POST(request: Request) {
  try {
    // Rate limit by IP before auth
    const ip = getClientIP(request)
    const ipRl = await checkRateLimitDistributed(ip, GENERATION_RATE_LIMIT)
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
    const userRl = await checkRateLimitDistributed(user.id, GENERATION_RATE_LIMIT)
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

    const { parsedJD, experience, jobDescriptionId, contactInfo, language } = body

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

    // Fetch profile early (needed for language gating + conditional save)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const isPro = profile?.plan === 'pro_monthly' || profile?.plan === 'pro_annual' || profile?.plan === 'team'
    const effectiveLanguage = (profile?.plan === 'pro_annual' || profile?.plan === 'team') && language ? language : undefined

    const linkedin = isAIConfigured()
      ? await generateJSONWithClaude(GENERATE_LINKEDIN_SYSTEM, buildLinkedInPrompt(parsedJD, experience, contactInfo, effectiveLanguage))
      : mockLinkedInData

    if (!isPro && usageResult?.reason !== 'credit_used') {
      return NextResponse.json({ success: true, content: linkedin, saved: false })
    }

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

    const { data: saveResult, error } = await supabase.rpc('save_document_with_bundle_tracking', {
      p_user_id: user.id,
      p_job_description_id: jobDescriptionId,
      p_type: 'linkedin_summary',
      p_title: `LinkedIn Summary - ${parsedJD.role_title || 'Untitled'}`,
      p_content: linkedin as Record<string, unknown>,
    })

    if (error) throw error

    return NextResponse.json({ success: true, data: saveResult, content: linkedin, saved: true })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'generate-linkedin')
  }
}
