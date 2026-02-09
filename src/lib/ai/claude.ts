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
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

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

  const jsonStr = jsonMatch[1] || jsonMatch[0]
  return JSON.parse(jsonStr) as T
}

export { isAIConfigured }
