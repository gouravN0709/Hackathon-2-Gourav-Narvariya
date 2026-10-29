'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import clsx from 'clsx';
import { Icon } from '@/components/ui/Icon';
import { HELP_TOPICS } from '@/content/help';

export interface InfoTipProps {
  /** Topic ID in src/content/help.ts. If provided, title, explanation and link are populated automatically. */
  topicId?: string;
  /** Explicit title override */
  title?: string;
  /** Explicit explanation override */
  explanation?: string;
  /** Live example text built from user data */
  example?: string;
  /** Explicit learn more URL override */
  learnMoreHref?: string;
  /** Icon size (defaults to 16) */
  size?: number;
  /** Additional wrapper class */
  className?: string;
  /** Optional children to override default icon button content */
  children?: ReactNode;
}

const CLOSE_OTHERS_EVENT = 'fitai:infotip-opened';

export function InfoTip({
  topicId,
  title: directTitle,
  explanation: directExplanation,
  example,
  learnMoreHref: directHref,
  size = 16,
  className,
}: InfoTipProps) {
  const instanceId = useId();
  const topic = topicId ? HELP_TOPICS[topicId] : undefined;
  const title = directTitle || topic?.title || 'Help and information';
  const explanation = directExplanation || topic?.short || '';
  const learnMore = directHref || (topicId ? `/help#${topicId}` : undefined);
  const activeExample = example || topic?.defaultExample;

  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<number | undefined>(undefined);
  const touchStartY = useRef<number>(0);
  const [sheetTranslateY, setSheetTranslateY] = useState(0);

  // Detect mobile / touch environment
  useEffect(() => {
    const checkMobile = () => {
      const coarse = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      const smallScreen = typeof window !== 'undefined' && window.innerWidth > 0 && window.innerWidth < 820;
      setIsMobile(Boolean(coarse || smallScreen));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for other InfoTips opening (singleton: only one open at a time)
  useEffect(() => {
    const handleCloseOthers = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      if (customEvent.detail?.id !== instanceId) {
        setIsOpen(false);
        setIsPinned(false);
      }
    };
    window.addEventListener(CLOSE_OTHERS_EVENT, handleCloseOthers);
    return () => window.removeEventListener(CLOSE_OTHERS_EVENT, handleCloseOthers);
  }, [instanceId]);

  const updateCoords = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = typeof window !== 'undefined' && window.innerWidth > 0 ? Math.min(320, window.innerWidth - 24) : 320;
    const popoverHeight = 180; // approximate height for placement calculation

    const spaceBelow = typeof window !== 'undefined' ? window.innerHeight - rect.bottom : 300;
    const placeTop = spaceBelow < popoverHeight && rect.top > popoverHeight;

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    // Boundary clamp so it never overflows screen edge
    const maxW = typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 1200;
    left = Math.max(12, Math.min(maxW - popoverWidth - 12, left));

    const top = placeTop
      ? rect.top + (typeof window !== 'undefined' ? window.scrollY : 0) - 8
      : rect.bottom + (typeof window !== 'undefined' ? window.scrollY : 0) + 8;

    setCoords({
      top,
      left,
      placement: placeTop ? 'top' : 'bottom',
    });
  }, []);

  const openTip = useCallback((pin = false) => {
    window.clearTimeout(closeTimeout.current);
    updateCoords();
    setIsOpen(true);
    if (pin) setIsPinned(true);
    window.dispatchEvent(
      new CustomEvent(CLOSE_OTHERS_EVENT, { detail: { id: instanceId } }),
    );
  }, [instanceId, updateCoords]);

  const closeTip = useCallback(() => {
    window.clearTimeout(closeTimeout.current);
    setIsOpen(false);
    setIsPinned(false);
    setSheetTranslateY(0);
    buttonRef.current?.focus();
  }, []);

  const scheduleClose = useCallback(() => {
    if (isPinned) return;
    window.clearTimeout(closeTimeout.current);
    closeTimeout.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 180);
  }, [isPinned]);

  // Handle escape key and outside clicks
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTip();
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        popoverRef.current?.contains(target) ||
        sheetRef.current?.contains(target)
      ) {
        return;
      }
      closeTip();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen, closeTip, updateCoords]);

  // Touch sheet gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) {
      setSheetTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (sheetTranslateY > 100) {
      closeTip();
    } else {
      setSheetTranslateY(0);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen && isPinned) {
      closeTip();
    } else {
      openTip(true);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`What is ${title}?`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        data-testid={`infotip-${topicId || 'custom'}`}
        onClick={handleButtonClick}
        onMouseEnter={() => {
          if (!isMobile) openTip();
        }}
        onMouseLeave={() => {
          if (!isMobile) scheduleClose();
        }}
        onFocus={() => {
          if (!isMobile) openTip();
        }}
        onBlur={() => {
          if (!isMobile) scheduleClose();
        }}
        className={clsx(
          'inline-flex items-center justify-center text-muted transition-colors duration-150',
          'hover:text-lime focus-visible:text-lime',
          'min-h-[44px] min-w-[44px] -m-2 p-2 md:min-h-0 md:min-w-0 md:m-0 md:p-0.5',
          'rounded-full align-middle select-none',
          className,
        )}
      >
        <Icon
          name="info"
          size={size}
          strokeWidth={2}
          className="pointer-events-none transition-transform duration-150 active:scale-95"
        />
      </button>

      {/* Desktop Portal Popover */}
      {isOpen &&
        !isMobile &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-modal="false"
            aria-label={title}
            onMouseEnter={() => window.clearTimeout(closeTimeout.current)}
            onMouseLeave={scheduleClose}
            style={{
              position: 'absolute',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.placement === 'top' ? 'translateY(-100%)' : 'none',
            }}
            className={clsx(
              'z-50 w-[290px] sm:w-[320px] rounded-[14px] border border-line-strong bg-raised p-4',
              'shadow-2xl transition-all duration-200 ease-out',
              'animate-in fade-in zoom-in-95',
            )}
          >
            <div className="flex items-start justify-between gap-2.5">
              <h3 className="font-display text-[15px] font-bold leading-tight text-fg">
                {title}
              </h3>
              <button
                type="button"
                onClick={closeTip}
                aria-label="Close information"
                className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-muted transition-colors hover:bg-card hover:text-fg"
              >
                <Icon name="close" size={14} />
              </button>
            </div>

            <p className="mt-2 text-[13px] leading-relaxed text-soft">
              {explanation}
            </p>

            {activeExample && (
              <div className="mt-2.5 rounded-lg border border-line bg-card p-2.5 text-[12px] leading-normal text-muted">
                <span className="font-semibold text-fg">Example: </span>
                <span className="text-soft">{activeExample}</span>
              </div>
            )}

            {learnMore && (
              <div className="mt-3 border-t border-line pt-2.5 text-right">
                <Link
                  href={learnMore}
                  onClick={closeTip}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-lime transition-colors hover:text-lime-hover hover:underline"
                >
                  <span>Learn more</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            )}
          </div>,
          document.body,
        )}

      {/* Mobile Bottom Sheet */}
      {isOpen &&
        isMobile &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-50 flex items-end justify-center md:hidden"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-200"
              onClick={closeTip}
              aria-hidden="true"
            />

            {/* Sheet Surface */}
            <div
              ref={sheetRef}
              style={{
                transform: `translateY(${sheetTranslateY}px)`,
                transition: sheetTranslateY === 0 ? 'transform 200ms ease-out' : 'none',
              }}
              className="relative z-10 w-full max-h-[85dvh] overflow-y-auto rounded-t-[20px] border-t border-line-strong bg-raised pb-8 pt-2.5 shadow-2xl safe-bottom"
            >
              {/* Drag Handle */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="mx-auto flex h-7 w-full cursor-grab items-center justify-center active:cursor-grabbing"
              >
                <div className="h-1.5 w-12 rounded-full bg-line-strong" />
              </div>

              <div className="flex items-center justify-between border-b border-line px-5 pb-3 pt-1">
                <h3 className="font-display text-[17px] font-bold text-fg">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={closeTip}
                  aria-label="Close information"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-muted hover:text-fg"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>

              <div className="px-5 pt-4 text-left">
                <p className="text-[14px] leading-relaxed text-soft">
                  {explanation}
                </p>

                {activeExample && (
                  <div className="mt-3.5 rounded-xl border border-line bg-card p-3 text-[13px] leading-relaxed text-muted">
                    <span className="font-semibold text-fg">Example: </span>
                    <span className="text-soft">{activeExample}</span>
                  </div>
                )}

                {learnMore && (
                  <div className="mt-5 border-t border-line pt-3.5 flex justify-end">
                    <Link
                      href={learnMore}
                      onClick={closeTip}
                      className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-bold text-lime"
                    >
                      <span>Learn more in Help Center</span>
                      <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
