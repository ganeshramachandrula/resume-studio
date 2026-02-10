import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdmin, getServiceClient } from '@/lib/admin/check-admin'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { validateBody, isValidationError, adminUserUpdateSchema } from '@/lib/security/validation'
import { checkRateLimit, rateLimitResponse, ADMIN_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
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

    const [profileRes, docsRes, messagesRes] = await Promise.all([
      admin.from('profiles').select('*').eq('id', id).single(),
      admin.from('documents').select('id', { count: 'exact', head: true }).eq('user_id', id),
      admin.from('support_messages').select('id', { count: 'exact', head: true }).eq('user_id', id),
    ])

    if (profileRes.error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: profileRes.data,
      documentsCount: docsRes.count ?? 0,
      messagesCount: messagesRes.count ?? 0,
    })
  } catch (error) {
    return safeErrorResponse(error, 'admin-user-get')
  }
}

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

    const body = await validateBody(request, adminUserUpdateSchema)
    if (isValidationError(body)) return body

    const admin = getServiceClient()
    const { data, error } = await admin
      .from('profiles')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    logSecurityEvent('admin_user_update', request, user.id, {
      targetUserId: id,
      changes: body,
    })

    return NextResponse.json({ success: true, user: data })
  } catch (error) {
    return safeErrorResponse(error, 'admin-user-update')
  }
}

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

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const admin = getServiceClient()

    // Delete user from auth (cascades to profiles via FK)
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) throw error

    logSecurityEvent('admin_user_delete', request, user.id, {
      deletedUserId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return safeErrorResponse(error, 'admin-user-delete')
  }
}
