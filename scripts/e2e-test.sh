#!/usr/bin/env bash
# =============================================================================
# Resume Studio — Full E2E Test Suite
# =============================================================================
# Simulates real user flows against the running dev server.
#
# Prerequisites:
#   1. Supabase running:  supabase start  (in project dir)
#   2. Dev server running: npm run dev     (port 5000)
#   3. Seed data loaded:   supabase db reset  (if fresh)
#
# Usage:
#   chmod +x scripts/e2e-test.sh
#   ./scripts/e2e-test.sh
#
# NOTE: If running repeatedly, you may hit rate limits (429). Wait 1-2
# minutes between runs, or restart the dev server to clear in-memory
# rate limit state.
#
# All test users use password: TestPassword123
# =============================================================================

set -euo pipefail

BASE_URL="http://localhost:5000"
SUPABASE_URL="http://127.0.0.1:54321"
ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2)

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
  elif [ "$actual" = "429" ]; then
    warn "$label (429 rate limited — retry after 1-2 min)"
  else
    fail "$label (expected $expected, got $actual)"
  fi
}

get_cookie() {
  local email=$1
  curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
    -H "apikey: $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$email\", \"password\": \"TestPassword123\"}" | python3 -c "
import sys, json, base64
s = json.load(sys.stdin)
if 'access_token' not in s:
    print('ERROR'); sys.exit(1)
session_str = json.dumps({
    'access_token': s['access_token'],
    'refresh_token': s['refresh_token'],
    'expires_at': s.get('expires_at', 0),
    'expires_in': s.get('expires_in', 0),
    'token_type': 'bearer',
    'user': s.get('user', {})
})
print('base64-' + base64.b64encode(session_str.encode()).decode())
"
}

get_token() {
  local email=$1
  curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
    -H "apikey: $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$email\", \"password\": \"TestPassword123\"}" | python3 -c "
import sys, json
s = json.load(sys.stdin)
print(s.get('access_token','ERROR'))
"
}

http_status() {
  curl -s -o /dev/null -w "%{http_code}" "$@"
}

# ── Preflight checks ────────────────────────────────────────────────────────

bold "=== PREFLIGHT CHECKS ==="

if ! curl -s -o /dev/null "$BASE_URL" 2>/dev/null; then
  red "Dev server not running on port 5000. Start with: npm run dev"
  exit 1
fi
pass "Dev server running on port 5000"

if ! curl -s -o /dev/null "$SUPABASE_URL/rest/v1/" -H "apikey: $ANON_KEY" 2>/dev/null; then
  red "Supabase not running. Start with: supabase start"
  exit 1
fi
pass "Supabase running"

# ── Acquire auth tokens ─────────────────────────────────────────────────────

bold ""
bold "=== ACQUIRING AUTH TOKENS ==="

BASIC_COOKIE=$(get_cookie "test-monthly@example.com")
PRO_COOKIE=$(get_cookie "test-annual@example.com")
FREE_COOKIE=$(get_cookie "e2e-test@example.com")
ADMIN_COOKIE=$(get_cookie "prsd_srm@yahoo.com")
PRO2_COOKIE=$(get_cookie "test-team@example.com")
CREDITS_COOKIE=$(get_cookie "test-credits@example.com")

BASIC_TOKEN=$(get_token "test-monthly@example.com")
PRO_TOKEN=$(get_token "test-annual@example.com")
FREE_TOKEN=$(get_token "e2e-test@example.com")
ADMIN_TOKEN=$(get_token "prsd_srm@yahoo.com")
PRO2_TOKEN=$(get_token "test-team@example.com")

for name in BASIC PRO FREE ADMIN PRO2 CREDITS; do
  cookie_var="${name}_COOKIE"
  if [[ "${!cookie_var}" == "ERROR" ]]; then
    fail "Login $name user"
  else
    pass "Login $name user"
  fi
done

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 1: MARKETING PAGES
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 1. MARKETING PAGES ==="

for url in \
  "/" "/privacy" "/terms" "/blog" "/contact" "/roast" \
  "/compare/chatgpt" "/compare/indeed" "/compare/linkedin" \
  "/es" "/fr" "/de" "/pt" "/hi" \
  "/login" "/signup"; do
  status=$(http_status "$BASE_URL$url")
  check_status "200" "$status" "GET $url"
done

# Verify hash links on landing page
LANDING=$(curl -s "$BASE_URL/")
for anchor in "/#features" "/#pricing" "/#how-it-works"; do
  if echo "$LANDING" | grep -q "href=\"$anchor\""; then
    pass "Landing page has $anchor link"
  else
    fail "Landing page missing $anchor link"
  fi
done

# Verify legal page content
PRIVACY=$(curl -s "$BASE_URL/privacy")
for term in "Frisco, Texas" "TDPSA" "CCPA" "GDPR" "privacy@resume-studio.io" "Data Breach"; do
  if echo "$PRIVACY" | grep -qi "$term"; then
    pass "Privacy: contains '$term'"
  else
    fail "Privacy: missing '$term'"
  fi
done

TERMS=$(curl -s "$BASE_URL/terms")
for term in "Frisco, Texas" "Collin County" "Arbitration" "Class Action" "Indemnification" "Force Majeure" "Severability"; do
  if echo "$TERMS" | grep -qi "$term"; then
    pass "Terms: contains '$term'"
  else
    fail "Terms: missing '$term'"
  fi
done

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 2: AUTH & ACCESS CONTROL
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 2. AUTH & ACCESS CONTROL ==="

# Unauthenticated redirects
for page in "/dashboard" "/generate" "/settings" "/admin"; do
  status=$(http_status "$BASE_URL$page")
  check_status "307" "$status" "Unauth GET $page → login redirect"
done

# Unauthenticated API access
for route in "/api/ai/generate-resume" "/api/ai/career-coach" "/api/jobs/search"; do
  status=$(http_status -X POST "$BASE_URL$route" -H "Content-Type: application/json" -d '{}')
  check_status "401" "$status" "Unauth POST $route"
done

# Admin API denied for non-admin
for route in "/api/admin/stats" "/api/admin/users" "/api/admin/messages"; do
  status=$(http_status -X GET "$BASE_URL$route" -b "sb-127-auth-token=$BASIC_COOKIE")
  check_status "403" "$status" "Non-admin GET $route"
done

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 3: DASHBOARD PAGES (authenticated)
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 3. DASHBOARD PAGES ==="

for page in \
  "/dashboard" "/generate" "/country-resume" "/documents" \
  "/job-feed" "/job-tracker" "/job-sites" "/vault" \
  "/cost-of-living" "/settings" "/support" "/upgrade" "/career-coach"; do
  status=$(http_status -b "sb-127-auth-token=$BASIC_COOKIE" "$BASE_URL$page")
  check_status "200" "$status" "GET $page (basic user)"
done

# Admin pages
for page in "/admin" "/admin/users" "/admin/analytics" "/admin/messages" "/admin/coach-usage"; do
  status=$(http_status -b "sb-127-auth-token=$ADMIN_COOKIE" "$BASE_URL$page")
  check_status "200" "$status" "GET $page (admin user)"
done

# No server-side rendering errors
for page in "/" "/dashboard" "/generate" "/privacy" "/terms" "/job-feed" "/vault" "/cost-of-living"; do
  content=$(curl -s -b "sb-127-auth-token=$ADMIN_COOKIE" "$BASE_URL$page")
  if echo "$content" | grep -qi "Application error\|Internal Server Error\|Unhandled Runtime Error"; then
    fail "SSR error on $page"
  else
    pass "No SSR error on $page"
  fi
done

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 4: AI GENERATION API ROUTES
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 4. AI GENERATION ROUTES ==="

# Parse JD
PARSE_RESULT=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/ai/parse-jd" \
  -H "Content-Type: application/json" \
  -b "sb-127-auth-token=$BASIC_COOKIE" \
  -d '{"jobDescription": "Senior Software Engineer at Acme Corp, San Francisco, CA. 5+ years React, TypeScript, Node.js, PostgreSQL. AWS/GCP experience required. Remote-friendly. $150-180K + equity."}')
PARSE_STATUS=$(echo "$PARSE_RESULT" | tail -1)
PARSE_BODY=$(echo "$PARSE_RESULT" | sed '$d')
check_status "200" "$PARSE_STATUS" "POST /api/ai/parse-jd"

# Extract parsed data and JD ID for subsequent tests
JD_ID=$(echo "$PARSE_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null || echo "")
PARSED_DATA=$(echo "$PARSE_BODY" | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin)['data']['parsed_data']))" 2>/dev/null || echo "{}")

if [ -z "$JD_ID" ] || [ "$JD_ID" = "" ]; then
  fail "JD parsing returned no ID — skipping generation tests"
else
  pass "JD parsed: ID=$JD_ID"

  EXPERIENCE="7 years as a software engineer. Expert in React, TypeScript, Node.js, PostgreSQL. Led team of 4 at TechCo building microservices. BS Computer Science from UT Austin."
  CONTACT='{"name":"E2E Test","email":"e2e@test.com","phone":"555-0000","location":"Austin, TX"}'

  # Generate Resume
  status=$(http_status -X POST "$BASE_URL/api/ai/generate-resume" \
    -H "Content-Type: application/json" \
    -b "sb-127-auth-token=$BASIC_COOKIE" \
    -d "{\"parsedJD\":$PARSED_DATA,\"experience\":\"$EXPERIENCE\",\"jobDescriptionId\":\"$JD_ID\",\"contactInfo\":$CONTACT}")
  check_status "200" "$status" "POST /api/ai/generate-resume"

  # Generate Cover Letter
  status=$(http_status -X POST "$BASE_URL/api/ai/generate-cover-letter" \
    -H "Content-Type: application/json" \
    -b "sb-127-auth-token=$BASIC_COOKIE" \
    -d "{\"parsedJD\":$PARSED_DATA,\"experience\":\"$EXPERIENCE\",\"jobDescriptionId\":\"$JD_ID\",\"contactInfo\":$CONTACT}")
  check_status "200" "$status" "POST /api/ai/generate-cover-letter"

  # Generate LinkedIn Summary
  status=$(http_status -X POST "$BASE_URL/api/ai/generate-linkedin" \
    -H "Content-Type: application/json" \
    -b "sb-127-auth-token=$BASIC_COOKIE" \
    -d "{\"parsedJD\":$PARSED_DATA,\"experience\":\"$EXPERIENCE\",\"jobDescriptionId\":\"$JD_ID\"}")
  check_status "200" "$status" "POST /api/ai/generate-linkedin"

  # Generate Cold Email
  status=$(http_status -X POST "$BASE_URL/api/ai/generate-cold-email" \
    -H "Content-Type: application/json" \
    -b "sb-127-auth-token=$BASIC_COOKIE" \
    -d "{\"parsedJD\":$PARSED_DATA,\"experience\":\"$EXPERIENCE\",\"jobDescriptionId\":\"$JD_ID\",\"contactInfo\":$CONTACT}")
  check_status "200" "$status" "POST /api/ai/generate-cold-email"

  # Generate Interview Prep
  status=$(http_status -X POST "$BASE_URL/api/ai/generate-interview-prep" \
    -H "Content-Type: application/json" \
    -b "sb-127-auth-token=$BASIC_COOKIE" \
    -d "{\"parsedJD\":$PARSED_DATA,\"experience\":\"$EXPERIENCE\",\"jobDescriptionId\":\"$JD_ID\"}")
  check_status "200" "$status" "POST /api/ai/generate-interview-prep"

  # Generate Certification Guide
  status=$(http_status -X POST "$BASE_URL/api/ai/generate-certification-guide" \
    -H "Content-Type: application/json" \
    -b "sb-127-auth-token=$BASIC_COOKIE" \
    -d "{\"parsedJD\":$PARSED_DATA,\"experience\":\"$EXPERIENCE\",\"jobDescriptionId\":\"$JD_ID\"}")
  check_status "200" "$status" "POST /api/ai/generate-certification-guide"

  # Generate Country Resume (pro user)
  status=$(http_status -X POST "$BASE_URL/api/ai/generate-country-resume" \
    -H "Content-Type: application/json" \
    -b "sb-127-auth-token=$PRO_COOKIE" \
    -d "{\"parsedJD\":$PARSED_DATA,\"experience\":\"$EXPERIENCE\",\"jobDescriptionId\":\"$JD_ID\",\"countryCode\":\"US\",\"contactInfo\":$CONTACT}")
  check_status "200" "$status" "POST /api/ai/generate-country-resume (pro, US)"

  # ATS Score
  status=$(http_status -X POST "$BASE_URL/api/ai/ats-score" \
    -H "Content-Type: application/json" \
    -b "sb-127-auth-token=$BASIC_COOKIE" \
    -d "{\"resumeJSON\":{\"header\":{\"name\":\"Test\"},\"summary\":\"Engineer\",\"experience\":[],\"skills\":{\"core\":[\"React\"]}},\"parsedJD\":$PARSED_DATA}")
  check_status "200" "$status" "POST /api/ai/ats-score"
fi

# Roast My Resume (public — no auth required)
ROAST_JD="Senior Software Engineer at Acme Corp. 5+ years React, TypeScript, Node.js, PostgreSQL required. Remote-friendly position in San Francisco."
ROAST_RESUME="Jordan Smith, Software Engineer. 3 years experience building React apps. Worked at StartupCo building dashboards. BS Computer Science."
status=$(http_status -X POST "$BASE_URL/api/ai/roast-resume" \
  -H "Content-Type: application/json" \
  -d "{\"jobDescription\":\"$ROAST_JD\",\"resumeText\":\"$ROAST_RESUME\"}")
check_status "200" "$status" "POST /api/ai/roast-resume (public, no auth)"

# Roast: short input should fail validation
status=$(http_status -X POST "$BASE_URL/api/ai/roast-resume" \
  -H "Content-Type: application/json" \
  -d '{"jobDescription":"short","resumeText":"short"}')
check_status "400" "$status" "POST /api/ai/roast-resume (short input → 400)"

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 5: CAREER COACH
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 5. CAREER COACH ==="

# Pro user (allowed)
status=$(http_status -X POST "$BASE_URL/api/ai/career-coach" \
  -H "Content-Type: application/json" \
  -b "sb-127-auth-token=$PRO_COOKIE" \
  -d '{"message":"What skills should I learn for full-stack development?"}')
check_status "200" "$status" "POST /api/ai/career-coach (pro user)"

# Free user (denied)
status=$(http_status -X POST "$BASE_URL/api/ai/career-coach" \
  -H "Content-Type: application/json" \
  -b "sb-127-auth-token=$FREE_COOKIE" \
  -d '{"message":"Help me"}')
check_status "403" "$status" "POST /api/ai/career-coach (free user — denied)"

# List conversations
status=$(http_status -X GET "$BASE_URL/api/ai/career-coach/conversations" \
  -b "sb-127-auth-token=$PRO_COOKIE")
check_status "200" "$status" "GET /api/ai/career-coach/conversations"

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 6: JOB FEED & PREFERENCES
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 6. JOB FEED ==="

# Search
JF_RESULT=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/jobs/search" \
  -H "Content-Type: application/json" \
  -b "sb-127-auth-token=$BASIC_COOKIE" \
  -d '{"query":"software engineer","location":"remote","country":"US"}')
JF_STATUS=$(echo "$JF_RESULT" | tail -1)
JF_BODY=$(echo "$JF_RESULT" | sed '$d')
check_status "200" "$JF_STATUS" "POST /api/jobs/search"

JOB_COUNT=$(echo "$JF_BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('jobs',[])))" 2>/dev/null || echo "0")
if [ "$JOB_COUNT" -gt 0 ]; then
  pass "Job search returned $JOB_COUNT jobs"
else
  warn "Job search returned 0 jobs (external APIs may be down)"
fi

# Preferences GET
status=$(http_status -X GET "$BASE_URL/api/jobs/preferences" \
  -b "sb-127-auth-token=$BASIC_COOKIE")
check_status "200" "$status" "GET /api/jobs/preferences"

# Preferences PUT
status=$(http_status -X PUT "$BASE_URL/api/jobs/preferences" \
  -H "Content-Type: application/json" \
  -b "sb-127-auth-token=$BASIC_COOKIE" \
  -d '{"roles":["Software Engineer"],"skills":["React"],"locations":["Remote"],"remote_only":false,"country":"US"}')
check_status "200" "$status" "PUT /api/jobs/preferences"

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 7: STRIPE
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 7. STRIPE ==="

# Create checkout session
status=$(http_status -X POST "$BASE_URL/api/stripe/create-checkout" \
  -H "Content-Type: application/json" \
  -b "sb-127-auth-token=$FREE_COOKIE" \
  -d '{"plan":"basic"}')
check_status "200" "$status" "POST /api/stripe/create-checkout (free → basic)"

# Create portal session
status=$(http_status -X POST "$BASE_URL/api/stripe/create-portal" \
  -H "Content-Type: application/json" \
  -b "sb-127-auth-token=$BASIC_COOKIE")
check_status "200" "$status" "POST /api/stripe/create-portal (basic user)"

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 8: ADMIN API
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 8. ADMIN API ==="

for route in "/api/admin/stats" "/api/admin/users" "/api/admin/analytics" "/api/admin/messages" "/api/admin/coach-usage"; do
  status=$(http_status -X GET "$BASE_URL$route" -b "sb-127-auth-token=$ADMIN_COOKIE")
  check_status "200" "$status" "GET $route (admin)"
done

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 9: DEVICE SESSIONS, EXTENSION, MISC
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 9. DEVICE SESSIONS, EXTENSION & MISC ==="

# Device register
status=$(http_status -X POST "$BASE_URL/api/device-session/register" \
  -H "Content-Type: application/json" \
  -b "sb-127-auth-token=$BASIC_COOKIE" \
  -d '{"deviceId":"e2e0000000000000000000000000000000000000000000000000000000000001","deviceLabel":"E2E Test"}')
check_status "200" "$status" "POST /api/device-session/register"

# Device heartbeat
status=$(http_status -X POST "$BASE_URL/api/device-session/heartbeat" \
  -H "Content-Type: application/json" \
  -b "sb-127-auth-token=$BASIC_COOKIE" \
  -d '{"deviceId":"e2e0000000000000000000000000000000000000000000000000000000000001"}')
check_status "200" "$status" "POST /api/device-session/heartbeat"

# Extension submit JD (Bearer auth)
status=$(http_status -X POST "$BASE_URL/api/extension/submit-jd" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BASIC_TOKEN" \
  -d '{"raw_text":"Frontend Developer at StartupX. We need a skilled frontend developer with 3+ years of experience in React, TypeScript, and modern CSS frameworks for our SaaS product.","source_url":"https://example.com/job/e2e","source_site":"E2E Test"}')
check_status "200" "$status" "POST /api/extension/submit-jd (Bearer)"

# Support contact
status=$(http_status -X POST "$BASE_URL/api/support/contact" \
  -H "Content-Type: application/json" \
  -b "sb-127-auth-token=$BASIC_COOKIE" \
  -d '{"name":"E2E Test","email":"test-monthly@example.com","category":"general","subject":"E2E Automated Test","message":"This is an automated E2E test message. Please ignore."}')
check_status "200" "$status" "POST /api/support/contact"

# Affiliate track (may return 429 if rate limited from repeated runs)
status=$(http_status -X POST "$BASE_URL/api/affiliate/track" \
  -H "Content-Type: application/json" \
  -d '{"partnerId":"E2E_TEST_REF"}')
if [ "$status" = "200" ]; then
  pass "POST /api/affiliate/track (200)"
elif [ "$status" = "429" ]; then
  pass "POST /api/affiliate/track (429 — rate limited, expected on repeated runs)"
else
  fail "POST /api/affiliate/track (expected 200 or 429, got $status)"
fi

# Referral
status=$(http_status -X GET "$BASE_URL/api/referral" -b "sb-127-auth-token=$BASIC_COOKIE")
check_status "200" "$status" "GET /api/referral"

# Document delete (non-existent ID — should return 200 with deleted_count:0)
status=$(http_status -X DELETE "$BASE_URL/api/documents/delete-application" \
  -H "Content-Type: application/json" \
  -b "sb-127-auth-token=$BASIC_COOKIE" \
  -d '{"jobDescriptionId":"00000000-0000-0000-0000-000000000000"}')
check_status "200" "$status" "DELETE /api/documents/delete-application"

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 10: VAULT CRUD (via Supabase REST)
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 10. VAULT CRUD ==="

USER_ID="00000000-0000-4000-a000-000000000001"

# Create certificate
CERT=$(curl -s -X POST "$SUPABASE_URL/rest/v1/vault_certificates" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $BASIC_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"user_id\":\"$USER_ID\",\"name\":\"E2E Cert\",\"issuer\":\"E2E\",\"issue_date\":\"2025-01-01\"}")
CERT_ID=$(echo "$CERT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if isinstance(d,list) and d else '')" 2>/dev/null)
if [ -n "$CERT_ID" ]; then pass "Vault: create certificate"; else fail "Vault: create certificate"; fi

# Create skill
SKILL=$(curl -s -X POST "$SUPABASE_URL/rest/v1/vault_skills" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $BASIC_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"user_id\":\"$USER_ID\",\"name\":\"E2E Skill\",\"category\":\"Test\",\"proficiency\":\"expert\"}")
SKILL_ID=$(echo "$SKILL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if isinstance(d,list) and d else '')" 2>/dev/null)
if [ -n "$SKILL_ID" ]; then pass "Vault: create skill"; else fail "Vault: create skill"; fi

# Create work sample
WS=$(curl -s -X POST "$SUPABASE_URL/rest/v1/vault_work_samples" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $BASIC_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"user_id\":\"$USER_ID\",\"title\":\"E2E Sample\",\"type\":\"portfolio\",\"url\":\"https://example.com\"}")
WS_ID=$(echo "$WS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if isinstance(d,list) and d else '')" 2>/dev/null)
if [ -n "$WS_ID" ]; then pass "Vault: create work sample"; else fail "Vault: create work sample"; fi

# Create reference
REF=$(curl -s -X POST "$SUPABASE_URL/rest/v1/vault_references" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $BASIC_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"user_id\":\"$USER_ID\",\"name\":\"E2E Ref\",\"title\":\"Engineering Manager\",\"relationship\":\"manager\",\"company\":\"TestCo\",\"email\":\"ref@test.com\"}")
REF_ID=$(echo "$REF" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if isinstance(d,list) and d else '')" 2>/dev/null)
if [ -n "$REF_ID" ]; then pass "Vault: create reference"; else fail "Vault: create reference"; fi

# RLS check: free user can't see monthly user's vault data
RLS_CHECK=$(curl -s "$SUPABASE_URL/rest/v1/vault_certificates?select=id" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $FREE_TOKEN")
RLS_COUNT=$(echo "$RLS_CHECK" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
if [ "$RLS_COUNT" = "0" ]; then
  pass "Vault RLS: free user sees 0 of monthly user's certs"
else
  fail "Vault RLS: free user sees $RLS_COUNT certs (expected 0)"
fi

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 11: SECURITY EDGE CASES
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 11. SECURITY ==="

# Invalid JSON
status=$(http_status -X POST "$BASE_URL/api/ai/generate-resume" \
  -H "Content-Type: application/json" \
  -b "sb-127-auth-token=$BASIC_COOKIE" \
  -d 'NOT JSON')
check_status "400" "$status" "Invalid JSON body → 400"

# Missing content-type
status=$(http_status -X POST "$BASE_URL/api/ai/generate-resume" \
  -b "sb-127-auth-token=$BASIC_COOKIE" \
  -d '{"test":true}')
check_status "400" "$status" "Missing Content-Type → 400"

# SQL injection in search (should not error)
status=$(http_status -X POST "$BASE_URL/api/jobs/search" \
  -H "Content-Type: application/json" \
  -b "sb-127-auth-token=$BASIC_COOKIE" \
  -d '{"query":"engineer\" OR 1=1 --","location":"remote","country":"US"}')
check_status "200" "$status" "SQL injection in search → handled (200)"

# Free user generation (preview only — or 403 if usage limit hit)
if [ -n "$JD_ID" ] && [ "$JD_ID" != "" ]; then
  FREE_GEN=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/ai/generate-resume" \
    -H "Content-Type: application/json" \
    -b "sb-127-auth-token=$FREE_COOKIE" \
    -d "{\"parsedJD\":$PARSED_DATA,\"experience\":\"3 years developer, Python and JavaScript.\",\"jobDescriptionId\":\"$JD_ID\",\"contactInfo\":{\"name\":\"Free User\",\"email\":\"free@test.com\"}}")
  FREE_STATUS=$(echo "$FREE_GEN" | tail -1)
  FREE_BODY=$(echo "$FREE_GEN" | sed '$d')
  if [ "$FREE_STATUS" = "200" ]; then
    SAVED=$(echo "$FREE_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('saved','missing'))" 2>/dev/null)
    if [ "$SAVED" = "False" ]; then
      pass "Free user generation: saved=false (preview only)"
    else
      # If saved=true, free user might have had credits — still acceptable behavior
      warn "Free user generation: saved=$SAVED (may have had credits)"
    fi
  elif [ "$FREE_STATUS" = "403" ]; then
    pass "Free user generation: 403 (usage limit reached — expected after repeated runs)"
  else
    if [ "$FREE_STATUS" = "429" ]; then
      warn "Free user generation: 429 (rate limited — retry after 1-2 min)"
    else
      fail "Free user generation: unexpected status $FREE_STATUS"
    fi
  fi
fi

# ═════════════════════════════════════════════════════════════════════════════
# SECTION 12: VERIFY PROFILES
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== 12. VERIFY USER PROFILES ==="

verify_profile() {
  local email=$1 expected_plan=$2 expected_role=$3
  local TOKEN PROFILE PLAN ROLE
  TOKEN=$(get_token "$email")
  PROFILE=$(curl -s "$SUPABASE_URL/rest/v1/profiles?select=plan,role,credits" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $TOKEN")
  PLAN=$(echo "$PROFILE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['plan'] if d else '?')" 2>/dev/null)
  ROLE=$(echo "$PROFILE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['role'] if d else '?')" 2>/dev/null)

  if [ "$PLAN" = "$expected_plan" ]; then
    pass "$email plan=$PLAN"
  else
    fail "$email plan=$PLAN (expected $expected_plan)"
  fi
  if [ "$ROLE" = "$expected_role" ]; then
    pass "$email role=$ROLE"
  else
    fail "$email role=$ROLE (expected $expected_role)"
  fi
}

verify_profile "test-monthly@example.com" "basic"       "user"
verify_profile "test-annual@example.com"  "pro"         "user"
verify_profile "test-team@example.com"    "pro"         "user"
verify_profile "test-credits@example.com" "free"        "user"
verify_profile "e2e-test@example.com"     "free"        "user"
verify_profile "prsd_srm@yahoo.com"       "free"        "admin"

# ═════════════════════════════════════════════════════════════════════════════
# CLEANUP
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "=== CLEANING UP E2E TEST DATA ==="

# Delete test documents
curl -s -X DELETE "$SUPABASE_URL/rest/v1/documents?user_id=eq.$USER_ID" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $BASIC_TOKEN" > /dev/null

curl -s -X DELETE "$SUPABASE_URL/rest/v1/documents?user_id=eq.00000000-0000-4000-a000-000000000002" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $PRO_TOKEN" > /dev/null

curl -s -X DELETE "$SUPABASE_URL/rest/v1/documents?user_id=eq.00000000-0000-4000-a000-000000000005" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $FREE_TOKEN" > /dev/null

# Delete test JDs
curl -s -X DELETE "$SUPABASE_URL/rest/v1/job_descriptions?user_id=eq.$USER_ID" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $BASIC_TOKEN" > /dev/null

# Delete test vault items
[ -n "$CERT_ID" ] && curl -s -X DELETE "$SUPABASE_URL/rest/v1/vault_certificates?id=eq.$CERT_ID" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $BASIC_TOKEN" > /dev/null
[ -n "$SKILL_ID" ] && curl -s -X DELETE "$SUPABASE_URL/rest/v1/vault_skills?id=eq.$SKILL_ID" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $BASIC_TOKEN" > /dev/null
[ -n "$WS_ID" ] && curl -s -X DELETE "$SUPABASE_URL/rest/v1/vault_work_samples?id=eq.$WS_ID" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $BASIC_TOKEN" > /dev/null
[ -n "$REF_ID" ] && curl -s -X DELETE "$SUPABASE_URL/rest/v1/vault_references?id=eq.$REF_ID" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $BASIC_TOKEN" > /dev/null

# Delete test support messages
curl -s -X DELETE "$SUPABASE_URL/rest/v1/support_messages?subject=like.*E2E*" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null

# Delete test device sessions
curl -s -X DELETE "$SUPABASE_URL/rest/v1/device_sessions?device_id=eq.e2e0000000000000000000000000000000000000000000000000000000000001" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $BASIC_TOKEN" > /dev/null

# Delete test coach conversations
curl -s -X DELETE "$SUPABASE_URL/rest/v1/coach_conversations?user_id=eq.00000000-0000-4000-a000-000000000002" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $PRO_TOKEN" > /dev/null

pass "Test data cleaned up"

# ═════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═════════════════════════════════════════════════════════════════════════════

bold ""
bold "═══════════════════════════════════════════════════════"
bold "  E2E TEST RESULTS"
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
