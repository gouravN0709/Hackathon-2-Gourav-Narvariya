import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

/**
 * SERVICE-ROLE client. Server-only: used by the account-deletion route.
 * Never import from client code, never set NEXT_PUBLIC_ on this key.
 */
export function createAdminClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured (server-side only).');
  }
  return createServerClient<Database>(url, serviceKey, {
    cookies: { getAll() { return []; }, setAll() { /* no-op */ }, },
  });
}
