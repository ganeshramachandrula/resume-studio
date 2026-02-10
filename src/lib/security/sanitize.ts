import { NextResponse } from 'next/server'

/**
 * Returns a safe error response — logs full error server-side, returns generic message to client.
 * Never leaks stack traces, internal paths, or DB details.
 */
export function safeErrorResponse(
  error: unknown,
  context: string,
  status: number = 500
): NextResponse {
  // Log full details server-side for debugging
  console.error(`[${context}]`, error)

  // Return generic message to client
  const genericMessages: Record<number, string> = {
    400: 'Invalid request',
    401: 'Unauthorized',
    403: 'Access denied',
    429: 'Too many requests. Please try again later.',
    500: 'An unexpected error occurred. Please try again.',
  }

  return NextResponse.json(
    { error: genericMessages[status] || 'An unexpected error occurred. Please try again.' },
    { status }
  )
}

/**
 * Strips HTML tags, javascript: protocols, and event handlers from a string.
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript\s*:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/data\s*:\s*text\/html/gi, '') // Remove data:text/html
    .trim()
}

/**
 * Truncates a string to a maximum length.
 */
export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input
  return input.slice(0, maxLength)
}

/**
 * Checks whether the user has confirmed their email address.
 */
export function isEmailVerified(user: { email_confirmed_at?: string | null }): boolean {
  return !!user.email_confirmed_at
}

/**
 * Validates that a redirect path is safe (relative, on allowlist).
 */
const ALLOWED_REDIRECT_PATHS = [
  '/dashboard',
  '/generate',
  '/documents',
  '/settings',
  '/job-tracker',
  '/pricing',
  '/admin',
  '/admin/users',
  '/admin/messages',
  '/contact',
]

export function isValidRedirect(path: string): boolean {
  // Reject anything with a protocol or double slashes (open redirect)
  if (path.includes('://') || path.startsWith('//')) return false

  // Must start with /
  if (!path.startsWith('/')) return false

  // Must match an allowed path (exact or prefix with /)
  return ALLOWED_REDIRECT_PATHS.some(
    (allowed) => path === allowed || path.startsWith(allowed + '/')
  )
}
