'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Trash2, Loader2, Crown, Pencil } from 'lucide-react'
import type { Team, TeamMember } from '@/types/team'

export default function TeamPage() {
  const { profile } = useAppStore()
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addEmail, setAddEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [savingName, setSavingName] = useState(false)

  const fetchTeam = useCallback(async () => {
    try {
      const [teamRes, membersRes] = await Promise.all([
        fetch('/api/team'),
        fetch('/api/team/members'),
      ])
      const teamData = await teamRes.json()
      const membersData = await membersRes.json()

      if (teamData.team) {
        setTeam(teamData.team)
        setTeamName(teamData.team.name)
        setIsAdmin(teamData.isAdmin)
      }
      if (membersData.members) {
        setMembers(membersData.members)
      }
    } catch {
      setError('Failed to load team data')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchTeam() }, [fetchTeam])

  const handleAddMember = async () => {
    if (!addEmail.trim()) return
    setAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to add member')
      } else {
        setAddEmail('')
        fetchTeam()
      }
    } catch {
      setError('Failed to add member')
    }
    setAdding(false)
  }

  const handleRemoveMember = async (id: string) => {
    setRemovingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/team/members/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to remove member')
      } else {
        fetchTeam()
      }
    } catch {
      setError('Failed to remove member')
    }
    setRemovingId(null)
  }

  const handleSaveName = async () => {
    if (!teamName.trim()) return
    setSavingName(true)
    try {
      const res = await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName.trim() }),
      })
      if (res.ok) {
        setTeam((t) => t ? { ...t, name: teamName.trim() } : t)
        setEditingName(false)
      }
    } catch {
      // ignore
    }
    setSavingName(false)
  }

  if (profile?.plan !== 'team') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-display text-gray-900 mb-2">Team Plan</h1>
        <p className="text-gray-500 mb-6">
          You&apos;re not on a team plan. Contact your team admin or upgrade to a team plan.
        </p>
        <Button onClick={() => window.location.href = '/pricing'}>View Plans</Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display text-gray-900">Team Management</h1>
        <p className="text-gray-500 mt-1">Manage your team members and billing.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* Team Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-[family-name:var(--font-body)]">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button size="sm" onClick={handleSaveName} disabled={savingName}>
                      {savingName ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingName(false); setTeamName(team?.name || '') }}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {team?.name}
                    {isAdmin && (
                      <button onClick={() => setEditingName(true)} className="text-gray-400 hover:text-gray-600">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {members.length} / {team?.seat_count} seats used
              </CardDescription>
            </div>
            <Badge variant="accent">Team Plan</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-body)]">Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-medium text-sm">
                  {(member.full_name || member.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {member.full_name || member.email}
                    {team?.admin_user_id === member.id && (
                      <Crown className="inline h-3.5 w-3.5 text-accent ml-1.5" />
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </div>
              {isAdmin && team?.admin_user_id !== member.id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={removingId === member.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {removingId === member.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Remove
                </Button>
              )}
            </div>
          ))}

          {/* Add Member */}
          {isAdmin && (
            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <Input
                placeholder="teammate@company.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              />
              <Button onClick={handleAddMember} disabled={adding || !addEmail.trim()}>
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Add
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-body)]">Billing</CardTitle>
            <CardDescription>Manage your team subscription and seats.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={async () => {
                const res = await fetch('/api/stripe/create-portal', { method: 'POST' })
                const data = await res.json()
                if (data.url) window.location.href = data.url
              }}
            >
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
