import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/admin/check-admin'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, SUPPORT_RATE_LIMIT, getClientIP, rateLimitResponse } from '@/lib/security/rate-limit'

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
    const rl = checkRateLimit(ip, SUPPORT_RATE_LIMIT)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds!)

    const body = await request.json()
    const partnerId = typeof body.partnerId === 'string' ? body.partnerId : ''

    if (!partnerId) {
      return NextResponse.json({ error: 'Missing partner ID' }, { status: 400 })
    }

    // Get user ID if logged in (optional)
    let userId: string | null = null
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    } catch {
      // Not logged in — still track the click
    }

    // Fire-and-forget: insert into affiliate_clicks using service role
    const admin = getServiceClient()
    Promise.resolve(
      admin.from('affiliate_clicks').insert({ partner_id: partnerId, user_id: userId })
    ).catch(() => {})

    return NextResponse.json({ tracked: true })
  } catch {
    // Non-critical — always return success
    return NextResponse.json({ tracked: true })
  }
}
