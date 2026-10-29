'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { replayQueue, useFitStore } from '@/lib/store';

/**
 * Bootstraps the store from Supabase (or the offline cache), keeps auth state
 * in sync and replays queued offline writes when connectivity returns.
 */
export function StoreHydrator() {
  useEffect(() => {
    const client = createClient();
    // INITIAL_SESSION covers signed-out loads too, so one listener is enough.
    const { data: sub } = client.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        void useFitStore.getState().bootstrap();
      }
      if (event === 'SIGNED_OUT') {
        window.localStorage.removeItem('fitai.cache.v1');
      }
    });

    const onOnline = () => {
      void replayQueue();
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOnline);

    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOnline);
    };
  }, []);
  return null;
}
