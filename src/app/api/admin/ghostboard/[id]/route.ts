import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdmin, getServiceClient } from '@/lib/admin/check-admin'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimit, rateLimitResponse, ADMIN_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

interface RouteContext {
  params: Promise<{ id: string }>
}

/** DELETE /api/admin/ghostboard/[id] — delete a rating */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
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

    const { error } = await admin
      .from('company_ratings')
      .delete()
      .eq('id', id)

    if (error) throw error

    logSecurityEvent('admin_user_update', request, user.id, {
      action: 'delete_ghostboard_rating',
      rating_id: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return safeErrorResponse(error, 'admin-ghostboard-delete')
  }
}

/** PATCH /api/admin/ghostboard/[id] — approve or flag a rating */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
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

    const body = await request.json()
    const { action } = body as { action: 'approve' | 'flag' }

    if (!['approve', 'flag'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const admin = getServiceClient()

    const updates = action === 'approve'
      ? { is_approved: true, is_flagged: false }
      : { is_approved: false, is_flagged: true }

    const { data, error } = await admin
      .from('company_ratings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    logSecurityEvent('admin_user_update', request, user.id, {
      action: `ghostboard_${action}`,
      rating_id: id,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return safeErrorResponse(error, 'admin-ghostboard-update')
  }
}
