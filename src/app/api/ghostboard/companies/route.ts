import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeErrorResponse } from '@/lib/security/sanitize'
import {
  checkRateLimitDistributed,
  getClientIP,
  isIpBlocked,
  blockedIpResponse,
  rateLimitResponse,
  GHOSTBOARD_READ_RATE_LIMIT,
} from '@/lib/security/rate-limit'

export async function GET(request: Request) {
  try {
    const ip = getClientIP(request)
    if (await isIpBlocked(ip)) return blockedIpResponse()

    const rl = await checkRateLimitDistributed(`ghostboard-read:${ip}`, GHOSTBOARD_READ_RATE_LIMIT)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds!)

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const sort = searchParams.get('sort') || 'total_ratings'
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query = supabase
      .from('company_profiles')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.ilike('company_name', `%${search}%`)
    }

    // Sort options
    const validSorts = ['total_ratings', 'avg_overall_recommendation', 'avg_ghosting_rate', 'company_name']
    const sortField = validSorts.includes(sort) ? sort : 'total_ratings'
    const ascending = sort === 'company_name' || sort === 'avg_ghosting_rate'
    query = query.order(sortField, { ascending, nullsFirst: false })

    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
    })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'ghostboard-companies')
  }
}
