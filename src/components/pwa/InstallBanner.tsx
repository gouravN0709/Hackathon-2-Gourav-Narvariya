'use client';

import { useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { usePWA } from '@/lib/pwa/usePWA';

const emptySubscribe = () => () => {};

export function InstallBanner() {
  const { shouldShowBanner, canPrompt, isIosSafari, promptInstall, dismissBanner } = usePWA();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [closed, setClosed] = useState(false);

  if (!mounted || !shouldShowBanner || closed) {
    return null;
  }

  const handleDismiss = () => {
    setClosed(true);
    dismissBanner(14);
  };

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setClosed(true);
    }
  };

  return (
    <aside
      aria-label="Install FitAI"
      data-testid="pwa-install-banner"
      className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md animate-fade-in md:bottom-6 md:right-6 md:left-auto"
      style={{
        transition: 'all 250ms cubic-bezier(.22,1,.36,1)',
      }}
    >
      <div className="flex flex-col gap-3 rounded-[14px] border border-violet-line bg-violet-tint p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-violet-deep text-violet">
              {isIosSafari ? (
                <Icon name="share" size={18} strokeWidth={2} />
              ) : (
                <Icon name="bolt" size={18} strokeWidth={2} />
              )}
            </div>
            <div>
              <p className="font-display text-[15px] font-bold text-fg">Install FitAI</p>
              {isIosSafari ? (
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  Tap <Icon name="share" size={14} className="inline mx-0.5 text-fg align-text-bottom" /> Share, then{' '}
                  <span className="font-semibold text-fg">Add to Home Screen</span> for fast offline access.
                </p>
              ) : (
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  Add to your home screen for quick logging, workout timers and offline access.
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-muted transition-colors hover:text-fg"
          >
            <Icon name="close" size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            data-testid="pwa-dismiss-button"
            className="text-[13px] text-muted hover:text-fg"
          >
            Not now
          </Button>

          {canPrompt && (
            <Button
              type="button"
              size="sm"
              onClick={handleInstall}
              data-testid="pwa-install-button"
            >
              Install FitAI
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
