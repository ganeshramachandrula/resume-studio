import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getClientIP } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

const recordLoginSchema = z.object({
  deviceId: z.string().max(128).optional().default(''),
  screenResolution: z.string().max(50).optional().default(''),
  timezone: z.string().max(100).optional().default(''),
  language: z.string().max(50).optional().default(''),
  referrer: z.string().max(2000).optional().default(''),
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

    const parsed = recordLoginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { deviceId, screenResolution, timezone, language, referrer } = parsed.data
    const ip = getClientIP(request)

    const metadata: Record<string, unknown> = {}
    if (deviceId) metadata.device_id = deviceId
    if (screenResolution) metadata.screenResolution = screenResolution
    if (timezone) metadata.timezone = timezone
    if (language) metadata.language = language
    if (referrer) metadata.referrer = referrer
    metadata.ip = ip

    logSecurityEvent('login_success', request, user.id, metadata)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[record-login-metadata] Unexpected error:', err)
    return NextResponse.json({ success: true }) // Don't fail the login flow
  }
}
