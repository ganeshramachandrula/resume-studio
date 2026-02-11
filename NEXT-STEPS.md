# Resume Studio — Remaining Work

## Phase A: Stripe Setup (1-2 hours)

Everything is coded and ready — just needs real Stripe keys.

1. **Log in** to [dashboard.stripe.com](https://dashboard.stripe.com) (test mode)
2. **Create 4 products**:
   | Product | Type | Price |
   |---------|------|-------|
   | Pro Monthly | Recurring (monthly) | $9.99/mo |
   | Pro Annual | Recurring (yearly) | $79/yr |
   | Team Plan | Recurring (yearly, per-seat) | $59/seat/yr |
   | Credit Pack | One-time | $2.99 |
3. **Copy keys to `.env.local`**:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID=price_...
   STRIPE_TEAM_PRICE_ID=price_...
   STRIPE_CREDIT_PACK_PRICE_ID=price_...
   ```
4. **Enable Stripe Tax** in dashboard settings (Settings > Tax)
5. **Run webhook listener locally**:
   ```bash
   stripe listen --forward-to localhost:5000/api/stripe/webhook
   ```
6. **Test end-to-end**:
   - Free user → checkout Pro Monthly → verify DB plan update
   - Free user → checkout Pro Annual → verify annual features unlock
   - Free user → buy Credit Pack → verify 3 credits added
   - Team admin → checkout Team (5 seats) → verify team created
   - Cancel subscription → verify downgrade to free

---

## Phase C: Deploy to Cloud (2-3 hours)

### C.1: Domain
- Pick and register a domain name (e.g., resumestudio.ai, resumeai.studio)

### C.2: Cloud Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Run all 9 migrations against cloud DB
3. Note the project URL + anon key + service role key

### C.3: OAuth Providers
1. **Google**: Create OAuth app at console.cloud.google.com, add redirect URI
2. **GitHub**: Create OAuth app at github.com/settings/developers, add redirect URI
3. Configure both in Supabase dashboard (Authentication > Providers)

### C.4: Deploy to Vercel
1. Connect GitHub repo to Vercel
2. Set all environment variables:
   - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - Stripe: All 7 keys from Phase A (use live keys for production)
   - AI: `ANTHROPIC_API_KEY`
   - Admin: `ADMIN_OWNER_EMAIL`
3. Configure custom domain in Vercel
4. Update Supabase redirect URLs to use production domain

### C.5: Post-Deploy
1. Update Stripe webhook endpoint to production URL
2. Bootstrap admin: `POST /api/admin/bootstrap`
3. Run full E2E test on production
4. Verify OAuth login (Google + GitHub)
5. Verify Stripe checkout + webhook on production
6. Test all 6 document types with real AI

---

## Phase D: Marketing & Launch (2-3 hours)

### D.1: Legal Pages
- Privacy Policy page (`/privacy`)
- Terms of Service page (`/terms`)

### D.2: SEO
- Meta tags (title, description, og:image) on all public pages
- `sitemap.xml` — already exists, verify routes
- `robots.txt` — already exists, verify
- Structured data (JSON-LD) for landing page

### D.3: Launch
- Product Hunt listing copy + screenshots
- Social media announcement
- Consider a launch discount (coupon in Stripe)

---

## Future Enhancements (Backlog)

| Feature | Description | Priority |
|---------|-------------|----------|
| URL-based JD extraction | Paste job URL from Indeed/Dice/Monster, auto-extract JD text | High |
| Google/GitHub OAuth | Social login (blocked until cloud deploy) | High |
| Redis rate limiting | Replace in-memory rate limiter for multi-instance deploy | Medium |
| Browser extension | Extract JD from any job site (100% coverage) | Low |
| Email notifications | Notify admin on new support messages | Medium |
| Usage analytics dashboard | Charts for user growth, generation volume over time | Medium |
| Export all documents | Bulk download as ZIP | Low |

---

## Current Stats

- **47 routes** (static + dynamic)
- **9 migrations** (001-009)
- **13 PDF templates** (3 free + 10 premium)
- **4 plan types**: free, pro_monthly, pro_annual, team
- **Build**: passing, zero errors
- **Last commit**: `aee16ef` on `main`
