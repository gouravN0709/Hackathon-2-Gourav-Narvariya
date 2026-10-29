'use client';

import { useEffect } from 'react';
import { pwaManager } from '@/lib/pwa/pwaManager';

export function PWARegistration() {
  useEffect(() => {
    pwaManager.registerServiceWorker();
  }, []);

  return null;
}

