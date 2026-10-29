#!/usr/bin/env sh
# Compare catalog INSERTs in seed.sql vs migration 20261029000004 (normalized diff).
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SEED="$ROOT/supabase/seed.sql"
MIGRATION="$ROOT/supabase/migrations/20261029000004_catalog_seed.sql"

if [ ! -f "$SEED" ]; then
  echo "check-catalog-seed-sync: missing $SEED" >&2
  exit 1
fi
if [ ! -f "$MIGRATION" ]; then
  echo "check-catalog-seed-sync: missing $MIGRATION" >&2
  exit 1
fi

normalize_catalog_sql() {
  awk '
    /^--/ { next }
    /^[[:space:]]*$/ { next }
    /^on conflict / { next }
    {
      gsub(/[[:space:]]+/, " ")
      sub(/^ /, "")
      sub(/ $/, "")
      print
    }
  ' "$1" | sed -E '/;$/! s/\)([[:space:]]*)$/);\1/'
}

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT INT HUP TERM

normalize_catalog_sql "$SEED" > "$TMP/seed.norm"
normalize_catalog_sql "$MIGRATION" > "$TMP/migration.norm"

if diff -u "$TMP/seed.norm" "$TMP/migration.norm" > "$TMP/diff.out"; then
  echo "check-catalog-seed-sync: OK — seed.sql matches 20261029000004_catalog_seed.sql (catalog INSERTs)."
  exit 0
fi

echo "check-catalog-seed-sync: FAIL — catalog INSERTs differ between seed.sql and 20261029000004_catalog_seed.sql" >&2
echo "Update both files together, then re-run: npm run db:check-catalog-seed" >&2
cat "$TMP/diff.out" >&2
exit 1
