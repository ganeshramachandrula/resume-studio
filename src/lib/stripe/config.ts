export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    documents_per_month: 2,
    templates: 3,
    features: ['2 documents/month', 'Basic ATS score', 'PDF download', '3 templates'],
  },
  basic: {
    name: 'Basic',
    price: 5.99,
    priceId: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID!,
    documents_per_month: 10,
    templates: 13,
    features: [
      '10 documents/month',
      'All 13 templates',
      'No watermark',
      'Save up to 10 applications',
      'Advanced ATS analysis',
      'Job tracker',
    ],
  },
  pro: {
    name: 'Pro',
    price: 10.99,
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    documents_per_month: 20,
    templates: 13,
    features: [
      '20 documents/month',
      'All 13 templates',
      'Premium fonts',
      'Multi-language support',
      'Career Coach',
      'No watermark',
    ],
  },
} as const

export const CREDIT_PACK = {
  name: 'Credit Pack',
  price: 2.99,
  credits: 3,
  priceId: process.env.STRIPE_CREDIT_PACK_PRICE_ID!,
} as const
