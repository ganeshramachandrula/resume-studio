import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdmin, getServiceClient } from '@/lib/admin/check-admin'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { validateBody, isValidationError, adminMessageUpdateSchema } from '@/lib/security/validation'
import { checkRateLimit, rateLimitResponse, ADMIN_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

interface RouteContext {
  params: Promise<{ id: string }>
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

    const body = await validateBody(request, adminMessageUpdateSchema)
    if (isValidationError(body)) return body

    const admin = getServiceClient()
    const { data, error } = await admin
      .from('support_messages')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    logSecurityEvent('admin_message_update', request, user.id, {
      messageId: id,
      changes: body,
    })

    return NextResponse.json({ success: true, message: data })
  } catch (error) {
    return safeErrorResponse(error, 'admin-message-update')
  }
}
