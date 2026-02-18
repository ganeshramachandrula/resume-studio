import { describe, it, expect } from 'vitest'
import { formatLocalPrice } from '@/lib/i18n/currencies'

describe('formatLocalPrice', () => {
  it('large rate currency (JPY rate=150): no decimals, returns ~¥amount', () => {
    const jpy = { symbol: '¥', code: 'JPY', rate: 150 }
    const result = formatLocalPrice(10, jpy)
    // 10 * 150 = 1500, rounded, no decimals
    expect(result).toBe('~¥1,500')
  })

  it('small rate currency (EUR rate=0.92): has decimals, returns ~€amount', () => {
    const eur = { symbol: '€', code: 'EUR', rate: 0.92 }
    const result = formatLocalPrice(10, eur)
    // 10 * 0.92 = 9.20, formatted with 2 decimals
    expect(result).toBe('~€9.20')
  })

  it('handles zero amount', () => {
    const eur = { symbol: '€', code: 'EUR', rate: 0.92 }
    const result = formatLocalPrice(0, eur)
    expect(result).toBe('~€0.00')
  })

  it('handles zero amount for large rate currency', () => {
    const jpy = { symbol: '¥', code: 'JPY', rate: 150 }
    const result = formatLocalPrice(0, jpy)
    expect(result).toBe('~¥0')
  })

  it('INR (rate=83): returns ~₹amount with no decimals', () => {
    const inr = { symbol: '₹', code: 'INR', rate: 83 }
    const result = formatLocalPrice(10, inr)
    // 10 * 83 = 830, rounded, no decimals (rate >= 10)
    expect(result).toBe('~₹830')
  })
})
