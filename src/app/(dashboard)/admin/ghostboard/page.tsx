'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Ghost, Trash2, CheckCircle, Flag } from 'lucide-react'

interface Rating {
  id: string
  company_name: string
  company_slug: string
  user_id: string
  overall_rating: number
  ghosting_rating: number
  response_time_rating: number
  interview_quality_rating: number
  review_text: string | null
  is_approved: boolean
  is_flagged: boolean
  created_at: string
}

interface RatingsResponse {
  ratings: Rating[]
  total: number
  page: number
  limit: number
}

export default function AdminGhostboardPage() {
  const [data, setData] = useState<RatingsResponse | null>(null)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [selected, setSelected] = useState<Rating | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const fetchRatings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('filter', filter)
      params.set('page', String(page))
      const res = await fetch(`/api/admin/ghostboard?${params}`)
      if (res.ok) {
        setData(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  function openRating(rating: Rating) {
    setSelected(rating)
    setDeleteConfirm(false)
    setDialogOpen(true)
  }

  async function handleAction(action: 'approve' | 'flag') {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/ghostboard/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        const { data: updated } = await res.json()
        setSelected(updated)
        fetchRatings()
      }
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/ghostboard/${selected.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setDialogOpen(false)
        setSelected(null)
        fetchRatings()
      }
    } finally {
      setActionLoading(false)
    }
  }

  function renderStars(rating: number) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'flagged', 'approved'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter(f); setPage(1) }}
          >
            {f === 'all' ? 'All' : f === 'flagged' ? 'Flagged' : 'Approved'}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-3 font-medium text-gray-500">Date</th>
                  <th className="text-left p-3 font-medium text-gray-500">Company</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden md:table-cell">Rating</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden lg:table-cell">Review</th>
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
                ) : data?.ratings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      <Ghost className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      No ratings found
                    </td>
                  </tr>
                ) : (
                  data?.ratings.map((rating) => (
                    <tr
                      key={rating.id}
                      onClick={() => openRating(rating)}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="p-3 text-gray-500 whitespace-nowrap">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-medium truncate max-w-[180px]">{rating.company_name}</td>
                      <td className="p-3 hidden md:table-cell text-amber-500">
                        {renderStars(rating.overall_rating)}
                      </td>
                      <td className="p-3 hidden lg:table-cell truncate max-w-[200px] text-gray-500">
                        {rating.review_text || '—'}
                      </td>
                      <td className="p-3">
                        {rating.is_flagged ? (
                          <Badge className="bg-red-50 text-red-600 border-red-200">Flagged</Badge>
                        ) : rating.is_approved ? (
                          <Badge className="bg-green-50 text-green-600 border-green-200">Approved</Badge>
                        ) : (
                          <Badge className="bg-gray-50 text-gray-500 border-gray-200">Pending</Badge>
                        )}
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
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((data.page - 1) * data.limit) + 1}–{Math.min(data.page * data.limit, data.total)} of {data.total}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Rating detail dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-body)]">{selected.company_name}</DialogTitle>
                <DialogDescription>
                  Rating submitted {new Date(selected.created_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="flex gap-2">
                  {selected.is_flagged ? (
                    <Badge className="bg-red-50 text-red-600 border-red-200">Flagged</Badge>
                  ) : selected.is_approved ? (
                    <Badge className="bg-green-50 text-green-600 border-green-200">Approved</Badge>
                  ) : (
                    <Badge className="bg-gray-50 text-gray-500 border-gray-200">Pending</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Overall</span>
                    <div className="text-amber-500">{renderStars(selected.overall_rating)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Ghosting</span>
                    <div className="text-amber-500">{renderStars(selected.ghosting_rating)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Response Time</span>
                    <div className="text-amber-500">{renderStars(selected.response_time_rating)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Interview Quality</span>
                    <div className="text-amber-500">{renderStars(selected.interview_quality_rating)}</div>
                  </div>
                </div>

                {selected.review_text && (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selected.review_text}
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2 sm:gap-2">
                {!selected.is_approved && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() => handleAction('approve')}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                  </Button>
                )}
                {!selected.is_flagged && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() => handleAction('flag')}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <Flag className="h-4 w-4 mr-1" /> Flag
                  </Button>
                )}
                {deleteConfirm ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actionLoading}
                    onClick={handleDelete}
                  >
                    {actionLoading ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
