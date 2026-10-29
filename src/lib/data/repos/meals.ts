import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, MealEntryRow, CustomFoodRow } from '@/lib/supabase/types';
import type { MealKey } from '@/types/domain';

export interface MealEntryPayload {
  logged_on: string;
  meal: MealKey;
  name: string;
  serving_label: string;
  servings: number;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  food_key?: string | null;
  /** History rows are hidden aggregates used for the 30-day charts. */
  history?: boolean;
}

export async function fetchMeals(
  client: SupabaseClient<Database>,
  userId: string,
  opts: { from?: string; to?: string; meals?: MealKey[] } = {},
): Promise<MealEntryRow[]> {
  let q = client
    .from('meal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('logged_on', { ascending: true })
    .order('created_at', { ascending: true });
  if (opts.from) q = q.gte('logged_on', opts.from);
  if (opts.to) q = q.lte('logged_on', opts.to);
  if (opts.meals?.length) q = q.in('meal', opts.meals as string[]);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).filter((row) => row.name !== 'Imported history' || opts.meals == null);
}

/** History aggregates (name "Imported history") never render; they only feed the charts. */
export async function insertMealEntry(
  client: SupabaseClient<Database>,
  userId: string,
  entry: MealEntryPayload,
): Promise<MealEntryRow> {
  const { data, error } = await client
    .from('meal_entries')
    .insert({
      user_id: userId,
      logged_on: entry.logged_on,
      meal: entry.meal,
      name: entry.history ? 'Imported history' : entry.name,
      serving_label: entry.serving_label,
      servings: entry.servings,
      kcal: entry.kcal,
      protein: entry.protein,
      carbs: entry.carbs,
      fats: entry.fats,
      food_key: entry.food_key ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMealEntry(
  client: SupabaseClient<Database>,
  userId: string,
  id: string,
): Promise<void> {
  const { error } = await client.from('meal_entries').delete().eq('user_id', userId).eq('id', id);
  if (error) throw error;
}

/* ──────────────── custom foods ──────────────── */

export async function fetchCustomFoods(client: SupabaseClient<Database>, userId: string): Promise<CustomFoodRow[]> {
  const { data, error } = await client.from('custom_foods').select('*').eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}

export async function insertCustomFood(
  client: SupabaseClient<Database>,
  userId: string,
  food: CustomFoodRow | Omit<CustomFoodRow, 'id' | 'user_id'>,
): Promise<CustomFoodRow> {
  const { data, error } = await client
    .from('custom_foods')
    .insert({ user_id: userId, ...food })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
