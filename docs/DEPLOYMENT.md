# FitAI deployment guide

Concise reference for local development, hosted Supabase, and Vercel. **Never commit real keys** — use `.env.local` locally and the Vercel / Supabase dashboards for production.

## Architecture

| Layer | What runs there |
|-------|-----------------|
| **Local** | Supabase CLI stack (`127.0.0.1:54321` API, `54322` Postgres), `supabase/seed.sql` on `db reset`, optional demo via `seed-demo.sql` |
| **Hosted Supabase** | Migrations `20261029000001`–`20261029000004` (schema, RLS, triggers, **catalog seed in 004**), real user data |
| **Vercel** | Next.js app with env vars pointing at the **hosted** Supabase URL and anon key |

Demo data (`supabase/seed-demo.sql`, `alex@fitai.app`) is **local-only**. Catalog data lives in `supabase/seed.sql` (local reset) and must stay in sync with `supabase/migrations/20261029000004_catalog_seed.sql` (hosted via `db push`).

## Local setup

```bash
npm install
cp .env.example .env.local   # fill anon + service role from `npx supabase status`
npx supabase start
npx supabase db reset        # migrations + seed.sql
npm run db:apply-demo        # optional Alex Morgan demo (local DB only)
npm run db:types
npm run dev
```

`supabase/apply-demo.sh` refuses non-local database URLs (hosted Supabase / pooler hosts).

## Keep catalog seeds aligned

After editing catalog INSERTs, update **both** `supabase/seed.sql` and `20261029000004_catalog_seed.sql` (migration adds `ON CONFLICT DO NOTHING` for idempotent deploys).

```bash
npm run db:check-catalog-seed
```

## Deploy database changes (hosted Supabase)

1. Confirm link: `npx supabase projects list` and intended project name/ref.
2. Review pending SQL: `npx supabase migration list --linked` and read new files under `supabase/migrations/`.
3. Apply reviewed migrations only: `npx supabase db push --linked`.
4. **Do not** run `supabase db reset` against production.
5. **Do not** run `seed-demo.sql` or `npm run db:apply-demo` against a linked/hosted database.

Read-only prod check:

```bash
npm run db:verify-linked
```

Expected catalog counts after migration 004: **26** exercises, **4** workouts, **21** workout_exercises, **16** foods. Demo email `alex@fitai.app` should return **no rows** on production.

## Vercel (Next.js)

Set in the Vercel project (Production + Preview as needed):

| Variable | Scope | Notes |
|----------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client | Hosted project URL (`https://….supabase.co`), not `127.0.0.1` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Anon / publishable key from Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Required if server code uses admin client; never `NEXT_PUBLIC_*` |
| `NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION` | Client | Usually `true` in production if email confirm is enabled |
| `NEXT_PUBLIC_TODAY` | Client | Omit in production (real dates); optional for demos locally |

Redeploy after changing env vars. Confirm production build does not embed the service role key in client bundles (see `docs/BACKEND_PLAN.md`).

## Command safety

| Command | Safe for production? |
|---------|----------------------|
| `npm run db:check-catalog-seed` | Yes (file diff only) |
| `npm run db:verify-linked` | Yes (read-only SQL via CLI) |
| `npm run db:apply-demo` | **No** — local Postgres only |
| `npx supabase db push --linked` | **Writes** — review migrations first |
| `npx supabase db reset` | **Local only** — destroys local DB |

## Related docs

- Backend schema and tests: `docs/BACKEND_PLAN.md`
- Env template: `.env.example`
