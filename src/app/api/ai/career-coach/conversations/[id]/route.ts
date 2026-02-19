import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimitDistributed, getClientIP, rateLimitResponse, COACH_RATE_LIMIT } from '@/lib/security/rate-limit'

// GET: Get a single conversation with messages
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ip = getClientIP(request)
    const ipRl = await checkRateLimitDistributed(ip, COACH_RATE_LIMIT)
    if (!ipRl.allowed) return rateLimitResponse(ipRl.retryAfterSeconds!)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: conv, error } = await supabase
      .from('coach_conversations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ conversation: conv })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'career-coach-get')
  }
}

// DELETE: Delete a conversation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ip = getClientIP(request)
    const ipRl = await checkRateLimitDistributed(ip, COACH_RATE_LIMIT)
    if (!ipRl.allowed) return rateLimitResponse(ipRl.retryAfterSeconds!)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('coach_conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'career-coach-delete')
  }
}
