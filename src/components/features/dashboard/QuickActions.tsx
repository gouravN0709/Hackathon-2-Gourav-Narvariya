'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useSelectToday } from '@/components/features/dashboard/StartWorkoutLink';
import { Icon, type IconName } from '@/components/ui/Icon';

interface QuickAction {
  label: string;
  short: string;
  href: string;
  icon: IconName;
  selectsToday?: boolean;
}

const ACTIONS: QuickAction[] = [
  { label: 'Log Weight', short: 'Log Weight', href: '/progress?focus=weight', icon: 'scale' },
  { label: 'Log Food', short: 'Log Food', href: '/nutrition/add', icon: 'plus' },
  { label: 'Start Workout', short: 'Workout', href: '/workouts/details', icon: 'play', selectsToday: true },
  { label: 'Ask AI', short: 'Ask AI', href: '/coach', icon: 'sparkle' },
];

export function QuickActions({ variant }: { variant: 'desktop' | 'mobile' }) {
  const selectToday = useSelectToday();
  const mobile = variant === 'mobile';
  return (
    <section aria-label="Quick actions" className={clsx('flex', mobile ? 'gap-2' : 'flex-wrap gap-3.5')}>
      {ACTIONS.map((a) => (
        <Link
          key={a.label}
          href={a.href}
          data-testid={`quick-action-${a.label.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={a.selectsToday ? selectToday : undefined}
          className={clsx(
            'box-border border border-line bg-card font-semibold text-fg transition-colors duration-150 hover:border-line-hover hover:bg-raised',
            mobile
              ? 'flex min-h-11 flex-1 flex-col items-center gap-2 rounded-2xl px-1 py-3 text-[12px]'
              : 'flex flex-[1_1_200px] items-center gap-3.5 rounded-[18px] px-[18px] py-4 text-[15px]',
          )}
        >
          {mobile ? (
            <Icon name={a.icon} size={22} className="text-lime" />
          ) : (
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-lime-tint text-lime">
              <Icon name={a.icon} size={20} />
            </span>
          )}
          {mobile ? a.short : a.label}
        </Link>
      ))}
    </section>
  );
}
