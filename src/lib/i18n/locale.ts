export const SUPPORTED_LOCALES = ['es', 'fr', 'de', 'pt', 'hi'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

/** Marketing paths that have locale-specific versions */
const LOCALIZABLE_PATHS = ['/blog', '/roast', '/contact', '/pricing', '/ghostboard']

/**
 * Extract locale from a pathname, or return null for English (default).
 * e.g. "/es" → "es", "/es#features" → "es", "/es/blog" → "es", "/blog" → null, "/" → null
 */
export function getLocaleFromPathname(pathname: string): SupportedLocale | null {
  const segment = pathname.split('/')[1]?.split('#')[0]
  if (segment && (SUPPORTED_LOCALES as readonly string[]).includes(segment)) {
    return segment as SupportedLocale
  }
  return null
}

/**
 * Prefix a path with the current locale for navigation links.
 * - Anchor links: "/#features" → "/es#features"
 * - Root: "/" → "/es"
 * - Localizable marketing paths: "/blog" → "/es/blog", "/roast" → "/es/roast"
 * - Other absolute paths: "/login", "/signup" → unchanged
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

  // Localizable marketing paths: "/blog" → "/locale/blog"
  if (LOCALIZABLE_PATHS.some((p) => path === p || path.startsWith(p + '/'))) {
    return `/${locale}${path}`
  }

  // Everything else (auth paths like /login, /signup) stays unchanged
  return path
}
