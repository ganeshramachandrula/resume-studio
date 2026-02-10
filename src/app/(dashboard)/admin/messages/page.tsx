'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { SUPPORT_CATEGORIES, SUPPORT_STATUSES, SUPPORT_CATEGORY_LABELS, SUPPORT_STATUS_LABELS } from '@/lib/constants'
import type { SupportMessage } from '@/types/database'

interface MessagesResponse {
  messages: SupportMessage[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function statusColor(status: string) {
  switch (status) {
    case 'new': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'resolved': return 'bg-green-100 text-green-700 border-green-200'
    case 'closed': return 'bg-gray-100 text-gray-500 border-gray-200'
    default: return ''
  }
}

function categoryColor(category: string) {
  switch (category) {
    case 'bug': return 'bg-red-50 text-red-600 border-red-200'
    case 'feature': return 'bg-purple-50 text-purple-600 border-purple-200'
    case 'billing': return 'bg-amber-50 text-amber-600 border-amber-200'
    default: return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

export default function AdminMessagesPage() {
  const [data, setData] = useState<MessagesResponse | null>(null)
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Detail dialog
  const [selected, setSelected] = useState<SupportMessage | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (category) params.set('category', category)
      params.set('page', String(page))
      const res = await fetch(`/api/admin/messages?${params}`)
      if (res.ok) {
        setData(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }, [status, category, page])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  function openMessage(msg: SupportMessage) {
    setSelected(msg)
    setNotes(msg.admin_notes || '')
    setDialogOpen(true)
  }

  async function updateMessage(updates: Record<string, unknown>) {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/messages/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const { message } = await res.json()
        setSelected(message)
        fetchMessages()
      }
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">All Statuses</option>
          {SUPPORT_STATUSES.map((s) => (
            <option key={s} value={s}>{SUPPORT_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">All Categories</option>
          {SUPPORT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{SUPPORT_CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-3 font-medium text-gray-500">Date</th>
                  <th className="text-left p-3 font-medium text-gray-500">Email</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden md:table-cell">Subject</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden lg:table-cell">Category</th>
                  <th className="text-left p-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && !data ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td colSpan={5} className="p-3"><div className="h-5 animate-pulse bg-gray-100 rounded" /></td>
                    </tr>
                  ))
                ) : data?.messages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      No messages found
                    </td>
                  </tr>
                ) : (
                  data?.messages.map((msg) => (
                    <tr
                      key={msg.id}
                      onClick={() => openMessage(msg)}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="p-3 text-gray-500 whitespace-nowrap">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 truncate max-w-[180px]">{msg.email}</td>
                      <td className="p-3 hidden md:table-cell truncate max-w-[200px]">{msg.subject}</td>
                      <td className="p-3 hidden lg:table-cell">
                        <Badge className={categoryColor(msg.category)}>{SUPPORT_CATEGORY_LABELS[msg.category]}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={statusColor(msg.status)}>{SUPPORT_STATUS_LABELS[msg.status]}</Badge>
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

      {/* Message detail dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-body)]">{selected.subject}</DialogTitle>
                <DialogDescription>
                  From {selected.name || 'Anonymous'} ({selected.email}) &middot;{' '}
                  {new Date(selected.created_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="flex gap-2">
                  <Badge className={categoryColor(selected.category)}>
                    {SUPPORT_CATEGORY_LABELS[selected.category]}
                  </Badge>
                  <Badge className={statusColor(selected.status)}>
                    {SUPPORT_STATUS_LABELS[selected.status]}
                  </Badge>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selected.message}
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  <select
                    value={selected.status}
                    onChange={(e) => updateMessage({ status: e.target.value })}
                    disabled={actionLoading}
                    className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
                  >
                    {SUPPORT_STATUSES.map((s) => (
                      <option key={s} value={s}>{SUPPORT_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                {/* Admin notes */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Admin Notes</label>
                  <Textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Internal notes..."
                    className="resize-none"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  size="sm"
                  disabled={actionLoading || notes === (selected.admin_notes || '')}
                  onClick={() => updateMessage({ admin_notes: notes })}
                >
                  {actionLoading ? 'Saving...' : 'Save Notes'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
