import { getLanguageName } from '@/lib/templates/languages'

/**
 * Returns a language instruction to append to generation prompts.
 * Returns empty string for English (default).
 */
export function getLanguageInstruction(languageCode: string | undefined): string {
  if (!languageCode || languageCode === 'en') return ''

  const name = getLanguageName(languageCode)
  // If it's a custom language (not found in presets), use the code as-is (it's the language name)
  const lang = name === languageCode ? languageCode : name

  return `\n\nCRITICAL LANGUAGE REQUIREMENT: Generate ALL content in ${lang}. Every piece of text in your response must be in ${lang}. JSON keys remain in English, but all string values must be in ${lang}.`
}
