import { describe, it, expect, beforeEach } from 'vitest'
import { useGenerationStore } from '@/store/generation-store'

describe('generation-store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useGenerationStore.getState().reset()
  })

  describe('initial state', () => {
    it('has correct default values', () => {
      const state = useGenerationStore.getState()
      expect(state.step).toBe('jd_input')
      expect(state.jobDescription).toBe('')
      expect(state.parsedJD).toBeNull()
      expect(state.jobDescriptionId).toBeNull()
      expect(state.experience).toBe('')
      expect(state.experienceId).toBeNull()
      expect(state.contactInfo).toEqual({
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
      })
      expect(state.selectedDocuments).toEqual([])
      expect(state.generatedDocuments).toEqual({})
      expect(state.isGenerating).toBe(false)
      expect(state.error).toBeNull()
      expect(state.selectedTemplate).toBe('modern')
      expect(state.selectedFont).toBe('helvetica')
      expect(state.selectedFontSize).toBe('medium')
      expect(state.language).toBe('en')
      expect(state.customLanguage).toBe('')
    })
  })

  describe('setStep', () => {
    it('updates the step', () => {
      useGenerationStore.getState().setStep('experience_input')
      expect(useGenerationStore.getState().step).toBe('experience_input')
    })

    it('can set step to review', () => {
      useGenerationStore.getState().setStep('review')
      expect(useGenerationStore.getState().step).toBe('review')
    })
  })

  describe('setJobDescription', () => {
    it('updates the job description', () => {
      useGenerationStore.getState().setJobDescription('Full-stack developer wanted')
      expect(useGenerationStore.getState().jobDescription).toBe('Full-stack developer wanted')
    })
  })

  describe('setParsedJD', () => {
    it('sets both parsedJD and jobDescriptionId', () => {
      const parsed = { title: 'Engineer', skills: ['React'] }
      useGenerationStore.getState().setParsedJD(parsed, 'jd-123')
      const state = useGenerationStore.getState()
      expect(state.parsedJD).toEqual(parsed)
      expect(state.jobDescriptionId).toBe('jd-123')
    })
  })

  describe('setExperience / setExperienceId', () => {
    it('sets experience text', () => {
      useGenerationStore.getState().setExperience('5 years at Google')
      expect(useGenerationStore.getState().experience).toBe('5 years at Google')
    })

    it('sets experience id', () => {
      useGenerationStore.getState().setExperienceId('exp-456')
      expect(useGenerationStore.getState().experienceId).toBe('exp-456')
    })
  })

  describe('setContactInfo', () => {
    it('merges partial contact info with existing', () => {
      useGenerationStore.getState().setContactInfo({ name: 'Alice', email: 'a@b.com' })
      useGenerationStore.getState().setContactInfo({ phone: '555-1234' })
      const info = useGenerationStore.getState().contactInfo
      expect(info.name).toBe('Alice')
      expect(info.email).toBe('a@b.com')
      expect(info.phone).toBe('555-1234')
      expect(info.location).toBe('')
      expect(info.linkedin).toBe('')
    })

    it('overwrites previously set fields', () => {
      useGenerationStore.getState().setContactInfo({ name: 'Alice' })
      useGenerationStore.getState().setContactInfo({ name: 'Bob' })
      expect(useGenerationStore.getState().contactInfo.name).toBe('Bob')
    })
  })

  describe('toggleDocument', () => {
    it('adds a document type if not present', () => {
      useGenerationStore.getState().toggleDocument('resume')
      expect(useGenerationStore.getState().selectedDocuments).toEqual(['resume'])
    })

    it('removes a document type if already present', () => {
      useGenerationStore.getState().toggleDocument('resume')
      useGenerationStore.getState().toggleDocument('cover_letter')
      useGenerationStore.getState().toggleDocument('resume')
      expect(useGenerationStore.getState().selectedDocuments).toEqual(['cover_letter'])
    })

    it('handles toggling the same document type twice (add then remove)', () => {
      useGenerationStore.getState().toggleDocument('cold_email')
      useGenerationStore.getState().toggleDocument('cold_email')
      expect(useGenerationStore.getState().selectedDocuments).toEqual([])
    })
  })

  describe('setSelectedDocuments', () => {
    it('replaces the entire selected documents array', () => {
      useGenerationStore.getState().toggleDocument('resume')
      useGenerationStore.getState().setSelectedDocuments(['cover_letter', 'cold_email'])
      expect(useGenerationStore.getState().selectedDocuments).toEqual(['cover_letter', 'cold_email'])
    })
  })

  describe('setGeneratedDocument', () => {
    it('merges a generated document into the map', () => {
      useGenerationStore.getState().setGeneratedDocument('resume', { content: 'Resume data' })
      useGenerationStore.getState().setGeneratedDocument('cover_letter', { content: 'CL data' })
      const docs = useGenerationStore.getState().generatedDocuments
      expect(docs.resume).toEqual({ content: 'Resume data' })
      expect(docs.cover_letter).toEqual({ content: 'CL data' })
    })

    it('overwrites a previously generated document', () => {
      useGenerationStore.getState().setGeneratedDocument('resume', { v: 1 })
      useGenerationStore.getState().setGeneratedDocument('resume', { v: 2 })
      expect(useGenerationStore.getState().generatedDocuments.resume).toEqual({ v: 2 })
    })
  })

  describe('setIsGenerating / setError', () => {
    it('sets isGenerating flag', () => {
      useGenerationStore.getState().setIsGenerating(true)
      expect(useGenerationStore.getState().isGenerating).toBe(true)
      useGenerationStore.getState().setIsGenerating(false)
      expect(useGenerationStore.getState().isGenerating).toBe(false)
    })

    it('sets and clears error', () => {
      useGenerationStore.getState().setError('Something went wrong')
      expect(useGenerationStore.getState().error).toBe('Something went wrong')
      useGenerationStore.getState().setError(null)
      expect(useGenerationStore.getState().error).toBeNull()
    })
  })

  describe('template / font / fontSize', () => {
    it('sets selectedTemplate', () => {
      useGenerationStore.getState().setSelectedTemplate('executive')
      expect(useGenerationStore.getState().selectedTemplate).toBe('executive')
    })

    it('sets selectedFont', () => {
      useGenerationStore.getState().setSelectedFont('times')
      expect(useGenerationStore.getState().selectedFont).toBe('times')
    })

    it('sets selectedFontSize', () => {
      useGenerationStore.getState().setSelectedFontSize('small')
      expect(useGenerationStore.getState().selectedFontSize).toBe('small')
    })
  })

  describe('language / customLanguage', () => {
    it('sets language', () => {
      useGenerationStore.getState().setLanguage('fr')
      expect(useGenerationStore.getState().language).toBe('fr')
    })

    it('sets customLanguage', () => {
      useGenerationStore.getState().setCustomLanguage('Esperanto')
      expect(useGenerationStore.getState().customLanguage).toBe('Esperanto')
    })
  })

  describe('reset', () => {
    it('restores all fields to initial state', () => {
      // Modify multiple fields
      useGenerationStore.getState().setStep('review')
      useGenerationStore.getState().setJobDescription('Some JD')
      useGenerationStore.getState().setParsedJD({ title: 'Dev' }, 'jd-1')
      useGenerationStore.getState().setExperience('10 years')
      useGenerationStore.getState().setExperienceId('exp-1')
      useGenerationStore.getState().setContactInfo({ name: 'Test' })
      useGenerationStore.getState().toggleDocument('resume')
      useGenerationStore.getState().setGeneratedDocument('resume', { data: true })
      useGenerationStore.getState().setIsGenerating(true)
      useGenerationStore.getState().setError('err')
      useGenerationStore.getState().setSelectedTemplate('creative')
      useGenerationStore.getState().setSelectedFont('courier')
      useGenerationStore.getState().setSelectedFontSize('large')
      useGenerationStore.getState().setLanguage('de')
      useGenerationStore.getState().setCustomLanguage('Klingon')

      // Reset
      useGenerationStore.getState().reset()

      const state = useGenerationStore.getState()
      expect(state.step).toBe('jd_input')
      expect(state.jobDescription).toBe('')
      expect(state.parsedJD).toBeNull()
      expect(state.jobDescriptionId).toBeNull()
      expect(state.experience).toBe('')
      expect(state.experienceId).toBeNull()
      expect(state.contactInfo).toEqual({
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
      })
      expect(state.selectedDocuments).toEqual([])
      expect(state.generatedDocuments).toEqual({})
      expect(state.isGenerating).toBe(false)
      expect(state.error).toBeNull()
      expect(state.selectedTemplate).toBe('modern')
      expect(state.selectedFont).toBe('helvetica')
      expect(state.selectedFontSize).toBe('medium')
      expect(state.language).toBe('en')
      expect(state.customLanguage).toBe('')
    })
  })
})
