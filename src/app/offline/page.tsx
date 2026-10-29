'use client';

import { useState } from 'react';
import { Logo } from '@/components/layout/Logo';
import { Button, LinkButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

export default function OfflinePage() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    if (typeof window !== 'undefined') {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setTimeout(() => {
          setRetrying(false);
        }, 600);
      }
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-app px-5 py-10 text-fg">
      <div className="w-full max-w-[420px] text-center">
        <div className="mb-6 flex justify-center">
          <Logo variant="auth" />
        </div>

        <Card className="flex flex-col items-center gap-5 p-6 text-center md:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-raised text-muted">
            <Icon name="bolt" size={28} className="text-lime" />
          </div>

          <div>
            <h1 className="font-display text-[24px] font-bold md:text-[28px]">You&apos;re offline</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              Your data is saved on this device.
            </p>
          </div>

          <div className="mt-2 flex w-full flex-col gap-3">
            <Button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="w-full"
              data-testid="offline-retry-button"
            >
              {retrying ? 'Checking connection…' : 'Retry'}
            </Button>
            <LinkButton
              href="/dashboard"
              variant="ghost"
              className="w-full"
              data-testid="offline-dashboard-link"
            >
              Go to dashboard
            </LinkButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
