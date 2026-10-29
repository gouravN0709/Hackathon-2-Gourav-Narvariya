import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, SessionRow } from '@/lib/supabase/types';
import type { WorkoutKey } from '@/types/domain';

export interface SetPayload {
  exercise_key: string;
  set_no: number;
  kg: number;
  reps: number;
  done: boolean;
}

export async function fetchSessions(client: SupabaseClient<Database>, userId: string, since?: string): Promise<SessionRow[]> {
  let q = client
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('performed_on', { ascending: true });
  if (since) q = q.gte('performed_on', since);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

/** Insert a finished session plus its per-set rows in one round-trip each. */
export async function createSession(
  client: SupabaseClient<Database>,
  userId: string,
  input: {
    performedOn: string;
    workoutKey: WorkoutKey;
    name: string;
    minutes: number;
    volumeKg: number;
    sets: SetPayload[];
  },
): Promise<SessionRow> {
  const { data: session, error } = await client
    .from('workout_sessions')
    .insert({
      user_id: userId,
      performed_on: input.performedOn,
      workout_key: input.workoutKey,
      name: input.name,
      minutes: input.minutes,
      volume_kg: input.volumeKg,
    })
    .select('*')
    .single();
  if (error) throw error;

  if (input.sets.length) {
    const { error: setsError } = await client.from('session_sets').insert(
      input.sets.map((s) => ({
        session_id: session.id,
        user_id: userId,
        exercise_key: s.exercise_key,
        set_no: s.set_no,
        kg: s.kg,
        reps: s.reps,
        done: s.done,
      })),
    );
    if (setsError) throw setsError;
    if (error) throw error;
  }
  return session;
}
