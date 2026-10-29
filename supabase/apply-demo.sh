#!/usr/bin/env sh
# Applies the generated demo account (supabase/seed-demo.sql) to the local DB only.
set -eu

assert_local_db_url() {
  url="$1"
  case "$url" in
    *supabase.co*|*pooler.supabase.com*)
      echo "apply-demo.sh: refused — SUPABASE_DB_URL must not point at hosted Supabase (supabase.co / pooler.supabase.com)." >&2
      echo "Demo seed is local-only. Use the default local URL or 127.0.0.1 / localhost." >&2
      exit 1
      ;;
  esac

  host="$(printf '%s' "$url" | sed -E 's|^postgres(ql)?://[^@/]*@([^:/]+).*|\2|' 2>/dev/null || true)"
  if [ -z "$host" ] || [ "$host" = "$url" ]; then
    host="$(printf '%s' "$url" | sed -E 's|^postgres(ql)?://([^:/]+).*|\2|' 2>/dev/null || true)"
  fi

  case "$host" in
    127.0.0.1|localhost|::1|"")
      ;;
    *)
      echo "apply-demo.sh: refused — database host must be local (127.0.0.1, localhost, or ::1), got: ${host:-unknown}" >&2
      exit 1
      ;;
  esac

  case "$host" in
    *supabase*|*pooler*)
      echo "apply-demo.sh: refused — database host looks remote: $host" >&2
      exit 1
      ;;
  esac
}

DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
assert_local_db_url "$DB_URL"

HERE="$(cd "$(dirname "$0")" && pwd)"
exec psql "$DB_URL" -v ON_ERROR_STOP=1 -q -f "$HERE/seed-demo.sql"
