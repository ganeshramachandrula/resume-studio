import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  LevelFormat,
  convertInchesToTwip,
  Packer,
} from 'docx'
import type { DocumentType } from '@/types/database'
import type {
  CoverLetterData,
  LinkedInData,
  ColdEmailData,
  InterviewPrepData,
  CertificationGuideData,
  FollowUpEmailData,
} from '@/types/documents'
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

function heading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: SPACING.sectionGap, after: SPACING.paragraphGap },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: BRAND_COLOR, space: 2 },
    },
    children: [
      new TextRun({
        text,
        bold: true,
        font: FONT_HEADING,
        size: FONT_SIZE.sectionHeading,
        color: BRAND_COLOR,
      }),
    ],
  })
}

function bodyParagraph(text: string, opts?: { bold?: boolean; italic?: boolean; spacing?: number }): Paragraph {
  return new Paragraph({
    spacing: { after: opts?.spacing ?? SPACING.paragraphGap },
    children: [
      new TextRun({
        text,
        font: FONT_BODY,
        size: FONT_SIZE.body,
        color: TEXT_PRIMARY,
        bold: opts?.bold,
        italics: opts?.italic,
      }),
    ],
  })
}

function labeledParagraph(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: SPACING.paragraphGap },
    children: [
      new TextRun({ text: `${label}: `, bold: true, font: FONT_BODY, size: FONT_SIZE.body, color: TEXT_SECONDARY }),
      new TextRun({ text: value, font: FONT_BODY, size: FONT_SIZE.body, color: TEXT_PRIMARY }),
    ],
  })
}

function bulletItem(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: 'doc-bullets', level: 0 },
    spacing: { after: SPACING.bulletGap },
    children: [
      new TextRun({ text, font: FONT_BODY, size: FONT_SIZE.body, color: TEXT_PRIMARY }),
    ],
  })
}

function separator(): Paragraph {
  return new Paragraph({
    spacing: { before: SPACING.sectionGap, after: SPACING.sectionGap },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB', space: 4 } },
    children: [],
  })
}

function buildCoverLetter(d: CoverLetterData): Paragraph[] {
  return [
    bodyParagraph(`${d.greeting},`, { bold: true }),
    bodyParagraph(d.opening_paragraph),
    ...(d.body_paragraphs || []).map((p) => bodyParagraph(p)),
    bodyParagraph(d.closing_paragraph),
    bodyParagraph(d.sign_off, { bold: true }),
  ]
}

function buildLinkedIn(d: LinkedInData): Paragraph[] {
  return [
    heading('LinkedIn Headline'),
    bodyParagraph(d.headline, { bold: true }),
    heading('About'),
    bodyParagraph(d.summary),
    heading('Suggested Skills'),
    bodyParagraph(d.suggested_skills?.join(', ') || ''),
  ]
}

function buildColdEmail(d: ColdEmailData): Paragraph[] {
  return [
    labeledParagraph('Subject', d.subject_line),
    bodyParagraph(d.body),
    separator(),
    heading('Follow-Up Email'),
    labeledParagraph('Subject', d.follow_up_subject),
    bodyParagraph(d.follow_up_body),
  ]
}

function buildInterviewPrep(d: InterviewPrepData): Paragraph[] {
  const paragraphs: Paragraph[] = []
  const sections = [
    { title: 'Behavioral Questions', items: d.behavioral_questions },
    { title: 'Technical Questions', items: d.technical_questions },
    { title: 'Situational Questions', items: d.situational_questions },
    { title: 'Role-Specific Questions', items: d.role_specific_questions },
  ]
  for (const section of sections) {
    paragraphs.push(heading(section.title))
    for (const q of section.items || []) {
      paragraphs.push(bodyParagraph(q.question, { bold: true }))
      paragraphs.push(labeledParagraph('Why asked', q.why_asked))
      paragraphs.push(bodyParagraph(q.model_answer))
      paragraphs.push(bodyParagraph(`Tip: ${q.tips}`, { italic: true, spacing: SPACING.sectionGap }))
    }
  }
  if (d.questions_to_ask?.length) {
    paragraphs.push(heading('Questions to Ask'))
    for (const q of d.questions_to_ask) {
      paragraphs.push(bulletItem(`${q.question} — ${q.why_impressive}`))
    }
  }
  return paragraphs
}

function buildCertificationGuide(d: CertificationGuideData): Paragraph[] {
  const paragraphs: Paragraph[] = []
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: SPACING.paragraphGap },
      children: [
        new TextRun({ text: `Certification Guide — ${d.role_title}`, bold: true, font: FONT_HEADING, size: FONT_SIZE.name, color: TEXT_PRIMARY }),
      ],
    })
  )
  paragraphs.push(bodyParagraph(d.summary))

  const tierLabels: Record<string, string> = { must_have: 'Must-Have', strongly_recommended: 'Strongly Recommended', nice_to_have: 'Nice-to-Have' }
  for (const tier of ['must_have', 'strongly_recommended', 'nice_to_have'] as const) {
    const certs = d.certifications?.filter((c) => c.priority === tier)
    if (!certs?.length) continue
    paragraphs.push(heading(tierLabels[tier]))
    for (const c of certs) {
      paragraphs.push(bodyParagraph(c.name, { bold: true }))
      paragraphs.push(labeledParagraph('Issuing Body', c.issuing_body))
      paragraphs.push(bodyParagraph(`Difficulty: ${c.difficulty} | Cost: ${c.estimated_cost} | Duration: ${c.duration}`))
      paragraphs.push(bodyParagraph(c.why_it_helps))
      paragraphs.push(bodyParagraph(`Salary Impact: ${c.salary_impact}`, { italic: true, spacing: SPACING.sectionGap }))
    }
  }

  if (d.learning_path?.length) {
    paragraphs.push(heading('Suggested Learning Path'))
    d.learning_path.forEach((step, i) => {
      paragraphs.push(bodyParagraph(`${i + 1}. ${step}`))
    })
  }

  if (d.industry_insights) {
    paragraphs.push(heading('Industry Insights'))
    paragraphs.push(bodyParagraph(d.industry_insights))
  }

  return paragraphs
}

function buildFollowUpEmail(d: FollowUpEmailData): Paragraph[] {
  const paragraphs: Paragraph[] = [
    labeledParagraph('Subject', d.subject_line),
    bodyParagraph(d.body),
  ]
  if (d.key_points_referenced?.length) {
    paragraphs.push(heading('Key Points Referenced'))
    for (const p of d.key_points_referenced) {
      paragraphs.push(bulletItem(p))
    }
  }
  paragraphs.push(labeledParagraph('Next Steps', d.next_steps))
  paragraphs.push(separator())
  paragraphs.push(heading('Shorter Alternative'))
  paragraphs.push(bodyParagraph(d.alternative_shorter_version))
  return paragraphs
}

export async function documentToDocxBlob(
  type: DocumentType,
  content: Record<string, unknown>,
  showWatermark: boolean
): Promise<Blob> {
  let children: Paragraph[]

  switch (type) {
    case 'cover_letter':
      children = buildCoverLetter(content as unknown as CoverLetterData)
      break
    case 'linkedin_summary':
      children = buildLinkedIn(content as unknown as LinkedInData)
      break
    case 'cold_email':
      children = buildColdEmail(content as unknown as ColdEmailData)
      break
    case 'interview_prep':
      children = buildInterviewPrep(content as unknown as InterviewPrepData)
      break
    case 'certification_guide':
      children = buildCertificationGuide(content as unknown as CertificationGuideData)
      break
    case 'follow_up_email':
      children = buildFollowUpEmail(content as unknown as FollowUpEmailData)
      break
    default:
      children = [bodyParagraph(JSON.stringify(content, null, 2))]
  }

  const watermark = showWatermark ? createFreeWatermark() : {}

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'doc-bullets',
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
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
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
