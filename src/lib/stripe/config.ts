export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    documents_per_month: 2,
    templates: 3,
    features: ['Basic ATS score', 'PDF download', '3 templates'],
  },
  pro_monthly: {
    name: 'Pro Monthly',
    price: 9.99,
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    documents_per_month: Infinity,
    templates: Infinity,
    features: [
      'Unlimited documents',
      'All templates',
      'Full app package',
      'Advanced ATS',
      'Job tracker',
      'Interview prep',
      'No ads',
    ],
  },
  pro_annual: {
    name: 'Pro Annual',
    price: 79,
    priceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
    documents_per_month: Infinity,
    templates: Infinity,
    features: [
      'Everything in Pro',
      'Priority generation',
      'AI Career Coach',
      'Multi-language',
      'Premium templates',
    ],
  },
} as const
