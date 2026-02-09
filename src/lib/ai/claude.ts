import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY || ''

function isAIConfigured(): boolean {
  return Boolean(apiKey && apiKey.length > 10 && !apiKey.startsWith('your_'))
}

export async function generateWithClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096
): Promise<string> {
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

  // If the response was truncated (hit max_tokens), the JSON may be incomplete
  if (message.stop_reason === 'max_tokens') {
    console.warn('[claude] Response truncated — hit max_tokens limit')
  }

  const textBlock = message.content.find((block) => block.type === 'text')
  return textBlock?.text ?? ''
}

export async function generateJSONWithClaude<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096
): Promise<T> {
  if (!isAIConfigured()) {
    throw new Error('MOCK_MODE')
  }

  const response = await generateWithClaude(systemPrompt, userPrompt, maxTokens)

  const jsonMatch =
    response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in AI response')

  let jsonStr = jsonMatch[1] || jsonMatch[0]

  // Attempt to fix truncated JSON by closing open braces/brackets
  try {
    return JSON.parse(jsonStr) as T
  } catch {
    // Try to salvage truncated JSON
    jsonStr = repairTruncatedJSON(jsonStr)
    return JSON.parse(jsonStr) as T
  }
}

/**
 * Attempts to repair truncated JSON by:
 * 1. Closing any unterminated string
 * 2. Removing trailing incomplete key-value pairs or array items
 * 3. Closing open brackets and braces in correct order
 */
function repairTruncatedJSON(json: string): string {
  // Track structural state
  let inString = false
  let escaped = false
  const stack: string[] = [] // tracks '{' and '['

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

  // If we ended inside a string, close it
  if (inString) {
    json += '"'
  }

  // Remove trailing incomplete values:
  // - partial string after colon: `"key": "incom`  → already closed above
  // - trailing comma + partial key: `, "partialKey`
  // - trailing colon without value: `"key":`
  // Work from the end, stripping problematic tails
  json = json
    .replace(/,\s*"[^"]*"\s*:\s*"[^"]*$/, '')   // trailing "key": "incomplete-val"
    .replace(/,\s*"[^"]*"\s*:\s*$/, '')           // trailing "key":
    .replace(/,\s*"[^"]*$/, '')                   // trailing "incomplete-key
    .replace(/,\s*$/, '')                          // trailing comma

  // Close open brackets/braces in reverse order (innermost first)
  for (let i = stack.length - 1; i >= 0; i--) {
    json += stack[i] === '{' ? '}' : ']'
  }

  return json
}

export { isAIConfigured }
