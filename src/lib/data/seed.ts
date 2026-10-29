import { addDays, TODAY } from '@/lib/date';
import { WORKOUTS } from '@/lib/data/workouts';
import type { DayIntake, FitData, ISODate, Session, WorkoutKey } from '@/types/domain';

const SESSION_ROWS: [ISODate, WorkoutKey, number, number][] = [
  ['2026-09-17', 'chest', 58, 9800],
  ['2026-09-18', 'shoulders', 55, 7200],
  ['2026-09-21', 'back', 60, 10400],
  ['2026-09-22', 'legs', 68, 16800],
  ['2026-09-24', 'chest', 57, 10100],
  ['2026-09-25', 'shoulders', 54, 7400],
  ['2026-09-28', 'back', 61, 10900],
  ['2026-09-29', 'legs', 70, 17200],
  ['2026-10-01', 'chest', 58, 10300],
  ['2026-10-05', 'back', 60, 11200],
  ['2026-10-06', 'legs', 69, 17600],
  ['2026-10-08', 'chest', 59, 10600],
  ['2026-10-09', 'shoulders', 55, 7600],
  ['2026-10-12', 'back', 62, 11500],
  ['2026-10-13', 'legs', 70, 18000],
];

/**
 * Logged intake for the 29 days before today (Sep 16 – Oct 14). Together with today's live meal log
 * the seed averages to 2,310 kcal / 128 g over 7 days and 2,380 kcal / 141 g over 30 days.
 */
const KCAL_OFFSETS = [-60, 40, -20, 70, -40, 10, 30, -50, 60, -30, 20, -10, 50, -70, 40, 0, -20, 30, -40, 60, -10, 20, -50];
const PROTEIN_OFFSETS = [-6, 4, -2, 7, -4, 1, 3, -5, 6, -3, 2, -1, 5, -7, 4, 0, -2, 3, -4, 6, -1, 2, -9];
const LAST_WEEK_KCAL = [2420, 2380, 2450, 2390, 2460, 2430];
const LAST_WEEK_PROTEIN = [128, 132, 126, 134, 130, 134];

function seedNutritionHistory(): Record<ISODate, DayIntake> {
  const out: Record<ISODate, DayIntake> = {};
  const start = addDays(TODAY, -29);
  KCAL_OFFSETS.forEach((off, i) => {
    out[addDays(start, i)] = { k: 2400 + off, p: 145 + PROTEIN_OFFSETS[i] };
  });
  LAST_WEEK_KCAL.forEach((k, i) => {
    out[addDays(start, KCAL_OFFSETS.length + i)] = { k, p: LAST_WEEK_PROTEIN[i] };
  });
  return out;
}

function seedWeights(): Record<ISODate, number> {
  const weights: Record<ISODate, number> = {};
  for (let i = 0; i < 30; i++) {
    weights[addDays('2026-09-16', i)] = +(74.9 + i * 0.052 + Math.sin(i * 1.3) * 0.16).toFixed(1);
  }
  weights[TODAY] = 76.4;
  return weights;
}

export function seed(): FitData {
  const sessions: Session[] = SESSION_ROWS.map(([date, key, minutes, volume]) => ({
    date,
    key,
    name: WORKOUTS[key].name,
    minutes,
    volume,
  }));

  return {
    v: 2,
    auth: false,
    user: {
      name: 'Alex Morgan',
      first: 'Alex',
      email: 'alex.morgan@email.com',
      age: 28,
      height: 178,
      goal: 'muscle',
      exp: 'intermediate',
      diet: 'vegetarian',
      startWeight: 72,
      goalWeight: 80,
      units: 'metric',
      targets: { kcal: 2400, protein: 160, carbs: 280, fats: 72 },
      notif: { reminders: true, weekly: true, coach: false, sounds: false },
    },
    weights: seedWeights(),
    sessions,
    lifts: {
      bench: { '2026-09-16': 65, '2026-10-01': 67.5, '2026-10-08': 70 },
      squat: { '2026-09-16': 82.5, '2026-09-29': 87.5, '2026-10-13': 90 },
      row: { '2026-09-16': 52.5, '2026-10-05': 57.5, '2026-10-12': 60 },
    },
    meals: {
      breakfast: [
        { name: 'Masala oats with banana', serving: '1 bowl', k: 340, p: 12, c: 60, f: 6 },
        { name: 'Greek yogurt', serving: '200 g', k: 130, p: 20, c: 8, f: 1 },
        { name: 'Almonds', serving: '20 g', k: 120, p: 4, c: 4, f: 10 },
      ],
      lunch: [
        { name: 'Paneer bhurji', serving: '150 g', k: 330, p: 24, c: 6, f: 18 },
        { name: 'Whole wheat roti', serving: '2 rotis', k: 200, p: 7, c: 36, f: 3 },
        { name: 'Dal tadka', serving: '1 cup', k: 180, p: 10, c: 24, f: 4 },
      ],
      dinner: [],
      snacks: [
        { name: 'Whey protein shake', serving: '1 scoop', k: 120, p: 24, c: 3, f: 1 },
        { name: 'Apple', serving: '1 medium', k: 95, p: 0, c: 25, f: 0 },
        { name: 'Paneer cubes', serving: '50 g', k: 125, p: 11, c: 2, f: 5 },
      ],
    },
    nutritionHistory: seedNutritionHistory(),
    chat: [
      {
        ai: true,
        text: "Hey Alex! I'm Nova, your coach. I can see your week, your macros and your lifts. What do you want to work on?",
      },
      { ai: false, text: 'What workout should I do today?' },
      {
        ai: true,
        text: "Today is Chest & Triceps. You hit 70 kg × 8 on bench last week, so let's try 72.5 kg for your last set. Keep rest to 90 seconds and you'll finish in about an hour.",
        card: true,
      },
    ],
    ui: {
      meal: 'dinner',
      flash: '',
      tab: 'search',
      workoutDay: null,
      extras: {},
      routines: [],
      tipDismissed: false,
      sidebarCollapsed: false,
    },
  };
}
