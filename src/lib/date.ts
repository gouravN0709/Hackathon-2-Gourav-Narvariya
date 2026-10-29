import type { ISODate } from '@/types/domain';

/** The demo data is seeded around this date. Swap for `new Date().toISOString().slice(0, 10)` to go live. */
export const TODAY: ISODate = '2026-10-15';

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
