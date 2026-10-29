import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, LiftHistoryRow, PlanRow, WeightLogRow } from '@/lib/supabase/types';

/* ──────────────── weights ──────────────── */

export async function fetchWeights(client: SupabaseClient<Database>, userId: string): Promise<WeightLogRow[]> {
  const { data, error } = await client
    .from('weight_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_on', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Upsert on UNIQUE(user_id, logged_on): re-logging today replaces today's entry. */
export async function upsertWeight(
  client: SupabaseClient<Database>,
  userId: string,
  loggedOn: string,
  kg: number,
): Promise<WeightLogRow> {
  const { data, error } = await client
    .from('weight_logs')
    .upsert({ user_id: userId, logged_on: loggedOn, kg }, { onConflict: 'user_id,logged_on' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/* ──────────────── plan ──────────────── */

export async function fetchPlan(client: SupabaseClient<Database>, userId: string): Promise<PlanRow[]> {
  const { data, error } = await client.from('user_plan').select('*').eq('user_id', userId).order('dow');
  if (error) throw error;
  return data ?? [];
}

export async function setPlan(
  client: SupabaseClient<Database>,
  userId: string,
  plan: { dow: number; workoutKey: string }[],
): Promise<void> {
  const rows = plan.map((p) => ({ user_id: userId, dow: p.dow, workout_key: p.workoutKey }));
  const { error } = await client.from('user_plan').upsert(rows, { onConflict: 'user_id,dow' });
  if (error) throw error;
}

/* ──────────────── lift history (computed view) ──────────────── */

/** Top completed set per lift per date; replaces the old localStorage `lifts` object. */
export async function fetchLiftHistory(
  client: SupabaseClient<Database>,
  userId: string,
  since?: string,
): Promise<LiftHistoryRow[]> {
  let q = client.from('lift_history').select('*').eq('user_id', userId).order('logged_on');
  if (since) q = q.gte('logged_on', since);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as LiftHistoryRow[];
}
