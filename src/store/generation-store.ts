import { create } from 'zustand'
import type { DocumentType } from '@/types/database'
import type { GenerationStep, ContactInfo } from '@/types/generation'
import type { FontSizeKey } from '@/lib/templates/types'

const emptyContactInfo: ContactInfo = {
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
}

interface GenerationStore {
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

  // Premium template options (Pro Annual)
  selectedTemplate: string
  selectedFont: string
  selectedFontSize: FontSizeKey

  // Multi-language (Pro Annual)
  language: string
  customLanguage: string

  setStep: (step: GenerationStep) => void
  setJobDescription: (jd: string) => void
  setParsedJD: (parsed: Record<string, unknown>, id: string) => void
  setExperience: (exp: string) => void
  setExperienceId: (id: string) => void
  setContactInfo: (info: Partial<ContactInfo>) => void
  toggleDocument: (type: DocumentType) => void
  setSelectedDocuments: (docs: DocumentType[]) => void
  setGeneratedDocument: (type: string, content: Record<string, unknown>) => void
  setIsGenerating: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedTemplate: (template: string) => void
  setSelectedFont: (font: string) => void
  setSelectedFontSize: (size: FontSizeKey) => void
  setLanguage: (lang: string) => void
  setCustomLanguage: (lang: string) => void
  reset: () => void
}

const initialState = {
  step: 'jd_input' as GenerationStep,
  jobDescription: '',
  parsedJD: null,
  jobDescriptionId: null,
  experience: '',
  experienceId: null,
  contactInfo: emptyContactInfo,
  selectedDocuments: [] as DocumentType[],
  generatedDocuments: {} as Record<string, Record<string, unknown>>,
  isGenerating: false,
  error: null,
  selectedTemplate: 'modern',
  selectedFont: 'helvetica',
  selectedFontSize: 'medium' as FontSizeKey,
  language: 'en',
  customLanguage: '',
}

export const useGenerationStore = create<GenerationStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setParsedJD: (parsedJD, jobDescriptionId) => set({ parsedJD, jobDescriptionId }),
  setExperience: (experience) => set({ experience }),
  setExperienceId: (experienceId) => set({ experienceId }),
  setContactInfo: (info) =>
    set((state) => ({
      contactInfo: { ...state.contactInfo, ...info },
    })),
  toggleDocument: (type) =>
    set((state) => ({
      selectedDocuments: state.selectedDocuments.includes(type)
        ? state.selectedDocuments.filter((d) => d !== type)
        : [...state.selectedDocuments, type],
    })),
  setSelectedDocuments: (selectedDocuments) => set({ selectedDocuments }),
  setGeneratedDocument: (type, content) =>
    set((state) => ({
      generatedDocuments: { ...state.generatedDocuments, [type]: content },
    })),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ error }),
  setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),
  setSelectedFont: (selectedFont) => set({ selectedFont }),
  setSelectedFontSize: (selectedFontSize) => set({ selectedFontSize }),
  setLanguage: (language) => set({ language }),
  setCustomLanguage: (customLanguage) => set({ customLanguage }),
  reset: () => set(initialState),
}))
