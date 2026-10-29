# FitAI delivery facts (verified)

Single source of truth for the handover HTML. Generated **2026-10-29** from repository inspection, `docs/TEST_REPORT.md`, local runs, and captured assets under `docs/delivery/screens/`.

---

## Executive metrics

| Metric | Verified value | Source |
|--------|----------------|--------|
| Primary app screens / routes | **15** user-facing routes (login, onboarding, dashboard, coach, workouts, workout details, active workout, nutrition, food add, progress, profile, help, offline, reset-password, plus `/` redirect) | `npm run build` route list; `docs/PLAN.md` |
| End-to-end user journeys passing | **10 / 10** | `docs/TEST_REPORT.md` §2.3 |
| Unit + component tests | **57 / 57** | `docs/TEST_REPORT.md` §2.1 |
| Playwright E2E cases | **112 / 112** | `docs/TEST_REPORT.md` §1 |
| Visual regression snapshots | **31 / 31** | `docs/TEST_REPORT.md` §2.7 |
| Lighthouse CI (9 routes) | **100 / 100 / 100 / 100** (performance / a11y / best practices / SEO) | `docs/TEST_REPORT.md` §2.8 |
| Axe serious/critical | **0** | `docs/TEST_REPORT.md` §2.6 |
| Production pages built | **17/17** (per test report; build lists 20 app entries incl. API + manifest) | `docs/TEST_REPORT.md`; local build 2026-10-29 |

**Unit test line coverage (overall):** **51.9%** lines (`npm run test:unit:coverage`, 2026-10-29). Repo layer `src/lib/data/repos/*` at **0%** in unit runs (covered by E2E/integration against local Supabase per `docs/BACKEND_PLAN.md`). **No** `tests/integration` directory present; `npm run test:integration` script exists but suite not shipped in tree.

---

## Stack: proposed vs delivered

| Area | Proposal (`docs/references/proposal.md`) | Delivered | Notes |
|------|------------------------------------------|-----------|--------|
| Frontend | Next.js, React, TS, Tailwind | Next.js **16.4**, React **19.3**, TS strict, Tailwind **v4** | `package.json` |
| Backend | Supabase | Supabase migrations **001–004**, RLS, repos, TanStack Query | `docs/BACKEND_PLAN.md` |
| Auth | Email/password | Supabase Auth + proxy guard + reset password | `src/proxy.ts`, `src/lib/auth.ts` |
| AI | Google Gemini (server) | **Simulated** keyword engine | `src/lib/reply.ts`; no Gemini SDK in deps |
| Charts | Chart library (optional) | **Hand-built SVG** | `src/components/charts/*` |
| Motion | Rich motion spec | CSS/`NumberStat`/transitions; **no** `motion` or `@number-flow/react` package | `docs/AUDIT.md`; `package.json` |
| PWA | Installable / offline | Manifest, `public/sw.js`, install banner, offline page | `docs/PWA_PLAN.md` |
| Hosting | Vercel | Documented; **live production URL not verified** in repo | `docs/DEPLOYMENT.md` |

---

## MVP feature status (4.1–4.5)

### 4.1 Authentication and onboarding

| Feature | Status | Where | Notes |
|---------|--------|-------|-------|
| Sign up / log in | Delivered | `/login` | Supabase auth |
| Validation, show password, terms | Delivered | `/login` | E2E AUTH-* |
| Forgot password | Delivered | `/login` | Email reset flow |
| Reset password page | Delivered | `/reset-password` | |
| Five-step onboarding + targets | Delivered | `/onboarding` | Mifflin–St Jeor via `calcTargets` |
| Route guards | Delivered | `src/proxy.ts` | |
| Delete account | Delivered | Profile + `POST /api/account/delete` | Service role server-side |

### 4.2 Dashboard and home

| Feature | Status | Where | Notes |
|---------|--------|-------|-------|
| Rings, weight, sessions, greeting | Delivered | `/dashboard` | |
| Quick actions + navigation | Delivered | `/dashboard` | |
| Tip banner dismiss | Delivered | `/dashboard` | |
| Weight chart 7d/30d | Delivered | `/dashboard` | |
| Command palette | Delivered | Global Ctrl/Cmd+K | |

### 4.3 Workouts

| Feature | Status | Where | Notes |
|---------|--------|-------|-------|
| Weekly planner | Delivered | `/workouts` | |
| Workout details | Delivered | `/workouts/details` | |
| Active workout + rest timer | Delivered | `/workouts/active` | Active state also in `localStorage` |
| Regenerate plan | Delivered | `/workouts` | RPC `regenerate_plan` (rule-based, not AI) |
| Custom routines / filters | Delivered | `/workouts` | |

### 4.4 Nutrition

| Feature | Status | Where | Notes |
|---------|--------|-------|-------|
| Daily overview + meals | Delivered | `/nutrition` | |
| Food search + custom food | Delivered | `/nutrition/add` | |
| Undo on food remove | Delivered | `/nutrition` | |
| Nova meal suggestion chip | Delivered | `/nutrition` | One-tap add; rule-based suggestion |

### 4.5 AI coach, progress, profile, shell

| Feature | Status | Where | Notes |
|---------|--------|-------|-------|
| Nova chat | **Simulated** | `/coach` | `reply.ts`; streaming UI only |
| Context panel | Delivered | `/coach` | Live selectors |
| Progress charts + log weight | Delivered | `/progress` | |
| Profile + targets + sounds | Delivered | `/profile` | |
| Feedback modal | **Partial** | Profile / sidebar | Persists to Supabase `feedback` + local fallback patterns in docs |
| Help center + InfoTips + tour | Delivered | `/help`, inline | `src/content/help.ts` |
| PWA install + offline | Delivered | Manifest, SW, `/offline` | **No push notifications** |
| Demo seed user `alex@fitai.app` | **Partial** | Local only | `supabase/seed-demo.sql`; `db reset` may conflict with catalog in migration 004 + `seed.sql` (duplicate key); demo auth requires valid `auth.identities` row when inserted manually |

---

## Screenshots (handover)

| Screen | Desktop 1440 | Mobile 390 | Capture method |
|--------|--------------|------------|----------------|
| Login | yes | yes | Playwright live app 2026-10-29 |
| Onboarding | yes | yes | Playwright (new signup) |
| Dashboard | yes | yes | Visual baseline PNG → JPEG (`design/screenshots/`) |
| Coach | yes | yes | Visual baseline |
| Workouts / details / active | yes | yes | Visual baseline |
| Nutrition / add | yes | yes | Visual baseline |
| Progress / profile | yes | yes | Visual baseline |
| Help | yes | yes | Playwright after API signup + SQL onboarding flag |
| Offline (PWA) | yes | yes | Playwright `/offline` |

---

## Data and security (summary)

- **Schema:** `supabase/migrations/20261029000001_init.sql` + RLS `000002` + triggers `000003` + catalog `000004`.
- **RLS:** User tables scoped to `auth.uid()`; catalogs read-only for authenticated; feedback insert allowed for anon+auth (`docs/BACKEND_PLAN.md` §3).
- **Client cache:** `fitai.cache.v1`, offline queue, active workout local key per PWA plan.
- **Privacy copy in help.ts** still describes client-only localStorage in places; **production path is Supabase** — handover doc uses backend plan as authoritative.

---

## Delivery package

| Item | Location |
|------|----------|
| Source repo | `https://github.com/gouravN0709/Hackathon-2-Gourav-Narvariya.git` |
| Docs | `docs/` (BRAND_OS, BACKEND_PLAN, PWA_PLAN, HELP_PLAN, TEST_REPORT, DEPLOYMENT) |
| Supabase | Migrations + `seed.sql`; demo `seed-demo.sql` **local only** |
| Hosted Supabase project name | **Fit-Ai** (linked ref in CLI status; ref not repeated in public HTML) |
| Design references | `design/screenshots/` |
| CI | `.github/workflows/ci.yml` |

---

## Known gaps / not verified

- Original **Canva** reference URL not opened (no Canva MCP access).
- **Live Vercel URL** not stored in repository.
- **Google Gemini** not integrated.
- **Push notifications** explicitly out of scope (`docs/PWA_PLAN.md`).
- **Integration test folder** absent despite npm script.
- **help.ts privacy** strings partially outdated vs Supabase backend.

---

## Changelog

- 2026-10-29 — Initial delivery facts for handover HTML.
