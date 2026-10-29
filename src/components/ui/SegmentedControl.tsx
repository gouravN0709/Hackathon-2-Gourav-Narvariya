'use client';

import { cn } from '@/lib/cn';
import { playTick } from '@/lib/audio';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** sm = 34px chart toggle · md = 36px progress range · lg = 40px tabs · xl = 44px auth */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** "sidebar" = #0F0F12 track (chart toggles), "card" = #151518 track */
  track?: 'sidebar' | 'card';
  stretch?: boolean;
  className?: string;
}

const sizes = {
  sm: 'h-[34px] px-3.5 text-[13px]',
  md: 'h-9 px-4 text-[14px]',
  lg: 'h-10 px-[18px] text-[14px]',
  xl: 'h-11 px-4 text-[15px]',
};

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
  size = 'sm',
  track = 'sidebar',
  stretch = false,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'flex gap-1 rounded-full border border-line p-1',
        track === 'sidebar' ? 'bg-sidebar' : 'bg-card',
        className,
      )}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={on}
            onClick={() => {
              playTick();
              onChange(o.value);
            }}
            className={cn(
              'rounded-full border font-semibold whitespace-nowrap transition-all duration-200 ease-out active:scale-95',
              sizes[size],
              stretch && 'flex-1',
              on ? 'border-line-active bg-active text-lime' : 'border-transparent bg-transparent text-muted hover:text-fg',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
