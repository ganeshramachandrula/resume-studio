'use client'

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import type { ResumeData } from '@/types/documents'

// Dynamic imports to avoid SSR issues with react-pdf
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
)

import { ModernTemplate } from './resume-templates/modern'
import { ClassicTemplate } from './resume-templates/classic'
import { MinimalTemplate } from './resume-templates/minimal'

const templates: Record<string, React.ComponentType<{ data: ResumeData }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
}

export function PDFGenerator({
  data,
  template = 'modern',
  fileName = 'resume.pdf',
}: {
  data: ResumeData
  template?: string
  fileName?: string
}) {
  const TemplateComponent = templates[template] || templates.modern

  return (
    <PDFDownloadLink
      document={<TemplateComponent data={data} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <Button variant="accent" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Preparing PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" /> Download PDF
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
