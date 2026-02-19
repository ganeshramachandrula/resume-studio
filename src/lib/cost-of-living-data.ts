/** Cost of living data for ~50 global cities. All costs in USD/month. */

export interface CityData {
  city: string
  country: string
  region: 'North America' | 'Europe' | 'Asia-Pacific' | 'Middle East & Africa' | 'South America'
  costs: {
    rent: number       // 1BR apartment, city center
    groceries: number  // Monthly groceries, single person
    transport: number  // Monthly public transport pass
    utilities: number  // Electricity, heating, water, garbage
    dining: number     // Meal for 2 at mid-range restaurant
    entertainment: number // Monthly (gym, cinema, outings)
  }
}

export const COST_CATEGORIES = ['rent', 'groceries', 'transport', 'utilities', 'dining', 'entertainment'] as const
export type CostCategory = typeof COST_CATEGORIES[number]

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  rent: 'Rent (1BR City Center)',
  groceries: 'Groceries',
  transport: 'Transport',
  utilities: 'Utilities',
  dining: 'Dining Out',
  entertainment: 'Entertainment',
}

export const CITIES: CityData[] = [
  // North America
  { city: 'New York', country: 'US', region: 'North America', costs: { rent: 3500, groceries: 450, transport: 127, utilities: 150, dining: 100, entertainment: 120 } },
  { city: 'San Francisco', country: 'US', region: 'North America', costs: { rent: 3200, groceries: 430, transport: 98, utilities: 140, dining: 110, entertainment: 130 } },
  { city: 'Los Angeles', country: 'US', region: 'North America', costs: { rent: 2500, groceries: 400, transport: 100, utilities: 130, dining: 90, entertainment: 110 } },
  { city: 'Chicago', country: 'US', region: 'North America', costs: { rent: 2000, groceries: 350, transport: 105, utilities: 120, dining: 80, entertainment: 100 } },
  { city: 'Austin', country: 'US', region: 'North America', costs: { rent: 1800, groceries: 330, transport: 90, utilities: 140, dining: 75, entertainment: 95 } },
  { city: 'Seattle', country: 'US', region: 'North America', costs: { rent: 2300, groceries: 380, transport: 99, utilities: 120, dining: 90, entertainment: 110 } },
  { city: 'Denver', country: 'US', region: 'North America', costs: { rent: 1900, groceries: 350, transport: 114, utilities: 110, dining: 80, entertainment: 100 } },
  { city: 'Boston', country: 'US', region: 'North America', costs: { rent: 2800, groceries: 400, transport: 90, utilities: 140, dining: 95, entertainment: 115 } },
  { city: 'Miami', country: 'US', region: 'North America', costs: { rent: 2400, groceries: 370, transport: 112, utilities: 130, dining: 85, entertainment: 105 } },
  { city: 'Toronto', country: 'Canada', region: 'North America', costs: { rent: 2200, groceries: 350, transport: 115, utilities: 110, dining: 75, entertainment: 90 } },
  { city: 'Vancouver', country: 'Canada', region: 'North America', costs: { rent: 2300, groceries: 340, transport: 100, utilities: 100, dining: 80, entertainment: 95 } },
  { city: 'Montreal', country: 'Canada', region: 'North America', costs: { rent: 1400, groceries: 300, transport: 86, utilities: 80, dining: 65, entertainment: 80 } },
  { city: 'Mexico City', country: 'Mexico', region: 'North America', costs: { rent: 700, groceries: 200, transport: 20, utilities: 50, dining: 30, entertainment: 40 } },

  // Europe
  { city: 'London', country: 'UK', region: 'Europe', costs: { rent: 2500, groceries: 380, transport: 175, utilities: 180, dining: 80, entertainment: 110 } },
  { city: 'Paris', country: 'France', region: 'Europe', costs: { rent: 1500, groceries: 350, transport: 84, utilities: 150, dining: 70, entertainment: 90 } },
  { city: 'Berlin', country: 'Germany', region: 'Europe', costs: { rent: 1200, groceries: 280, transport: 86, utilities: 230, dining: 55, entertainment: 75 } },
  { city: 'Amsterdam', country: 'Netherlands', region: 'Europe', costs: { rent: 1800, groceries: 320, transport: 100, utilities: 170, dining: 70, entertainment: 85 } },
  { city: 'Zurich', country: 'Switzerland', region: 'Europe', costs: { rent: 2600, groceries: 500, transport: 100, utilities: 200, dining: 120, entertainment: 130 } },
  { city: 'Dublin', country: 'Ireland', region: 'Europe', costs: { rent: 2100, groceries: 340, transport: 120, utilities: 160, dining: 75, entertainment: 90 } },
  { city: 'Barcelona', country: 'Spain', region: 'Europe', costs: { rent: 1200, groceries: 260, transport: 52, utilities: 120, dining: 50, entertainment: 65 } },
  { city: 'Lisbon', country: 'Portugal', region: 'Europe', costs: { rent: 1100, groceries: 240, transport: 40, utilities: 100, dining: 40, entertainment: 55 } },
  { city: 'Stockholm', country: 'Sweden', region: 'Europe', costs: { rent: 1500, groceries: 350, transport: 95, utilities: 80, dining: 75, entertainment: 90 } },
  { city: 'Copenhagen', country: 'Denmark', region: 'Europe', costs: { rent: 1700, groceries: 370, transport: 55, utilities: 100, dining: 85, entertainment: 95 } },
  { city: 'Milan', country: 'Italy', region: 'Europe', costs: { rent: 1300, groceries: 300, transport: 39, utilities: 150, dining: 55, entertainment: 70 } },
  { city: 'Vienna', country: 'Austria', region: 'Europe', costs: { rent: 1100, groceries: 280, transport: 51, utilities: 180, dining: 50, entertainment: 70 } },
  { city: 'Warsaw', country: 'Poland', region: 'Europe', costs: { rent: 800, groceries: 220, transport: 35, utilities: 150, dining: 35, entertainment: 50 } },
  { city: 'Prague', country: 'Czech Republic', region: 'Europe', costs: { rent: 900, groceries: 250, transport: 30, utilities: 160, dining: 35, entertainment: 55 } },

  // Asia-Pacific
  { city: 'Singapore', country: 'Singapore', region: 'Asia-Pacific', costs: { rent: 2800, groceries: 350, transport: 100, utilities: 130, dining: 60, entertainment: 90 } },
  { city: 'Tokyo', country: 'Japan', region: 'Asia-Pacific', costs: { rent: 1400, groceries: 350, transport: 70, utilities: 150, dining: 40, entertainment: 80 } },
  { city: 'Sydney', country: 'Australia', region: 'Asia-Pacific', costs: { rent: 2200, groceries: 350, transport: 120, utilities: 140, dining: 80, entertainment: 100 } },
  { city: 'Melbourne', country: 'Australia', region: 'Asia-Pacific', costs: { rent: 1800, groceries: 320, transport: 105, utilities: 130, dining: 75, entertainment: 90 } },
  { city: 'Hong Kong', country: 'Hong Kong', region: 'Asia-Pacific', costs: { rent: 2600, groceries: 400, transport: 65, utilities: 170, dining: 55, entertainment: 85 } },
  { city: 'Seoul', country: 'South Korea', region: 'Asia-Pacific', costs: { rent: 1100, groceries: 300, transport: 50, utilities: 120, dining: 35, entertainment: 60 } },
  { city: 'Taipei', country: 'Taiwan', region: 'Asia-Pacific', costs: { rent: 800, groceries: 250, transport: 30, utilities: 70, dining: 25, entertainment: 50 } },
  { city: 'Bangkok', country: 'Thailand', region: 'Asia-Pacific', costs: { rent: 600, groceries: 200, transport: 30, utilities: 80, dining: 20, entertainment: 40 } },
  { city: 'Ho Chi Minh City', country: 'Vietnam', region: 'Asia-Pacific', costs: { rent: 500, groceries: 180, transport: 15, utilities: 60, dining: 15, entertainment: 30 } },
  { city: 'Bangalore', country: 'India', region: 'Asia-Pacific', costs: { rent: 400, groceries: 150, transport: 20, utilities: 50, dining: 15, entertainment: 25 } },
  { city: 'Mumbai', country: 'India', region: 'Asia-Pacific', costs: { rent: 700, groceries: 170, transport: 15, utilities: 45, dining: 20, entertainment: 30 } },
  { city: 'Auckland', country: 'New Zealand', region: 'Asia-Pacific', costs: { rent: 1600, groceries: 320, transport: 115, utilities: 130, dining: 70, entertainment: 85 } },
  { city: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia-Pacific', costs: { rent: 550, groceries: 200, transport: 30, utilities: 55, dining: 15, entertainment: 35 } },

  // Middle East & Africa
  { city: 'Dubai', country: 'UAE', region: 'Middle East & Africa', costs: { rent: 2000, groceries: 350, transport: 80, utilities: 130, dining: 70, entertainment: 95 } },
  { city: 'Tel Aviv', country: 'Israel', region: 'Middle East & Africa', costs: { rent: 1800, groceries: 380, transport: 55, utilities: 140, dining: 80, entertainment: 90 } },
  { city: 'Riyadh', country: 'Saudi Arabia', region: 'Middle East & Africa', costs: { rent: 800, groceries: 250, transport: 50, utilities: 80, dining: 40, entertainment: 50 } },
  { city: 'Cape Town', country: 'South Africa', region: 'Middle East & Africa', costs: { rent: 700, groceries: 200, transport: 45, utilities: 70, dining: 30, entertainment: 40 } },
  { city: 'Nairobi', country: 'Kenya', region: 'Middle East & Africa', costs: { rent: 500, groceries: 180, transport: 30, utilities: 60, dining: 20, entertainment: 30 } },

  // South America
  { city: 'Buenos Aires', country: 'Argentina', region: 'South America', costs: { rent: 500, groceries: 180, transport: 15, utilities: 50, dining: 25, entertainment: 35 } },
  { city: 'Sao Paulo', country: 'Brazil', region: 'South America', costs: { rent: 700, groceries: 200, transport: 40, utilities: 70, dining: 30, entertainment: 40 } },
  { city: 'Santiago', country: 'Chile', region: 'South America', costs: { rent: 700, groceries: 220, transport: 40, utilities: 80, dining: 30, entertainment: 40 } },
  { city: 'Bogota', country: 'Colombia', region: 'South America', costs: { rent: 500, groceries: 170, transport: 25, utilities: 60, dining: 20, entertainment: 30 } },
  { city: 'Lima', country: 'Peru', region: 'South America', costs: { rent: 550, groceries: 190, transport: 30, utilities: 55, dining: 25, entertainment: 35 } },
]

/** Returns the percentage difference between two values. Positive = v2 is more expensive. */
export function costDifference(v1: number, v2: number): number {
  if (v1 === 0) return 0
  return Math.round(((v2 - v1) / v1) * 100)
}

/** Returns total monthly cost for a city (sum of all categories). */
export function totalMonthlyCost(city: CityData): number {
  const c = city.costs
  return c.rent + c.groceries + c.transport + c.utilities + c.dining + c.entertainment
}

/** Returns unique regions from the dataset. */
export function getRegions(): string[] {
  return [...new Set(CITIES.map((c) => c.region))]
}

/** Returns cities filtered by region. */
export function getCitiesByRegion(region: string): CityData[] {
  return CITIES.filter((c) => c.region === region)
}
