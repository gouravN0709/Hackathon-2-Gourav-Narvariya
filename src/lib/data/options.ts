import type { Diet, Experience, Goal } from '@/types/domain';

export interface Option<T extends string> {
  id: T;
  title: string;
  desc?: string;
}

export const ONBOARDING_GOALS: Option<Goal>[] = [
  { id: 'muscle', title: 'Build muscle', desc: 'Gain strength and size with a small calorie surplus.' },
  { id: 'fat', title: 'Lose fat', desc: 'Drop body fat while keeping the muscle you have.' },
  { id: 'maintain', title: 'Maintain', desc: 'Stay at your weight and keep your fitness steady.' },
];

export const PROFILE_GOALS: Option<Goal>[] = [
  { id: 'muscle', title: 'Build muscle', desc: 'Small calorie surplus, heavy progressive training.' },
  { id: 'fat', title: 'Lose fat', desc: 'Calorie deficit while keeping your muscle.' },
  { id: 'maintain', title: 'Maintain', desc: 'Hold your weight and keep fitness steady.' },
];

export const EXPERIENCES: Option<Experience>[] = [
  { id: 'beginner', title: 'Beginner', desc: 'New to lifting, or back after a long break.' },
  { id: 'intermediate', title: 'Intermediate', desc: '1 to 3 years of regular training.' },
  { id: 'advanced', title: 'Advanced', desc: 'More than 3 years and comfortable with heavy compounds.' },
];

export const DIETS: Option<Diet>[] = [
  { id: 'vegetarian', title: 'Vegetarian' },
  { id: 'vegan', title: 'Vegan' },
  { id: 'eggetarian', title: 'Eggetarian' },
  { id: 'nonveg', title: 'Non-vegetarian' },
  { id: 'none', title: 'No preference' },
];

export function optionTitle<T extends string>(options: Option<T>[], id: T | ''): string {
  return options.find((o) => o.id === id)?.title ?? '';
}
