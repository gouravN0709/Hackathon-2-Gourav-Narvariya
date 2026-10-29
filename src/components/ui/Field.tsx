import { cn } from '@/lib/cn';
import type { InputHTMLAttributes, LabelHTMLAttributes, Ref } from 'react';

type FieldSize = 'sm' | 'md' | 'lg' | 'xl';

/** sm 46 (routine) · md 50 (profile) · lg 52 (search) · xl 54 (auth/onboarding) */
const sizes: Record<FieldSize, string> = {
  sm: 'h-[46px] px-3.5 text-[15px] font-medium',
  md: 'h-[50px] px-3.5 text-[16px] font-semibold',
  lg: 'h-[52px] px-4 text-[16px] font-medium',
  xl: 'h-[54px] px-4 text-[17px] font-medium',
};

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  invalid?: boolean;
  fieldSize?: FieldSize;
  ref?: Ref<HTMLInputElement>;
}

export function Field({ invalid = false, fieldSize = 'xl', className, ref, ...rest }: FieldProps) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'box-border w-full rounded-[14px] border bg-sidebar text-fg outline-none transition-colors duration-150 focus:border-lime focus-visible:outline-none',
        invalid ? 'border-danger-line' : 'border-line-strong',
        sizes[fieldSize],
        className,
      )}
      {...rest}
    />
  );
}

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** "strong" = 14px/600 #D4D4DC (auth forms), "muted" = 13px/500 secondary */
  tone?: 'strong' | 'muted';
}

export function Label({ tone = 'muted', className, children, ...rest }: LabelProps) {
  return (
    <label
      className={cn(
        tone === 'strong' ? 'text-[14px] font-semibold text-soft' : 'text-[13px] font-medium text-muted',
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  );
}
