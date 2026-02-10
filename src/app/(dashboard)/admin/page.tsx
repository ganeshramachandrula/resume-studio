'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Crown, FileText, MessageSquare, ArrowRight, ShieldOff, GraduationCap } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  proUsers: number
  freeUsers: number
  disabledUsers: number
  totalDocuments: number
  newMessages: number
  openMessages: number
  totalCoachMessages: number
  activeCoachUsers: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats')
        if (!res.ok) {
          setError('Failed to load stats')
          return
        }
        const data = await res.json()
        setStats(data)
      } catch {
        setError('Failed to load stats')
      }
    }
    loadStats()
  }, [])

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-16 animate-pulse bg-gray-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-brand' },
    { label: 'Pro Users', value: stats.proUsers, icon: Crown, color: 'text-amber-500' },
    { label: 'Free Users', value: stats.freeUsers, icon: Users, color: 'text-gray-500' },
    { label: 'Disabled', value: stats.disabledUsers, icon: ShieldOff, color: 'text-red-500' },
    { label: 'Documents', value: stats.totalDocuments, icon: FileText, color: 'text-accent' },
    { label: 'New Messages', value: stats.newMessages, icon: MessageSquare, color: 'text-orange-500' },
    { label: 'Open Messages', value: stats.openMessages, icon: MessageSquare, color: 'text-blue-500' },
    { label: 'Coach Messages', value: stats.totalCoachMessages, icon: GraduationCap, color: 'text-purple-500' },
    { label: 'Coach Users', value: stats.activeCoachUsers, icon: GraduationCap, color: 'text-indigo-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/users">
          <Card className="hover:border-brand/30 hover:shadow-md transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center justify-between">
                Manage Users
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-brand transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                View, search, and manage user accounts. Change plans, reset usage, disable or delete users.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/messages">
          <Card className="hover:border-brand/30 hover:shadow-md transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center justify-between">
                Support Messages
                {stats.newMessages > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-orange-500 text-white text-xs font-medium">
                    {stats.newMessages}
                  </span>
                )}
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-brand transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Review and respond to support messages from users and visitors.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/coach-usage">
          <Card className="hover:border-brand/30 hover:shadow-md transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-base font-[family-name:var(--font-body)] flex items-center justify-between">
                Coach Usage
                {stats.activeCoachUsers > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-purple-500 text-white text-xs font-medium">
                    {stats.activeCoachUsers}
                  </span>
                )}
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-brand transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Monitor Career Coach usage by user, country, and message volume. Spot abuse.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-[family-name:var(--font-body)]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/admin/users?plan=pro_monthly">
            <Button variant="outline" size="sm">View Pro Monthly Users</Button>
          </Link>
          <Link href="/admin/users?plan=pro_annual">
            <Button variant="outline" size="sm">View Pro Annual Users</Button>
          </Link>
          <Link href="/admin/messages?status=new">
            <Button variant="outline" size="sm">View New Messages</Button>
          </Link>
          <Link href="/admin/coach-usage">
            <Button variant="outline" size="sm">View Coach Usage</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
