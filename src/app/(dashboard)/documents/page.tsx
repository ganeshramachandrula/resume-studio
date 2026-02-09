'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DocumentList } from '@/components/documents/document-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Search } from 'lucide-react'
import Link from 'next/link'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import type { Document, DocumentType } from '@/types/database'

const filterOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'resume', label: 'Resumes' },
  { value: 'cover_letter', label: 'Cover Letters' },
  { value: 'linkedin_summary', label: 'LinkedIn' },
  { value: 'cold_email', label: 'Cold Emails' },
  { value: 'interview_prep', label: 'Interview Prep' },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    const supabase = createClient()
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setDocuments(data as Document[])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('documents').delete().eq('id', id)
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  const filtered = documents.filter((doc) => {
    if (filter !== 'all' && doc.type !== filter) return false
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">Browse and manage your generated documents.</p>
        </div>
        <Link href="/generate">
          <Button>Generate New</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {filterOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={filter === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(opt.value)}
              className="whitespace-nowrap"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
          <p className="text-gray-500 mb-4">
            {documents.length === 0
              ? 'Generate your first document to get started.'
              : 'Try adjusting your search or filter.'}
          </p>
          {documents.length === 0 && (
            <Link href="/generate">
              <Button>Generate Document</Button>
            </Link>
          )}
        </div>
      ) : (
        <DocumentList documents={filtered} onDelete={handleDelete} />
      )}
    </div>
  )
}
