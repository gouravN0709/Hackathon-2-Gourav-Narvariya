'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFitStore } from '@/lib/store';

type Decision = 'pending' | 'stay' | 'leave';

/**
 * For /login: once state is loaded, a signed-in visitor is sent to the dashboard.
 * The decision is taken once, so signing in on this page still shows its success screen.
 */
export function useSignedOutOnly(): boolean {
  const router = useRouter();
  const hydrated = useFitStore((s) => s.hydrated);
  const auth = useFitStore((s) => s.auth);
  const [decision, setDecision] = useState<Decision>('pending');

  if (hydrated && decision === 'pending') setDecision(auth ? 'leave' : 'stay');

  useEffect(() => {
    if (decision === 'pending') return;
    if (useFitStore.getState().justDeleted) useFitStore.setState({ justDeleted: false });
    if (decision === 'leave') router.replace('/dashboard');
  }, [decision, router]);

  return decision === 'stay';
}
