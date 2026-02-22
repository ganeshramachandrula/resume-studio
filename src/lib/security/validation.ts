import { NextResponse } from 'next/server'
import { z } from 'zod'

// ── Size Limits ───────────────────────────────────────────────

const MAX_JSON_FIELD_BYTES = 100 * 1024 // 100KB per JSON object field
const MAX_BODY_BYTES = 500 * 1024 // 500KB overall request body
export const EXPERIENCE_MAX_CHARS = 20_000

/**
 * Zod refinement: rejects JSON object fields whose serialized size exceeds 100KB.
 */
function jsonSizeLimit() {
  return (v: Record<string, unknown>) => {
    const size = new TextEncoder().encode(JSON.stringify(v)).length
    return size <= MAX_JSON_FIELD_BYTES
  }
}

function jsonSizeLimitMessage(fieldName: string) {
  return { message: `${fieldName} exceeds maximum size of 100KB` }
}

// ── Schemas ────────────────────────────────────────────────

export const parseJDSchema = z.object({
  jobDescription: z
    .string()
    .min(50, 'Job description must be at least 50 characters')
    .max(15_000, 'Job description must be under 15,000 characters'),
})

export const contactInfoSchema = z.object({
  name: z.string().max(200, 'Name too long'),
  email: z.string().max(300, 'Email too long'),
  phone: z.string().max(50, 'Phone too long').optional().default(''),
  location: z.string().max(200, 'Location too long').optional().default(''),
  linkedin: z.string().max(500, 'LinkedIn URL too long').optional().default(''),
})

export const generateDocSchema = z.object({
  parsedJD: z.record(z.string(), z.unknown())
    .refine((v) => Object.keys(v).length > 0, { message: 'Parsed job description is required' })
    .refine(jsonSizeLimit(), jsonSizeLimitMessage('parsedJD')),
  experience: z
    .string()
    .min(10, 'Experience must be at least 10 characters')
    .max(EXPERIENCE_MAX_CHARS, `Experience must be under ${EXPERIENCE_MAX_CHARS.toLocaleString()} characters`),
  jobDescriptionId: z.string().uuid('Invalid job description ID'),
  contactInfo: contactInfoSchema.optional(),
  language: z.string().max(100, 'Language too long').optional(),
})

export const careerCoachSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(5000, 'Message must be under 5,000 characters'),
  conversationId: z.string().uuid('Invalid conversation ID').optional(),
  context: z.record(z.string(), z.unknown()).optional(),
})

export const atsScoreSchema = z.object({
  resumeJSON: z.record(z.string(), z.unknown())
    .refine((v) => Object.keys(v).length > 0, { message: 'Resume data is required' })
    .refine(jsonSizeLimit(), jsonSizeLimitMessage('resumeJSON')),
  parsedJD: z.record(z.string(), z.unknown())
    .refine((v) => Object.keys(v).length > 0, { message: 'Parsed job description is required' })
    .refine(jsonSizeLimit(), jsonSizeLimitMessage('parsedJD')),
  documentId: z.string().uuid('Invalid document ID').optional(),
})

export const createCheckoutSchema = z.object({
  priceId: z
    .string()
    .min(1, 'Price ID is required')
    .max(100, 'Invalid price ID')
    .optional(),
  plan: z.enum(['basic', 'pro', 'credits']).optional(),
  mode: z.enum(['subscription', 'payment']).optional().default('subscription'),
})

export const supportContactSchema = z.object({
  name: z.string().max(200, 'Name too long').optional().default(''),
  email: z.string().email('Invalid email').max(300, 'Email too long'),
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be under 200 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be under 5,000 characters'),
  category: z.enum(['bug', 'feature', 'billing', 'account', 'technical', 'advice', 'general']).default('general'),
})

export const adminUserUpdateSchema = z.object({
  plan: z.enum(['free', 'basic', 'pro']).optional(),
  usage_count: z.number().int().min(0).optional(),
  credits: z.number().int().min(0).optional(),
  role: z.enum(['user', 'admin']).optional(),
  is_disabled: z.boolean().optional(),
  saved_applications_count: z.number().int().min(0).optional(),
  signup_ip: z.null().optional(),
  signup_device_id: z.null().optional(),
})

export const adminMessageUpdateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']).optional(),
  admin_notes: z.string().max(5000, 'Notes too long').optional(),
})

export const jobSearchSchema = z.object({
  query: z
    .string()
    .min(2, 'Search query must be at least 2 characters')
    .max(200, 'Search query must be under 200 characters'),
  location: z.string().max(100, 'Location too long').optional(),
  country: z.string().max(2, 'Country code must be 2 characters').toUpperCase().optional(),
  remote_only: z.boolean().optional().default(false),
  page: z.number().int().min(1).max(100).optional().default(1),
})

export const jobPreferencesSchema = z.object({
  skills: z.array(z.string().max(100)).max(20, 'Maximum 20 skills').optional().default([]),
  roles: z.array(z.string().max(100)).max(10, 'Maximum 10 roles').optional().default([]),
  locations: z.array(z.string().max(100)).max(10, 'Maximum 10 locations').optional().default([]),
  country: z.string().max(2, 'Country code must be 2 characters').toUpperCase().optional(),
  salary_min: z.number().int().min(0).max(1_000_000).optional().nullable(),
  salary_max: z.number().int().min(0).max(1_000_000).optional().nullable(),
  remote_preference: z.enum(['any', 'remote', 'hybrid', 'onsite']).optional().default('any'),
})

export const countryResumeSchema = z.object({
  parsedJD: z.record(z.string(), z.unknown())
    .refine((v) => Object.keys(v).length > 0, { message: 'Parsed job description is required' })
    .refine(jsonSizeLimit(), jsonSizeLimitMessage('parsedJD')),
  experience: z
    .string()
    .min(10, 'Experience must be at least 10 characters')
    .max(EXPERIENCE_MAX_CHARS, `Experience must be under ${EXPERIENCE_MAX_CHARS.toLocaleString()} characters`),
  jobDescriptionId: z.string().uuid('Invalid job description ID'),
  countryCode: z.string().length(2, 'Country code must be exactly 2 characters').toUpperCase(),
  contactInfo: contactInfoSchema.optional(),
  language: z.string().max(100, 'Language too long').optional(),
  vaultData: z.object({
    certificates: z.array(z.object({ name: z.string(), issuer: z.string() })).optional(),
    skills: z.array(z.object({ name: z.string(), proficiency: z.string() })).optional(),
  }).optional(),
})

export const followUpEmailSchema = z.object({
  parsedJD: z.record(z.string(), z.unknown())
    .refine((v) => Object.keys(v).length > 0, { message: 'Parsed job description is required' })
    .refine(jsonSizeLimit(), jsonSizeLimitMessage('parsedJD')),
  experience: z
    .string()
    .min(10, 'Experience must be at least 10 characters')
    .max(EXPERIENCE_MAX_CHARS, `Experience must be under ${EXPERIENCE_MAX_CHARS.toLocaleString()} characters`),
  jobDescriptionId: z.string().uuid('Invalid job description ID'),
  interviewNotes: z
    .string()
    .min(10, 'Interview notes must be at least 10 characters')
    .max(5000, 'Interview notes must be under 5,000 characters'),
  contactInfo: contactInfoSchema.optional(),
  language: z.string().max(100, 'Language too long').optional(),
})

export const documentEditorSchema = z.object({
  documentId: z.string().uuid('Invalid document ID'),
  documentType: z.string().min(1, 'Document type is required'),
  currentContent: z.record(z.string(), z.unknown())
    .refine((v) => Object.keys(v).length > 0, { message: 'Current content is required' })
    .refine(jsonSizeLimit(), jsonSizeLimitMessage('currentContent')),
  instruction: z
    .string()
    .min(3, 'Instruction must be at least 3 characters')
    .max(1000, 'Instruction must be under 1,000 characters'),
})

export const skillGapSchema = z.object({
  jobDescription: z
    .string()
    .min(50, 'Job description must be at least 50 characters')
    .max(15_000, 'Job description must be under 15,000 characters'),
  skills: z.array(z.object({
    name: z.string(),
    proficiency: z.string(),
    category: z.string().optional(),
  })).min(1, 'At least one skill is required').max(50, 'Maximum 50 skills'),
  targetRole: z.string().max(200, 'Target role too long').optional(),
})

export const roastResumeSchema = z.object({
  jobDescription: z
    .string()
    .min(50, 'Job description must be at least 50 characters')
    .max(15_000, 'Job description must be under 15,000 characters'),
  resumeText: z
    .string()
    .min(50, 'Resume text must be at least 50 characters')
    .max(15_000, 'Resume text must be under 15,000 characters'),
})

export const extensionSubmitSchema = z.object({
  source_url: z.string().url('Invalid URL').max(2000, 'URL too long').optional(),
  source_site: z.string().max(100, 'Site name too long').optional(),
  raw_text: z
    .string()
    .min(50, 'Job description must be at least 50 characters')
    .max(15_000, 'Job description must be under 15,000 characters'),
})

// ── Helper ─────────────────────────────────────────────────

/**
 * Parses and validates the request body against a Zod schema.
 * Enforces a 500KB overall body size limit before parsing.
 * Returns typed data on success, or a NextResponse error on failure.
 */
export async function validateBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<z.infer<T> | NextResponse> {
  // Check Content-Length header first (fast reject)
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'Request body too large (max 500KB)' },
      { status: 413 }
    )
  }

  let rawText: string
  try {
    rawText = await request.text()
  } catch {
    return NextResponse.json(
      { error: 'Failed to read request body' },
      { status: 400 }
    )
  }

  // Check actual body size
  if (new TextEncoder().encode(rawText).length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'Request body too large (max 500KB)' },
      { status: 413 }
    )
  }

  let body: unknown
  try {
    body = JSON.parse(rawText)
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    const firstIssue = result.error.issues[0]
    return NextResponse.json(
      { error: firstIssue?.message || 'Validation failed' },
      { status: 400 }
    )
  }

  return result.data
}

/**
 * Type guard: checks if validateBody returned a NextResponse (error).
 */
export function isValidationError(result: unknown): result is NextResponse {
  return result instanceof NextResponse
}
