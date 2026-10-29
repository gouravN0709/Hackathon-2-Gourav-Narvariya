#!/usr/bin/env sh
# Read-only audit of the linked Supabase project (migrations, catalogs, demo guard, auth trigger).
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v npx >/dev/null 2>&1; then
  echo "verify-linked-supabase: npx not found" >&2
  exit 1
fi

if [ ! -d "$ROOT/supabase" ]; then
  echo "verify-linked-supabase: supabase/ directory not found" >&2
  exit 1
fi

echo "=== Linked project ==="
if ! npx supabase projects list 2>/dev/null | head -20; then
  echo "(Could not list projects — run \`npx supabase login\` if needed.)" >&2
fi
echo ""

echo "=== Migration history (local vs linked) ==="
if ! npx supabase migration list --linked; then
  echo "verify-linked-supabase: migration list failed (not linked or not authenticated)." >&2
  exit 1
fi
echo ""

echo "=== Catalog row counts (expected: exercises=26, workouts=4, workout_exercises=21, foods=16) ==="
npx supabase db query --linked "
select
  (select count(*)::int from exercises) as exercises,
  (select count(*)::int from workouts) as workouts,
  (select count(*)::int from workout_exercises) as workout_exercises,
  (select count(*)::int from foods) as foods;
"
echo ""

echo "=== Demo user guard (alex@fitai.app should be absent on production) ==="
npx supabase db query --linked "
select id, email from auth.users where email = 'alex@fitai.app' limit 5;
"
echo ""

echo "=== Auth trigger on_auth_user_created ==="
npx supabase db query --linked "
select tgname, tgenabled
from pg_trigger t
join pg_class c on t.tgrelid = c.oid
join pg_namespace n on c.relnamespace = n.oid
where n.nspname = 'auth' and c.relname = 'users' and not t.tgisinternal
  and tgname = 'on_auth_user_created';
"
echo ""
echo "verify-linked-supabase: read-only audit finished."
