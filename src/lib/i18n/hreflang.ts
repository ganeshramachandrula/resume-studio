import { SUPPORTED_LOCALES } from './locale'

const BASE_URL = 'https://resume-studio.io'

/**
 * Generate hreflang alternate links for a marketing page.
 * Returns a languages object for Next.js metadata.alternates.languages
 */
export function hreflangAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {
    'x-default': `${BASE_URL}${path}`,
    en: `${BASE_URL}${path}`,
  }
  for (const locale of SUPPORTED_LOCALES) {
    languages[locale] = `${BASE_URL}/${locale}${path}`
  }
  return languages
}
