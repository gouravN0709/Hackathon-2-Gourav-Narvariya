import { fmt, TODAY } from '@/lib/date';
import { num } from '@/lib/format';
import type { SeriesPoint } from '@/lib/selectors';

interface CalorieTrendProps {
  series: SeriesPoint[];
  target: number;
}

const W = 760;
const H = 170;
const L = 48;
const R = 16;
const T = 14;
const B = 28;

/** Daily calories (bars) against the calorie target (dashed line). Today is drawn in full lime. */
export function CalorieTrend({ series, target }: CalorieTrendProps) {
  const max = Math.max(target, ...series.map((p) => p.v)) * 1.1;
  const plotH = H - T - B;
  const step = (W - L - R) / series.length;
  const bw = Math.min(28, step * 0.46);
  const y = (v: number) => T + plotH - (v / max) * plotH;
  const ty = y(target);
  const labelEvery = series.length > 7 ? 7 : 1;
  const avg = Math.round(series.reduce((a, p) => a + p.v, 0) / series.length);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label={`Daily calories for the last ${series.length} days, averaging ${num(avg)} kcal against a ${num(target)} kcal target`}
    >
      <line x1={L} x2={W - R} y1={H - B} y2={H - B} className="stroke-line-strong" strokeWidth="1" />
      {series.map((p, i) => {
        const cx = L + step * i + step / 2;
        const h = (p.v / max) * plotH;
        const isToday = p.date === TODAY;
        const showLabel = isToday || (series.length - 1 - i) % labelEvery === 0;
        return (
          <g key={p.date}>
            <rect
              x={cx - bw / 2}
              y={H - B - h}
              width={bw}
              height={h}
              rx={Math.min(6, bw / 3)}
              className={isToday ? 'fill-lime' : 'fill-lime-dim'}
            />
            {showLabel && (
              <text x={cx} y={H - 10} textAnchor="middle" fontSize="12" className="fill-muted font-sans">
                {series.length > 7 ? fmt(p.date) : fmt(p.date).split(' ')[1]}
              </text>
            )}
          </g>
        );
      })}
      <line x1={L} x2={W - R} y1={ty} y2={ty} className="stroke-soft" strokeWidth="1.5" strokeDasharray="6 6" />
      <text x={L - 8} y={ty + 4} textAnchor="end" fontSize="12" className="fill-muted font-sans">
        {num(target)}
      </text>
    </svg>
  );
}
