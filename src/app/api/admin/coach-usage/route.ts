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

    const url = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '25')))
    const sortBy = url.searchParams.get('sort') === 'recent' ? 'updated_at' : 'coach_messages_count'

    const admin = getServiceClient()

    // Top coach users (sorted by message count or recent activity)
    const { data: topUsers, error } = await admin
      .from('profiles')
      .select('id, email, full_name, plan, coach_messages_count, country, updated_at')
      .gt('coach_messages_count', 0)
      .order(sortBy, { ascending: false })
      .limit(limit)

    if (error) throw error

    // Country breakdown
    const { data: allCoachUsers } = await admin
      .from('profiles')
      .select('country, coach_messages_count')
      .gt('coach_messages_count', 0)

    const countryStats: Record<string, { users: number; messages: number }> = {}
    for (const u of allCoachUsers || []) {
      const c = u.country || 'Unknown'
      if (!countryStats[c]) countryStats[c] = { users: 0, messages: 0 }
      countryStats[c].users++
      countryStats[c].messages += u.coach_messages_count || 0
    }

    // Sort countries by message count
    const countryBreakdown = Object.entries(countryStats)
      .map(([country, stats]) => ({ country, ...stats }))
      .sort((a, b) => b.messages - a.messages)

    return NextResponse.json({
      topUsers: topUsers || [],
      countryBreakdown,
    })
  } catch (error) {
    return safeErrorResponse(error, 'admin-coach-usage')
  }
}
