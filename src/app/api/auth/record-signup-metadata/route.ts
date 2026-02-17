import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getClientIP } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

const recordSignupSchema = z.object({
  deviceId: z.string().max(128).optional().default(''),
  referrer: z.string().max(2000).optional().default(''),
  screenResolution: z.string().max(50).optional().default(''),
  timezone: z.string().max(100).optional().default(''),
  language: z.string().max(50).optional().default(''),
  colorDepth: z.number().int().min(0).max(64).optional(),
  hardwareConcurrency: z.number().int().min(0).max(256).optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = recordSignupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { deviceId, referrer, screenResolution, timezone, language, colorDepth, hardwareConcurrency } = parsed.data
    const ip = getClientIP(request)

    const metadata: Record<string, unknown> = {}
    if (screenResolution) metadata.screenResolution = screenResolution
    if (timezone) metadata.timezone = timezone
    if (language) metadata.language = language
    if (colorDepth !== undefined) metadata.colorDepth = colorDepth
    if (hardwareConcurrency !== undefined) metadata.hardwareConcurrency = hardwareConcurrency

    const { error } = await supabase.rpc('record_signup_metadata', {
      p_user_id: user.id,
      p_ip: ip,
      p_device_id: deviceId || null,
      p_referrer: referrer || null,
      p_metadata: metadata,
    })

    if (error) {
      console.error('[record-signup-metadata] RPC error:', error.message)
    }

    logSecurityEvent('signup', request, user.id, {
      device_id: deviceId || null,
      referrer: referrer || null,
      ...metadata,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[record-signup-metadata] Unexpected error:', err)
    return NextResponse.json({ success: true }) // Don't fail the signup flow
  }
}
