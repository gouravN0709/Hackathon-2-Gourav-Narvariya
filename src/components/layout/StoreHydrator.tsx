'use client';

import { useEffect } from 'react';
import { STORAGE_KEY, useFitStore } from '@/lib/store';

/** Loads persisted state after mount (so SSR and first client render match) and keeps tabs in sync. */
export function StoreHydrator() {
  useEffect(() => {
    void useFitStore.persist.rehydrate();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) void useFitStore.persist.rehydrate();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return null;
}
