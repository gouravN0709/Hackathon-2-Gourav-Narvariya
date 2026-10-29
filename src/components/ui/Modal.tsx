'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        ref={dialogRef}
        className={cn(
          'relative z-10 w-full max-w-[500px] rounded-[20px] border border-line bg-card p-6 shadow-2xl transition-all duration-200 ease-out',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 pb-4">
          <div>
            <h2 id="modal-title" className="font-display text-[20px] font-bold text-fg">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1 text-[14px] leading-relaxed text-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line bg-row text-muted transition-colors hover:border-line-hover hover:bg-row-hover hover:text-fg"
          >
            <Icon name="plus" size={18} className="rotate-45" />
          </button>
        </div>

        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}

