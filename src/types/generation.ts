import type { DocumentType } from './database'

export type GenerationStep = 'jd_input' | 'experience_input' | 'select_documents' | 'review'

export interface ContactInfo {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string
}

export interface GenerationState {
  step: GenerationStep
  jobDescription: string
  parsedJD: Record<string, unknown> | null
  jobDescriptionId: string | null
  experience: string
  experienceId: string | null
  contactInfo: ContactInfo
  selectedDocuments: DocumentType[]
  generatedDocuments: Record<string, Record<string, unknown>>
  isGenerating: boolean
  error: string | null
}
