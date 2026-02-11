import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/admin/check-admin'
import { safeErrorResponse } from '@/lib/security/sanitize'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('team_id, plan')
      .eq('id', user.id)
      .single()

    if (!profile?.team_id || profile.plan !== 'team') {
      return NextResponse.json({ error: 'Not a team member' }, { status: 403 })
    }

    // Use service client to list all team members (bypasses RLS)
    const admin = getServiceClient()
    const { data: members, error } = await admin
      .from('profiles')
      .select('id, email, full_name, plan, created_at')
      .eq('team_id', profile.team_id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ members: members || [] })
  } catch (error) {
    return safeErrorResponse(error, 'team-members-list')
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('team_id')
      .eq('id', user.id)
      .single()

    if (!profile?.team_id) {
      return NextResponse.json({ error: 'Not a team member' }, { status: 403 })
    }

    // Verify admin
    const admin = getServiceClient()
    const { data: team } = await admin
      .from('teams')
      .select('admin_user_id, seat_count')
      .eq('id', profile.team_id)
      .single()

    if (team?.admin_user_id !== user.id) {
      return NextResponse.json({ error: 'Only the team admin can add members' }, { status: 403 })
    }

    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check seat limit
    const { count: currentMembers } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('team_id', profile.team_id)

    if ((currentMembers ?? 0) >= team.seat_count) {
      return NextResponse.json(
        { error: `Seat limit reached (${team.seat_count}). Upgrade to add more seats.` },
        { status: 403 }
      )
    }

    // Find the user by email
    const { data: targetProfile } = await admin
      .from('profiles')
      .select('id, email, plan, team_id')
      .eq('email', email)
      .single()

    if (!targetProfile) {
      return NextResponse.json(
        { error: 'User not found. They must create an account first.' },
        { status: 404 }
      )
    }

    if (targetProfile.team_id) {
      return NextResponse.json(
        { error: 'User is already on a team.' },
        { status: 409 }
      )
    }

    // Add to team
    const { error } = await admin
      .from('profiles')
      .update({ plan: 'team', team_id: profile.team_id })
      .eq('id', targetProfile.id)

    if (error) throw error

    return NextResponse.json({ success: true, member: { id: targetProfile.id, email: targetProfile.email } })
  } catch (error) {
    return safeErrorResponse(error, 'team-members-add')
  }
}
