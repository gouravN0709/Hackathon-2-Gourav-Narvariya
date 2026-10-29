'use client';

import { usePWA } from '@/lib/pwa/usePWA';

export function OfflineIndicator({ className = '' }: { className?: string }) {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <span
      role="status"
      aria-label="App is offline"
      data-testid="offline-status-pill"
      className={`inline-flex items-center gap-1.5 rounded-full border border-line-chip bg-chip px-2.5 py-1 text-[12px] font-medium text-muted transition-all duration-200 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
      Offline
    </span>
  );
}

