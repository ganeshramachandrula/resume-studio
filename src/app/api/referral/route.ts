import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimit, GENERAL_RATE_LIMIT, rateLimitResponse } from '@/lib/security/rate-limit'

// GET /api/referral — get the current user's referral code + stats
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = checkRateLimit(user.id, GENERAL_RATE_LIMIT)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds!)

    // Get or create referral code
    const { data: code } = await supabase.rpc('get_or_create_referral_code', {
      p_user_id: user.id,
    })

    // Get referral count
    const { data: referrals } = await supabase
      .from('referral_signups')
      .select('id, created_at, referred_user_id')
      .in(
        'referral_code_id',
        (await supabase.from('referral_codes').select('id').eq('user_id', user.id)).data?.map((r) => r.id) || []
      )

    return NextResponse.json({
      code: code || null,
      referralCount: referrals?.length || 0,
      referrals: referrals?.map((r) => ({ id: r.id, createdAt: r.created_at })) || [],
    })
  } catch (error) {
    return safeErrorResponse(error, 'referral-get')
  }
}

// POST /api/referral — record a referral signup (called after signup with ?ref= param)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = checkRateLimit(user.id, GENERAL_RATE_LIMIT)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds!)

    const body = await request.json()
    const referralCode = body.referralCode
    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json({ error: 'Missing referral code' }, { status: 400 })
    }

    const { data: success } = await supabase.rpc('record_referral_signup', {
      p_referred_user_id: user.id,
      p_referral_code: referralCode,
    })

    return NextResponse.json({ success: !!success })
  } catch (error) {
    return safeErrorResponse(error, 'referral-post')
  }
}
