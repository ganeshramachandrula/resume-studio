import { Header, Footer, Paragraph, TextRun, AlignmentType } from 'docx'
import { FONT_SIZE, TEXT_SECONDARY, FONT_BODY } from './docx-styles'

/** Creates header/footer watermark for free-plan users */
export function createFreeWatermark() {
  const headerParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: 'Generated with Resume Studio - Free Preview',
        font: FONT_BODY,
        size: FONT_SIZE.watermark,
        color: TEXT_SECONDARY,
        italics: true,
      }),
    ],
  })

  const footerParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: 'Upgrade at resume-studio.io to remove watermark and unlock all features',
        font: FONT_BODY,
        size: FONT_SIZE.watermark,
        color: TEXT_SECONDARY,
        italics: true,
      }),
    ],
  })

  return {
    headers: {
      default: new Header({ children: [headerParagraph] }),
    },
    footers: {
      default: new Footer({ children: [footerParagraph] }),
    },
  }
}
