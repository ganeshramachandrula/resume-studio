import { createServerClient } from '@supabase/ssr'
import { getClientIP } from './rate-limit'

export type SecurityEventType =
  | 'signup'
  | 'login_success'
  | 'login_failed'
  | 'generation_attempt'
  | 'generation_denied'
  | 'rate_limit_hit'
  | 'usage_limit_hit'
  | 'checkout_initiated'
  | 'webhook_received'
  | 'disposable_email_blocked'
  | 'invalid_redirect_blocked'
  | 'email_not_verified'
  | 'validation_error'
  | 'delete_application'
  | 'support_message_sent'
  | 'admin_user_update'
  | 'admin_user_delete'
  | 'admin_message_update'
  | 'admin_bootstrap'
  | 'concurrent_session_exceeded'
  | 'device_session_kicked'
  | 'signup_blocked'
  | 'job_search'
  | 'extension_submit'
  | 'account_locked'
  | 'account_lockout_triggered'
  | 'password_changed'
  | 'password_change_failed'
  | 'admin_password_reset'
  | 'admin_signup_restrictions_cleared'

/**
 * Returns a Supabase admin client (service role) for writing security events.
 * Bypasses RLS since security_events has no user-facing policies.
 */
function getAdminClient() {
  return createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\s+/g, ''),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\s+/g, ''),
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}

/**
 * Logs a security event to the security_events table.
 * Fire-and-forget — never crashes the main request.
 */
export function logSecurityEvent(
  eventType: SecurityEventType,
  request: Request,
  userId?: string,
  metadata?: Record<string, unknown>
): void {
  // Fire-and-forget: don't await, don't throw
  void (async () => {
    try {
      const supabase = getAdminClient()
      const ip = getClientIP(request)
      const userAgent = request.headers.get('user-agent') || 'unknown'

      await supabase.from('security_events').insert({
        event_type: eventType,
        user_id: userId || null,
        ip_address: ip,
        user_agent: userAgent.slice(0, 500), // Truncate long user agents
        metadata: metadata || {},
      })
    } catch (err) {
      // Silently fail — logging should never break the app
      console.error('[audit-log] Failed to log security event:', err)
    }
  })()
}
