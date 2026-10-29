import { addDays, DOW, DOW_FULL, dayOfMonth, dow, fmt, TODAY, weekStart } from '@/lib/date';
import { LIFTS, SCHEDULE, WORKOUTS } from '@/lib/data/workouts';
import { MEAL_KEYS } from '@/lib/format';
import type {
  DayStatus,
  Exercise,
  FitData,
  Goal,
  ISODate,
  LiftId,
  Macros,
  Session,
  Workout,
  WorkoutKey,
} from '@/types/domain';

export interface Totals {
  k: number;
  p: number;
  c: number;
  f: number;
}

export function totals(s: FitData): Totals {
  const t: Totals = { k: 0, p: 0, c: 0, f: 0 };
  MEAL_KEYS.forEach((m) =>
    s.meals[m].forEach((it) => {
      t.k += it.k;
      t.p += it.p;
      t.c += it.c;
      t.f += it.f;
    }),
  );
  return t;
}

export function sessionOn(s: FitData, date: ISODate): Session | null {
  return s.sessions.find((x) => x.date === date) ?? null;
}

export interface DayInfo {
  date: ISODate;
  key: WorkoutKey | 'rest';
  workout: Workout | null;
  session: Session | null;
  status: DayStatus;
}

export function dayInfo(s: FitData, date: ISODate): DayInfo {
  const key = SCHEDULE[dow(date)];
  const session = sessionOn(s, date);
  let status: DayStatus;
  if (!key) status = 'rest';
  else if (session) status = 'done';
  else if (date === TODAY) status = 'today';
  else if (date > TODAY) status = 'planned';
  else status = 'missed';
  return { date, key: key ?? 'rest', workout: key ? WORKOUTS[key] : null, session, status };
}

export function today(s: FitData): DayInfo {
  return dayInfo(s, TODAY);
}

export interface WeekDay extends DayInfo {
  i: number;
  dow: string;
  dowFull: string;
  num: number;
  name: string;
}

export function week(s: FitData): WeekDay[] {
  const mon = weekStart(TODAY);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(mon, i);
    const info = dayInfo(s, date);
    return {
      ...info,
      i,
      dow: DOW[i],
      dowFull: DOW_FULL[i],
      num: dayOfMonth(date),
      name: info.workout ? info.workout.name : 'Rest day',
    };
  });
}

export const todayIndex = (): number => dow(TODAY);

export function latestWeight(s: FitData): number {
  if (s.weights[TODAY] != null) return s.weights[TODAY];
  const keys = Object.keys(s.weights).sort();
  return keys.length ? s.weights[keys[keys.length - 1]] : s.user.startWeight;
}

export interface SeriesPoint {
  date: ISODate;
  v: number;
}

/** Last `n` days ending today; gaps carry the previous value forward. */
export function weightSeries(s: FitData, n: number): SeriesPoint[] {
  const keys = Object.keys(s.weights).sort();
  const first = keys.length ? s.weights[keys[0]] : s.user.startWeight;
  const start = addDays(TODAY, -(n - 1));
  let last: number | null = null;
  for (const k of keys) if (k < start) last = s.weights[k];
  const out: SeriesPoint[] = [];
  for (let i = 0; i < n; i++) {
    const d = addDays(start, i);
    if (s.weights[d] != null) last = s.weights[d];
    out.push({ date: d, v: last ?? first });
  }
  return out;
}

export function weightDelta(s: FitData, n: number): number {
  const series = weightSeries(s, n);
  return series[series.length - 1].v - series[0].v;
}

export function goalPct(s: FitData): number {
  const { goalWeight, startWeight } = s.user;
  const den = goalWeight - startWeight;
  if (!den) return 100;
  return Math.max(0, Math.min(100, Math.round(((latestWeight(s) - startWeight) / den) * 100)));
}

export function kgToGo(s: FitData): string {
  return Math.abs(s.user.goalWeight - latestWeight(s)).toFixed(1);
}

export interface PeriodStats {
  planned: number;
  done: number;
  pct: number;
  minutes: number;
  volume: number;
}

export function stats(s: FitData, n: number): PeriodStats {
  const start = addDays(TODAY, -(n - 1));
  let planned = 0;
  for (let i = 0; i < n; i++) if (SCHEDULE[dow(addDays(start, i))]) planned++;
  let done = 0;
  let minutes = 0;
  let volume = 0;
  s.sessions.forEach((x) => {
    if (x.date >= start && x.date <= TODAY) {
      done++;
      minutes += x.minutes;
      volume += x.volume;
    }
  });
  return { planned, done, pct: planned ? Math.round((done / planned) * 100) : 0, minutes, volume };
}

export function sessionsThisWeek(s: FitData): number {
  const mon = weekStart(TODAY);
  return s.sessions.filter((x) => x.date >= mon && x.date <= TODAY).length;
}

export interface BarData {
  unit: 'min' | 'sessions';
  max: number;
  items: { label: string; v: number }[];
}

export function bars(s: FitData, n: number): BarData {
  const start = addDays(TODAY, -(n - 1));
  if (n === 7) {
    const items = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start, i);
      return { label: DOW[dow(d)], v: sessionOn(s, d)?.minutes ?? 0 };
    });
    return { unit: 'min', max: 80, items };
  }
  const wk = addDays(weekStart(TODAY), -28);
  const items = Array.from({ length: 5 }, (_, i) => {
    const a = addDays(wk, i * 7);
    const b = addDays(a, 6);
    const v = s.sessions.filter((x) => x.date >= a && x.date <= b && x.date >= start).length;
    return { label: fmt(a), v };
  });
  return { unit: 'sessions', max: 5, items };
}

function liftAt(s: FitData, id: LiftId, date: ISODate): number {
  const h = s.lifts[id];
  const keys = Object.keys(h).sort();
  let best: number | null = null;
  for (const d of keys) if (d <= date) best = h[d];
  return best ?? h[keys[0]];
}

export interface LiftProgress {
  id: LiftId;
  name: string;
  from: number;
  to: number;
  goal: number;
  gain: string;
  pct: number;
}

export function lifts(s: FitData, n: number): LiftProgress[] {
  const start = addDays(TODAY, -(n - 1));
  return LIFTS.map((l) => {
    const from = liftAt(s, l.id, start);
    const to = liftAt(s, l.id, TODAY);
    return {
      id: l.id,
      name: l.name,
      from,
      to,
      goal: l.goal,
      gain: from ? `+${(((to - from) / from) * 100).toFixed(1)}%` : '',
      pct: Math.min(100, Math.round((to / l.goal) * 100)),
    };
  });
}

/** Average daily intake over the last `n` days, including today's live meal log. */
export function avgIntake(s: FitData, n: number): { k: number; p: number } {
  const t = totals(s);
  let k = t.k;
  let p = t.p;
  for (let i = 1; i < n; i++) {
    const day = s.nutritionHistory[addDays(TODAY, -i)];
    k += day?.k ?? 0;
    p += day?.p ?? 0;
  }
  return { k: Math.round(k / n), p: Math.round(p / n) };
}

export function calorieSeries(s: FitData, n: number): SeriesPoint[] {
  const t = totals(s);
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(TODAY, -(n - 1 - i));
    return { date, v: date === TODAY ? t.k : (s.nutritionHistory[date]?.k ?? 0) };
  });
}

export interface ChartGeometry {
  linePath: string;
  areaPath: string;
  grid: { y: number; label: string }[];
  xl: { x: number; anchor: 'start' | 'middle' | 'end'; label: string }[];
  points: { x: number; y: number; date: ISODate; v: number }[];
  bottom: number;
  delta: number;
}

export interface ChartBox {
  W: number;
  H: number;
  L: number;
  R: number;
  T: number;
  B: number;
}

export function chart(series: SeriesPoint[], { W, H, L, R, T, B }: ChartBox): ChartGeometry {
  const n = series.length;
  const vals = series.map((p) => p.v);
  const lo = Math.floor(Math.min(...vals) * 2) / 2;
  let hi = Math.ceil(Math.max(...vals) * 2) / 2;
  if (hi - lo < 1) hi = lo + 1;
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(1, n - 1);
  const y = (v: number) => T + ((hi - v) / (hi - lo)) * (H - T - B);
  const points = series.map((p, i) => ({ x: x(i), y: y(p.v), date: p.date, v: p.v }));
  const linePath = 'M' + points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L');
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)},${H - B} L${x(0).toFixed(1)},${H - B} Z`;
  const grid = [0, 1, 2, 3, 4].map((i) => {
    const v = hi - ((hi - lo) * i) / 4;
    return { y: y(v), label: v.toFixed(1) };
  });
  const xl = [0, 0.25, 0.5, 0.75, 1].map((f, k) => {
    const ix = Math.round(f * (n - 1));
    return {
      x: x(ix),
      anchor: (k === 0 ? 'start' : k === 4 ? 'end' : 'middle') as 'start' | 'middle' | 'end',
      label: fmt(series[ix].date),
    };
  });
  return { linePath, areaPath, grid, xl, points, bottom: H - B, delta: vals[n - 1] - vals[0] };
}

/** Mifflin-St Jeor × 1.33 activity, adjusted for the goal. */
export function calcTargets(u: { height: number; age: number; goal: Goal }, w: number): Macros {
  const base = (10 * w + 6.25 * u.height - 5 * u.age + 5) * 1.33;
  const adj = u.goal === 'muscle' ? 100 : u.goal === 'fat' ? -500 : 0;
  const kcal = Math.round((base + adj) / 50) * 50;
  const protein = Math.round(w * (u.goal === 'fat' ? 2.2 : u.goal === 'maintain' ? 1.8 : 2.1));
  const fats = Math.round((kcal * 0.27) / 9);
  const carbs = Math.round((kcal - protein * 4 - fats * 9) / 4 / 5) * 5;
  return { kcal, protein, carbs, fats };
}

export function workoutExercises(s: FitData, key: WorkoutKey): Exercise[] {
  return WORKOUTS[key].exercises.concat(s.ui.extras[key] ?? []);
}

/** Calorie share of each macro in what has been eaten today, in percent. */
export function macroSplit(t: Totals): { p: number; c: number; f: number } {
  const kc = Math.max(1, t.p * 4 + t.c * 4 + t.f * 9);
  const p = Math.round(((t.p * 4) / kc) * 100);
  const c = Math.round(((t.c * 4) / kc) * 100);
  return { p, c, f: Math.max(0, 100 - p - c) };
}
