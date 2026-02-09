'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Document } from '@/types/database'

export function DocumentViewer({
  document,
  open,
  onClose,
}: {
  document: Document | null
  open: boolean
  onClose: () => void
}) {
  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{document.title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-700">
          <pre className="whitespace-pre-wrap font-[family-name:var(--font-body)]">
            {JSON.stringify(document.content, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  )
}
