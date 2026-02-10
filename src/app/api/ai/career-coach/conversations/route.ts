import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimit, getClientIP, rateLimitResponse, COACH_RATE_LIMIT } from '@/lib/security/rate-limit'

// GET: List conversations for current user
export async function GET(request: Request) {
  try {
    const ip = getClientIP(request)
    const ipRl = checkRateLimit(ip, COACH_RATE_LIMIT)
    if (!ipRl.allowed) return rateLimitResponse(ipRl.retryAfterSeconds!)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Annual-only gating
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profile?.plan !== 'pro_annual') {
      return NextResponse.json({ error: 'Pro Annual required' }, { status: 403 })
    }

    const { data: conversations, error } = await supabase
      .from('coach_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ conversations })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'career-coach-conversations')
  }
}

// POST: Create a new conversation
export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
    const ipRl = checkRateLimit(ip, COACH_RATE_LIMIT)
    if (!ipRl.allowed) return rateLimitResponse(ipRl.retryAfterSeconds!)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profile?.plan !== 'pro_annual') {
      return NextResponse.json({ error: 'Pro Annual required' }, { status: 403 })
    }

    let body: { title?: string; context?: Record<string, unknown> } = {}
    try {
      body = await request.json()
    } catch {
      // empty body is ok
    }

    const { data: conv, error } = await supabase
      .from('coach_conversations')
      .insert({
        user_id: user.id,
        title: body.title || 'New Conversation',
        context: body.context || {},
      })
      .select('id, title, created_at, updated_at')
      .single()

    if (error) throw error

    return NextResponse.json({ conversation: conv })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'career-coach-create')
  }
}
