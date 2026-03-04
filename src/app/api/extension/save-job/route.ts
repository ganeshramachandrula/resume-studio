import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { validateBody, isValidationError, extensionSaveJobSchema } from '@/lib/security/validation'
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
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'extension-save-job' })
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Bearer token auth
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
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'extension-save-job' })
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Validate body
    const body = await validateBody(request, extensionSaveJobSchema)
    if (isValidationError(body)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    logSecurityEvent('extension_submit', request, user.id, {
      action: 'save_job',
      company: body.company,
      role: body.role,
    })

    // Insert into job_applications
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        user_id: user.id,
        company: body.company,
        role: body.role,
        url: body.url || null,
        status: 'saved',
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json(
      { success: true, id: data.id },
      { headers: CORS_HEADERS }
    )
  } catch (error: unknown) {
    return safeErrorResponse(error, 'extension-save-job')
  }
}
