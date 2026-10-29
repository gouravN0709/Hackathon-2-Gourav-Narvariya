import { cn } from '@/lib/cn';
import Link from 'next/link';
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';
/** sm 40 · md 48 · lg 52 (hero) · xl 54/56 (auth & detail CTAs) · icon 48×48 round */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full border font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.97] select-none';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-lime text-on-lime border-transparent hover:bg-lime-hover disabled:bg-lime-disabled disabled:text-lime-disabled-fg',
  ghost: 'bg-transparent text-fg border-line-strong hover:bg-chip disabled:text-disabled-fg disabled:hover:bg-transparent',
  danger:
    'bg-transparent text-danger border-danger-border hover:bg-danger-bg disabled:text-danger-disabled disabled:hover:bg-transparent',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-[18px] text-[14px]',
  md: 'h-12 px-6 text-[15px]',
  lg: 'h-[52px] px-[30px] text-[16px]',
  xl: 'h-[54px] px-7 text-[16px]',
  icon: 'h-12 w-12 flex-none p-0',
};

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = 'primary', size = 'md', className, type = 'button', children, ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

interface LinkButtonProps extends CommonProps {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  'aria-label'?: string;
}

export function LinkButton({ variant = 'primary', size = 'md', className, href, children, ...rest }: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
