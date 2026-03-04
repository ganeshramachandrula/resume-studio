/**
 * Company name normalization for GhostBoard.
 * Ensures "Google Inc.", "google", "GOOGLE LLC" all map to the same slug.
 */

const SUFFIXES = [
  'inc', 'incorporated', 'llc', 'ltd', 'limited', 'corp', 'corporation',
  'co', 'company', 'plc', 'gmbh', 'ag', 'sa', 'srl', 'pvt', 'pty',
  'lp', 'llp', 'pllc', 'na', 'nv', 'se', 'kg', 'ohg',
]

const SUFFIX_PATTERN = new RegExp(
  `\\b(${SUFFIXES.join('|')})\\.?$`,
  'i'
)

/**
 * Normalize a company name to a canonical form for matching.
 * Strips legal suffixes, lowercases, collapses whitespace.
 */
export function normalizeCompanyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(SUFFIX_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Generate a URL-safe slug from a company name.
 */
export function companySlug(name: string): string {
  return normalizeCompanyName(name)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Capitalize the first letter of each word for display.
 */
export function displayCompanyName(name: string): string {
  return normalizeCompanyName(name)
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
