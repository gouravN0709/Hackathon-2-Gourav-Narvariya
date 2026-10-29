import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

type AlertTone = 'error' | 'success';

interface AlertProps {
  tone: AlertTone;
  children: ReactNode;
  /** Prefix success messages with a check icon. */
  check?: boolean;
  className?: string;
}

/** Boxed inline message: red error (role=alert) or lime success/info (role=status). */
export function Alert({ tone, children, check = false, className }: AlertProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-xl border px-4 py-3 text-[15px] leading-normal',
        tone === 'error' ? 'border-danger-border bg-danger-bg text-danger' : 'border-lime-pill-line bg-lime-pill text-lime',
        className,
      )}
    >
      {check && <Icon name="check" size={15} strokeWidth={2.8} className="mr-1.5 inline-block align-[-2px]" />}
      {children}
    </div>
  );
}

/** Unboxed status line (e.g. "✓ Weight saved."). */
export function StatusText({ tone, children, className }: { tone: AlertTone; children: ReactNode; className?: string }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('text-[14px]', tone === 'error' ? 'text-danger' : 'font-semibold text-lime', className)}
    >
      {tone === 'success' && <Icon name="check" size={14} strokeWidth={2.8} className="mr-1.5 inline-block align-[-2px]" />}
      {children}
    </p>
  );
}
