import { createClient } from '@/lib/supabase/server'
import { isAIConfigured } from '@/lib/ai/claude'
import { CAREER_COACH_SYSTEM, buildCoachContextBlock } from '@/lib/ai/prompts/career-coach'
import { mockCoachResponse } from '@/lib/ai/mock-responses'
import { safeErrorResponse, isEmailVerified } from '@/lib/security/sanitize'
import { validateBody, isValidationError, careerCoachSchema } from '@/lib/security/validation'
import { checkRateLimitDistributed, getClientIP, getClientCountry, rateLimitResponse, COACH_RATE_LIMIT, COACH_MONTHLY_LIMIT } from '@/lib/security/rate-limit'
import { logSecurityEvent } from '@/lib/security/audit-log'
import Anthropic from '@anthropic-ai/sdk'

const MAX_MESSAGES_PER_CONVERSATION = 50

/** Increment coach_messages_count + update country (fire-and-forget) */
async function trackCoachUsage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  country: string | null
) {
  try {
    // Increment counter atomically
    await supabase.rpc('increment_coach_count', { user_row_id: userId })
    // Update country if available (last-seen country)
    if (country) {
      await supabase
        .from('profiles')
        .update({ country })
        .eq('id', userId)
    }
  } catch {
    // Non-critical — don't break the response
  }
}

export async function POST(request: Request) {
  try {
    // Extract client info
    const ip = getClientIP(request)
    const country = getClientCountry(request)

    // Rate limit by IP
    const ipRl = await checkRateLimitDistributed(ip, COACH_RATE_LIMIT)
    if (!ipRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, undefined, { route: 'career-coach' })
      return rateLimitResponse(ipRl.retryAfterSeconds!)
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // Rate limit by user (per-minute)
    const userRl = await checkRateLimitDistributed(user.id, COACH_RATE_LIMIT)
    if (!userRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'career-coach' })
      return rateLimitResponse(userRl.retryAfterSeconds!)
    }

    // Monthly message cap (100 messages/month)
    const monthlyRl = await checkRateLimitDistributed(`monthly:coach:${user.id}`, COACH_MONTHLY_LIMIT)
    if (!monthlyRl.allowed) {
      logSecurityEvent('rate_limit_hit', request, user.id, { route: 'career-coach-monthly' })
      return new Response(
        JSON.stringify({ error: 'Monthly coaching limit reached (100 messages/month). Your limit resets next month!' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(monthlyRl.retryAfterSeconds) } }
      )
    }

    if (!isEmailVerified(user)) {
      return new Response(JSON.stringify({ error: 'Please verify your email.' }), { status: 403 })
    }

    // Annual-only gating
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profile?.plan !== 'pro') {
      return new Response(
        JSON.stringify({ error: 'Career Coach is available for Pro subscribers.' }),
        { status: 403 }
      )
    }

    // Validate body
    const body = await validateBody(request, careerCoachSchema)
    if (isValidationError(body)) {
      return body
    }

    const { message, conversationId, context } = body

    // Load existing conversation messages if provided
    let conversationMessages: { role: string; content: string }[] = []
    let convId = conversationId

    if (convId) {
      const { data: conv } = await supabase
        .from('coach_conversations')
        .select('messages')
        .eq('id', convId)
        .eq('user_id', user.id)
        .single()

      if (conv?.messages && Array.isArray(conv.messages)) {
        conversationMessages = conv.messages as { role: string; content: string }[]
      }
    } else {
      // Create new conversation
      const { data: newConv, error: createErr } = await supabase
        .from('coach_conversations')
        .insert({
          user_id: user.id,
          title: message.slice(0, 80),
          context: context || {},
        })
        .select('id')
        .single()

      if (createErr) throw createErr
      convId = newConv!.id
    }

    // Add user message
    conversationMessages.push({ role: 'user', content: message })

    // Build context block from stored context
    const contextBlock = buildCoachContextBlock(context as { parsedJD?: Record<string, unknown>; experience?: string; userName?: string } | undefined)

    // Prepare messages for API (limit context window to last ~20 messages)
    const recentMessages = conversationMessages.slice(-20)
    const apiMessages = recentMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    logSecurityEvent('generation_attempt', request, user.id, { route: 'career-coach' })

    // Mock mode: return single chunk
    if (!isAIConfigured()) {
      const assistantMsg = mockCoachResponse
      conversationMessages.push({ role: 'assistant', content: assistantMsg })

      // Truncate if over limit
      if (conversationMessages.length > MAX_MESSAGES_PER_CONVERSATION) {
        conversationMessages = conversationMessages.slice(-MAX_MESSAGES_PER_CONVERSATION)
      }

      // Save to DB
      await supabase
        .from('coach_conversations')
        .update({
          messages: conversationMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', convId)

      // Track usage for admin analytics
      trackCoachUsage(supabase, user.id, country)

      // Return as SSE
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: assistantMsg })}\n\n`))
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', conversationId: convId })}\n\n`))
          controller.close()
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Real streaming mode
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })
    const systemPrompt = CAREER_COACH_SYSTEM + contextBlock

    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: apiMessages,
    })

    let fullResponse = ''

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text
              fullResponse += text
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`)
              )
            }
          }

          // Save complete response
          conversationMessages.push({ role: 'assistant', content: fullResponse })

          if (conversationMessages.length > MAX_MESSAGES_PER_CONVERSATION) {
            conversationMessages = conversationMessages.slice(-MAX_MESSAGES_PER_CONVERSATION)
          }

          await supabase
            .from('coach_conversations')
            .update({
              messages: conversationMessages,
              updated_at: new Date().toISOString(),
            })
            .eq('id', convId)

          // Track usage for admin analytics
          trackCoachUsage(supabase, user.id, country)

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done', conversationId: convId })}\n\n`)
          )
          controller.close()
        } catch (err) {
          console.error('[career-coach]', (err as Error).message)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', content: 'Streaming failed' })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: unknown) {
    return safeErrorResponse(error, 'career-coach')
  }
}
