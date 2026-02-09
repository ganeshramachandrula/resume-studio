'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import type { Document } from '@/types/database'

export function DocumentCard({
  document,
  onDelete,
}: {
  document: Document
  onDelete: (id: string) => void
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm line-clamp-1">
                {document.title}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(document.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {DOCUMENT_TYPE_LABELS[document.type]}
            </Badge>
            {document.ats_score && (
              <Badge variant="accent" className="text-xs">
                {document.ats_score}% ATS
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Download className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onDelete(document.id)}
            >
              <Trash2 className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
