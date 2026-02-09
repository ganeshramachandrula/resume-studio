'use client'

import { DocumentCard } from './document-card'
import type { Document } from '@/types/database'

export function DocumentList({
  documents,
  onDelete,
}: {
  documents: Document[]
  onDelete: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
      ))}
    </div>
  )
}
