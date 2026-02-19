import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimit, GENERAL_RATE_LIMIT, rateLimitResponse } from '@/lib/security/rate-limit'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = checkRateLimit(user.id, GENERAL_RATE_LIMIT)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds!)

    const { data: profile } = await supabase
      .from('profiles')
      .select('team_id, plan')
      .eq('id', user.id)
      .single()

    if (!profile?.team_id || profile.plan !== 'team') {
      return NextResponse.json({ error: 'Not a team member' }, { status: 403 })
    }

    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', profile.team_id)
      .single()

    if (error || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    return NextResponse.json({ team, isAdmin: team.admin_user_id === user.id })
  } catch (error) {
    return safeErrorResponse(error, 'team-get')
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = checkRateLimit(user.id, GENERAL_RATE_LIMIT)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds!)

    const { data: profile } = await supabase
      .from('profiles')
      .select('team_id')
      .eq('id', user.id)
      .single()

    if (!profile?.team_id) {
      return NextResponse.json({ error: 'Not a team member' }, { status: 403 })
    }

    // Verify admin
    const { data: team } = await supabase
      .from('teams')
      .select('admin_user_id')
      .eq('id', profile.team_id)
      .single()

    if (team?.admin_user_id !== user.id) {
      return NextResponse.json({ error: 'Only the team admin can update team settings' }, { status: 403 })
    }

    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : null

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('teams')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', profile.team_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return safeErrorResponse(error, 'team-update')
  }
}
