import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdmin, getServiceClient } from '@/lib/admin/check-admin'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimit, rateLimitResponse, ADMIN_RATE_LIMIT } from '@/lib/security/rate-limit'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = checkRateLimit(user.id, ADMIN_RATE_LIMIT)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds!)

    const { isAdmin } = await checkAdmin(user)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const admin = getServiceClient()

    const [
      profilesRes,
      proRes,
      disabledRes,
      docsRes,
      messagesNewRes,
      messagesOpenRes,
      coachTotalRes,
      coachActiveRes,
    ] = await Promise.all([
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin.from('profiles').select('id', { count: 'exact', head: true }).in('plan', ['pro_monthly', 'pro_annual']),
      admin.from('profiles').select('id', { count: 'exact', head: true }).eq('is_disabled', true),
      admin.from('documents').select('id', { count: 'exact', head: true }),
      admin.from('support_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      admin.from('support_messages').select('id', { count: 'exact', head: true }).in('status', ['new', 'in_progress']),
      // Coach stats: sum of all coach messages
      admin.from('profiles').select('coach_messages_count'),
      // Coach active users: users with at least 1 coach message
      admin.from('profiles').select('id', { count: 'exact', head: true }).gt('coach_messages_count', 0),
    ])

    const totalUsers = profilesRes.count ?? 0
    const proUsers = proRes.count ?? 0

    // Sum coach messages across all users
    const totalCoachMessages = (coachTotalRes.data || []).reduce(
      (sum: number, row: { coach_messages_count: number }) => sum + (row.coach_messages_count || 0),
      0
    )

    return NextResponse.json({
      totalUsers,
      proUsers,
      freeUsers: totalUsers - proUsers,
      disabledUsers: disabledRes.count ?? 0,
      totalDocuments: docsRes.count ?? 0,
      newMessages: messagesNewRes.count ?? 0,
      openMessages: messagesOpenRes.count ?? 0,
      totalCoachMessages,
      activeCoachUsers: coachActiveRes.count ?? 0,
    })
  } catch (error) {
    return safeErrorResponse(error, 'admin-stats')
  }
}
