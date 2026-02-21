'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Globe, AlertTriangle } from 'lucide-react'

interface CoachUser {
  id: string
  email: string
  full_name: string | null
  plan: string
  coach_messages_count: number
  country: string | null
  updated_at: string
}

interface CountryEntry {
  country: string
  users: number
  messages: number
}

interface CoachUsageData {
  topUsers: CoachUser[]
  countryBreakdown: CountryEntry[]
}

export default function CoachUsagePage() {
  const [data, setData] = useState<CoachUsageData | null>(null)
  const [sortBy, setSortBy] = useState<'count' | 'recent'>('count')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (sortBy === 'recent') params.set('sort', 'recent')
        const res = await fetch(`/api/admin/coach-usage?${params}`)
        if (res.ok) {
          setData(await res.json())
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sortBy])

  if (loading && !data) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-gray-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return <p className="text-red-500">Failed to load coach usage data.</p>
  }

  const totalMessages = data.topUsers.reduce((sum, u) => sum + u.coach_messages_count, 0)

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.topUsers.length}</p>
                <p className="text-xs text-gray-500">Active Coach Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalMessages}</p>
                <p className="text-xs text-gray-500">Total Coach Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.countryBreakdown.length}</p>
                <p className="text-xs text-gray-500">Countries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-[family-name:var(--font-body)]">
            Top Coach Users
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={sortBy === 'count' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('count')}
            >
              By Messages
            </Button>
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('recent')}
            >
              Recent
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-3 font-medium text-gray-500">#</th>
                  <th className="text-left p-3 font-medium text-gray-500">Email</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden md:table-cell">Name</th>
                  <th className="text-left p-3 font-medium text-gray-500">Plan</th>
                  <th className="text-left p-3 font-medium text-gray-500">Messages</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden md:table-cell">Country</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden lg:table-cell">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {data.topUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      No coach usage yet.
                    </td>
                  </tr>
                ) : (
                  data.topUsers.map((user, i) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 text-gray-400">{i + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {user.coach_messages_count >= 80 && (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          )}
                          <span className="truncate max-w-[200px]">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell text-gray-600">{user.full_name || '—'}</td>
                      <td className="p-3">
                        <Badge className={
                          user.plan === 'pro'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : user.plan === 'basic'
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-gray-100 text-gray-600'
                        }>
                          {user.plan === 'pro' ? 'Pro' : user.plan === 'basic' ? 'Basic' : 'Free'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className={`font-medium ${user.coach_messages_count >= 80 ? 'text-red-600' : user.coach_messages_count >= 50 ? 'text-amber-600' : 'text-gray-900'}`}>
                          {user.coach_messages_count}
                        </span>
                        <span className="text-gray-400 text-xs"> / 100</span>
                      </td>
                      <td className="p-3 hidden md:table-cell text-gray-500">{user.country || '—'}</td>
                      <td className="p-3 hidden lg:table-cell text-gray-500">
                        {new Date(user.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Country Breakdown */}
      {data.countryBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-[family-name:var(--font-body)]">
              Usage by Country
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-3 font-medium text-gray-500">Country</th>
                    <th className="text-left p-3 font-medium text-gray-500">Users</th>
                    <th className="text-left p-3 font-medium text-gray-500">Messages</th>
                    <th className="text-left p-3 font-medium text-gray-500">Avg/User</th>
                  </tr>
                </thead>
                <tbody>
                  {data.countryBreakdown.map((entry) => (
                    <tr key={entry.country} className="border-b border-gray-50">
                      <td className="p-3 font-medium">{entry.country}</td>
                      <td className="p-3 text-gray-600">{entry.users}</td>
                      <td className="p-3 text-gray-600">{entry.messages}</td>
                      <td className="p-3 text-gray-600">{Math.round(entry.messages / entry.users)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
