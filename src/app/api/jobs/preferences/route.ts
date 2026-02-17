import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { validateBody, isValidationError, jobPreferencesSchema } from '@/lib/security/validation'
import { checkRateLimit, getClientIP, rateLimitResponse, GENERAL_RATE_LIMIT } from '@/lib/security/rate-limit'

export async function GET(request: Request) {
  try {
    const ip = getClientIP(request)
    const ipRl = checkRateLimit(ip, GENERAL_RATE_LIMIT)
    if (!ipRl.allowed) return rateLimitResponse(ipRl.retryAfterSeconds!)

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('job_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows

    return NextResponse.json({ preferences: data || null })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'job-preferences-get')
  }
}

export async function PUT(request: Request) {
  try {
    const ip = getClientIP(request)
    const ipRl = checkRateLimit(ip, GENERAL_RATE_LIMIT)
    if (!ipRl.allowed) return rateLimitResponse(ipRl.retryAfterSeconds!)

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await validateBody(request, jobPreferencesSchema)
    if (isValidationError(body)) return body

    const { data, error } = await supabase
      .from('job_preferences')
      .upsert(
        {
          user_id: user.id,
          ...body,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ preferences: data })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'job-preferences-put')
  }
}
