import type { BarData } from '@/lib/selectors';

interface ConsistencyBarsProps {
  data: BarData;
  label: string;
}

const W = 400;
const BASE = 190;
const MAX_H = 150;

/** Training minutes per day (7 days) or sessions per week (30 days). */
export function ConsistencyBars({ data, label }: ConsistencyBarsProps) {
  const step = 376 / data.items.length;
  const bw = Math.min(40, step * 0.6);
  return (
    <svg viewBox={`0 0 ${W} 220`} className="block h-auto w-full" role="img" aria-label={label}>
      <line x1="12" x2="388" y1={BASE} y2={BASE} className="stroke-line-strong" strokeWidth="1" />
      {data.items.map((b, i) => {
        const h = Math.max(b.v > 0 ? 6 : 0, (b.v / data.max) * MAX_H);
        const cx = 12 + step * i + step / 2;
        return (
          <g key={`${b.label}-${i}`}>
            <rect x={cx - bw / 2} y={BASE - h} width={bw} height={h} rx="6" className={b.v > 0 ? 'fill-lime' : 'fill-line'} />
            {b.v > 0 && (
              <text x={cx} y={BASE - h - 8} textAnchor="middle" fontSize="12" fontWeight="700" className="fill-fg font-sans">
                {b.v}
              </text>
            )}
            <text x={cx} y="208" textAnchor="middle" fontSize="12" className="fill-muted font-sans">
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
