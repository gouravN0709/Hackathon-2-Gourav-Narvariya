'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { playSuccess, playTick } from '@/lib/audio';

export interface ToastMessage {
  id: string;
  message: string;
  tone?: 'success' | 'info' | 'error';
  onUndo?: () => void;
  undoLabel?: string;
}

const TOAST_EVENT = 'fitai:toast';

export function showToast(
  message: string,
  tone: 'success' | 'info' | 'error' = 'success',
  undoOptions?: { onUndo: () => void; undoLabel?: string },
) {
  if (typeof window !== 'undefined') {
    if (tone === 'success') playSuccess();
    else playTick();

    window.dispatchEvent(
      new CustomEvent(TOAST_EVENT, {
        detail: {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          message,
          tone,
          onUndo: undoOptions?.onUndo,
          undoLabel: undoOptions?.undoLabel || 'Undo',
        },
      }),
    );
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const hoveredRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastMessage>;
      const toast = customEvent.detail;
      setToasts((prev) => [...prev, toast]);

      const dismissAfter = () => {
        setTimeout(() => {
          if (hoveredRef.current[toast.id]) {
            dismissAfter();
          } else {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          }
        }, 3600);
      };
      dismissAfter();
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          data-testid="toast"
          onMouseEnter={() => {
            hoveredRef.current[toast.id] = true;
          }}
          onMouseLeave={() => {
            hoveredRef.current[toast.id] = false;
          }}
          className={cn(
            'pointer-events-auto flex items-center justify-between gap-3 rounded-[16px] border border-line-strong bg-card px-4 py-3 shadow-2xl transition-all duration-200 ease-out',
            toast.tone === 'success' && 'border-lime-line bg-lime-tint text-lime',
            toast.tone === 'error' && 'border-danger-border bg-danger-bg text-danger',
            toast.tone === 'info' && 'text-fg',
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.tone === 'success' ? (
              <Icon name="check" size={18} strokeWidth={2.4} className="flex-none text-lime" />
            ) : toast.tone === 'error' ? (
              <Icon name="info" size={18} strokeWidth={2.2} className="flex-none text-danger" />
            ) : (
              <Icon name="info" size={18} strokeWidth={2.2} className="flex-none text-muted" />
            )}
            <span className="text-[14px] font-medium leading-snug truncate">{toast.message}</span>
          </div>

          {toast.onUndo && (
            <button
              type="button"
              data-testid="toast-undo"
              onClick={() => {
                toast.onUndo?.();
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
              }}
              className="flex-none text-[13px] font-bold underline underline-offset-4 transition-colors hover:text-white"
            >
              {toast.undoLabel || 'Undo'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
