// Map timezone regions to approximate currency display
// This is for display only — actual billing is handled by Stripe in USD

interface CurrencyInfo {
  symbol: string
  code: string
  rate: number // approximate conversion from USD
}

const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  EUR: { symbol: '\u20AC', code: 'EUR', rate: 0.92 },
  GBP: { symbol: '\u00A3', code: 'GBP', rate: 0.79 },
  INR: { symbol: '\u20B9', code: 'INR', rate: 83 },
  CAD: { symbol: 'CA$', code: 'CAD', rate: 1.36 },
  AUD: { symbol: 'A$', code: 'AUD', rate: 1.54 },
  BRL: { symbol: 'R$', code: 'BRL', rate: 4.97 },
  JPY: { symbol: '\u00A5', code: 'JPY', rate: 150 },
  KRW: { symbol: '\u20A9', code: 'KRW', rate: 1330 },
  MXN: { symbol: 'MX$', code: 'MXN', rate: 17.2 },
}

// Timezone → currency mapping (common ones)
const TIMEZONE_CURRENCY: Record<string, string> = {
  'Europe/London': 'GBP',
  'Europe/Paris': 'EUR',
  'Europe/Berlin': 'EUR',
  'Europe/Madrid': 'EUR',
  'Europe/Rome': 'EUR',
  'Europe/Amsterdam': 'EUR',
  'Europe/Brussels': 'EUR',
  'Europe/Vienna': 'EUR',
  'Europe/Lisbon': 'EUR',
  'Europe/Dublin': 'EUR',
  'Europe/Helsinki': 'EUR',
  'Asia/Kolkata': 'INR',
  'Asia/Calcutta': 'INR',
  'Asia/Mumbai': 'INR',
  'America/Toronto': 'CAD',
  'America/Vancouver': 'CAD',
  'Australia/Sydney': 'AUD',
  'Australia/Melbourne': 'AUD',
  'America/Sao_Paulo': 'BRL',
  'Asia/Tokyo': 'JPY',
  'Asia/Seoul': 'KRW',
  'America/Mexico_City': 'MXN',
}

export function detectLocalCurrency(): CurrencyInfo | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const currencyCode = TIMEZONE_CURRENCY[tz]
    if (currencyCode && CURRENCY_MAP[currencyCode]) {
      return CURRENCY_MAP[currencyCode]
    }
    return null
  } catch {
    return null
  }
}

export function formatLocalPrice(usdAmount: number, currency: CurrencyInfo): string {
  const localAmount = Math.round(usdAmount * currency.rate)
  // For large currencies like JPY, KRW, INR — no decimals
  if (currency.rate >= 10) {
    return `~${currency.symbol}${localAmount.toLocaleString()}`
  }
  const amount = (usdAmount * currency.rate).toFixed(2)
  return `~${currency.symbol}${amount}`
}

export function detectBrowserLanguageCode(): string {
  try {
    const lang = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || 'en'
    // Get the 2-letter code
    return lang.split('-')[0].toLowerCase()
  } catch {
    return 'en'
  }
}
