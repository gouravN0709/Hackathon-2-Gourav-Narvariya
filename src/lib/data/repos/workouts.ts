import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, RoutineRow, ExtraRow } from '@/lib/supabase/types';
import type { WorkoutKey } from '@/types/domain';

/* ──────────────── custom routines ──────────────── */

export async function fetchRoutines(client: SupabaseClient<Database>, userId: string): Promise<RoutineRow[]> {
  const { data, error } = await client
    .from('custom_routines')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function insertRoutine(
  client: SupabaseClient<Database>,
  userId: string,
  name: string,
  exerciseKeys: string[],
): Promise<RoutineRow> {
  const { data, error } = await client
    .from('custom_routines')
    .insert({ user_id: userId, name, exercise_keys: exerciseKeys })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRoutine(
  client: SupabaseClient<Database>,
  userId: string,
  id: string,
): Promise<void> {
  const { error } = await client.from('custom_routines').delete().eq('user_id', userId).eq('id', id);
  if (error) throw error;
}

/* ──────────────── workout extras ("Add exercise" picks) ──────────────── */

export async function fetchExtras(client: SupabaseClient<Database>, userId: string): Promise<ExtraRow[]> {
  const { data, error } = await client.from('workout_extras').select('*').eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}

export async function upsertExtra(
  client: SupabaseClient<Database>,
  userId: string,
  workoutKey: WorkoutKey,
  exerciseKey: string,
): Promise<void> {
  const { error } = await client
    .from('workout_extras')
    .upsert(
      { user_id: userId, workout_key: workoutKey, exercise_key: exerciseKey },
      { onConflict: 'user_id,workout_key,exercise_key' },
    );
  if (error) throw error;
}

export async function deleteExtra(
  client: SupabaseClient<Database>,
  userId: string,
  workoutKey: WorkoutKey,
  exerciseKey: string,
): Promise<void> {
  const { error } = await client
    .from('workout_extras')
    .delete()
    .eq('user_id', userId)
    .eq('workout_key', workoutKey)
    .eq('exercise_key', exerciseKey);
  if (error) throw error;
}
