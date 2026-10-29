/**
 * Loads the signed-in user's entire dataset in parallel and assembles the exact
 * FitData shape every existing screen reads. Also provides the demo importer and
 * one-time on-device import.
 */
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { addDays, TODAY } from '@/lib/date';
import { seed } from '@/lib/data/seed';
import { EXTRA_EXERCISES, WORKOUTS } from '@/lib/data/workouts';
import { fetchChat, insertChat } from '@/lib/data/repos/chat';
import {
  fetchCustomFoods,
  fetchMeals,
  insertMealEntry,
  deleteMealEntry,
} from '@/lib/data/repos/meals';
import { fetchProfile, updateProfile, type ProfilePatch } from '@/lib/data/repos/profile';
import { fetchLiftHistory, fetchPlan, fetchWeights, setPlan, upsertWeight } from '@/lib/data/repos/progress';
import { createSession, fetchSessions, type SetPayload } from '@/lib/data/repos/sessions';
import { deleteExtra, fetchExtras, fetchRoutines, insertRoutine, upsertExtra } from '@/lib/data/repos/workouts';
import type { ChatMessage, Diet, Exercise, Experience, FitData, FoodEntry, Goal, MealKey, WorkoutKey } from '@/types/domain';

export const CACHE_KEY = 'fitai.cache.v1';
export const LEGACY_KEY = 'fitai.state.v2';
export const DEMO_BASE = '2026-10-15';

export interface LoaderResult {
  data: FitData;
  onboarded: boolean;
  email: string;
  importedAvailable: boolean;
}

export async function getClient(): Promise<SupabaseClient> {
  return createClient() as SupabaseClient;
}

/* ─────────────────── load ─────────────────── */

export async function loadAll(): Promise<LoaderResult> {
  const client = await getClient();
  const { data: authData, error } = await client.auth.getUser();
  if (error || !authData?.user) throw error ?? new Error('NO_SESSION');

  const uid = authData.user.id;
  const [profileRow, weights, planRows, sessions, lifts, mealRows, chat, extraRows, routineRows] = await Promise.all([
    fetchProfile(client, uid),
    fetchWeights(client, uid),
    fetchPlan(client, uid),
    fetchSessions(client, uid, addDays(TODAY, -30)),
    fetchLiftHistory(client, uid, addDays(TODAY, -35)),
    fetchMeals(client, uid, {
      from: addDays(TODAY, -30),
      to: TODAY,
      meals: ['breakfast', 'lunch', 'dinner', 'snacks'],
    }),
    fetchChat(client, uid),
    fetchExtras(client, uid),
    fetchRoutines(client, uid),
  ]);

  const base = seed();
  const profile = profileRow;
  const settings = (profile.settings ?? {}) as Record<string, unknown>;

  const weightsMap: Record<string, number> = {};
  weights.forEach((w) => {
    if (w.logged_on <= TODAY) weightsMap[w.logged_on] = w.kg;
  });

  const sessionsView = sessions
    .filter((s) => s.performed_on <= TODAY)
    .map((s) => ({
      date: s.performed_on,
      key: s.workout_key as WorkoutKey,
      name: s.name,
      minutes: s.minutes,
      volume: s.volume_kg,
    }));

  const liftsMap: Record<string, Record<string, number>> = { bench: {}, squat: {}, row: {} };
  lifts.forEach((l) => {
    if (l.lift == null || l.kg == null) return;
    liftsMap[l.lift] ??= {};
    liftsMap[l.lift][l.logged_on] = l.kg;
  });

  const meals: Record<MealKey, FoodEntry[]> = { breakfast: [], lunch: [], dinner: [], snacks: [] };
  const history: Record<string, { k: number; p: number }> = {};
  mealRows.forEach((row) => {
    const entry: FoodEntry & { id?: string } = {
      id: row.id,
      name: row.name,
      serving: row.serving_label,
      k: row.kcal,
      p: row.protein,
      c: row.carbs,
      f: row.fats,
    };
    if (row.logged_on === TODAY) {
      (meals[row.meal as MealKey] ??= []).push(entry);
    } else {
      const h = (history[row.logged_on] ??= { k: 0, p: 0 });
      h.k += row.kcal;
      h.p += row.protein;
    }
  });

  const plan: Partial<Record<number, WorkoutKey>> = {};
  planRows.forEach((p) => {
    plan[p.dow] = p.workout_key as WorkoutKey;
  });

  const extras: Record<string, Exercise[]> = {};
  extraRows.forEach((e) => {
    const ex = EXTRA_EXERCISES.find((x) => x.id === e.exercise_key);
    if (ex) (extras[e.workout_key] ??= []).push(ex);
  });

  const chatView: ChatMessage[] = chat.map((c) => ({ ai: c.role === 'ai', text: c.text, card: c.card || undefined }));

  const data: FitData = {
    ...base,
    auth: true,
    user: {
      name: profile.name || base.user.name,
      first: (profile.name || base.user.name).trim().split(/\s+/)[0] ?? '',
      email: profile.email || authData.user.email || '',
      age: profile.age,
      height: profile.height_cm,
      goal: profile.goal as Goal,
      exp: profile.experience as Experience,
      diet: profile.diet as Diet,
      startWeight: profile.start_weight,
      goalWeight: profile.goal_weight,
      units: 'metric',
      targets: {
        kcal: profile.target_kcal,
        protein: profile.target_protein,
        carbs: profile.target_carbs,
        fats: profile.target_fats,
      },
      notif: {
        reminders: profile.notif_reminders,
        weekly: profile.notif_weekly,
        coach: profile.notif_coach,
        sounds: Boolean(settings.sounds),
      },
    },
    weights: weightsMap,
    sessions: sessionsView,
    lifts: liftsMap,
    meals,
    nutritionHistory: history,
    chat: chatView,
    ui: {
      ...base.ui,
      meal: (settings.meal as MealKey) ?? base.ui.meal,
      extras: extras as never,
      routines: routineRows.map((r) => r.name),
      tipDismissed: Boolean(settings.tip_dismissed),
      sidebarCollapsed: Boolean(settings.sidebar_collapsed),
    },
    plan,
  };

  return {
    data,
    onboarded: profile.onboarding_completed,
    email: authData.user.email ?? '',
    // The one-time importer is offered only when the account has no data yet.
    importedAvailable: weights.length === 0 && sessions.length === 0 && Object.keys(history).length === 0 && chatView.length === 0,
  };
}

export function cacheWrite(data: FitData, onboarded?: boolean): void {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ data, onboarded, at: Date.now(), today: TODAY }));
  } catch {
    /* offline cache unavailable */
  }
}

export function cacheRead(): { data: FitData; onboarded: boolean } | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: FitData; onboarded: boolean };
    return parsed;
  } catch {
    return null;
  }
}

/* ─────────────────── mutations used by the store ─────────────────── */

export async function persistProfile(patch: ProfilePatch & { settings?: Record<string, unknown> }): Promise<void> {
  const uid = await currentUid();
  if (!uid) throw new Error('NO_SESSION');
  const client = await getClient();
  await updateProfile(client, uid, patch);
}

export async function persistSetting(patch: Record<string, unknown>): Promise<void> {
  const uid = await currentUid();
  if (!uid) return;
  const client = await getClient();
  const cur = await fetchProfile(client, uid);
  await updateProfile(client, uid, {
    settings: { ...((cur.settings ?? {}) as Record<string, unknown>), ...patch },
  });
}

export async function upsertWeightToday(kg: number, day: string = TODAY): Promise<void> {
  const uid = await currentUid();
  if (!uid) throw new Error('NO_SESSION');
  const client = await getClient();
  await upsertWeight(client, uid, day, kg);
}

export async function addMealEntry(item: FoodEntry, meal: MealKey, day: string = TODAY): Promise<string> {
  const uid = await currentUid();
  if (!uid) throw new Error('NO_SESSION');
  const client = await getClient();
  const row = await insertMealEntry(client, uid, {
    logged_on: day,
    meal,
    name: item.name,
    serving_label: item.serving,
    servings: 1,
    kcal: item.k,
    protein: item.p,
    carbs: item.c,
    fats: item.f,
  });
  return row.id;
}

export async function saveWorkoutSession(input: {
  key: WorkoutKey;
  minutes: number;
  volume: number;
  sets: SetPayload[];
  day?: string;
}): Promise<void> {
  const uid = await currentUid();
  if (!uid) throw new Error('NO_SESSION');
  const client = await getClient();
  await createSession(client, uid, {
    performedOn: input.day ?? TODAY,
    workoutKey: input.key,
    name: WORKOUTS[input.key].name,
    minutes: input.minutes,
    volumeKg: input.volume,
    sets: input.sets,
  });
}

export async function addChatMessage(message: ChatMessage): Promise<void> {
  const uid = await currentUid();
  if (!uid) throw new Error('NO_SESSION');
  const client = await getClient();
  await insertChat(client, uid, message);
}

export async function addExerciseExtra(key: WorkoutKey, exerciseKey: string): Promise<void> {
  const uid = await currentUid();
  if (!uid) throw new Error('NO_SESSION');
  await upsertExtra(await getClient(), uid, key, exerciseKey);
}

export async function removeExerciseExtra(key: WorkoutKey, exerciseKey: string): Promise<void> {
  const uid = await currentUid();
  if (!uid) throw new Error('NO_SESSION');
  await deleteExtra(await getClient(), uid, key, exerciseKey);
}

export async function newRoutine(name: string, exerciseKeys: string[]): Promise<void> {
  const uid = await currentUid();
  if (!uid) throw new Error('NO_SESSION');
  await insertRoutine(await getClient(), uid, name, exerciseKeys);
}

export async function applyPlan(plan: { dow: number; workoutKey: WorkoutKey }[]): Promise<void> {
  const uid = await currentUid();
  if (!uid) throw new Error('NO_SESSION');
  await setPlan(await getClient(), uid, plan);
}

export async function deleteMealEntryServer(id: string): Promise<void> {
  const client = await getClient();
  const uid = await currentUid();
  if (!uid) throw new Error('NO_SESSION');
  await deleteMealEntry(client, uid, id);
}

export async function currentUid(): Promise<string | null> {
  const client = await getClient();
  const { data } = await client.auth.getUser();
  return data?.user?.id ?? null;
}

export async function customFoodsAll() {
  const uid = await currentUid();
  if (!uid) return [];
  return fetchCustomFoods(await getClient(), uid);
}

/**
 * Writes the demo week (seed.ts values) into Supabase for the current user. Used by
 * "Reset demo data" and the one-time on-device import; dates are shifted to match TODAY.
 */
export function demoPayload(base: string = DEMO_BASE): {
  weights: { date: string; kg: number }[];
  sessions: { date: string; key: WorkoutKey; minutes: number; volume: number; sets: { exercise_key: string; set_no: number; kg: number; reps: number; done: boolean }[] }[];
  meals: { day: string; meal: MealKey; entry: FoodEntry }[];
  chat: ChatMessage[];
  profile: ProfilePatch;
} {
  const demo = seed();
  const shift = (iso: string): string => {
    const ms = new Date(`${iso}T00:00:00Z`).getTime() - new Date(`${base}T00:00:00Z`).getTime();
    return new Date(new Date(`${TODAY}T00:00:00Z`).getTime() + ms).toISOString().slice(0, 10);
  };

  const liftValue = (lift: string, date: string): number | null => {
    const rec = demo.lifts[lift as keyof typeof demo.lifts];
    const keys = Object.keys(rec).filter((k) => k <= date).sort();
    return keys.length ? rec[keys[keys.length - 1]] : null;
  };

  const sessions = demo.sessions.map((s) => {
    const workout = WORKOUTS[s.key];
    const sets: { exercise_key: string; set_no: number; kg: number; reps: number; done: boolean }[] = [];
    workout.exercises.forEach((e) => {
      for (let i = 1; i <= e.sets; i++) {
        const top = e.lift ? liftValue(e.lift, s.date) : null;
        sets.push({
          exercise_key: e.id,
          set_no: i,
          kg: top ?? e.kg,
          reps: e.reps,
          done: true,
        });
      }
    });
    return { date: shift(s.date), key: s.key, minutes: s.minutes, volume: s.volume, sets };
  });

  const weights = Object.entries(demo.weights).map(([d, kg]) => ({ date: shift(d), kg }));

  const meals: { day: string; meal: MealKey; entry: FoodEntry }[] = [];
  Object.entries(demo.meals).forEach(([meal, items]) =>
    items.forEach((entry) => meals.push({ day: TODAY, meal: meal as MealKey, entry })),
  );
  Object.entries(demo.nutritionHistory).forEach(([day, h]) => {
    if (day === TODAY) return;
    meals.push({ day: shift(day), meal: 'snacks', entry: { name: 'Imported history', serving: 'day', k: h.k, p: h.p, c: 0, f: 0 } });
  });

  return {
    weights,
    sessions,
    meals,
    chat: demo.chat,
    profile: {
      name: demo.user.name,
      age: demo.user.age,
      height_cm: demo.user.height,
      goal: demo.user.goal,
      experience: demo.user.exp,
      diet: demo.user.diet,
      start_weight: demo.user.startWeight,
      goal_weight: demo.user.goalWeight,
      target_kcal: demo.user.targets.kcal,
      target_protein: demo.user.targets.protein,
      target_carbs: demo.user.targets.carbs,
      target_fats: demo.user.targets.fats,
      notif_reminders: demo.user.notif.reminders,
      notif_weekly: demo.user.notif.weekly,
      notif_coach: demo.user.notif.coach,
      current_weight: demo.weights[TODAY],
    },
  };
}
