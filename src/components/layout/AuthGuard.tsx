'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useFitStore } from '@/lib/store';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renders children only for a signed-in user once persisted state is loaded; otherwise redirects to /login. */
export function AuthGuard({ children, fallback = null }: AuthGuardProps) {
  const router = useRouter();
  const hydrated = useFitStore((s) => s.hydrated);
  const auth = useFitStore((s) => s.auth);
  const justDeleted = useFitStore((s) => s.justDeleted);
  const allowed = auth || justDeleted;

  useEffect(() => {
    if (hydrated && !allowed) router.replace('/login');
  }, [hydrated, allowed, router]);

  if (!hydrated || !allowed) return <>{fallback}</>;
  return <>{children}</>;
}
