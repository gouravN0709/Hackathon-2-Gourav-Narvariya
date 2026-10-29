import type { Exercise, LiftId, Workout, WorkoutKey } from '@/types/domain';

function ex(
  id: string,
  name: string,
  muscle: string,
  sets: number,
  reps: number,
  kg: number,
  rest: number,
  step: number,
  tip: string,
  lift: LiftId | null = null,
): Exercise {
  return { id, name, muscle, sets, reps, kg, rest, step, tip, lift };
}

export const WORKOUTS: Record<WorkoutKey, Workout> = {
  back: {
    key: 'back',
    name: 'Back & Biceps',
    minutes: 62,
    kcal: 390,
    focus: ['Lats', 'Mid back', 'Biceps'],
    exercises: [
      ex('pu', 'Pull-ups', 'Lats · Biceps', 4, 8, 0, 90, 2.5, 'Chin over the bar, control the way down.'),
      ex('row', 'Barbell Row', 'Mid back', 4, 8, 60, 90, 2.5, 'Flat back, pull to your lower ribs.', 'row'),
      ex('scr', 'Seated Cable Row', 'Mid back', 3, 10, 45, 75, 2.5, 'Squeeze your shoulder blades together.'),
      ex('fp', 'Face Pull', 'Rear delts', 3, 15, 20, 60, 2.5, 'Pull to eye level, elbows high.'),
      ex('curl', 'EZ-Bar Curl', 'Biceps', 3, 10, 30, 60, 2.5, 'Keep elbows still at your sides.'),
    ],
  },
  legs: {
    key: 'legs',
    name: 'Legs',
    minutes: 70,
    kcal: 480,
    focus: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
    exercises: [
      ex('sq', 'Back Squat', 'Quads · Glutes', 4, 6, 90, 150, 2.5, 'Hit parallel, drive through mid-foot.', 'squat'),
      ex('rdl', 'Romanian Deadlift', 'Hamstrings', 3, 8, 80, 120, 2.5, 'Hips back, soft knees, bar close.'),
      ex('lp', 'Leg Press', 'Quads', 3, 12, 160, 90, 5, 'Full depth without lifting your hips.'),
      ex('lu', 'Walking Lunges', 'Glutes', 3, 12, 20, 90, 2, 'Long steps, upright torso.'),
      ex('cr', 'Standing Calf Raise', 'Calves', 4, 15, 60, 45, 2.5, 'Pause at the top for a second.'),
    ],
  },
  chest: {
    key: 'chest',
    name: 'Chest & Triceps',
    minutes: 58,
    kcal: 420,
    focus: ['Chest', 'Upper chest', 'Triceps'],
    exercises: [
      ex('bp', 'Barbell Bench Press', 'Chest', 4, 8, 70, 120, 2.5, 'Aim for 72.5 kg on your last set.', 'bench'),
      ex('idp', 'Incline Dumbbell Press', 'Upper chest', 3, 10, 24, 90, 2, 'Slow 3-second lowering phase.'),
      ex('cf', 'Cable Fly', 'Chest', 3, 12, 15, 60, 2.5, 'Squeeze for one second in the middle.'),
      ex('dip', 'Dips', 'Chest · Triceps', 3, 10, 0, 90, 2.5, 'Lean forward slightly to hit the chest.'),
      ex('rp', 'Rope Pushdown', 'Triceps', 3, 12, 27, 60, 2.5, 'Keep elbows pinned to your sides.'),
      ex('ote', 'Overhead Triceps Extension', 'Triceps', 3, 12, 22, 60, 2, 'Full stretch at the bottom.'),
    ],
  },
  shoulders: {
    key: 'shoulders',
    name: 'Shoulders & Core',
    minutes: 55,
    kcal: 360,
    focus: ['Shoulders', 'Rear delts', 'Core'],
    exercises: [
      ex('ohp', 'Overhead Press', 'Shoulders', 4, 8, 40, 120, 2.5, 'Brace your core, press straight up.'),
      ex('lr', 'Lateral Raise', 'Side delts', 4, 12, 10, 60, 1, 'Lead with the elbows, no swinging.'),
      ex('rdf', 'Rear Delt Fly', 'Rear delts', 3, 15, 8, 60, 1, 'Light weight, slow reps.'),
      ex('hlr', 'Hanging Leg Raise', 'Core', 3, 12, 0, 60, 2.5, 'Curl your pelvis up, no swinging.'),
      ex('cc', 'Cable Crunch', 'Core', 3, 15, 35, 60, 2.5, 'Round your spine, exhale at the bottom.'),
    ],
  },
};

/** Day-of-week index (Mon = 0) → workout */
export const SCHEDULE: Partial<Record<number, WorkoutKey>> = { 0: 'back', 1: 'legs', 3: 'chest', 4: 'shoulders' };

export const SESSIONS_PER_WEEK = 4;

export const LIFTS: { id: LiftId; name: string; goal: number }[] = [
  { id: 'bench', name: 'Bench press', goal: 80 },
  { id: 'squat', name: 'Back squat', goal: 100 },
  { id: 'row', name: 'Barbell row', goal: 70 },
];

/** Suggested extras for the "Add exercise" picker on Workout Details. */
export const EXTRA_EXERCISES: Exercise[] = [
  ex('x1', 'Push-ups', 'Chest', 3, 15, 0, 60, 2.5, 'Body in one line, chest to the floor.'),
  ex('x2', 'Pec Deck Fly', 'Chest', 3, 12, 40, 60, 2.5, 'Slow stretch, squeeze at the front.'),
  ex('x3', 'Skull Crushers', 'Triceps', 3, 10, 25, 75, 2.5, 'Lower to your forehead, elbows in.'),
  ex('x4', 'Hammer Curl', 'Biceps', 3, 12, 14, 60, 2, 'Neutral grip, no swinging.'),
  ex('x5', 'Farmer Carry', 'Core · Grip', 3, 30, 28, 60, 2, 'Walk tall for 30 steps.'),
];

export const NOVA_NOTES: Record<WorkoutKey, string> = {
  chest:
    'Warm up with two light bench sets. Last time you hit 70 kg × 8, so try 72.5 kg on your final set. Keep elbows at about 45 degrees.',
  back: 'Control the lowering on every pull-up. Row from a flat back and keep your biceps work strict.',
  legs: 'Squat depth first, weight second. Eat a carb-rich meal 2 hours before.',
  shoulders: 'Keep lateral raises light and strict. Brace your core on every overhead press.',
};

export const MUSCLE_GROUPS: { short: string; name: string; kw: string[] }[] = [
  { short: 'CH', name: 'Chest', kw: ['Chest'] },
  { short: 'BK', name: 'Back', kw: ['Lats', 'Mid back'] },
  { short: 'LG', name: 'Legs', kw: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] },
  { short: 'SH', name: 'Shoulders', kw: ['Shoulders', 'delts'] },
  { short: 'AR', name: 'Arms', kw: ['Biceps', 'Triceps'] },
  { short: 'CR', name: 'Core', kw: ['Core'] },
];

export const PLANNED_TIME = '6:30 PM';
