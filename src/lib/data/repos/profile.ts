import type { SupabaseClient } from '@supabase/supabase-js';
import { TODAY } from '@/lib/date';
import type { Database, Json, ProfileRow } from '@/lib/supabase/types';
import { unwrap } from '@/lib/data/repos/base';

export type ProfilePatch = Partial<
  Pick<
    ProfileRow,
    | 'name'
    | 'age'
    | 'height_cm'
    | 'goal'
    | 'experience'
    | 'diet'
    | 'start_weight'
    | 'goal_weight'
    | 'target_kcal'
    | 'target_protein'
    | 'target_carbs'
    | 'target_fats'
    | 'notif_reminders'
    | 'notif_weekly'
    | 'notif_coach'
    | 'onboarding_completed'
    | 'current_weight'
  >
> & { settings?: Record<string, unknown> };

export async function fetchProfile(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<ProfileRow> {
  return unwrap(
    () => client.from('profiles').select('*').eq('id', userId).maybeSingle(),
    'Could not load your profile. Try again.',
  );
}

export async function updateProfile(
  client: SupabaseClient<Database>,
  userId: string,
  patch: ProfilePatch,
): Promise<ProfileRow> {
  const { settings, ...rest } = patch;
  // PostgREST doesn't merge jsonb, so patch.settings must be the full object when given.
  const body: Omit<ProfilePatch, 'settings'> & { settings?: NonNullable<Json> } = { ...rest };
  if (settings) body.settings = settings as unknown as NonNullable<Json>;
  return unwrap(
    () => client.from('profiles').update(body).eq('id', userId).select().single(),
    'Could not save your profile. Try again.',
  );
}

export async function upsertSetting(
  client: SupabaseClient<Database>,
  userId: string,
  patch: Record<string, unknown>,
): Promise<ProfileRow> {
  const current = await fetchProfile(client, userId);
  const merged = { ...((current.settings ?? {}) as Record<string, unknown>), ...patch };
  return updateProfile(client, userId, { settings: merged });
}

export async function updatePassword(
  client: SupabaseClient<Database>,
  password: string,
): Promise<void> {
  const { error } = await client.auth.updateUser({ password });
  if (error) throw error;
}

/** Demonstrates the "today" helper: weight entries are stored against the frozen tz date. */
export function todayISO(): string {
  return TODAY;
}
