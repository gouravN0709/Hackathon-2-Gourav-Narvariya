'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface RingProps {
  size: number;
  radius: number;
  stroke: number;
  /** 0–100 */
  value: number;
  label: string;
  children?: ReactNode;
}

/** Circular progress ring (lime on #26262C track), as used for calories and goal progress. */
export function Ring({ size, radius, stroke, value, label, children }: RingProps) {
  const [mounted, setMounted] = useState(false);
  const c = 2 * Math.PI * radius;
  const targetDash = (Math.max(0, Math.min(100, value)) / 100) * c;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const currentDash = prefersReducedMotion || mounted ? targetDash : 0;
  const mid = size / 2;

  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        <circle cx={mid} cy={mid} r={radius} fill="none" className="stroke-line" strokeWidth={stroke} />
        <circle
          cx={mid}
          cy={mid}
          r={radius}
          fill="none"
          className="stroke-lime transition-[stroke-dasharray] duration-700 ease-out"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${currentDash.toFixed(1)} ${c.toFixed(1)}`}
          transform={`rotate(-90 ${mid} ${mid})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
