'use client';

import { useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { usePWA } from '@/lib/pwa/usePWA';
import { cn } from '@/lib/cn';

const emptySubscribe = () => () => {};

type InstallAppButtonProps = {
  /** `card` = full-width row (mobile dashboard). `pill` = labeled control (desktop header). */
  variant?: 'card' | 'pill';
  className?: string;
};

export function InstallAppButton({ variant = 'pill', className }: InstallAppButtonProps) {
  const { isStandalone, canPrompt, isIosSafari, promptInstall } = usePWA();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [guideOpen, setGuideOpen] = useState(false);

  if (!mounted || isStandalone) {
    return null;
  }

  const handleClick = async () => {
    if (canPrompt) {
      await promptInstall();
      return;
    }
    setGuideOpen(true);
  };

  const guideModal = (
    <Modal
      open={guideOpen}
      onClose={() => setGuideOpen(false)}
      title="Install FitAI on your phone"
      description="Add FitAI to your home screen for one-tap access and offline workouts."
    >
      <div className="flex flex-col gap-4">
        {isIosSafari ? (
          <p className="text-[14px] leading-relaxed text-muted">
            Tap{' '}
            <Icon name="share" size={16} className="inline align-text-bottom text-fg" />{' '}
            <span className="font-semibold text-fg">Share</span> in Safari, then choose{' '}
            <span className="font-semibold text-fg">Add to Home Screen</span>.
          </p>
        ) : (
          <p className="text-[14px] leading-relaxed text-muted">
            Open your browser menu (often <span className="font-semibold text-fg">⋮</span> or{' '}
            <span className="font-semibold text-fg">Share</span>) and choose{' '}
            <span className="font-semibold text-fg">Install app</span> or{' '}
            <span className="font-semibold text-fg">Add to Home Screen</span>.
          </p>
        )}
        <Button type="button" size="sm" className="self-start" onClick={() => setGuideOpen(false)}>
          Got it
        </Button>
      </div>
    </Modal>
  );

  if (variant === 'card') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          data-testid="dashboard-install-button"
          className={cn(
            'flex w-full min-h-11 items-center gap-3 rounded-[14px] border border-lime/35 bg-lime/10 px-3.5 py-3 text-left transition-colors hover:border-lime/55 hover:bg-lime/15',
            className,
          )}
        >
          <span
            className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-lime text-on-lime"
            aria-hidden
          >
            <Icon name="download" size={20} strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold text-fg">Install FitAI app</span>
            <span className="mt-0.5 block text-[13px] text-muted">Add to home screen · works offline</span>
          </span>
          <span className="flex-none text-[13px] font-semibold text-lime">Install</span>
        </button>
        {guideModal}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        data-testid="dashboard-install-button"
        className={cn(
          'flex h-[52px] flex-none items-center gap-2 rounded-full border border-lime/35 bg-lime/10 px-4 text-fg transition-colors hover:border-lime/55 hover:bg-lime/15',
          className,
        )}
      >
        <Icon name="download" size={20} strokeWidth={2.2} className="text-lime" />
        <span className="text-[14px] font-semibold">Install app</span>
      </button>
      {guideModal}
    </>
  );
}
