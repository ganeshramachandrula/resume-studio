import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  TabStopType,
  TabStopPosition,
  BorderStyle,
  LevelFormat,
  convertInchesToTwip,
  Packer,
} from 'docx'
import type { ResumeData } from '@/types/documents'
import {
  BRAND_COLOR,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  FONT_HEADING,
  FONT_BODY,
  FONT_SIZE,
  SPACING,
} from './docx-styles'
import { createFreeWatermark } from './docx-watermark'

const RIGHT_TAB = TabStopPosition.MAX

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: SPACING.sectionGap, after: SPACING.paragraphGap },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: BRAND_COLOR, space: 2 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        font: FONT_HEADING,
        size: FONT_SIZE.sectionHeading,
        color: BRAND_COLOR,
      }),
    ],
  })
}

function contactLine(items: (string | null | undefined)[]): Paragraph {
  const filtered = items.filter(Boolean) as string[]
  const children: TextRun[] = []
  filtered.forEach((item, i) => {
    if (i > 0) {
      children.push(new TextRun({ text: '  |  ', font: FONT_BODY, size: FONT_SIZE.small, color: TEXT_SECONDARY }))
    }
    children.push(new TextRun({ text: item, font: FONT_BODY, size: FONT_SIZE.small, color: TEXT_SECONDARY }))
  })
  return new Paragraph({ alignment: AlignmentType.CENTER, children })
}

export async function resumeToDocxBlob(data: ResumeData, showWatermark: boolean): Promise<Blob> {
  const children: Paragraph[] = []

  // Header: Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: data.header.name,
          bold: true,
          font: FONT_HEADING,
          size: FONT_SIZE.name,
          color: TEXT_PRIMARY,
        }),
      ],
    })
  )

  // Header: Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: data.header.title,
          font: FONT_BODY,
          size: FONT_SIZE.title,
          color: BRAND_COLOR,
        }),
      ],
    })
  )

  // Header: Contact info
  children.push(
    contactLine([
      data.header.email,
      data.header.phone,
      data.header.location,
      data.header.linkedin,
      data.header.website,
    ])
  )

  // Summary
  children.push(sectionHeading('Summary'))
  children.push(
    new Paragraph({
      spacing: { after: SPACING.paragraphGap },
      children: [
        new TextRun({ text: data.summary, font: FONT_BODY, size: FONT_SIZE.body, color: TEXT_PRIMARY }),
      ],
    })
  )

  // Experience
  if (data.experience?.length) {
    children.push(sectionHeading('Experience'))
    for (const exp of data.experience) {
      // Title + dates (right-aligned via tab stop)
      children.push(
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
          spacing: { before: SPACING.paragraphGap, after: 20 },
          children: [
            new TextRun({ text: exp.title, bold: true, font: FONT_BODY, size: FONT_SIZE.body, color: TEXT_PRIMARY }),
            new TextRun({ text: '\t', font: FONT_BODY, size: FONT_SIZE.body }),
            new TextRun({ text: `${exp.start_date} — ${exp.end_date}`, font: FONT_BODY, size: FONT_SIZE.small, color: TEXT_SECONDARY }),
          ],
        })
      )
      // Company + location
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${exp.company}  |  ${exp.location}`, font: FONT_BODY, size: FONT_SIZE.small, color: TEXT_SECONDARY }),
          ],
        })
      )
      // Bullets
      for (const bullet of exp.bullets || []) {
        children.push(
          new Paragraph({
            numbering: { reference: 'resume-bullets', level: 0 },
            spacing: { after: SPACING.bulletGap },
            children: [
              new TextRun({ text: bullet, font: FONT_BODY, size: FONT_SIZE.body, color: TEXT_PRIMARY }),
            ],
          })
        )
      }
    }
  }

  // Education
  if (data.education?.length) {
    children.push(sectionHeading('Education'))
    for (const edu of data.education) {
      children.push(
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
          spacing: { before: SPACING.paragraphGap, after: 20 },
          children: [
            new TextRun({ text: `${edu.degree} in ${edu.field}`, bold: true, font: FONT_BODY, size: FONT_SIZE.body, color: TEXT_PRIMARY }),
            new TextRun({ text: '\t', font: FONT_BODY, size: FONT_SIZE.body }),
            new TextRun({ text: edu.graduation_date, font: FONT_BODY, size: FONT_SIZE.small, color: TEXT_SECONDARY }),
          ],
        })
      )
      const details = [edu.institution, edu.gpa ? `GPA: ${edu.gpa}` : null, edu.honors].filter(Boolean).join('  |  ')
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: details, font: FONT_BODY, size: FONT_SIZE.small, color: TEXT_SECONDARY }),
          ],
        })
      )
    }
  }

  // Skills
  children.push(sectionHeading('Skills'))
  const skillGroups: Array<{ label: string; items: string[] }> = [
    { label: 'Core', items: data.skills?.core || [] },
    { label: 'Interpersonal', items: data.skills?.interpersonal || [] },
    { label: 'Tools', items: data.skills?.tools || [] },
  ]
  for (const group of skillGroups) {
    if (group.items.length === 0) continue
    children.push(
      new Paragraph({
        spacing: { after: SPACING.bulletGap },
        children: [
          new TextRun({ text: `${group.label}: `, bold: true, font: FONT_BODY, size: FONT_SIZE.body, color: TEXT_PRIMARY }),
          new TextRun({ text: group.items.join(', '), font: FONT_BODY, size: FONT_SIZE.body, color: TEXT_PRIMARY }),
        ],
      })
    )
  }

  // Certifications
  if (data.certifications?.length) {
    children.push(sectionHeading('Certifications'))
    for (const cert of data.certifications) {
      children.push(
        new Paragraph({
          numbering: { reference: 'resume-bullets', level: 0 },
          spacing: { after: SPACING.bulletGap },
          children: [
            new TextRun({ text: cert, font: FONT_BODY, size: FONT_SIZE.body, color: TEXT_PRIMARY }),
          ],
        })
      )
    }
  }

  const watermark = showWatermark ? createFreeWatermark() : {}

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'resume-bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '\u2022',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.15) } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.6),
              bottom: convertInchesToTwip(0.6),
              left: convertInchesToTwip(0.7),
              right: convertInchesToTwip(0.7),
            },
          },
        },
        ...watermark,
        children,
      },
    ],
  })

  return Packer.toBlob(doc)
}
