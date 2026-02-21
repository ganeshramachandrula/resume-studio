'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DocumentChatEditor } from '@/components/documents/document-chat-editor'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import type { Document, DocumentType } from '@/types/database'

export default function DocumentEditPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDocument() {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (fetchError || !data) {
        setError('Document not found or you do not have access.')
        setLoading(false)
        return
      }

      setDocument(data as Document)
      setLoading(false)
    }
    void loadDocument()
  }, [documentId])

  const handleSave = async (updatedContent: Record<string, unknown>) => {
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('documents')
      .update({ content: updatedContent, updated_at: new Date().toISOString() })
      .eq('id', documentId)

    if (updateError) throw new Error('Failed to save document')
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-gray-500 mb-4">{error || 'Document not found.'}</p>
        <Button variant="outline" onClick={() => router.push('/documents')}>
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-gray-900">Edit with AI</h1>
          <p className="text-gray-500 mt-1">
            {document.title} &middot; {DOCUMENT_TYPE_LABELS[document.type] || document.type}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/documents')}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      <DocumentChatEditor
        documentId={document.id}
        documentType={document.type as DocumentType}
        initialContent={document.content}
        onSave={handleSave}
      />
    </div>
  )
}
