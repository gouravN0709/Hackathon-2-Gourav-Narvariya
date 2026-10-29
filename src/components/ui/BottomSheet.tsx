'use client';

import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const [translateY, setTranslateY] = useState(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleClose = () => {
    setTranslateY(0);
    onClose();
  };

  const handleTouchStart = (e: TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    if (deltaY > 0) {
      setTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    if (translateY > 120) {
      handleClose();
    } else {
      setTranslateY(0);
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-200" onClick={handleClose} aria-hidden="true" />

      {/* Sheet Content */}
      <div
        style={{ transform: `translateY(${translateY}px)` }}
        className={cn(
          'relative z-10 w-full max-h-[85dvh] overflow-y-auto rounded-t-[24px] border-t border-line bg-card pb-8 pt-3 shadow-2xl transition-transform duration-200 ease-out safe-bottom',
          className,
        )}
      >
        {/* Pull Handle */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="mx-auto flex h-6 w-full cursor-grab items-center justify-center active:cursor-grabbing"
        >
          <div className="h-1.5 w-12 rounded-full bg-line-strong" />
        </div>

        {title && (
          <div className="flex items-center justify-between border-b border-line px-5 pb-3 pt-1">
            <h2 className="font-display text-[18px] font-bold text-fg">{title}</h2>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-row text-muted hover:text-fg"
            >
              <Icon name="plus" size={16} className="rotate-45" />
            </button>
          </div>
        )}

        <div className="px-5 pt-3">{children}</div>
      </div>
    </div>
  );
}
