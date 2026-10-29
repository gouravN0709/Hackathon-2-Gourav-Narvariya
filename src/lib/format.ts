import type { Diet, Goal, MealKey } from '@/types/domain';

export function num(n: number): string {
  return Number(n).toLocaleString('en-US');
}

/** 90 → "1:30" */
export function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** 916 → "15 h 16 min" */
export function dur(min: number): string {
  return min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min` : `${min} min`;
}

export function signed(n: number, digits = 1): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}`;
}

export function pct(value: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}

export const GOAL_NAME: Record<Goal, string> = {
  muscle: 'Muscle gain',
  fat: 'Fat loss',
  maintain: 'Maintenance',
};

export const DIET_NAME: Record<Diet, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  eggetarian: 'Eggetarian',
  nonveg: 'Non-vegetarian',
  none: 'No preference',
};

export const MEAL_NAME: Record<MealKey, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

export const MEAL_KEYS: MealKey[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five'];

export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

/** "4 × 8 · 70 kg" / "3 × 10 · bodyweight" */
export function setLine(e: { sets: number; reps: number; kg: number }, bodyweight = ' · bodyweight'): string {
  return `${e.sets} × ${e.reps}${e.kg ? ` · ${e.kg} kg` : bodyweight}`;
}
