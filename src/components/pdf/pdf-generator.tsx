'use client'

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import type { ResumeData } from '@/types/documents'
import type { FontSizeKey } from '@/lib/templates/types'
import { getTemplateEntry } from '@/lib/templates/all-templates'

// Dynamic imports to avoid SSR issues with react-pdf
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
)

import { ModernTemplate } from './resume-templates/modern'
import { ClassicTemplate } from './resume-templates/classic'
import { MinimalTemplate } from './resume-templates/minimal'
import { ConfigurableTemplate } from './resume-templates/configurable-template'

const freeTemplates: Record<string, React.ComponentType<{ data: ResumeData; watermark?: boolean }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
}

export function PDFGenerator({
  data,
  template = 'modern',
  fileName = 'resume.pdf',
  showWatermark = false,
  fontOverride,
  fontSizeOverride,
}: {
  data: ResumeData
  template?: string
  fileName?: string
  showWatermark?: boolean
  fontOverride?: string
  fontSizeOverride?: FontSizeKey
}) {
  // Check if it's a premium template with a config
  const entry = getTemplateEntry(template)
  const isPremium = entry?.premium && entry?.config
  const FreeComponent = freeTemplates[template]

  const doc = isPremium ? (
    <ConfigurableTemplate
      data={data}
      config={entry.config!}
      fontOverride={fontOverride}
      fontSizeOverride={fontSizeOverride}
      watermark={showWatermark}
    />
  ) : FreeComponent ? (
    <FreeComponent data={data} watermark={showWatermark} />
  ) : (
    <ModernTemplate data={data} watermark={showWatermark} />
  )

  return (
    <PDFDownloadLink document={doc} fileName={fileName}>
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
