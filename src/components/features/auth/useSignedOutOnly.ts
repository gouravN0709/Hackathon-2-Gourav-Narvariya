'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFitStore } from '@/lib/store';

type Decision = 'pending' | 'stay' | 'leave';

/**
 * For /login: a visitor who arrives already signed in is sent to the dashboard.
 * The decision is captured once — the auth state at mount — so signing in on this
 * page never yanks the user away from its success screens.
 */
export function useSignedOutOnly(): boolean {
  const router = useRouter();
  const hydrated = useFitStore((s) => s.hydrated);
  const [initialAuth] = useState(() => useFitStore.getState().auth);
  const [decision, setDecision] = useState<Decision>('pending');

  if (hydrated && decision === 'pending') setDecision(initialAuth ? 'leave' : 'stay');

  useEffect(() => {
    if (decision === 'pending') return;
    if (useFitStore.getState().justDeleted) useFitStore.setState({ justDeleted: false });
    if (decision === 'leave') router.replace('/dashboard');
  }, [decision, router]);

  return decision === 'stay';
}
