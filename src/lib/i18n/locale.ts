export const SUPPORTED_LOCALES = ['es', 'fr', 'de', 'pt', 'hi'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

/**
 * Extract locale from a pathname, or return null for English (default).
 * e.g. "/es" → "es", "/es#features" → "es", "/blog" → null, "/" → null
 */
export function getLocaleFromPathname(pathname: string): SupportedLocale | null {
  const segment = pathname.split('/')[1]?.split('#')[0]
  if (segment && (SUPPORTED_LOCALES as readonly string[]).includes(segment)) {
    return segment as SupportedLocale
  }
  return null
}

/**
 * Prefix a path with the current locale for anchor-style navigation links.
 * - Anchor links: "/#features" → "/es#features"
 * - Root: "/" → "/es"
 * - Absolute paths (non-anchor): "/blog", "/login" → unchanged
 */
export function localePath(locale: SupportedLocale | null, path: string): string {
  if (!locale) return path

  // "/#something" → "/locale#something"
  if (path.startsWith('/#')) {
    return `/${locale}${path.slice(1)}`
  }

  // "/" → "/locale"
  if (path === '/') {
    return `/${locale}`
  }

  // Everything else (absolute paths like /blog, /login) stays unchanged
  return path
}
