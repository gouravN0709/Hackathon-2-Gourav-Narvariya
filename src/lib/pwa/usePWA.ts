'use client';

import { useSyncExternalStore } from 'react';
import { pwaManager } from './pwaManager';

export function usePWA() {
  const isOnline = useSyncExternalStore(
    (onStoreChange) => pwaManager.subscribe(onStoreChange),
    () => pwaManager.isOnline,
    () => true
  );

  const isStandalone = useSyncExternalStore(
    (onStoreChange) => pwaManager.subscribe(onStoreChange),
    () => pwaManager.isStandalone,
    () => false
  );

  const shouldShowBanner = useSyncExternalStore(
    (onStoreChange) => pwaManager.subscribe(onStoreChange),
    () => pwaManager.shouldShowInstallBanner(),
    () => false
  );

  const canPrompt = useSyncExternalStore(
    (onStoreChange) => pwaManager.subscribe(onStoreChange),
    () => pwaManager.canPromptInstall,
    () => false
  );

  const isIosSafari = useSyncExternalStore(
    (onStoreChange) => pwaManager.subscribe(onStoreChange),
    () => pwaManager.isIosSafari(),
    () => false
  );

  return {
    isOnline,
    isStandalone,
    shouldShowBanner,
    canPrompt,
    isIosSafari,
    promptInstall: () => pwaManager.promptInstall(),
    dismissBanner: (days = 14) => pwaManager.dismissInstallBanner(days),
    recordAction: () => pwaManager.recordAction(),
  };
}

