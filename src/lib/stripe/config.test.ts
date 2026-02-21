import { describe, it, expect } from 'vitest'
import { PLANS, CREDIT_PACK } from '@/lib/stripe/config'

describe('PLANS', () => {
  it('has keys: free, basic, pro', () => {
    const keys = Object.keys(PLANS)
    expect(keys).toContain('free')
    expect(keys).toContain('basic')
    expect(keys).toContain('pro')
    expect(keys).toHaveLength(3)
  })

  it('free plan price is 0', () => {
    expect(PLANS.free.price).toBe(0)
  })

  it('all paid plans have a priceId field', () => {
    expect(PLANS.basic).toHaveProperty('priceId')
    expect(PLANS.pro).toHaveProperty('priceId')
  })
})

describe('CREDIT_PACK', () => {
  it('has price, credits, and name', () => {
    expect(CREDIT_PACK).toHaveProperty('price')
    expect(CREDIT_PACK).toHaveProperty('credits')
    expect(CREDIT_PACK).toHaveProperty('name')
  })

  it('credits is 3', () => {
    expect(CREDIT_PACK.credits).toBe(3)
  })
})
