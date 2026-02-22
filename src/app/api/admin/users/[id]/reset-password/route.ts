import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdmin, getServiceClient } from '@/lib/admin/check-admin'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimit, rateLimitResponse, ADMIN_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
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

    // Look up the target user's email
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single()

    if (profileError || !profile?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate a recovery link using the Supabase Admin API
    const origin = new URL(request.url).origin
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: profile.email,
      options: {
        redirectTo: `${origin}/change-password`,
      },
    })

    if (linkError) {
      console.error('[admin-reset-password] generateLink error:', linkError.message)
      return NextResponse.json(
        { error: 'Failed to generate reset link. Try again.' },
        { status: 500 }
      )
    }

    logSecurityEvent('admin_password_reset', request, user.id, {
      targetUserId: id,
      targetEmail: profile.email,
    })

    // The action_link contains the full reset URL
    // For local dev with Supabase, rewrite the link to use the app origin
    let resetLink = linkData.properties?.action_link || ''
    if (resetLink) {
      // Supabase generates links with its own URL; rewrite to app origin for usability
      try {
        const linkUrl = new URL(resetLink)
        const token = linkUrl.searchParams.get('token')
        const type = linkUrl.searchParams.get('type')
        if (token && type) {
          resetLink = `${origin}/api/auth/callback?token_hash=${encodeURIComponent(token)}&type=${encodeURIComponent(type)}&next=/change-password`
        }
      } catch {
        // Keep original link if parsing fails
      }
    }

    return NextResponse.json({
      success: true,
      resetLink,
      email: profile.email,
    })
  } catch (error) {
    return safeErrorResponse(error, 'admin-reset-password')
  }
}
