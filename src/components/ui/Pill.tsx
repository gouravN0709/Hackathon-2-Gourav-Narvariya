import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export type PillTone = 'default' | 'lime' | 'violet' | 'amber';

const tones: Record<PillTone, string> = {
  default: 'bg-chip text-soft border-line-chip',
  lime: 'bg-lime-pill text-lime border-lime-pill-line',
  violet: 'bg-chip text-violet-soft border-line-chip',
  amber: 'bg-chip text-amber border-amber-line',
};

interface PillProps {
  tone?: PillTone;
  size?: 'md' | 'sm';
  className?: string;
  children: ReactNode;
  role?: 'status';
}

export function Pill({ tone = 'default', size = 'md', className, children, role }: PillProps) {
  return (
    <span
      role={role}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap',
        size === 'md' ? 'px-3 py-1.5 text-[13px] leading-[1.15]' : 'px-2.5 py-[5px] text-[12px] leading-[1.15]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
