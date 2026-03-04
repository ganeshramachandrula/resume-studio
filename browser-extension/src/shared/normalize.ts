/**
 * Company name normalization — port of src/lib/ghostboard/normalize.ts
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

export function normalizeCompanyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(SUFFIX_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function companySlug(name: string): string {
  return normalizeCompanyName(name)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function displayCompanyName(name: string): string {
  return normalizeCompanyName(name)
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
