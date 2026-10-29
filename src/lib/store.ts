'use client';

import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { TODAY } from '@/lib/date';
import { seed } from '@/lib/data/seed';
import { WORKOUTS } from '@/lib/data/workouts';
import { MEAL_NAME } from '@/lib/format';
import { pwaManager } from '@/lib/pwa/pwaManager';
import type { ChatMessage, FitData, FoodEntry, LiftId, Macros, MealKey, UIState, User, WorkoutKey } from '@/types/domain';

export const STORAGE_KEY = 'fitai.state.v2';
const MAX_CHAT = 24;

export interface FitActions {
  signIn: (patch: Partial<Pick<User, 'name' | 'email'>>) => void;
  signOut: () => void;
  deleteAccount: () => void;
  reset: () => void;
  addFood: (meal: MealKey, item: FoodEntry) => void;
  removeFood: (meal: MealKey, index: number) => void;
  setUI: (patch: Partial<UIState>) => void;
  takeFlash: () => string;
  logWeight: (kg: number) => void;
  pushChat: (msg: ChatMessage) => void;
  saveSession: (key: WorkoutKey, minutes: number, volume: number, topLifts: Partial<Record<LiftId, number>>) => void;
  saveUser: (patch: Partial<User>, targets?: Macros, weight?: number | null) => void;
}

interface RuntimeState {
  hydrated: boolean;
  /** Not persisted: lets the Profile page show "Account deleted" before the guard sends the user to Log in. */
  justDeleted: boolean;
}

export type FitStore = FitData & FitActions & RuntimeState;

/** localStorage that degrades to a no-op when storage is blocked (private mode, quota, SSR). */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* storage unavailable: keep state in memory only */
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* storage unavailable */
    }
  },
};

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? '';
}

export const useFitStore = create<FitStore>()(
  persist(
    (set, get) => ({
      ...seed(),
      hydrated: false,
      justDeleted: false,

      signIn: (patch) =>
        set((s) => {
          const user = { ...s.user, ...patch };
          if (patch.name) user.first = firstName(patch.name);
          return { auth: true, user, justDeleted: false };
        }),

      signOut: () => set({ auth: false }),

      deleteAccount: () => set({ ...seed(), auth: false, justDeleted: true }),

      reset: () => set((s) => ({ ...seed(), auth: s.auth })),

      addFood: (meal, item) => {
        pwaManager.recordAction();
        return set((s) => ({
          meals: { ...s.meals, [meal]: [...s.meals[meal], item] },
          ui: { ...s.ui, flash: `Added ${item.name} to ${MEAL_NAME[meal]}`, meal },
        }));
      },

      removeFood: (meal, index) =>
        set((s) => ({ meals: { ...s.meals, [meal]: s.meals[meal].filter((_, i) => i !== index) } })),

      setUI: (patch) => set((s) => ({ ui: { ...s.ui, ...patch } })),

      takeFlash: () => {
        const flash = get().ui.flash;
        if (flash) set((s) => ({ ui: { ...s.ui, flash: '' } }));
        return flash;
      },

      logWeight: (kg) => {
        pwaManager.recordAction();
        return set((s) => ({ weights: { ...s.weights, [TODAY]: kg } }));
      },

      pushChat: (msg) => {
        pwaManager.recordAction();
        return set((s) => ({ chat: [...s.chat, msg].slice(-MAX_CHAT) }));
      },

      saveSession: (key, minutes, volume, topLifts) => {
        pwaManager.recordAction();
        set((s) => {
          const lifts = { ...s.lifts };
          (Object.keys(topLifts) as LiftId[]).forEach((id) => {
            const kg = topLifts[id];
            if (kg != null && lifts[id]) lifts[id] = { ...lifts[id], [TODAY]: kg };
          });
          return {
            sessions: [
              ...s.sessions.filter((x) => x.date !== TODAY),
              { date: TODAY, key, name: WORKOUTS[key].name, minutes, volume },
            ],
            lifts,
          };
        });
      },

      saveUser: (patch, targets, weight) =>
        set((s) => {
          const user: User = { ...s.user, ...patch };
          if (patch.name) user.first = firstName(patch.name);
          if (targets) user.targets = targets;
          return { user, weights: weight ? { ...s.weights, [TODAY]: weight } : s.weights };
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: ({ v, auth, user, weights, sessions, lifts, meals, nutritionHistory, chat, ui }): FitData => ({
        v,
        auth,
        user,
        weights,
        sessions,
        lifts,
        meals,
        nutritionHistory,
        chat,
        ui,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<FitData>;
        const base = seed();
        return {
          ...current,
          ...p,
          user: { ...base.user, ...p.user },
          ui: { ...base.ui, ...p.ui },
          nutritionHistory: p.nutritionHistory ?? base.nutritionHistory,
        };
      },
      onRehydrateStorage: () => () => {
        useFitStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Read the persisted slice (data only) for pure selectors. */
export function useFitData(): FitData {
  return useFitStore() as FitData;
}
