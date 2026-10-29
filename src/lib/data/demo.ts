/**
 * One-shot data writers: "Reset demo data" and the on-device importer
 * (reads fitai.state.v2 from localStorage, uploads it, then clears it).
 */
import { TODAY } from '@/lib/date';
import { getClient } from '@/lib/data/loader';
import { insertChat } from '@/lib/data/repos/chat';
import { deleteMealEntry, fetchMeals, insertMealEntry } from '@/lib/data/repos/meals';
import { updateProfile, type ProfilePatch } from '@/lib/data/repos/profile';
import { setPlan, upsertWeight } from '@/lib/data/repos/progress';
import { createSession, fetchSessions, type SetPayload } from '@/lib/data/repos/sessions';
import { deleteRoutine, fetchRoutines } from '@/lib/data/repos/workouts';
import type {
  ChatMessage,
  Diet,
  Experience,
  FoodEntry,
  Goal,
  ISODate,
  Macros,
  MealKey,
  NotificationPrefs,
  WorkoutKey,
} from '@/types/domain';

const HISTORY_NAME = 'Imported history';
const DEFAULT_PLAN: { dow: number; workoutKey: WorkoutKey }[] = [
  { dow: 0, workoutKey: 'back' },
  { dow: 1, workoutKey: 'legs' },
  { dow: 3, workoutKey: 'chest' },
  { dow: 4, workoutKey: 'shoulders' },
];

export interface ResetPayload {
  profilePatch: ProfilePatch;
  weights: { date: string; kg: number }[];
  sessions: { date: string; key: WorkoutKey; name: string; minutes: number; volume: number; sets?: SetPayload[] }[];
  meals: { meal: MealKey; entry: FoodEntry; day?: string; history?: boolean }[];
  chat: ChatMessage[];
}

/** Shape of fitai.state.v2 as written by the localStorage-only era of the app. */
interface LegacyUser {
  name?: string;
  email?: string;
  age?: number;
  height?: number;
  goal?: Goal;
  exp?: Experience;
  diet?: Diet;
  startWeight?: number;
  goalWeight?: number;
  targets?: Macros;
  notif?: NotificationPrefs;
}

interface LegacyState {
  weights?: Record<string, number>;
  sessions?: { date: ISODate; key: WorkoutKey; name: string; minutes: number; volume: number }[];
  meals?: Record<string, FoodEntry[]>;
  nutritionHistory?: Record<ISODate, { k: number; p: number }>;
  chat?: ChatMessage[];
  user?: LegacyUser;
}

async function requireUid(): Promise<string> {
  const client = await getClient();
  const { data } = await client.auth.getUser();
  const id = data?.user?.id;
  if (!id) throw new Error('NO_SESSION');
  return id;
}

async function clearUserData(client: Awaited<ReturnType<typeof getClient>>, uid: string): Promise<void> {
  const oldMeals = await fetchMeals(client, uid, { from: '1990-01-01', to: '2999-12-31' });
  for (const m of oldMeals) await deleteMealEntry(client, uid, m.id);
  const oldSessions = await fetchSessions(client, uid, '1990-01-01');
  for (const s of oldSessions) await client.from('workout_sessions').delete().eq('id', s.id);
  await client.from('weight_logs').delete().eq('user_id', uid);
  await client.from('chat_messages').delete().eq('user_id', uid);
  const routines = await fetchRoutines(client, uid);
  for (const r of routines) await deleteRoutine(client, uid, r.id);
}

export const cleanPatch = (patch: Record<string, unknown>): ProfilePatch =>
  Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as ProfilePatch;

/** Replaces the current account's data (one-shot import/reset). */
export async function applyPayload(payload: ResetPayload): Promise<void> {
  const client = await getClient();
  const uid = await requireUid();
  await clearUserData(client, uid);
  for (const w of payload.weights) await upsertWeight(client, uid, w.date, w.kg);
  for (const s of payload.sessions) {
    await createSession(client, uid, {
      performedOn: s.date,
      workoutKey: s.key,
      name: s.name,
      minutes: s.minutes,
      volumeKg: s.volume,
      sets: s.sets ?? [],
    });
  }
  for (const m of payload.meals) {
    const entry = m.history ? { ...m.entry, name: HISTORY_NAME } : m.entry;
    await insertMealEntry(client, uid, {
      logged_on: m.day ?? TODAY,
      meal: m.meal,
      name: entry.name,
      serving_label: entry.serving,
      servings: 1,
      kcal: entry.k,
      protein: entry.p,
      carbs: entry.c,
      fats: entry.f,
    });
  }
  for (const message of payload.chat) await insertChat(client, uid, message);
  await updateProfile(client, uid, cleanPatch(payload.profilePatch));
  await setPlan(client, uid, DEFAULT_PLAN);
}

/** Uploads a legacy fitai.state.v2 payload. Must only be offered on an empty account. */
export async function importDeviceState(raw: string): Promise<void> {
  const legacy = JSON.parse(raw) as LegacyState;
  const u = legacy.user ?? {};

  await applyPayload({
    profilePatch: cleanPatch({
      name: u.name,
      email: u.email,
      age: u.age,
      height_cm: u.height,
      goal: u.goal,
      experience: u.exp,
      diet: u.diet,
      start_weight: u.startWeight,
      goal_weight: u.goalWeight,
      target_kcal: u.targets?.kcal,
      target_protein: u.targets?.protein,
      target_carbs: u.targets?.carbs,
      target_fats: u.targets?.fats,
      notif_reminders: u.notif?.reminders,
      notif_weekly: u.notif?.weekly,
      notif_coach: u.notif?.coach,
    }),
    weights: Object.entries(legacy.weights ?? {}).map(([date, kg]) => ({ date, kg: Number(kg) })),
    sessions: (legacy.sessions ?? []).map((s) => ({ ...s, date: s.date })),
    meals: [
      ...Object.entries(legacy.meals ?? {}).flatMap(([meal, items]) =>
        (items ?? []).map((entry) => ({ meal: meal as MealKey, entry })),
      ),
      ...Object.entries(legacy.nutritionHistory ?? {})
        .filter(([day]) => day !== TODAY)
        .map(([day, h]) => ({
          meal: 'snacks' as MealKey,
          entry: { name: HISTORY_NAME, serving: 'day', k: h.k, p: h.p, c: 0, f: 0 },
          day,
          history: true,
        })),
    ],
    chat: legacy.chat ?? [],
  });

  try {
    window.localStorage.removeItem('fitai.state.v2');
  } catch {
    /* nothing to clear */
  }
}
