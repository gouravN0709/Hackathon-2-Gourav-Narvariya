import type { Exercise, LiftId } from '@/types/domain';

export interface SetState {
  kg: number;
  reps: number;
  done: boolean;
}

export interface ActiveExercise {
  id: string;
  name: string;
  muscle: string;
  lift: LiftId | null;
  step: number;
  tip: string;
  rest: number;
  planKg: number;
  sets: SetState[];
  targetLine: string;
}

export interface ActiveState {
  idx: number;
  err: string;
  exercises: ActiveExercise[];
}

export type ActiveAction =
  | { type: 'select'; idx: number }
  | { type: 'patch'; ei: number; si: number; patch: Partial<SetState> }
  | { type: 'toggle'; ei: number; si: number }
  | { type: 'addSet'; ei: number }
  | { type: 'complete'; ei: number }
  | { type: 'error'; message: string };

export function initActive(list: Exercise[]): ActiveState {
  return {
    idx: 0,
    err: '',
    exercises: list.map((e) => ({
      id: e.id,
      name: e.name,
      muscle: e.muscle,
      lift: e.lift,
      step: e.step,
      tip: e.tip,
      rest: e.rest,
      planKg: e.kg,
      targetLine: `${e.sets} × ${e.reps}${e.kg ? ` · ${e.kg} kg` : ' · bodyweight'}`,
      sets: Array.from({ length: e.sets }, () => ({ kg: e.kg, reps: e.reps, done: false })),
    })),
  };
}

function mapSets(state: ActiveState, ei: number, fn: (sets: SetState[]) => SetState[]): ActiveExercise[] {
  return state.exercises.map((e, i) => (i === ei ? { ...e, sets: fn(e.sets) } : e));
}

export function activeReducer(state: ActiveState, action: ActiveAction): ActiveState {
  switch (action.type) {
    case 'select':
      return { ...state, idx: action.idx, err: '' };
    case 'patch':
      return {
        ...state,
        err: '',
        exercises: mapSets(state, action.ei, (sets) => sets.map((x, j) => (j === action.si ? { ...x, ...action.patch } : x))),
      };
    case 'toggle': {
      const set = state.exercises[action.ei]?.sets[action.si];
      if (!set) return state;
      if (!set.done && set.reps < 1) return { ...state, err: `Add at least 1 rep before completing set ${action.si + 1}.` };
      return {
        ...state,
        err: '',
        exercises: mapSets(state, action.ei, (sets) => sets.map((x, j) => (j === action.si ? { ...x, done: !x.done } : x))),
      };
    }
    case 'addSet':
      return {
        ...state,
        err: '',
        exercises: mapSets(state, action.ei, (sets) => [...sets, { ...sets[sets.length - 1], done: false }]),
      };
    case 'complete': {
      const ex = state.exercises[action.ei];
      if (!ex) return state;
      if (ex.sets.some((x) => x.reps < 1)) {
        return { ...state, err: 'Every set needs at least 1 rep before you can complete the exercise.' };
      }
      return {
        idx: Math.min(state.exercises.length - 1, action.ei + 1),
        err: '',
        exercises: mapSets(state, action.ei, (sets) => sets.map((x) => ({ ...x, done: true }))),
      };
    }
    case 'error':
      return { ...state, err: action.message };
  }
}

export function summarize(state: ActiveState) {
  let setsDone = 0;
  let setsTotal = 0;
  let volume = 0;
  state.exercises.forEach((e) =>
    e.sets.forEach((x) => {
      setsTotal++;
      if (x.done) {
        setsDone++;
        volume += x.kg * x.reps;
      }
    }),
  );
  return { setsDone, setsTotal, volume: Math.round(volume) };
}

/** Heaviest completed set per linked lift. */
export function topLifts(state: ActiveState): Partial<Record<LiftId, number>> {
  const tops: Partial<Record<LiftId, number>> = {};
  state.exercises.forEach((e) => {
    if (!e.lift) return;
    const kgs = e.sets.filter((x) => x.done).map((x) => x.kg);
    if (kgs.length) tops[e.lift] = Math.max(...kgs);
  });
  return tops;
}

export const isExerciseDone = (e: ActiveExercise) => e.sets.every((x) => x.done);
