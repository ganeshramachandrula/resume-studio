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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const ip = getClientIP(request)
    if (await isIpBlocked(ip)) return blockedIpResponse()

    const rl = await checkRateLimitDistributed(`ghostboard-read:${ip}`, GHOSTBOARD_READ_RATE_LIMIT)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds!)

    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    const supabase = await createClient()

    // Fetch company profile
    const { data: profile, error: profileError } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('company_slug', slug)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Fetch paginated reviews
    const { data: reviews, count, error: reviewsError } = await supabase
      .from('company_ratings')
      .select('id, company_name, role, response_time, ghosting_rate, interview_quality, offer_fairness, transparency, recruiter_professionalism, overall_recommendation, review_text, created_at', { count: 'exact' })
      .eq('company_slug', slug)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (reviewsError) throw reviewsError

    return NextResponse.json({
      success: true,
      profile,
      reviews: reviews || [],
      total_reviews: count || 0,
      page,
      limit,
    })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'ghostboard-company-detail')
  }
}
