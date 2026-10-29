import { describe, it, expect, beforeEach } from 'vitest';
import { useFitStore, STORAGE_KEY } from '@/lib/store';
import { seed } from '@/lib/data/seed';
import { TODAY } from '@/lib/date';
import type { FoodEntry } from '@/types/domain';

describe('useFitStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useFitStore.setState({ ...seed(), auth: true, hydrated: true, justDeleted: false });
  });

  it('initializes with seed data and verifies STORAGE_KEY', () => {
    expect(STORAGE_KEY).toBe('fitai.state.v2');
    const state = useFitStore.getState();
    expect(state.user.name).toBe('Alex Morgan');
    expect(state.user.first).toBe('Alex');
    expect(state.user.goal).toBe('muscle');
    expect(state.user.targets.kcal).toBe(2400);
    expect(state.user.targets.protein).toBe(160);
    expect(state.weights[TODAY]).toBe(76.4);
  });

  it('signIn updates auth, user email, and extracts first name', () => {
    useFitStore.getState().signIn({ name: 'Jordan Smith', email: 'jordan@example.com' });
    const state = useFitStore.getState();
    expect(state.auth).toBe(true);
    expect(state.user.name).toBe('Jordan Smith');
    expect(state.user.first).toBe('Jordan');
    expect(state.user.email).toBe('jordan@example.com');
  });

  it('signOut sets auth to false', () => {
    useFitStore.getState().signOut();
    expect(useFitStore.getState().auth).toBe(false);
  });

  it('deleteAccount resets state and marks justDeleted true', () => {
    useFitStore.getState().deleteAccount();
    const state = useFitStore.getState();
    expect(state.auth).toBe(false);
    expect(state.justDeleted).toBe(true);
  });

  it('reset restores seed data but preserves auth', () => {
    useFitStore.getState().logWeight(85);
    expect(useFitStore.getState().weights[TODAY]).toBe(85);
    useFitStore.getState().reset();
    expect(useFitStore.getState().weights[TODAY]).toBe(76.4);
    expect(useFitStore.getState().auth).toBe(true);
  });

  it('addFood appends food to meal and sets flash message', () => {
    const item: FoodEntry = {
      name: 'Greek Yogurt',
      serving: '1 cup',
      k: 130,
      p: 18,
      c: 7,
      f: 0,
    };
    useFitStore.getState().addFood('snacks', item);
    const state = useFitStore.getState();
    expect(state.meals.snacks).toContainEqual(item);
    expect(state.ui.flash).toBe('Added Greek Yogurt to Snacks');
    expect(state.ui.meal).toBe('snacks');
  });

  it('removeFood removes the item at the specified index', () => {
    const initialBreakfastCount = useFitStore.getState().meals.breakfast.length;
    useFitStore.getState().removeFood('breakfast', 0);
    expect(useFitStore.getState().meals.breakfast.length).toBe(initialBreakfastCount - 1);
  });

  it('takeFlash clears and returns flash message', () => {
    useFitStore.getState().setUI({ flash: 'Test message' });
    expect(useFitStore.getState().takeFlash()).toBe('Test message');
    expect(useFitStore.getState().ui.flash).toBe('');
    expect(useFitStore.getState().takeFlash()).toBe('');
  });

  it('logWeight updates weight for TODAY', () => {
    useFitStore.getState().logWeight(77.2);
    expect(useFitStore.getState().weights[TODAY]).toBe(77.2);
  });

  it('pushChat adds message and trims to max length', () => {
    for (let i = 0; i < 30; i++) {
      useFitStore.getState().pushChat({ ai: false, text: `Message ${i}` });
    }
    const state = useFitStore.getState();
    expect(state.chat.length).toBe(24);
    expect(state.chat[state.chat.length - 1].text).toBe('Message 29');
  });

  it('saveSession adds a completed session for TODAY and updates lift records', () => {
    useFitStore.getState().saveSession('chest', 55, 3200, { bench: 72.5 });
    const state = useFitStore.getState();
    const todaySession = state.sessions.find((x) => x.date === TODAY);
    expect(todaySession).toBeDefined();
    expect(todaySession?.minutes).toBe(55);
    expect(todaySession?.volume).toBe(3200);
    expect(state.lifts.bench[TODAY]).toBe(72.5);
  });

  it('saveUser updates user profile fields and today weight', () => {
    useFitStore.getState().saveUser(
      { name: 'Alex M.', age: 29, goalWeight: 82 },
      { kcal: 2500, protein: 170, carbs: 290, fats: 75 },
      77.0,
    );
    const state = useFitStore.getState();
    expect(state.user.name).toBe('Alex M.');
    expect(state.user.first).toBe('Alex');
    expect(state.user.age).toBe(29);
    expect(state.user.goalWeight).toBe(82);
    expect(state.user.targets.kcal).toBe(2500);
    expect(state.weights[TODAY]).toBe(77.0);
  });
});

