'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { LinkButton, type ButtonSize } from '@/components/ui/Button';
import { todayIndex } from '@/lib/selectors';
import { useFitStore } from '@/lib/store';

/** Selects today in the planner, then opens Workout Details. */
export function useSelectToday() {
  const setUI = useFitStore((s) => s.setUI);
  return () => setUI({ workoutDay: todayIndex() });
}

export function StartWorkoutButton({
  size = 'lg',
  className,
  children,
}: {
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  const selectToday = useSelectToday();
  return (
    <LinkButton href="/workouts/details" size={size} className={className} onClick={selectToday}>
      {children}
    </LinkButton>
  );
}

export function StartWorkoutLink({ className, children }: { className?: string; children: ReactNode }) {
  const selectToday = useSelectToday();
  return (
    <Link href="/workouts/details" className={className} onClick={selectToday}>
      {children}
    </Link>
  );
}
