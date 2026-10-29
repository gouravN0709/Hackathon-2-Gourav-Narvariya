import type { ISODate } from '@/types/domain';

function realToday(): ISODate {
  return new Date().toISOString().slice(0, 10);
}

/**
 * "Today" is env-overridable so tests and demo builds can freeze the clock
 * (NEXT_PUBLIC_TODAY=2026-10-15). In plain local/dev use it is the real date.
 */
const frozen = process.env.NEXT_PUBLIC_TODAY;
export const TODAY: ISODate = frozen && /^\d{4}-\d{2}-\d{2}$/.test(frozen) ? frozen : realToday();

export const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const DOW_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const DAY_MS = 86_400_000;

function toUTC(iso: ISODate): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function addDays(iso: ISODate, n: number): ISODate {
  return new Date(toUTC(iso) + n * DAY_MS).toISOString().slice(0, 10);
}

/** Monday = 0 … Sunday = 6 */
export function dow(iso: ISODate): number {
  return (new Date(toUTC(iso)).getUTCDay() + 6) % 7;
}

/** "Oct 15" */
export function fmt(iso: ISODate): string {
  const d = new Date(toUTC(iso));
  return `${MON[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** "Thu, Oct 15" */
export function fmtLong(iso: ISODate): string {
  return `${DOW[dow(iso)]}, ${fmt(iso)}`;
}

/** "Thursday, Oct 15" */
export function fmtFull(iso: ISODate): string {
  return `${DOW_FULL[dow(iso)]}, ${fmt(iso)}`;
}

export function dayOfMonth(iso: ISODate): number {
  return Number(iso.slice(8));
}

export function weekStart(iso: ISODate): ISODate {
  return addDays(iso, -dow(iso));
}
