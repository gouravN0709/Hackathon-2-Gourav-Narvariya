# FitAI Backend Plan (Phase: Supabase)

Status: **implemented** (this document describes the real shipped backend: schema, RLS, data layer and test setup).

Goal: replace the localStorage data layer (`fitai.state.v2` in `src/lib/store.ts`) with Supabase (Postgres + Auth + RLS) while keeping every screen, design token, animation, copy string and user-visible behavior exactly as it is. Nova stays the simulated reply engine (`src/lib/reply.ts`) — no AI calls in this phase.

Sources of truth read before coding:

- `docs/BRAND_OS.md` (Rule zero: designs win; voice; copy)
- `FITAI_MASTER_PROMPT.md` / docs (data model seed values; section 4 demo data)
- `docs/FITAI_E2E_TEST_PLAN.md` (journeys J1–J10, seed values, frozen test day 2026-10-15)
- current store: `src/lib/store.ts`, `src/lib/selectors.ts`, `src/lib/data/{seed,workouts,foods,options}.ts`

---

## 1. Stack and packages

| Concern | Choice |
|---|---|
| Database / Auth / RLS | Supabase (Postgres), local stack via Supabase CLI (`supabase start`), prod = hosted project |
| Client libs | `@supabase/supabase-js` v2 (verified via `npm view`), `@supabase/ssr` v0.12 for cookie-based sessions |
| Query/mutation layer | TanStack Query v5 (`@tanstack/react-query`) with optimistic updates + rollback; Zustand kept as the in-memory UI state mirror (same shape as today) |
| Validation | `zod` schemas shared client/server (`src/lib/schemas.ts`) |
| Types | `supabase gen types typescript --local` → `src/lib/supabase/types.ts`; no `any` |

Supabase CLI is a devDependency; Next 16 uses **`proxy.ts`** (the old `middleware.ts` convention is deprecated) for session refresh + route guarding.

### Env vars

`.env.local` (never committed; `.env.example` committed):

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=…            # sb_publishable_… / anon key — browser-safe
SUPABASE_SERVICE_ROLE_KEY=…                # server-only; NOT NEXT_PUBLIC_*, only imported by src/lib/supabase/admin.ts
NEXT_PUBLIC_TODAY=2026-10-15               # optional: freeze "today" for demos/tests
NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION=false
```

Grep gate in CI: build output must contain `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` only; `SERVICE_ROLE` appears in no client bundle.

---

## 2. Schema (migrations in `supabase/migrations/*.sql`)

All tables `uuid PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at timestamptz DEFAULT now()`, `updated_at timestamptz` (kept fresh by trigger `set_updated_at`) where mutable, snake_case, and (for user tables) `user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`.

```
auth.users (Supabase)
 └─ profiles               id = auth.uid  PK
 ├─ weight_logs           (user_id, logged_on, kg)          UNIQUE(user_id, logged_on)
 ├─ user_plan             (user_id, dow 0-6, workout_key)   UNIQUE(user_id, dow)
 ├─ workout_extras        (user_id, workout_key, exercise_key) UNIQUE(user_id, workout_key, exercise_key)
 ├─ custom_routines       (user_id, name UNIQUE per user, exercise_keys text[])
 ├─ workout_sessions      (user_id, performed_on, workout_key, name, minutes, volume_kg)
 │    └─ session_sets     (session_id FK → workout_sessions ON DELETE CASCADE,
 │                          exercise_key, set_no, kg, reps, done)
 ├─ custom_foods          (user_id, name per user, cat, base, k/p/c/f, servings jsonb)
 ├─ meal_entries          (user_id, logged_on date, meal, name, serving_label, servings,
 │                          kcal, protein, carbs, fats, food_key nullable)
 ├─ chat_messages         (user_id, role ai|user, text, card bool)
 ├─ settings/part: profiles.settings jsonb (tour_seen, tip_dismissed, install_dismissed_until, sidebar_collapsed)
 └─ feedback              (user_id nullable, type bug|idea, message, email, created_at)

Catalogs (read-only for authenticated, seeded):
 exercises (key PK, name, muscle, muscle_group, default_sets, default_reps, default_kg,
            rest_seconds, step numeric, tip, lift_key nullable)
 workouts (key PK, name, minutes, kcal, focus text[]) — workout_exercises(workout_key FK, exercise_key FK, position)
 foods (key PK, name, cat, base, k/p/c/f, servings jsonb, default_index)
```

Indexes: `(user_id, logged_on)` on weight_logs + meal_entries; `(user_id, performed_on)` on workout_sessions; `(session_id, exercise_key)` on session_sets; `(user_id, created_at)` on chat_messages.

CHECKs: age 14–100, height_cm 120–230, weights 30–300, kcal/protein/carbs/fats ≥ 0, servings ≥ 0.5, meal ∈ (breakfast,lunch,dinner,snacks), dow 0–6, goal ∈ (muscle,fat,maintain), role ∈ (ai,user).

Views / functions:

- **`lift_history` view** — replaces the old `lifts` object: `SELECT es.lift_key AS lift, ss.user_id, ss.performed_on AS logged_on, max(ss.kg) AS kg FROM workout_sessions ws JOIN session_sets ss ... JOIN exercises es ON es.key = ss.exercise_key AND ss.done AND es.lift_key IS NOT NULL GROUP BY 1,2,3`. Computed, never stored.
- **`regenerate_plan(p_user uuid)`** — deterministic, rule-based plan generator (no AI): keeps every scheduled day whose session was already logged this week, fills remaining weekdays from the standard rotation Mon→back, Tue→legs, Thu→chest, Fri→shoulders. RPC callable by the row owner.
- **`handle_new_user()` trigger on `auth.users`** — inserts `profiles` (from metadata/name/email) with `onboarding_completed = false` and seeds `user_plan` with the default rotation.
- **`set_updated_at()`** — generic updated_at trigger.
- **`cascade delete`** — `DELETE FROM auth.users` via service role route (`/api/account/delete`) removes every user table row by FK.

### Demo data separation

- `supabase/seed.sql` — catalogs only (exercises, workouts + workout_exercises, foods). Runs on every `db reset`.
- `supabase/seed-demo.sql` — generated by `scripts/gen-demo-seed.mjs` **relative to a base date** (`TODAY`, default 2026-10-15): the Alex Morgan demo user from FITAI_MASTER_PROMPT §4 (profile, 2,400/160/280/72 targets, weights 74.9→76.4 kg, 15 past sessions with session_sets, bench 65→70 / squat 82.5→90 / row 52.5→60, 10 meal entries for the past 30 days averaging 2,380 kcal/141 g, today's meals totaling **1,640 kcal / 112 g protein / 168 c / 48 f → 68% ring, dinner empty**, the seeded 3 chat messages). Dev/test only — never applied to hosted projects.

---

## 3. RLS (non-negotiable)

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | own (`id = auth.uid()`) | own (id = auth.uid()) | own | — |
| weight_logs, user_plan, workout_extras, custom_routines, workout_sessions, session_sets, meal_entries, custom_foods, chat_messages | `user_id = auth.uid()` | same | same | same |
| exercises, workouts, workout_exercises, foods | authenticated: true | — | — | — |
| feedback | none | `true` (anon + users, limited cols) | — | — |

All via `TO authenticated` policies (catalog read) / `TO anon, authenticated` (feedback insert). Mapping of the old locally-unique lift rows: lift history is server-computed (view), so no client write path exists.

---

## 4. Data layer

```
src/lib/supabase/client.ts    browser client (createBrowserClient, singleton)
src/lib/supabase/server.ts    server client (Server Components / Route Handlers)
src/lib/supabase/proxy.ts     proxy.ts client using @supabase/ssr cookies
src/lib/supabase/admin.ts     service-role client — server files only
src/lib/supabase/types.ts     generated Database type
src/lib/data/repos/*.ts       typed repositories (profile, weights, plan, sessions,
                              lifts, foods, meals, chat, routines, extras, feedback, account)
src/lib/domain/*              pure selectors stay as-is (src/lib/selectors.ts etc.)
src/lib/store.ts              Zustand state = hydrated FitData view; mutations → repos with
                              optimistic update + rollback + toast
```

Mapping of every old localStorage action:

| Old action | New path |
|---|---|
| `signIn` | `supabase.auth.signInWithPassword` (LoginForm) |
| sign up | `supabase.auth.signUp` + name in metadata → trigger creates profile |
| signOut | `supabase.auth.signOut()` + router.replace('/login') |
| `deleteAccount` | POST `/api/account/delete` (service role, zod-validated) after "type DELETE" |
| `logWeight` | `weight_logs` UPSERT on (user_id, logged_on) — replaces today's entry |
| `addFood`/`removeFood` | `meal_entries` insert/delete (\*.id), optimistic + Undo |
| `saveSession` | `workout_sessions` insert + `session_sets` bulk insert; lift history recomputed from view |
| `saveUser` / onboarding | `profiles` update; changing current weight also upserts today's weight_log |
| `regenerate plan` | RPC `regenerate_plan(auth.uid())` |
| extras (Add exercise) | `workout_extras` upsert/delete |
| custom routines | `custom_routines` CRUD (unique per user) |
| chat (`pushChat`) | `chat_messages` insert (rate-limited) |
| feedback | `feedback` insert (rate-limited by middleware) |
| tour/tip/sidebar/notifs | `profiles.settings` jsonb + `notif_reminders/weekly/coach` columns |
| nutritionHistory | derived: aggregate `meal_entries` per `logged_on` for the chart window |
| lifts | derived: `lift_history` view |

Offline/PWA: TanStack Query persists its cache so the shell + last-known data still render offline; mutations queue via the existing `pwaManager` and replay when online; the in-progress active workout stays local (unchanged localStorage key) until "Finish & save".

One-time migration: if `fitai.state.v2` exists and the account is empty, the dashboard offers **"Import data from this device"** → writes to Supabase → clears localStorage.

Time: dates are stored as `date` in the user's timezone; `TODAY` comes from `NEXT_PUBLIC_TODAY` (fixed in tests/demos), else the real current date. Demo seed uses fixed dates.

---

## 5. Auth flows

- Login/Signup: exact existing LoginForm UI; Supabase errors mapped (`Invalid login credentials` → existing error tone; validation copy unchanged: "Enter a valid email address.", "Use at least 8 characters…").
- Email confirmation: gate by `NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION` (off locally; the "Wait a sec…" success copy per spec). Confirmed flow handled on `/reset-password`-like banner, non-breaking.
- Forgot password → `resetPasswordForEmail` with existing inline confirmation message ("Reset link sent to …"); `/reset-password` page styled with existing tokens asks for the new password and calls `updateUser`.
- Change password in Profile → `updateUser({ password })`, existing "Password updated" banner.
- Proxy guard: `/login` & signed-out tld exception → signed-out users to `/login`, signed-in users past `/login|/onboarding` unless `onboarding_completed` is false, `/reset-password` and `/offline` excluded. Sessions refreshed in proxy via `getClaims()`.

## 6. Tests

- Unit (Vitest): schemas, repos (mocked client success/error), error mapping, importer (v2 → payloads), selectors untouched.
- DB (pgTAP, `supabase test db`): cross-user isolation in every table, anon read denial, catalog write denial, constraints, triggers (profile create, updated_at, cascades), plan RPC.
- Integration (Vitest against local stack): auth round-trip, repos, upsert weight, session + sets, meals, delete account.
- E2E (Playwright): J1–J10 + consistency matrix + refresh/2-context/offline/Retry; demo user from seed-demo.
- Coverage: ≥ 90% lines/branches on `src/lib/data`, `src/lib/domain`, validators, proxy (config thresholds).

## 7. Local workflow / deploy

```bash
npx supabase start              # local stack
npx supabase db reset           # rebuild schema + seed.sql
npm run gen-demo-seed           # regenerate supabase/seed-demo.sql (base date)
psql "$DEV_DB_URL" -f supabase/seed-demo.sql    # load demo data (dev only)
npm run db:types && npm run dev # sync types, start app
npm run test:unit / test:db / test:integration / test:e2e
```

Deploy: see **`docs/DEPLOYMENT.md`** (link, `db push`, Vercel env, catalog sync, read-only verify). Catalogs ship in migration `20261029000004`; `seed.sql` is local reset only. **Never run seed-demo.sql in prod.** New migrations: `npx supabase migration new <name>` then `db reset` locally to verify.
