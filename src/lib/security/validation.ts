import { NextResponse } from 'next/server'
import { z } from 'zod'

// ── Size Limits ───────────────────────────────────────────────

const MAX_JSON_FIELD_BYTES = 100 * 1024 // 100KB per JSON object field
const MAX_BODY_BYTES = 500 * 1024 // 500KB overall request body

/**
 * Zod refinement: rejects JSON object fields whose serialized size exceeds 100KB.
 */
function jsonSizeLimit(fieldName: string) {
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
    .refine(jsonSizeLimit('parsedJD'), jsonSizeLimitMessage('parsedJD')),
  experience: z
    .string()
    .min(10, 'Experience must be at least 10 characters')
    .max(20_000, 'Experience must be under 20,000 characters'),
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
    .refine(jsonSizeLimit('resumeJSON'), jsonSizeLimitMessage('resumeJSON')),
  parsedJD: z.record(z.string(), z.unknown())
    .refine((v) => Object.keys(v).length > 0, { message: 'Parsed job description is required' })
    .refine(jsonSizeLimit('parsedJD'), jsonSizeLimitMessage('parsedJD')),
  documentId: z.string().uuid('Invalid document ID').optional(),
})

export const createCheckoutSchema = z.object({
  priceId: z
    .string()
    .min(1, 'Price ID is required')
    .max(100, 'Invalid price ID'),
  mode: z.enum(['subscription', 'payment', 'team']).optional().default('subscription'),
  quantity: z.number().int().min(5).max(100).optional(),
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
  category: z.enum(['bug', 'feature', 'billing', 'general']).default('general'),
})

export const adminUserUpdateSchema = z.object({
  plan: z.enum(['free', 'pro_monthly', 'pro_annual', 'team']).optional(),
  usage_count: z.number().int().min(0).optional(),
  credits: z.number().int().min(0).optional(),
  role: z.enum(['user', 'admin']).optional(),
  is_disabled: z.boolean().optional(),
  saved_applications_count: z.number().int().min(0).optional(),
})

export const adminMessageUpdateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']).optional(),
  admin_notes: z.string().max(5000, 'Notes too long').optional(),
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
