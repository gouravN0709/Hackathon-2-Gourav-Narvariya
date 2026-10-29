'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export type BarColor = 'lime' | 'violet' | 'amber';

const fills: Record<BarColor, string> = {
  lime: 'bg-lime',
  violet: 'bg-violet',
  amber: 'bg-amber',
};

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  color?: BarColor;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, color = 'lime', label, className }: ProgressBarProps) {
  const [mounted, setMounted] = useState(false);
  const targetWidth = Math.max(0, Math.min(100, value));

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

  const currentWidth = prefersReducedMotion || mounted ? targetWidth : 0;

  return (
    <div
      className={cn('h-[7px] overflow-hidden rounded-full bg-line md:h-2', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-700 ease-out', fills[color])}
        style={{ width: `${currentWidth}%` }}
      />
    </div>
  );
}
