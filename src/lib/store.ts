'use client';

import { create } from 'zustand';
import { TODAY } from '@/lib/date';
import { seed } from '@/lib/data/seed';
import { WORKOUTS } from '@/lib/data/workouts';
import { MEAL_NAME } from '@/lib/format';
import { showToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { applyPayload, importDeviceState, type ResetPayload } from '@/lib/data/demo';
import {
  addChatMessage,
  addExerciseExtra,
  addMealEntry,
  cacheRead,
  cacheWrite,
  demoPayload,
  deleteMealEntryServer,
  loadAll,
  persistProfile,
  persistSetting,
  removeExerciseExtra,
  saveWorkoutSession,
  upsertWeightToday,
  newRoutine,
} from '@/lib/data/loader';
import { flushQueue, runOrQueue } from '@/lib/data/offlineQueue';
import type { SetPayload } from '@/lib/data/repos/sessions';
import type {
  ChatMessage,
  Exercise,
  FitData,
  FoodEntry,
  LiftId,
  Macros,
  MealKey,
  UIState,
  User,
  WorkoutKey,
} from '@/types/domain';

export const STORAGE_KEY = 'fitai.state.v2';
export const CACHE_KEY = 'fitai.cache.v1';
export const LEGACY_KEY = 'fitai.state.v2';
const MAX_CHAT = 24;

/** Per-exercise set payload passed by the Active Workout when saving. */
export interface SaveSetsInput {
  id: string;
  lift: LiftId | null;
  sets: { kg: number; reps: number; done: boolean }[];
}

export interface FitActions {
  /** Loads the signed-in user's data from Supabase (or the offline cache cache fallback). */
  bootstrap: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Server-side delete (service-role route). True when the account is gone. */
  deleteAccount: () => Promise<boolean>;
  /** Writes the demo week into Supabase for this account ("Reset demo data"). */
  reset: () => Promise<void>;
  /** One-time import of fitai.state.v2 from this device. */
  importFromDevice: () => Promise<boolean>;
  addFood: (meal: MealKey, item: FoodEntry) => void;
  removeFood: (meal: MealKey, index: number) => void;
  setUI: (patch: Partial<UIState>) => void;
  takeFlash: () => string;
  logWeight: (kg: number) => void;
  pushChat: (msg: ChatMessage) => void;
  saveSession: (
    key: WorkoutKey,
    minutes: number,
    volume: number,
    topLifts: Partial<Record<LiftId, number>>,
    sets?: SaveSetsInput[],
  ) => void;
  saveUser: (
    patch: Partial<User> & {
      /** Set on the final onboarding step; stored in profiles.onboarding_completed. */
      onboardingCompleted?: boolean;
    },
    targets?: Macros,
    weight?: number | null,
  ) => void;
}

interface RuntimeState {
  hydrated: boolean;
  /** True when showing cached data because Supabase could not be reached. */
  syncError: boolean;
  /** Data has been loaded (or a signed-out/no-cache state was reached) at least once this session. */
  dataLoaded: boolean;
  /** Lets the Profile page show "Account deleted" before the guard sends the user to Log in. */
  justDeleted: boolean;
}

export type FitStore = FitData & FitActions & RuntimeState;

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? '';
}

function addId(item: FoodEntry, id: string): FoodEntry & { id?: string } {
  return { ...item, id };
}

/** The fallback state mirrors the demo seed so skeletons/empty visuals stay identical. */
function initialData(hydrated: boolean): FitData & RuntimeState {
  return {
    ...seed(),
    auth: false,
    plan: {},
    hydrated,
    syncError: false,
    dataLoaded: false,
    justDeleted: false,
  } as FitData & RuntimeState;
}

export const useFitStore = create<FitStore>()((set, get) => {
  let uid: string | null = null;
  let hydrationSeq = 0;

  /** Write to Supabase with optimistic-update + rollback semantics. */
  async function runWrite(
    write: () => Promise<void>,
    rollback: () => void,
    messages?: { offline: string; failure: string },
  ): Promise<boolean> {
    try {
      return await runOrQueue({ run: write, rollback, description: 'FitAI sync', messages });
    } catch (err) {
      rollback();
      showToast(messages?.failure ?? 'Saving failed. Try again.', 'error');
      console.warn('[FitAI] sync error:', err);
      return false;
    }
  }

  async function syncSetting(patch: Record<string, unknown>): Promise<void> {
    try {
      await persistSetting(patch);
    } catch (err) {
      showToast('Saving preference failed. Try again.', 'error');
      console.warn('[FitAI] settings sync error:', err);
    }
  }

  async function syncExtras(
    before: Partial<Record<WorkoutKey, Exercise[]>>,
    after: Partial<Record<WorkoutKey, Exercise[]>>,
  ): Promise<void> {
    const keys = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])) as WorkoutKey[];
    for (const key of keys) {
      const previous = before?.[key] ?? [];
      const next = after?.[key] ?? [];
      const nextIds = new Set(next.map((e) => e.id));
      const prevIds = new Set(previous.map((e) => e.id));
      for (const ex of next) {
        if (!prevIds.has(ex.id)) {
          await addExerciseExtraSafe(key, ex.id);
        }
      }
      for (const ex of previous) {
        if (!nextIds.has(ex.id)) {
          await addExerciseExtraSafe(key, ex.id, true);
        }
      }
    }
  }

  async function addExerciseExtraSafe(key: WorkoutKey, exerciseId: string, remove = false): Promise<void> {
    try {
      if (remove) await removeExerciseExtra(key, exerciseId);
      else await addExerciseExtra(key, exerciseId);
    } catch (err) {
      showToast('Saving exercise failed. Try again.', 'error');
      console.warn('[FitAI] extras sync error:', err);
    }
  }

  function buildResetPayload(): ResetPayload {
    const payload = demoPayload();
    return {
      profilePatch: { ...payload.profile, onboarding_completed: true },
      weights: payload.weights,
      sessions: payload.sessions.map((s) => ({ ...s, name: WORKOUTS[s.key].name })),
      meals: payload.meals.map((m) => ({ meal: m.meal, entry: m.entry, day: m.day, history: m.day !== TODAY })),
      chat: payload.chat,
    };
  }

  /** Resets the data slice while keeping live actions. */
  function freshState(options: { dataLoaded?: boolean; justDeleted?: boolean }): Omit<FitStore, keyof FitActions> {
    return {
      ...initialData(true),
      dataLoaded: options.dataLoaded ?? false,
      justDeleted: options.justDeleted ?? false,
    };
  }

  return {
    ...initialData(false),


    bootstrap: async () => {
      const seq = ++hydrationSeq;
      const client = createClient();
      // getSession is cheap and reads the cookie storage; proxy.ts revalidates claims server-side.
      const { data: sessionData } = await client.auth.getSession();
      uid = sessionData.session?.user.id ?? null;

      if (!uid) {
        set({ auth: false, hydrated: true, dataLoaded: get().dataLoaded });
        return;
      }

      try {
        const result = await loadAll();
        if (seq !== hydrationSeq) return;
        set({
          ...result.data,
          auth: true,
          hydrated: true,
          syncError: false,
          dataLoaded: true,
          justDeleted: false,
        });
        cacheWrite(result.data);
      } catch (err) {
        const offline = (err as { message?: string })?.message === 'NO_SESSION' ? false : true;
        const cached = cacheRead();
        if (cached) {
          if (seq !== hydrationSeq) return;
          set({
            ...cached.data,
            auth: true,
            hydrated: true,
            syncError: true,
            dataLoaded: true,
          });
          showToast('Showing your last synced data.', 'info');
        } else if (offline) {
          if (seq !== hydrationSeq) return;
          set({
            ...initialData(true),
            auth: true,
            hydrated: true,
            syncError: true,
            dataLoaded: true,
          });
          showToast('Could not load your account data. Check your connection and retry.', 'error');
        }
      }
    },

    signOut: async () => {
      try {
        await createClient().auth.signOut();
      } catch {
        /* session already gone */
      }
      uid = null;
      set(freshState({ dataLoaded: true }));
    },

    deleteAccount: async () => {
      try {
        const res = await window.fetch('/api/account/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirm: 'DELETE' }),
        });
        if (!res.ok) {
          showToast('Could not delete your account. Try again.', 'error');
          return false;
        }
        await createClient().auth.signOut();
        uid = null;
        set(freshState({ dataLoaded: true, justDeleted: true }));
        return true;
      } catch (err) {
        console.warn('[FitAI] delete account error:', err);
        showToast('Could not delete your account. Try again.', 'error');
        return false;
      }
    },

    reset: async () => {
      try {
        await applyPayload(buildResetPayload());
        showToast('Demo data restored to the original sample week.', 'success');
        await get().bootstrap();
      } catch (err) {
        console.warn('[FitAI] reset demo failed:', err);
        showToast('Could not restore demo data. Try again.', 'error');
      }
    },

    importFromDevice: async () => {
      try {
        const raw = window.localStorage.getItem(LEGACY_KEY);
        if (!raw) {
          showToast('No FitAI data found on this device.', 'info');
          return false;
        }
        await importDeviceState(raw);
        showToast('Imported your data from this device.', 'success');
        await get().bootstrap();
        return true;
      } catch (err) {
        console.warn('[FitAI] import failed:', err);
        showToast('Could not import the data. Try again.', 'error');
        return false;
      }
    },

    addFood: (meal, item) => {
      // The optimistic row starts without an id; the server picks up and we patch it in.
      const entry: FoodEntry = { ...item };
      let insertedId: string | null = null;
      set((s) => ({
        meals: { ...s.meals, [meal]: [...s.meals[meal], entry] },
        ui: { ...s.ui, flash: `Added ${item.name} to ${MEAL_NAME[meal]}`, meal },
      }));
      void runWrite(
        async () => {
          insertedId = await addMealEntry(entry, meal);
          set((s) => ({
            meals: {
              ...s.meals,
              [meal]: s.meals[meal].map((x) =>
                insertedId && x === entry ? addId(entry, insertedId) : x,
              ),
            },
          }));
        },
        () => set((s) => ({ meals: { ...s.meals, [meal]: s.meals[meal].filter((x) => x != entry) } })),
      );
    },

    removeFood: (meal, index) => {
      let victim: FoodEntry | null = null;
      set((s) => {
        const item = s.meals[meal][index];
        if (!item) return {};
        victim = item;
        return { meals: { ...s.meals, [meal]: s.meals[meal].filter((_, i) => i !== index) } };
      });
      const target = victim;
      if (!target) return;
      const serverId = (target as FoodEntry & { id?: string }).id;
      void runWrite(
        async () => {
          if (serverId) await deleteMealEntryServer(serverId);
        },
        () =>
          set((s) => {
            // Insert back as close to the original index as the current list allows.
            const arr = [...s.meals[meal]];
            arr.splice(Math.min(index, arr.length), 0, target as FoodEntry);
            return { meals: { ...s.meals, [meal]: arr } };
          }),
      );
    },

    setUI: (patch) => {
      const previous = get().ui;
      set((s) => ({ ui: { ...s.ui, ...patch } }));
      const next = get().ui;
      if (patch.tipDismissed !== undefined && patch.tipDismissed !== previous.tipDismissed) {
        void syncSetting({ tip_dismissed: patch.tipDismissed });
      }
      if (patch.sidebarCollapsed !== undefined && patch.sidebarCollapsed !== previous.sidebarCollapsed) {
        void syncSetting({ sidebar_collapsed: patch.sidebarCollapsed });
      }
      if (patch.meal !== undefined && patch.meal !== previous.meal) void syncSetting({ meal: patch.meal });
      if (patch.extras) void syncExtras(previous.extras, next.extras);
      if (patch.routines) {
        const added = (patch.routines as string[]).filter((r) => !previous.routines.includes(r));
        if (added.length) {
          void newRoutine(added[added.length - 1], []).catch((err) => {
            console.warn('[FitAI] routine sync error:', err);
            showToast('Saving routine failed. Try again.', 'error');
          });
        }
      }
    },

    takeFlash: () => {
      const flash = get().ui.flash;
      if (flash) set((s) => ({ ui: { ...s.ui, flash: '' } }));
      return flash;
    },

    logWeight: (kg) => {
      const day = TODAY;
      const beforeWeights = { ...(get().weights as Record<string, number>) };
      const hadEntry = day in beforeWeights;
      const previousKg = beforeWeights[day];
      set((s) => ({
        weights: { ...(s.weights as Record<string, number>), [day]: kg } as FitData['weights'],
      }));
      void runWrite(
        async () => {
          await upsertWeightToday(kg, day);
        },
        () => {
          set((s) => {
            const weights = { ...(s.weights as Record<string, number>) };
            if (hadEntry) weights[day] = previousKg;
            else delete weights[day];
            return { weights: weights as FitData['weights'] };
          });
        },
      );
    },

    pushChat: (msg) => {
      set((s) => ({ chat: [...s.chat, msg].slice(-MAX_CHAT) }));
      void addChatMessage(msg).catch((err) => {
        console.warn('[FitAI] chat sync error:', err);
        showToast('Saving your message failed. Try again.', 'error');
      });
    },

    saveSession: (key, minutes, volume, topLifts, sets) => {
      const day = TODAY;
      const prevLifts = { ...(get().lifts as Record<LiftId, Record<string, number>>) };
      const optimisticLifts = { ...prevLifts };
      (Object.keys(topLifts) as LiftId[]).forEach((id) => {
        const kg = topLifts[id];
        if (kg == null) return;
        optimisticLifts[id] = { ...optimisticLifts[id], [day]: kg };
      });
      set((s) => ({
        sessions: [
          ...s.sessions.filter((x) => x.date !== day),
          { date: day, key, name: WORKOUTS[key].name, minutes, volume },
        ].sort((a, b) => (a.date < b.date ? -1 : 1)),
        lifts: optimisticLifts as FitData['lifts'],
      }));
      void runWrite(
        async () => {
          const payload: SetPayload[] = [];
          (sets ?? []).forEach((ex) => {
            ex.sets.forEach((st, si) => {
              payload.push({ exercise_key: ex.id, set_no: si + 1, kg: st.kg, reps: st.reps, done: st.done && st.reps > 0 });
            });
          });
          await saveWorkoutSession({ key, minutes, volume, sets: payload });
        },
        () =>
          set({
            sessions: get().sessions.filter((x) => !(x.date === day && x.key === key)),
            lifts: prevLifts as FitData['lifts'],
          }),
      );
    },

    saveUser: (patch, targets, weight) => {
      const beforeUser = get().user;
      const beforeWeights = { ...(get().weights as Record<string, number>) };
      set((s) => {
        const user = { ...s.user, ...patch };
        if (patch.name !== undefined) user.first = firstName(patch.name);
        if (targets) user.targets = targets;
        const weights =
          weight == null
            ? { ...(s.weights as Record<string, number>) }
            : { ...(s.weights as Record<string, number>), [TODAY]: weight };
        return { user, weights: weights as FitData['weights'] };
      });
      void runWrite(
        async () => {
          const dbPatch: Record<string, string | number | boolean> = {};
          if (patch.name !== undefined) dbPatch.name = patch.name;
          if (patch.email !== undefined) dbPatch.email = patch.email;
          if (patch.age !== undefined) dbPatch.age = patch.age;
          if (patch.height !== undefined) dbPatch.height_cm = patch.height;
          if (patch.goal !== undefined) dbPatch.goal = patch.goal;
          if (patch.exp !== undefined) dbPatch.experience = patch.exp;
          if (patch.diet !== undefined) dbPatch.diet = patch.diet;
          if (patch.startWeight !== undefined) dbPatch.start_weight = patch.startWeight;
          if (patch.goalWeight !== undefined) dbPatch.goal_weight = patch.goalWeight;
          if (patch.onboardingCompleted !== undefined) dbPatch.onboarding_completed = patch.onboardingCompleted;
          if (patch.notif !== undefined) {
            dbPatch.notif_reminders = patch.notif.reminders === true;
            dbPatch.notif_weekly = patch.notif.weekly === true;
            dbPatch.notif_coach = patch.notif.coach === true;
          }
          if (patch.notif?.sounds !== undefined) {
            await persistSetting({ sounds: patch.notif.sounds === true });
          }
          if (targets) {
            dbPatch.target_kcal = targets.kcal;
            dbPatch.target_protein = targets.protein;
            dbPatch.target_carbs = targets.carbs;
            dbPatch.target_fats = targets.fats;
          }
          await persistProfile(dbPatch);
          if (weight != null) await upsertWeightToday(weight);
        },
        () => {
          set({ user: beforeUser, weights: beforeWeights as FitData['weights'] });
        },
      );
    },
  };
});

/** Read the full data slice for pure selectors. */
export function useFitData(): FitData {
  return useFitStore() as FitData;
}

/** Replays queued offline writes (wired to the browser "online" event). */
export const replayQueue = flushQueue;
