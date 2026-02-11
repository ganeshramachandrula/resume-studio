import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdmin, getServiceClient } from '@/lib/admin/check-admin'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimit, rateLimitResponse, ADMIN_RATE_LIMIT } from '@/lib/security/rate-limit'

export async function GET(request: Request) {
  try {
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

    // Run all queries in parallel
    const [
      countryUsersRes,
      recentEventsRes,
      blockedIpsRes,
      topIpsRes,
      eventTypeRes,
      loginCountriesRes,
    ] = await Promise.all([
      // Country-wise user distribution from profiles
      admin.rpc('get_country_user_counts'),
      // Recent security events (last 200)
      admin
        .from('security_events')
        .select('id, event_type, user_id, ip_address, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
      // Currently blocked IPs
      admin
        .from('blocked_ips')
        .select('*')
        .order('created_at', { ascending: false }),
      // Top IPs by request count (from security_events, last 24h)
      admin.rpc('get_top_ips', { hours_ago: 24 }),
      // Event type breakdown (last 24h)
      admin.rpc('get_event_type_counts', { hours_ago: 24 }),
      // Country-wise login/generation hits from security events
      admin.rpc('get_geo_hits', { hours_ago: 168 }), // last 7 days
    ])

    return NextResponse.json({
      countryUsers: countryUsersRes.data || [],
      recentEvents: recentEventsRes.data || [],
      blockedIps: blockedIpsRes.data || [],
      topIps: topIpsRes.data || [],
      eventTypeCounts: eventTypeRes.data || [],
      geoHits: loginCountriesRes.data || [],
    })
  } catch (error) {
    return safeErrorResponse(error, 'admin-analytics')
  }
}

// Block an IP
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isAdmin } = await checkAdmin(user)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ip_address, reason } = body

    const admin = getServiceClient()

    if (action === 'block') {
      if (!ip_address || typeof ip_address !== 'string') {
        return NextResponse.json({ error: 'IP address required' }, { status: 400 })
      }
      const { error } = await admin
        .from('blocked_ips')
        .upsert(
          { ip_address: ip_address.trim(), reason: reason || '', blocked_by: user.id },
          { onConflict: 'ip_address' }
        )
      if (error) throw error
      return NextResponse.json({ success: true, action: 'blocked' })
    }

    if (action === 'unblock') {
      if (!ip_address || typeof ip_address !== 'string') {
        return NextResponse.json({ error: 'IP address required' }, { status: 400 })
      }
      const { error } = await admin
        .from('blocked_ips')
        .delete()
        .eq('ip_address', ip_address.trim())
      if (error) throw error
      return NextResponse.json({ success: true, action: 'unblocked' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return safeErrorResponse(error, 'admin-analytics-action')
  }
}
