import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/admin/check-admin'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimit, getClientIP, rateLimitResponse, ADMIN_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
    const rl = checkRateLimit(ip, ADMIN_RATE_LIMIT)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds!)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ownerEmail = process.env.ADMIN_OWNER_EMAIL
    if (!ownerEmail) {
      return NextResponse.json(
        { error: 'ADMIN_OWNER_EMAIL not configured' },
        { status: 500 }
      )
    }

    if (user.email !== ownerEmail) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const adminClient = getServiceClient()
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)

    if (updateError) throw updateError

    logSecurityEvent('admin_bootstrap', request, user.id, { email: user.email })

    return NextResponse.json({ success: true, message: 'Admin role granted' })
  } catch (error) {
    return safeErrorResponse(error, 'admin-bootstrap')
  }
}
