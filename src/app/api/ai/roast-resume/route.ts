import { NextResponse } from 'next/server'
import { generateJSONWithClaude, isAIConfigured } from '@/lib/ai/claude'
import { ROAST_RESUME_SYSTEM, buildRoastResumePrompt } from '@/lib/ai/prompts/roast-resume'
import { mockRoastData } from '@/lib/ai/mock-responses'
import { safeErrorResponse } from '@/lib/security/sanitize'
import { validateBody, isValidationError, roastResumeSchema } from '@/lib/security/validation'
import { checkRateLimitDistributed, getClientIP, isIpBlocked, blockedIpResponse, rateLimitResponse, ROAST_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'

export async function POST(request: Request) {
  try {
    // IP block check
    const ip = getClientIP(request)
    if (await isIpBlocked(ip)) {
      return blockedIpResponse()
    }

    // Rate limit by IP (public endpoint — no auth)
    const rl = await checkRateLimitDistributed(`roast:${ip}`, ROAST_RATE_LIMIT)
    if (!rl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'roast-resume' })
      return rateLimitResponse(rl.retryAfterSeconds!)
    }

    // Validate input
    const body = await validateBody(request, roastResumeSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, undefined, { route: 'roast-resume' })
      return body
    }

    const { jobDescription, resumeText } = body

    let result
    try {
      result = isAIConfigured()
        ? await generateJSONWithClaude(
            ROAST_RESUME_SYSTEM,
            buildRoastResumePrompt(jobDescription, resumeText),
            8192
          )
        : JSON.parse(JSON.stringify(mockRoastData))
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'MOCK_MODE') {
        result = JSON.parse(JSON.stringify(mockRoastData))
      } else {
        throw err
      }
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'roast-resume')
  }
}
