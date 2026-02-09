import type { DocumentType } from './database'

export type GenerationStep = 'jd_input' | 'experience_input' | 'select_documents' | 'review'

export interface GenerationState {
  step: GenerationStep
  jobDescription: string
  parsedJD: Record<string, unknown> | null
  jobDescriptionId: string | null
  experience: string
  experienceId: string | null
  selectedDocuments: DocumentType[]
  generatedDocuments: Record<string, Record<string, unknown>>
  isGenerating: boolean
  error: string | null
}
