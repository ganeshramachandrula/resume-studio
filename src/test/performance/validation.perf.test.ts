import { describe, it, expect } from 'vitest'
import { parseJDSchema, generateDocSchema } from '@/lib/security/validation'

describe('Validation Schema Performance', () => {
  it('parseJDSchema.safeParse on valid data 1000 times completes in under 500ms', () => {
    const validData = {
      jobDescription: 'A'.repeat(200), // well above 50 char minimum
    }

    const start = performance.now()

    for (let i = 0; i < 1000; i++) {
      parseJDSchema.safeParse(validData)
    }

    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(500)
  })

  it('generateDocSchema.safeParse on valid data 1000 times completes in under 500ms', () => {
    const validData = {
      parsedJD: {
        role_title: 'Software Engineer',
        company_name: 'Test Corp',
        required_skills: ['JavaScript', 'TypeScript'],
      },
      experience: 'I have 5 years of experience in software development with JavaScript and TypeScript.',
      jobDescriptionId: '00000000-0000-0000-0000-000000000001',
    }

    const start = performance.now()

    for (let i = 0; i < 1000; i++) {
      generateDocSchema.safeParse(validData)
    }

    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(500)
  })

  it('parseJDSchema correctly validates minimum length', () => {
    const tooShort = { jobDescription: 'short' }
    const result = parseJDSchema.safeParse(tooShort)
    expect(result.success).toBe(false)
  })

  it('generateDocSchema correctly rejects empty parsedJD', () => {
    const emptyParsedJD = {
      parsedJD: {},
      experience: 'I have 5 years of experience in software development.',
      jobDescriptionId: '00000000-0000-0000-0000-000000000001',
    }
    const result = generateDocSchema.safeParse(emptyParsedJD)
    expect(result.success).toBe(false)
  })
})
