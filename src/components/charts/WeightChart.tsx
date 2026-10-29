'use client';

import { useId, useMemo, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { fmtLong } from '@/lib/date';
import { chart, type ChartBox, type SeriesPoint } from '@/lib/selectors';

interface WeightChartProps {
  series: SeriesPoint[];
  box: ChartBox;
  /** "full" draws gridlines, axis labels and tooltip; "compact" is the mobile sparkline. */
  variant?: 'full' | 'compact';
  label: string;
}

const TIP_W = 112;
const TIP_H = 46;

/** Lime line + area chart. Hover, tap or arrow keys move the tooltip; it rests on the latest point. */
export function WeightChart({ series, box, variant = 'full', label }: WeightChartProps) {
  const gradientId = useId();
  const g = useMemo(() => chart(series, box), [series, box]);
  const [active, setActive] = useState<number | null>(null);
  const last = g.points.length - 1;
  const idx = active == null ? last : Math.min(active, last);
  const p = g.points[idx];
  const full = variant === 'full';

  const pick = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const x = ((e.clientX - rect.left) / rect.width) * box.W;
    let best = 0;
    g.points.forEach((pt, i) => {
      if (Math.abs(pt.x - x) < Math.abs(g.points[best].x - x)) best = i;
    });
    setActive(best);
  };

  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowLeft') setActive(Math.max(0, idx - 1));
    else if (e.key === 'ArrowRight') setActive(Math.min(last, idx + 1));
    else return;
    e.preventDefault();
  };

  let tipX = p.x - TIP_W - 12;
  if (tipX < box.L) tipX = Math.min(p.x + 12, box.W - box.R - TIP_W);
  const tipY = Math.max(4, p.y - 62);

  return (
    <svg
      viewBox={`0 0 ${box.W} ${box.H}`}
      className="block h-auto w-full touch-pan-y select-none"
      role="img"
      aria-label={`${label}. ${fmtLong(p.date)}: ${p.v.toFixed(1)} kilograms`}
      tabIndex={full ? 0 : undefined}
      onPointerMove={full ? pick : undefined}
      onPointerDown={full ? pick : undefined}
      onPointerLeave={full ? () => setActive(null) : undefined}
      onKeyDown={full ? onKey : undefined}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="[stop-color:var(--color-lime)]" stopOpacity="0.28" />
          <stop offset="100%" className="[stop-color:var(--color-lime)]" stopOpacity="0" />
        </linearGradient>
      </defs>
      {full &&
        g.grid.map((row) => (
          <g key={row.label}>
            <line x1={box.L} x2={box.W - box.R} y1={row.y} y2={row.y} className="stroke-line" strokeWidth="1" />
            <text x={box.L - 8} y={row.y + 4} textAnchor="end" fontSize="12" className="fill-muted font-sans">
              {row.label}
            </text>
          </g>
        ))}
      {full &&
        g.xl.map((t, i) => (
          <text key={i} x={t.x} y={box.H - 8} textAnchor={t.anchor} fontSize="12" className="fill-muted font-sans">
            {t.label}
          </text>
        ))}
      <path d={g.areaPath} fill={`url(#${gradientId})`} className="transition-opacity duration-700 ease-out" />
      <path
        d={g.linePath}
        fill="none"
        className="stroke-lime transition-all duration-500 ease-out"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {full && active != null && (
        <line x1={p.x} x2={p.x} y1={box.T} y2={g.bottom} className="stroke-line-hover" strokeWidth="1" strokeDasharray="4 4" />
      )}
      {full && <circle cx={p.x} cy={p.y} r="11" className="fill-lime/20 animate-pulse" />}
      <circle cx={p.x} cy={p.y} r="5" className="fill-lime stroke-card transition-all duration-200" strokeWidth="2" />
      {full && (
        <g pointerEvents="none">
          <rect x={tipX} y={tipY} width={TIP_W} height={TIP_H} rx="10" className="fill-active stroke-line-hover" />
          <text x={tipX + 12} y={tipY + 18} fontSize="12" className="fill-muted font-sans">
            {fmtLong(p.date)}
          </text>
          <text x={tipX + 12} y={tipY + 36} fontSize="15" fontWeight="700" className="fill-fg font-display">
            {p.v.toFixed(1)} kg
          </text>
        </g>
      )}
    </svg>
  );
}
