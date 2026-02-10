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
    const status = url.searchParams.get('status') || ''
    const category = url.searchParams.get('category') || ''
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')))
    const offset = (page - 1) * limit

    const admin = getServiceClient()

    let query = admin
      .from('support_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && ['new', 'in_progress', 'resolved', 'closed'].includes(status)) {
      query = query.eq('status', status)
    }

    if (category && ['bug', 'feature', 'billing', 'general'].includes(category)) {
      query = query.eq('category', category)
    }

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      messages: data || [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    })
  } catch (error) {
    return safeErrorResponse(error, 'admin-messages-list')
  }
}
