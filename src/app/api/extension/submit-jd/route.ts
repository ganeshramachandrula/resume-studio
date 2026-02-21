import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { generateJSONWithClaude, isAIConfigured } from '@/lib/ai/claude'
import { PARSE_JD_SYSTEM, buildParseJDPrompt } from '@/lib/ai/prompts/parse-jd'
import { mockParsedJD } from '@/lib/ai/mock-responses'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { validateBody, isValidationError, extensionSubmitSchema } from '@/lib/security/validation'
import { checkRateLimitDistributed, getClientIP, EXTENSION_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.EXTENSION_CORS_ORIGIN || 'https://resume-studio.io',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = getClientIP(request)
    const ipRl = await checkRateLimitDistributed(ip, EXTENSION_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'extension-submit-jd' })
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Bearer token auth (not cookie-based)
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in via the extension.' },
        { status: 401, headers: CORS_HEADERS }
      )
    }

    const token = authHeader.slice(7)
    const supabase = createServerClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\s+/g, ''),
      (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\s+/g, ''),
      { cookies: { getAll() { return [] }, setAll() {} } }
    )

    // Verify the JWT and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token. Please log in again.' },
        { status: 401, headers: CORS_HEADERS }
      )
    }

    // Rate limit by user
    const userRl = await checkRateLimitDistributed(user.id, EXTENSION_RATE_LIMIT)
    if (!userRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'extension-submit-jd' })
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Validate body
    const body = await validateBody(request, extensionSubmitSchema)
    if (isValidationError(body)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    logSecurityEvent('extension_submit', request, user.id, {
      source_url: body.source_url,
      source_site: body.source_site,
    })

    // Insert the submission
    const { data: submission, error: subError } = await supabase
      .from('extension_submissions')
      .insert({
        user_id: user.id,
        source_url: body.source_url || null,
        source_site: body.source_site || null,
        raw_text: body.raw_text,
        status: 'pending',
      })
      .select()
      .single()

    if (subError) throw subError

    // Parse JD with Claude (reuse same logic as parse-jd route)
    let parsed: Record<string, unknown>
    try {
      parsed = isAIConfigured()
        ? await generateJSONWithClaude(PARSE_JD_SYSTEM, buildParseJDPrompt(body.raw_text))
        : (mockParsedJD as unknown as Record<string, unknown>)
    } catch {
      // Update submission status to failed
      await supabase
        .from('extension_submissions')
        .update({ status: 'failed' })
        .eq('id', submission.id)

      return NextResponse.json(
        { error: 'Failed to parse job description. Please try again.' },
        { status: 500, headers: CORS_HEADERS }
      )
    }

    // Insert parsed JD into job_descriptions
    const { data: jd, error: jdError } = await supabase
      .from('job_descriptions')
      .insert({
        user_id: user.id,
        raw_text: body.raw_text,
        parsed_data: parsed,
        company_name: (parsed as Record<string, unknown>).company_name as string,
        role_title: (parsed as Record<string, unknown>).role_title as string,
      })
      .select()
      .single()

    if (jdError) throw jdError

    // Update submission with parsed JD reference
    await supabase
      .from('extension_submissions')
      .update({
        status: 'parsed',
        job_description_id: jd.id,
      })
      .eq('id', submission.id)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'
    const redirectUrl = `/generate?jd_id=${jd.id}`

    return NextResponse.json(
      {
        submission_id: submission.id,
        job_description_id: jd.id,
        redirect_url: redirectUrl,
        full_url: `${appUrl}${redirectUrl}`,
      },
      { headers: CORS_HEADERS }
    )
  } catch (error: unknown) {
    return safeErrorResponse(error, 'extension-submit-jd')
  }
}
