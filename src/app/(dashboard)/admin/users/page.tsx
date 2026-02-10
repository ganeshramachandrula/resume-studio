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
import { Search, ChevronLeft, ChevronRight, ShieldAlert, Shield } from 'lucide-react'
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
    if (p === 'pro_monthly' || p === 'pro_annual') {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">{p === 'pro_monthly' ? 'Pro Monthly' : 'Pro Annual'}</Badge>
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
          <option value="pro_monthly">Pro Monthly</option>
          <option value="pro_annual">Pro Annual</option>
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
                </tr>
              </thead>
              <tbody>
                {loading && !data ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td colSpan={8} className="p-3"><div className="h-5 animate-pulse bg-gray-100 rounded" /></td>
                    </tr>
                  ))
                ) : data?.users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">No users found</td>
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
                    <option value="pro_monthly">Pro Monthly</option>
                    <option value="pro_annual">Pro Annual</option>
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
                    onClick={() => updateUser({ is_disabled: !selected.is_disabled })}
                  >
                    {selected.is_disabled ? 'Enable' : 'Disable'} Account
                  </Button>
                </div>
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
