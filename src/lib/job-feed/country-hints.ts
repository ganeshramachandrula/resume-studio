/**
 * Country location hints for smart post-filtering.
 * Maps country codes to arrays of strings that indicate a job is located in that country.
 */

// US state abbreviations used to detect US-located jobs (e.g. "Dallas, TX")
export const US_STATE_ABBREVIATIONS = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
])

/** Major cities / country names that indicate a job belongs to a specific country */
export const COUNTRY_HINTS: Record<string, string[]> = {
  US: ['united states', 'usa', 'u.s.', 'new york', 'san francisco', 'los angeles', 'chicago', 'seattle', 'austin', 'boston', 'denver', 'miami', 'dallas', 'atlanta', 'portland', 'philadelphia', 'houston', 'phoenix', 'san diego', 'san jose', 'washington dc', 'raleigh', 'nashville', 'minneapolis', 'detroit', 'charlotte', 'pittsburgh', 'salt lake city', 'columbus', 'indianapolis'],
  GB: ['united kingdom', 'uk', 'england', 'scotland', 'wales', 'london', 'manchester', 'birmingham', 'edinburgh', 'glasgow', 'bristol', 'leeds', 'liverpool', 'cambridge', 'oxford', 'belfast', 'cardiff', 'newcastle', 'nottingham', 'sheffield', 'reading'],
  CA: ['canada', 'toronto', 'vancouver', 'montreal', 'ottawa', 'calgary', 'edmonton', 'winnipeg', 'quebec', 'halifax', 'victoria', 'waterloo', 'kitchener'],
  AU: ['australia', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra', 'gold coast', 'hobart'],
  DE: ['germany', 'deutschland', 'berlin', 'munich', 'hamburg', 'frankfurt', 'cologne', 'düsseldorf', 'stuttgart', 'leipzig', 'dresden', 'münchen'],
  FR: ['france', 'paris', 'lyon', 'marseille', 'toulouse', 'bordeaux', 'nantes', 'strasbourg', 'lille', 'nice'],
  NL: ['netherlands', 'holland', 'amsterdam', 'rotterdam', 'the hague', 'den haag', 'utrecht', 'eindhoven', 'delft'],
  ES: ['spain', 'españa', 'madrid', 'barcelona', 'valencia', 'seville', 'malaga', 'bilbao'],
  IT: ['italy', 'italia', 'rome', 'roma', 'milan', 'milano', 'turin', 'torino', 'florence', 'naples', 'bologna'],
  PL: ['poland', 'polska', 'warsaw', 'warszawa', 'krakow', 'kraków', 'wroclaw', 'wrocław', 'gdansk', 'gdańsk', 'poznan', 'poznań', 'lodz', 'łódź', 'katowice'],
  IN: ['india', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'new delhi', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'gurgaon', 'gurugram', 'noida'],
  NZ: ['new zealand', 'auckland', 'wellington', 'christchurch', 'hamilton nz'],
  BR: ['brazil', 'brasil', 'são paulo', 'sao paulo', 'rio de janeiro', 'belo horizonte', 'curitiba', 'brasília', 'brasilia'],
  SG: ['singapore'],
  AT: ['austria', 'österreich', 'vienna', 'wien', 'graz', 'salzburg', 'linz', 'innsbruck'],
  CH: ['switzerland', 'schweiz', 'suisse', 'zurich', 'zürich', 'geneva', 'genève', 'bern', 'basel', 'lausanne'],
  SE: ['sweden', 'sverige', 'stockholm', 'gothenburg', 'göteborg', 'malmö', 'malmo', 'uppsala'],
  IE: ['ireland', 'dublin', 'cork', 'galway', 'limerick'],
  JP: ['japan', '日本', 'tokyo', 'osaka', 'yokohama', 'kyoto', 'nagoya', 'fukuoka', 'sapporo'],
  ZA: ['south africa', 'cape town', 'johannesburg', 'durban', 'pretoria'],
}

/** Strings that indicate the job location is ambiguous / not country-specific */
const AMBIGUOUS_PATTERNS = [
  'remote', 'worldwide', 'global', 'anywhere', 'not specified', 'earth',
  'multiple locations', 'various locations', 'distributed', 'flexible',
]

/**
 * Check whether a location string is ambiguous (not tied to a specific country).
 */
export function isAmbiguousLocation(location: string): boolean {
  const loc = location.toLowerCase().trim()
  if (!loc) return true
  return AMBIGUOUS_PATTERNS.some(p => loc.includes(p))
}

/**
 * Check if a location matches a US state abbreviation pattern (e.g. "Dallas, TX").
 */
export function matchesUSStatePattern(location: string): boolean {
  // Match patterns like "City, TX" or "City TX" or just "TX"
  const parts = location.split(/[,\s]+/).filter(Boolean)
  return parts.some(part => {
    const upper = part.toUpperCase().replace(/[.]/g, '')
    return upper.length === 2 && US_STATE_ABBREVIATIONS.has(upper)
  })
}

/**
 * Determine which country a location string likely belongs to.
 * Returns the country code, or null if not determinable.
 */
export function detectCountry(location: string): string | null {
  const loc = location.toLowerCase()

  for (const [code, hints] of Object.entries(COUNTRY_HINTS)) {
    if (hints.some(hint => loc.includes(hint))) {
      return code
    }
  }

  // Check US state abbreviation pattern
  if (matchesUSStatePattern(location)) {
    return 'US'
  }

  return null
}
