'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Search, ChevronLeft, ChevronRight, ShieldAlert, Shield, KeyRound, Fingerprint, Copy, Check } from 'lucide-react'
import type { Profile } from '@/types/database'

interface UsersResponse {
  users: Profile[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="animate-pulse text-gray-400">Loading...</div>}>
      <AdminUsersContent />
    </Suspense>
  )
}

function formatRelativeTime(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function AdminUsersContent() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<UsersResponse | null>(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [plan, setPlan] = useState(searchParams.get('plan') || '')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Detail dialog
  const [selected, setSelected] = useState<Profile | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [resetLink, setResetLink] = useState<string | null>(null)
  const [resetLinkCopied, setResetLinkCopied] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (plan) params.set('plan', plan)
      params.set('page', String(page))
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        setData(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }, [search, plan, page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  function openUser(user: Profile) {
    setSelected(user)
    setDialogOpen(true)
    setDeleteConfirm(false)
    setResetLink(null)
    setResetLinkCopied(false)
  }

  async function resetPassword() {
    if (!selected) return
    setActionLoading(true)
    setResetLink(null)
    try {
      const res = await fetch(`/api/admin/users/${selected.id}/reset-password`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setResetLink(data.resetLink || null)
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function clearSignupRestrictions() {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signup_ip: null, signup_device_id: null }),
      })
      if (res.ok) {
        const { user } = await res.json()
        setSelected(user)
        fetchUsers()
      }
    } finally {
      setActionLoading(false)
    }
  }

  function copyResetLink() {
    if (!resetLink) return
    navigator.clipboard.writeText(resetLink)
    setResetLinkCopied(true)
    setTimeout(() => setResetLinkCopied(false), 2000)
  }

  async function updateUser(updates: Record<string, unknown>) {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const { user } = await res.json()
        setSelected(user)
        fetchUsers()
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function deleteUser() {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${selected.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDialogOpen(false)
        setSelected(null)
        fetchUsers()
      }
    } finally {
      setActionLoading(false)
    }
  }

  function planBadge(p: string) {
    if (p === 'basic' || p === 'pro') {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">{p === 'basic' ? 'Basic' : 'Pro'}</Badge>
    }
    return <Badge variant="secondary">Free</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <select
          value={plan}
          onChange={(e) => { setPlan(e.target.value); setPage(1) }}
          className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-3 font-medium text-gray-500">Email</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden md:table-cell">Name</th>
                  <th className="text-left p-3 font-medium text-gray-500">Plan</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden lg:table-cell">Usage</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden lg:table-cell">Coach</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden xl:table-cell">Country</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden lg:table-cell">Status</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden xl:table-cell">Joined</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden xl:table-cell">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {loading && !data ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td colSpan={9} className="p-3"><div className="h-5 animate-pulse bg-gray-100 rounded" /></td>
                    </tr>
                  ))
                ) : data?.users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">No users found</td>
                  </tr>
                ) : (
                  data?.users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => openUser(user)}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {user.role === 'admin' && <Shield className="h-3.5 w-3.5 text-brand" />}
                          <span className="truncate max-w-[200px]">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell text-gray-600">{user.full_name || '—'}</td>
                      <td className="p-3">{planBadge(user.plan)}</td>
                      <td className="p-3 hidden lg:table-cell text-gray-600">{user.usage_count}</td>
                      <td className="p-3 hidden lg:table-cell text-gray-600">
                        {user.coach_messages_count > 0 ? (
                          <span className={user.coach_messages_count >= 80 ? 'text-red-600 font-medium' : ''}>
                            {user.coach_messages_count}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="p-3 hidden xl:table-cell text-gray-500">{user.country || '—'}</td>
                      <td className="p-3 hidden lg:table-cell">
                        {user.is_disabled ? (
                          <Badge variant="destructive">Disabled</Badge>
                        ) : (
                          <Badge className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                        )}
                      </td>
                      <td className="p-3 hidden xl:table-cell text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 hidden xl:table-cell text-gray-500">
                        {user.last_login_at ? formatRelativeTime(user.last_login_at) : 'Never'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((data.page - 1) * data.limit) + 1}–{Math.min(data.page * data.limit, data.total)} of {data.total}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* User detail dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-body)]">
                  {selected.full_name || selected.email}
                </DialogTitle>
                <DialogDescription>{selected.email}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Role badge */}
                <div className="flex items-center gap-2">
                  {selected.role === 'admin' ? (
                    <Badge className="bg-brand/10 text-brand border-brand/20">
                      <ShieldAlert className="h-3 w-3 mr-1" />Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary">User</Badge>
                  )}
                  {selected.is_disabled && (
                    <Badge variant="destructive">Disabled</Badge>
                  )}
                </div>

                {/* Plan selector */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Plan</label>
                  <select
                    value={selected.plan}
                    onChange={(e) => updateUser({ plan: e.target.value })}
                    disabled={actionLoading}
                    className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Usage Count</p>
                    <p className="font-medium">{selected.usage_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Saved Apps</p>
                    <p className="font-medium">{selected.saved_applications_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Coach Messages</p>
                    <p className={`font-medium ${selected.coach_messages_count >= 80 ? 'text-red-600' : ''}`}>
                      {selected.coach_messages_count}{selected.coach_messages_count >= 80 ? ' (high)' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Country</p>
                    <p className="font-medium">{selected.country || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Joined</p>
                    <p className="font-medium">{new Date(selected.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Login</p>
                    <p className="font-medium">{selected.last_login_at ? formatRelativeTime(selected.last_login_at) : 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Stripe ID</p>
                    <p className="font-medium text-xs truncate">{selected.stripe_customer_id || '—'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => updateUser({ usage_count: 0 })}
                  >
                    Reset Usage
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={resetPassword}
                  >
                    <KeyRound className="h-3.5 w-3.5 mr-1" />
                    Reset Password
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={clearSignupRestrictions}
                  >
                    <Fingerprint className="h-3.5 w-3.5 mr-1" />
                    Clear Signup Restrictions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => updateUser({ is_disabled: !selected.is_disabled })}
                  >
                    {selected.is_disabled ? 'Enable' : 'Disable'} Account
                  </Button>
                </div>

                {/* Password reset link */}
                {resetLink && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-green-800">Password reset link generated</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-white p-2 rounded border border-green-200 break-all select-all">
                        {resetLink}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyResetLink}
                        className="shrink-0"
                      >
                        {resetLinkCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    <p className="text-xs text-green-600">Share this link with the user. It expires in 24 hours.</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {!deleteConfirm ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirm(true)}
                  >
                    Delete User
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600">Are you sure?</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={actionLoading}
                      onClick={deleteUser}
                    >
                      {actionLoading ? 'Deleting...' : 'Yes, Delete'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
