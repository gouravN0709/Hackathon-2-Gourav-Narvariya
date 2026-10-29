export type ISODate = string;

export type Goal = 'muscle' | 'fat' | 'maintain';
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type Diet = 'vegetarian' | 'vegan' | 'eggetarian' | 'nonveg' | 'none';
export type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export type WorkoutKey = 'back' | 'legs' | 'chest' | 'shoulders';
export type LiftId = 'bench' | 'squat' | 'row';
export type DayStatus = 'rest' | 'done' | 'today' | 'planned' | 'missed';

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NotificationPrefs {
  reminders: boolean;
  weekly: boolean;
  coach: boolean;
  sounds?: boolean;
}

export interface User {
  name: string;
  first: string;
  email: string;
  age: number;
  height: number;
  goal: Goal;
  exp: Experience;
  diet: Diet;
  startWeight: number;
  goalWeight: number;
  units: 'metric';
  targets: Macros;
  notif: NotificationPrefs;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  /** 0 means bodyweight */
  kg: number;
  /** seconds */
  rest: number;
  step: number;
  tip: string;
  lift: LiftId | null;
}

export interface Workout {
  key: WorkoutKey;
  name: string;
  minutes: number;
  kcal: number;
  focus: string[];
  exercises: Exercise[];
}

export interface Session {
  date: ISODate;
  key: WorkoutKey;
  name: string;
  minutes: number;
  volume: number;
}

/** k / p / c / f = kcal, protein, carbs, fats */
export interface FoodEntry {
  /** Server row id (meal_entries.id). Absent on freshly-added optimistic rows. */
  id?: string;
  name: string;
  serving: string;
  k: number;
  p: number;
  c: number;
  f: number;
}

export interface Serving {
  label: string;
  m: number;
}

export interface Food {
  id: string;
  name: string;
  cat: FoodCategory;
  base: string;
  k: number;
  p: number;
  c: number;
  f: number;
  servings: Serving[];
  defIdx: number;
}

export type FoodCategory =
  | 'Protein'
  | 'Lentils & beans'
  | 'Grains'
  | 'Breakfast'
  | 'Vegetables'
  | 'Fruit'
  | 'Snacks'
  | 'Dairy';

export interface ChatMessage {
  ai: boolean;
  text: string;
  card?: boolean;
}

export interface DayIntake {
  k: number;
  p: number;
}

export interface UIState {
  meal: MealKey;
  flash: string;
  tab: 'search' | 'custom';
  workoutDay: number | null;
  extras: Partial<Record<WorkoutKey, Exercise[]>>;
  routines: string[];
  tipDismissed: boolean;
  sidebarCollapsed: boolean;
}

export interface FitData {
  v: 2;
  auth: boolean;
  user: User;
  weights: Record<ISODate, number>;
  sessions: Session[];
  lifts: Record<LiftId, Record<ISODate, number>>;
  meals: Record<MealKey, FoodEntry[]>;
  nutritionHistory: Record<ISODate, DayIntake>;
  chat: ChatMessage[];
  ui: UIState;
  /** Weekly plan from user_plan; non-empty entries override SCHEDULE. */
  plan?: Partial<Record<number, WorkoutKey>>;
}
