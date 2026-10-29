import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { playTick } from '@/lib/audio';

type EyebrowTone = 'lime' | 'violet' | 'amber';

const eyebrowTones: Record<EyebrowTone, string> = {
  lime: 'text-lime',
  violet: 'text-violet-soft',
  amber: 'text-amber',
};

/** 12px/700 caps label with 0.1em tracking. */
export function Eyebrow({ tone = 'lime', className, children }: { tone?: EyebrowTone; className?: string; children: ReactNode }) {
  return <p className={cn('text-[12px] font-bold tracking-[0.1em] uppercase', eyebrowTones[tone], className)}>{children}</p>;
}

/** Exercise photo placeholder: gradient tile with a 60% lime dumbbell. */
export function ExercisePlaceholder({
  size,
  iconSize,
  strokeWidth = 1.5,
  className,
}: {
  size?: number;
  iconSize: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <div className={cn('placeholder-tile flex-none', className)} style={size ? { width: size, height: size } : undefined}>
      <Icon name="dumbbell" size={iconSize} strokeWidth={strokeWidth} style={{ opacity: 0.6 }} />
    </div>
  );
}

/** Round lime avatar with Nova's sparkle. */
export function NovaAvatar({ size, iconSize, strokeWidth = 2 }: { size: number; iconSize: number; strokeWidth?: number }) {
  return (
    <span
      className="flex flex-none items-center justify-center rounded-full bg-lime text-on-lime"
      style={{ width: size, height: size }}
    >
      <Icon name="sparkle" size={iconSize} strokeWidth={strokeWidth} />
    </span>
  );
}

/** Big lime success check used on completion screens. */
export function SuccessCheck({ size = 80, iconSize = 40 }: { size?: number; iconSize?: number }) {
  return (
    <span className="flex flex-none items-center justify-center rounded-full bg-lime text-on-lime" style={{ width: size, height: size }}>
      <Icon name="check" size={iconSize} strokeWidth={2.6} />
    </span>
  );
}

export function Muted({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn('text-muted', className)}>{children}</p>;
}

/** Dashed empty-state box. */
export function EmptyState({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-[18px] border-[1.5px] border-dashed border-line-active text-center',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Spinner() {
  return <div className="animate-spin-slow h-16 w-16 rounded-full border-[5px] border-line border-t-lime" aria-hidden="true" />;
}

/** Stepper button (− / +) used in set rows and serving quantity. */
export function StepButton({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => {
        playTick();
        onClick();
      }}
      aria-label={label}
      className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[14px] border border-line-strong bg-row text-[22px] font-semibold text-fg transition-all duration-150 active:scale-90 hover:border-lime hover:bg-row-hover"
    >
      {children}
    </button>
  );
}

/** Selectable chip (food categories, servings, meals, experience, diet). */
export function Chip({
  on,
  onClick,
  children,
  className,
  type = 'button',
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={() => {
        playTick();
        onClick();
      }}
      aria-pressed={on}
      className={cn(
        'h-10 rounded-full border px-4 text-[14px] font-semibold whitespace-nowrap transition-all duration-150 active:scale-95',
        on ? 'border-lime bg-lime-tint text-lime scale-[1.02]' : 'border-line-active bg-transparent text-soft hover:bg-chip',
        className,
      )}
    >
      {children}
    </button>
  );
}
