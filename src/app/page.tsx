'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFitStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const hydrated = useFitStore((s) => s.hydrated);
  const auth = useFitStore((s) => s.auth);

  useEffect(() => {
    if (hydrated) router.replace(auth ? '/dashboard' : '/login');
  }, [hydrated, auth, router]);

  return <main className="min-h-dvh bg-app" aria-busy="true" />;
}
