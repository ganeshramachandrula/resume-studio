import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSONWithClaude, isAIConfigured } from '@/lib/ai/claude'
import {
  DOCUMENT_EDITOR_SYSTEM,
  buildDocumentEditorPrompt,
} from '@/lib/ai/prompts/document-editor'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, documentEditorSchema } from '@/lib/security/validation'
import { checkRateLimitDistributed, getClientIP, rateLimitResponse, GENERATION_RATE_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'
import { FREE_DOCS_PER_MONTH } from '@/lib/constants'

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
    const ipRl = await checkRateLimitDistributed(ip, GENERATION_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'document-editor' })
      return rateLimitResponse(ipRl.retryAfterSeconds!)
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRl = await checkRateLimitDistributed(user.id, GENERATION_RATE_LIMIT)
    if (!userRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'document-editor' })
      return rateLimitResponse(userRl.retryAfterSeconds!)
    }

    if (!isEmailVerified(user)) {
      return NextResponse.json(
        { error: 'Please verify your email address.' },
        { status: 403 }
      )
    }

    const body = await validateBody(request, documentEditorSchema)
    if (isValidationError(body)) {
      logSecurityEvent('validation_error', request, user.id, { route: 'document-editor' })
      return body
    }

    const { documentId, documentType, currentContent, instruction } = body

    // Verify document ownership
    const { data: doc } = await supabase
      .from('documents')
      .select('id, user_id')
      .eq('id', documentId)
      .single()

    if (!doc || doc.user_id !== user.id) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check usage
    const { data: usageResult } = await supabase.rpc('check_and_increment_usage', {
      user_uuid: user.id,
      max_free_usage: FREE_DOCS_PER_MONTH,
    })

    if (usageResult && !usageResult.allowed) {
      logSecurityEvent('usage_limit_hit', request, user.id, { route: 'document-editor' })
      return NextResponse.json(
        { error: 'Plan limit reached. Upgrade for more generations.' },
        { status: 403 }
      )
    }

    logSecurityEvent('generation_attempt', request, user.id, { route: 'document-editor' })

    if (!isAIConfigured()) {
      // In mock mode, just return the current content unchanged
      return NextResponse.json({ success: true, content: currentContent })
    }

    const updated = await generateJSONWithClaude(
      DOCUMENT_EDITOR_SYSTEM,
      buildDocumentEditorPrompt(documentType, currentContent, instruction),
      8192
    )

    return NextResponse.json({ success: true, content: updated })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'document-editor')
  }
}
