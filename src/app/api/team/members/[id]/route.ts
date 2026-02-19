import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/admin/check-admin'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { checkRateLimit, GENERAL_RATE_LIMIT, rateLimitResponse } from '@/lib/security/rate-limit'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params

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

    const admin = getServiceClient()

    // Verify admin
    const { data: team } = await admin
      .from('teams')
      .select('admin_user_id')
      .eq('id', profile.team_id)
      .single()

    if (team?.admin_user_id !== user.id) {
      return NextResponse.json({ error: 'Only the team admin can remove members' }, { status: 403 })
    }

    // Cannot remove yourself (the admin)
    if (memberId === user.id) {
      return NextResponse.json({ error: 'Cannot remove yourself. Cancel the team subscription instead.' }, { status: 400 })
    }

    // Verify the member belongs to this team
    const { data: member } = await admin
      .from('profiles')
      .select('id, team_id')
      .eq('id', memberId)
      .single()

    if (!member || member.team_id !== profile.team_id) {
      return NextResponse.json({ error: 'Member not found in this team' }, { status: 404 })
    }

    // Downgrade member
    const { error } = await admin
      .from('profiles')
      .update({ plan: 'free', team_id: null })
      .eq('id', memberId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return safeErrorResponse(error, 'team-member-remove')
  }
}
