#!/usr/bin/env bash
# =============================================================================
# Resume Studio — Production E2E Test Suite
# =============================================================================
# Tests the live production site (https://resume-studio.io) for:
#   - All marketing/public pages load (200)
#   - Unauthenticated dashboard pages redirect to login (307)
#   - Unauthenticated API routes return 401
#   - No SSR errors on any page
#   - Legal page content verification
#   - Landing page link verification
#
# NOTE: Authenticated tests (AI generation, Stripe, team, vault, etc.)
# cannot run against production because test users only exist in local
# Supabase. Use scripts/e2e-test.sh for the full suite locally.
#
# Usage:
#   chmod +x scripts/e2e-test-prod.sh
#   ./scripts/e2e-test-prod.sh
# =============================================================================

set -euo pipefail

BASE_URL="https://resume-studio.io"

PASS=0
FAIL=0
WARN=0
ERRORS=""

# ── Helpers ──────────────────────────────────────────────────────────────────

green()  { printf "\033[32m%s\033[0m\n" "$1"; }
red()    { printf "\033[31m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }
bold()   { printf "\033[1m%s\033[0m\n" "$1"; }

pass() { PASS=$((PASS + 1)); green "  ✅ $1"; }
fail() { FAIL=$((FAIL + 1)); red   "  ❌ $1"; ERRORS="$ERRORS\n  - $1"; }
warn() { WARN=$((WARN + 1)); yellow "  ⚠️  $1"; }

check_status() {
  local expected=$1 actual=$2 label=$3
  if [ "$actual" = "$expected" ]; then
    pass "$label ($actual)"
  else
    fail "$label (expected $expected, got $actual)"
  fi
}

http_status() {
  curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$@"
}

# ── Preflight ─────────────────────────────────────────────────────────────────

bold "=== PREFLIGHT CHECKS ==="

if ! curl -s -o /dev/null --max-time 10 "$BASE_URL" 2>/dev/null; then
  red "Production site not reachable at $BASE_URL"
  exit 1
fi
pass "Production site reachable at $BASE_URL"

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 1: MARKETING PAGES
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 1. MARKETING PAGES ==="

for url in \
  "/" "/privacy" "/terms" "/blog" "/contact" "/roast" \
  "/compare/chatgpt" "/compare/indeed" "/compare/linkedin" \
  "/es" "/fr" "/de" "/pt" "/hi" \
  "/login" "/signup" "/pricing"; do
  status=$(http_status "$BASE_URL$url")
  check_status "200" "$status" "GET $url"
done

# Verify hash links on landing page
LANDING=$(curl -s --max-time 15 "$BASE_URL/")
for anchor in "/#features" "/#pricing" "/#how-it-works"; do
  if echo "$LANDING" | grep -q "href=\"$anchor\""; then
    pass "Landing page has $anchor link"
  else
    fail "Landing page missing $anchor link"
  fi
done

# Roast My Resume visibility (navbar + hero + banner)
if echo "$LANDING" | grep -qi "Roast My Resume"; then
  pass "Landing page contains 'Roast My Resume' text"
else
  fail "Landing page missing 'Roast My Resume' text"
fi

if echo "$LANDING" | grep -q 'href="/roast"'; then
  pass "Landing page has /roast link"
else
  fail "Landing page missing /roast link"
fi

if echo "$LANDING" | grep -qi "FREE"; then
  pass "Landing page has FREE badge"
else
  fail "Landing page missing FREE badge"
fi

if echo "$LANDING" | grep -qi "Not ready to sign up"; then
  pass "Roast banner: 'Not ready to sign up?' text present"
else
  fail "Roast banner: 'Not ready to sign up?' text missing"
fi

if echo "$LANDING" | grep -qi "brutally honest"; then
  pass "Roast banner: 'brutally honest' text present"
else
  fail "Roast banner: 'brutally honest' text missing"
fi

if echo "$LANDING" | grep -qi "roast your resume free"; then
  pass "Hero: 'roast your resume free' link present"
else
  fail "Hero: 'roast your resume free' link missing"
fi

# Verify legal page content
PRIVACY=$(curl -s --max-time 15 "$BASE_URL/privacy")
for term in "Frisco, Texas" "TDPSA" "CCPA" "GDPR" "privacy@resume-studio.io" "Data Breach"; do
  if echo "$PRIVACY" | grep -qi "$term"; then
    pass "Privacy: contains '$term'"
  else
    fail "Privacy: missing '$term'"
  fi
done

TERMS=$(curl -s --max-time 15 "$BASE_URL/terms")
for term in "Frisco, Texas" "Collin County" "Arbitration" "Class Action" "Indemnification" "Force Majeure" "Severability"; do
  if echo "$TERMS" | grep -qi "$term"; then
    pass "Terms: contains '$term'"
  else
    fail "Terms: missing '$term'"
  fi
done

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 2: AUTH & ACCESS CONTROL (unauthenticated)
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 2. AUTH & ACCESS CONTROL ==="

# Pages with server-side middleware redirect (307)
for page in "/dashboard" "/generate" "/settings" "/admin" \
  "/documents" "/job-tracker" "/career-coach" "/team"; do
  status=$(http_status "$BASE_URL$page")
  check_status "307" "$status" "Unauth GET $page → login redirect"
done

# Pages with client-side auth redirect (render 200, redirect in browser)
for page in "/job-feed" "/vault" "/cost-of-living" "/support" \
  "/upgrade" "/country-resume" "/job-sites"; do
  status=$(http_status "$BASE_URL$page")
  check_status "200" "$status" "Unauth GET $page → renders (client-side auth)"
done

# Unauthenticated API access (should return 401)
for route in "/api/ai/generate-resume" "/api/ai/career-coach" "/api/jobs/search"; do
  status=$(http_status -X POST "$BASE_URL$route" -H "Content-Type: application/json" -d '{}')
  check_status "401" "$status" "Unauth POST $route"
done

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 3: SSR ERROR CHECK (public pages)
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 3. SSR ERROR CHECK ==="

for page in "/" "/privacy" "/terms" "/blog" "/contact" "/roast" "/login" "/signup" \
  "/compare/chatgpt" "/es" "/fr" "/de" "/pt" "/hi" "/pricing"; do
  content=$(curl -s --max-time 15 "$BASE_URL$page")
  if echo "$content" | grep -qi "Application error\|Internal Server Error\|Unhandled Runtime Error\|NEXT_NOT_FOUND"; then
    fail "SSR error on $page"
  else
    pass "No SSR error on $page"
  fi
done

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 4: RESPONSE HEADERS
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 4. RESPONSE HEADERS ==="

HEADERS=$(curl -s -I --max-time 15 "$BASE_URL/")

# Check for security headers
if echo "$HEADERS" | grep -qi "x-frame-options"; then
  pass "X-Frame-Options header present"
else
  warn "X-Frame-Options header missing"
fi

if echo "$HEADERS" | grep -qi "x-content-type-options"; then
  pass "X-Content-Type-Options header present"
else
  warn "X-Content-Type-Options header missing"
fi

if echo "$HEADERS" | grep -qi "strict-transport-security"; then
  pass "Strict-Transport-Security header present"
else
  warn "Strict-Transport-Security header missing"
fi

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 5: SEO & META
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 5. SEO & META ==="

# robots.txt
ROBOTS_STATUS=$(http_status "$BASE_URL/robots.txt")
check_status "200" "$ROBOTS_STATUS" "GET /robots.txt"

# sitemap.xml
SITEMAP_STATUS=$(http_status "$BASE_URL/sitemap.xml")
check_status "200" "$SITEMAP_STATUS" "GET /sitemap.xml"

# Meta tags on landing page
if echo "$LANDING" | grep -qi "<title>"; then
  pass "Landing page has <title> tag"
else
  fail "Landing page missing <title> tag"
fi

if echo "$LANDING" | grep -qi "meta.*description"; then
  pass "Landing page has meta description"
else
  fail "Landing page missing meta description"
fi

# ═════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "═══════════════════════════════════════════════════════"
bold "  PRODUCTION E2E TEST RESULTS"
bold "═══════════════════════════════════════════════════════"
green "  Passed:   $PASS"
if [ "$WARN" -gt 0 ]; then
  yellow "  Warnings: $WARN"
fi
if [ "$FAIL" -gt 0 ]; then
  red   "  Failed:   $FAIL"
  red ""
  red "  Failures:"
  echo -e "$ERRORS"
  bold ""
  bold "═══════════════════════════════════════════════════════"
  exit 1
else
  bold ""
  bold "  All tests passed! 🎉"
  bold "═══════════════════════════════════════════════════════"
  exit 0
fi
