import { isEmail } from '@/lib/validation';
import { latestWeight } from '@/lib/selectors';
import type { Diet, Experience, FitData, Goal, NotificationPrefs } from '@/types/domain';

export interface ProfileDraft {
  goal: Goal;
  goalWeight: string;
  age: string;
  height: string;
  weight: string;
  exp: Experience;
  diet: Diet;
  kcal: string;
  protein: string;
  carbs: string;
  fats: string;
  name: string;
  email: string;
  notif: NotificationPrefs;
}

export type NumericKey = 'goalWeight' | 'age' | 'height' | 'weight' | 'kcal' | 'protein' | 'carbs' | 'fats';

export function draftFrom(s: FitData): ProfileDraft {
  const u = s.user;
  return {
    goal: u.goal,
    goalWeight: String(u.goalWeight),
    age: String(u.age),
    height: String(u.height),
    weight: String(latestWeight(s)),
    exp: u.exp,
    diet: u.diet,
    kcal: String(u.targets.kcal),
    protein: String(u.targets.protein),
    carbs: String(u.targets.carbs),
    fats: String(u.targets.fats),
    name: u.name,
    email: u.email,
    notif: { ...u.notif },
  };
}

export function sameDraft(a: ProfileDraft, b: ProfileDraft): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const RULES: [NumericKey, number, number, string][] = [
  ['age', 14, 90, 'Age must be between 14 and 90.'],
  ['height', 120, 230, 'Height must be between 120 and 230 cm.'],
  ['weight', 30, 300, 'Current weight must be between 30 and 300 kg.'],
  ['goalWeight', 30, 300, 'Goal weight must be between 30 and 300 kg.'],
  ['kcal', 1200, 5000, 'Calories must be between 1,200 and 5,000.'],
  ['protein', 40, 400, 'Protein must be between 40 and 400 g.'],
  ['carbs', 50, 700, 'Carbs must be between 50 and 700 g.'],
  ['fats', 20, 200, 'Fats must be between 20 and 200 g.'],
];

export const numOf = (d: ProfileDraft, k: NumericKey): number => Number.parseFloat(d[k]);

/** Returns the first validation error (source order), or '' when the draft is valid. */
export function validateDraft(d: ProfileDraft): { error: string; field?: NumericKey | 'name' | 'email' } {
  for (const [k, min, max, msg] of RULES) {
    const x = numOf(d, k);
    if (!(x >= min && x <= max)) return { error: msg, field: k };
  }
  if (!d.name.trim()) return { error: 'Enter your name.', field: 'name' };
  if (!isEmail(d.email)) return { error: 'Enter a valid email address.', field: 'email' };
  return { error: '' };
}
