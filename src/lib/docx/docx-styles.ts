/** Shared DOCX style constants matching the Resume Studio brand */

export const BRAND_COLOR = '1A56DB'
export const ACCENT_COLOR = '10B981'
export const TEXT_PRIMARY = '111827' // gray-900
export const TEXT_SECONDARY = '6B7280' // gray-500
export const BORDER_COLOR = 'D1D5DB' // gray-300

export const FONT_HEADING = 'Calibri'
export const FONT_BODY = 'Calibri'

export const FONT_SIZE = {
  name: 28, // 14pt
  title: 22, // 11pt
  sectionHeading: 22, // 11pt
  body: 20, // 10pt
  small: 18, // 9pt
  watermark: 16, // 8pt
} as const

export const SPACING = {
  sectionGap: 200, // ~10pt before section
  paragraphGap: 80, // ~4pt between paragraphs
  bulletGap: 40, // ~2pt between bullets
} as const
