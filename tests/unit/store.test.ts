import { describe, it, expect, beforeEach, vi } from 'vitest';

// The store talks to Supabase through the loader + browser client; mock both so
// these tests cover the optimistic-update/rollback logic without a network.
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
      getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  }),
}));

vi.mock('@/lib/data/loader', async () => {
  const actual = await vi.importActual('@/lib/data/loader');
  return {
    ...actual,
    loadAll: vi.fn(async () => {
      throw new Error('NO_SESSION');
    }),
    cacheRead: vi.fn(async () => null),
    cacheWrite: vi.fn(() => {}),
    demoPayload: vi.fn(() => ({
      weights: [],
      sessions: [],
      meals: [],
      chat: [],
      profile: { onboarding_completed: true },
    })),
    addMealEntry: vi.fn(async () => 'row-1'),
    deleteMealEntryServer: vi.fn(async () => {}),
    persistProfile: vi.fn(async () => {}),
    persistSetting: vi.fn(async () => {}),
    upsertWeightToday: vi.fn(async () => {}),
    addChatMessage: vi.fn(async () => {}),
    saveWorkoutSession: vi.fn(async () => {}),
    addExerciseExtra: vi.fn(async () => {}),
    removeExerciseExtra: vi.fn(async () => {}),
    newRoutine: vi.fn(async () => {}),
  };
});

vi.mock('@/lib/data/demo', () => ({
  applyPayload: vi.fn(async () => {}),
  importDeviceState: vi.fn(async () => {}),
}));

import { useFitStore, STORAGE_KEY } from '@/lib/store';
import {
  addMealEntry,
  deleteMealEntryServer,
  persistProfile,
  saveWorkoutSession,
  upsertWeightToday,
  addChatMessage,
} from '@/lib/data/loader';
import { applyPayload } from '@/lib/data/demo';
import { seed } from '@/lib/data/seed';
import { TODAY } from '@/lib/date';
import type { FoodEntry } from '@/types/domain';

const mockedAddMealEntry = vi.mocked(addMealEntry);
const mockedDeleteMealEntryServer = vi.mocked(deleteMealEntryServer);
const mockedPersistProfile = vi.mocked(persistProfile);
const mockedUpsertWeightToday = vi.mocked(upsertWeightToday);
const mockedSaveWorkoutSession = vi.mocked(saveWorkoutSession);
const mockedAddChatMessage = vi.mocked(addChatMessage);
const mockedApplyPayload = vi.mocked(applyPayload);

describe('useFitStore (backend store, optimistic layer)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useFitStore.setState({ ...seed(), plan: {}, auth: true, hydrated: true, syncError: false, justDeleted: false, dataLoaded: true });
  });

  it('still exports the legacy storage key and optimistic seed baseline', () => {
    expect(STORAGE_KEY).toBe('fitai.state.v2');
    const state = useFitStore.getState();
    expect(state.user.name).toBe('Alex Morgan');
    expect(state.user.targets.kcal).toBe(2_400);
    expect(state.weights[TODAY]).toBe(76.4);
  });

  it('bootstrap with no session ends signed-out and hydrated', async () => {
    useFitStore.setState({ auth: true, hydrated: false });
    await useFitStore.getState().bootstrap();
    const state = useFitStore.getState();
    expect(state.auth).toBe(false);
    expect(state.hydrated).toBe(true);
  });

  it('signOut resets the store to a signed-out state', async () => {
    await useFitStore.getState().signOut();
    const state = useFitStore.getState();
    expect(state.auth).toBe(false);
    expect(state.hydrated).toBe(true);
  });

  it('deleteAccount hits the server route, signs out and marks justDeleted', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const ok = await useFitStore.getState().deleteAccount();
    vi.unstubAllGlobals();
    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('/api/account/delete', expect.objectContaining({ method: 'POST' }));
    const state = useFitStore.getState();
    expect(state.justDeleted).toBe(true);
    expect(state.auth).toBe(false);
  });

  it('reset applies the demo payload', async () => {
    await useFitStore.getState().reset();
    expect(mockedApplyPayload).toHaveBeenCalledTimes(1);
  });

  it('addFood appends optimistically and patches the server id in', async () => {
    const item: FoodEntry = { name: 'Greek Yogurt', serving: '1 cup', k: 130, p: 18, c: 7, f: 0 };
    useFitStore.getState().addFood('snacks', item);
    const state = useFitStore.getState();
    expect(state.meals.snacks.some((x) => x.name === item.name)).toBe(true);
    expect(state.ui.flash).toBe('Added Greek Yogurt to Snacks');
    expect(state.ui.meal).toBe('snacks');
    await vi.waitFor(() => expect(mockedAddMealEntry).toHaveBeenCalledWith(item, 'snacks'));
    await vi.waitFor(() => {
      const patched = useFitStore.getState().meals.snacks.find((x) => x.name === item.name);
      expect(patched?.id).toBe('row-1');
    });
  });

  it('removeFood removes the row and deletes it server-side when an id exists', async () => {
    const item: FoodEntry & { id?: string } = { id: 'row-9', name: 'Cookie', serving: '1 piece', k: 60, p: 1, c: 8, f: 2 };
    useFitStore.setState((s) => ({ meals: { ...s.meals, snacks: [item] } }));
    useFitStore.getState().removeFood('snacks', 0);
    await vi.waitFor(() => expect(mockedDeleteMealEntryServer).toHaveBeenCalledWith('row-9'));
    expect(useFitStore.getState().meals.snacks).toHaveLength(0);
  });

  it('takeFlash clears and returns the flash message', () => {
    useFitStore.getState().setUI({ flash: 'Test message' });
    expect(useFitStore.getState().takeFlash()).toBe('Test message');
    expect(useFitStore.getState().ui.flash).toBe('');
    expect(useFitStore.getState().takeFlash()).toBe('');
  });

  it('logWeight updates today optimistically and upserts server-side', async () => {
    useFitStore.getState().logWeight(77.2);
    expect(useFitStore.getState().weights[TODAY]).toBe(77.2);
    await vi.waitFor(() => expect(mockedUpsertWeightToday).toHaveBeenCalledWith(77.2, TODAY));
  });

  it('pushChat appends and trims the transcript to 24 entries', async () => {
    for (let i = 0; i < 30; i++) {
      useFitStore.getState().pushChat({ ai: false, text: `Message ${i}` });
    }
    const state = useFitStore.getState();
    expect(state.chat.length).toBe(24);
    expect(state.chat[state.chat.length - 1].text).toBe('Message 29');
    await vi.waitFor(() => expect(mockedAddChatMessage).toHaveBeenCalled());
  });

  it('saveSession stores the session for TODAY, lifts, and forwards per-set rows', async () => {
    useFitStore.getState().saveSession(
      'chest',
      55,
      3_200,
      { bench: 72.5 },
      [{ id: 'bench_press', lift: 'bench', sets: [{ kg: 72.5, reps: 8, done: true }] }],
    );
    const state = useFitStore.getState();
    const todaySession = state.sessions.find((x) => x.date === TODAY);
    expect(todaySession).toBeDefined();
    expect(todaySession?.minutes).toBe(55);
    expect(todaySession?.volume).toBe(3_200);
    expect(state.lifts.bench[TODAY]).toBe(72.5);
    await vi.waitFor(() =>
      expect(mockedSaveWorkoutSession).toHaveBeenCalledWith({
        key: 'chest',
        minutes: 55,
        volume: 3_200,
        sets: [{ exercise_key: 'bench_press', set_no: 1, kg: 72.5, reps: 8, done: true }],
      }),
    );
  });

  it('saveUser updates profile fields, targets and today weight optimistically', async () => {
    useFitStore.getState().saveUser(
      { name: 'Alex M.', age: 29, goalWeight: 82 },
      { kcal: 2_500, protein: 170, carbs: 290, fats: 75 },
      77,
    );
    const state = useFitStore.getState();
    expect(state.user.name).toBe('Alex M.');
    expect(state.user.first).toBe('Alex');
    expect(state.user.age).toBe(29);
    expect(state.user.goalWeight).toBe(82);
    expect(state.user.targets.kcal).toBe(2_500);
    expect(state.weights[TODAY]).toBe(77);
    await vi.waitFor(() => expect(mockedPersistProfile).toHaveBeenCalled());
  });
});
