import { NextResponse } from 'next/server'
import { z } from 'zod'

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
  parsedJD: z.record(z.string(), z.unknown()).refine((v) => Object.keys(v).length > 0, {
    message: 'Parsed job description is required',
  }),
  experience: z
    .string()
    .min(10, 'Experience must be at least 10 characters')
    .max(20_000, 'Experience must be under 20,000 characters'),
  jobDescriptionId: z.string().uuid('Invalid job description ID'),
  contactInfo: contactInfoSchema.optional(),
})

export const atsScoreSchema = z.object({
  resumeJSON: z.record(z.string(), z.unknown()).refine((v) => Object.keys(v).length > 0, {
    message: 'Resume data is required',
  }),
  parsedJD: z.record(z.string(), z.unknown()).refine((v) => Object.keys(v).length > 0, {
    message: 'Parsed job description is required',
  }),
  documentId: z.string().uuid('Invalid document ID').optional(),
})

export const createCheckoutSchema = z.object({
  priceId: z
    .string()
    .min(1, 'Price ID is required')
    .max(100, 'Invalid price ID'),
})

// ── Helper ─────────────────────────────────────────────────

/**
 * Parses and validates the request body against a Zod schema.
 * Returns typed data on success, or a NextResponse error on failure.
 */
export async function validateBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<z.infer<T> | NextResponse> {
  let body: unknown
  try {
    body = await request.json()
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
