# Resume Studio

AI-powered career document generator. Paste a job description and your experience — get a tailored resume, cover letter, LinkedIn summary, cold email, interview prep, and certification guide in seconds.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (Postgres + Auth + RLS)
- **Payments**: Stripe (subscriptions + one-time credits)
- **AI**: Claude API (Anthropic)
- **PDF**: @react-pdf/renderer
- **State**: Zustand
- **Tests**: Vitest + Testing Library

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for local Supabase)
- Anthropic API key

### Setup

```bash
# Install dependencies
npm install

# Start local Supabase (applies all migrations automatically)
npx supabase start

# Start dev server (runs on port 5000)
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

### Environment Variables

Copy `.env.local.example` or configure `.env.local` with:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from `supabase start` output
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from dashboard.stripe.com
- `STRIPE_WEBHOOK_SECRET` — from `stripe listen`
- Price IDs for Pro Monthly, Pro Annual, Team, and Credit Pack

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 5000 |
| `npm run build` | Production build |
| `npm run start` | Start production server on port 5000 |
| `npm run lint` | Run ESLint |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Project Structure

```
src/
  app/              # Next.js App Router pages and API routes
    (auth)/         # Login, signup, email verification
    (dashboard)/    # Generate, applications, job feed, settings, admin
    (marketing)/    # Landing page, pricing, privacy, terms, i18n
    api/            # API routes (AI, Stripe, auth, admin, jobs, etc.)
  components/       # React components (UI, generate, preview, admin)
  lib/              # Utilities (Supabase clients, Stripe, Claude, rate limiting)
  store/            # Zustand stores (generation, app, job-feed)
  types/            # TypeScript type definitions
  test/             # Test setup and utilities
supabase/
  migrations/       # 13 SQL migrations (001-013)
  config.toml       # Local Supabase configuration
browser-extension/  # Chrome extension (Manifest V3) for JD capture
```

## Plans

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 2 generations/month, preview only, watermarked PDFs |
| Pro Monthly | $9.99/mo | Unlimited generations, DB save, 10 applications |
| Pro Annual | $79/yr | Everything in Pro + premium templates, career coach, multi-language |
| Team | $59/seat/yr | Pro Annual features + team management, min 5 seats |
| Credit Pack | $2.99 | 3 one-time generations, no watermark, saved to DB |
