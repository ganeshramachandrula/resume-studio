import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY || ''

function isAIConfigured(): boolean {
  return Boolean(apiKey && apiKey.length > 10 && !apiKey.startsWith('your_'))
}

export async function generateWithClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096
): Promise<{ text: string; truncated: boolean }> {
  if (!isAIConfigured()) {
    throw new Error('MOCK_MODE')
  }

  const anthropic = new Anthropic({ apiKey })
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const truncated = message.stop_reason === 'max_tokens'
  if (truncated) {
    console.warn('[claude] Response truncated — hit max_tokens limit')
  }

  const textBlock = message.content.find((block) => block.type === 'text')
  return { text: textBlock?.text ?? '', truncated }
}

export async function generateJSONWithClaude<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 8192
): Promise<T> {
  if (!isAIConfigured()) {
    throw new Error('MOCK_MODE')
  }

  const response = await generateWithClaude(systemPrompt, userPrompt, maxTokens)

  const jsonMatch =
    response.text.match(/```json\n?([\s\S]*?)\n?```/) || response.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in AI response')

  let jsonStr = jsonMatch[1] || jsonMatch[0]

  try {
    return JSON.parse(jsonStr) as T
  } catch {
    // Try to salvage truncated JSON
    jsonStr = repairTruncatedJSON(jsonStr)
    try {
      return JSON.parse(jsonStr) as T
    } catch (e) {
      console.error('[claude] JSON repair failed:', (e as Error).message)
      console.error('[claude] Repaired string (last 200 chars):', jsonStr.slice(-200))
      throw new Error('Failed to parse AI response as JSON')
    }
  }
}

/**
 * Repairs truncated JSON by:
 * 1. Closing unterminated strings
 * 2. Trimming back to the last valid structural point
 * 3. Closing open brackets/braces in correct nesting order
 */
function repairTruncatedJSON(json: string): string {
  // Track structural state
  let inString = false
  let escaped = false
  const stack: string[] = []
  let lastValidEnd = 0 // index after last complete value/structure

  for (let i = 0; i < json.length; i++) {
    const ch = json[i]
    if (escaped) { escaped = false; continue }
    if (ch === '\\') { escaped = true; continue }
    if (ch === '"') {
      inString = !inString
      if (!inString) {
        // Just closed a string — this is a valid endpoint
        lastValidEnd = i + 1
      }
      continue
    }
    if (inString) continue
    if (ch === '{') { stack.push('{'); continue }
    if (ch === '[') { stack.push('['); continue }
    if (ch === '}') { stack.pop(); lastValidEnd = i + 1; continue }
    if (ch === ']') { stack.pop(); lastValidEnd = i + 1; continue }
    if (ch === ',') { lastValidEnd = i; continue } // comma itself is a trim point
    // colons, whitespace, numbers, booleans, null — skip
  }

  // If we ended inside a string, truncate back to last valid point
  if (inString) {
    // Recompute stack from the truncated portion
    json = json.slice(0, lastValidEnd)
    inString = false
    escaped = false
    stack.length = 0
    for (const ch of json) {
      if (escaped) { escaped = false; continue }
      if (ch === '\\') { escaped = true; continue }
      if (ch === '"') { inString = !inString; continue }
      if (inString) continue
      if (ch === '{') stack.push('{')
      if (ch === '}') stack.pop()
      if (ch === '[') stack.push('[')
      if (ch === ']') stack.pop()
    }
  }

  // Remove trailing commas and incomplete key-value tokens
  json = json
    .replace(/,\s*$/, '')             // trailing comma
    .replace(/:\s*$/, '')             // trailing colon (remove value-less key too)

  // If the last non-whitespace is a colon-less key, remove it
  json = json.replace(/,\s*"[^"]*"\s*$/, '')

  // Remove trailing comma again (in case the above exposed one)
  json = json.replace(/,\s*$/, '')

  // Close open brackets/braces in reverse order
  for (let i = stack.length - 1; i >= 0; i--) {
    json += stack[i] === '{' ? '}' : ']'
  }

  return json
}

export { isAIConfigured }
