#!/usr/bin/env sh
# Applies the generated demo account (supabase/seed-demo.sql) to the local DB.
set -eu
DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
HERE="$(cd "$(dirname "$0")" && pwd)"
exec psql "$DB_URL" -v ON_ERROR_STOP=1 -q -f "$HERE/seed-demo.sql"
